const cron = require('node-cron');
const moment = require('moment-timezone');
const ColorBetHistoryDB = require('../db/colorBetHistory/colorBetHistory.db.processor');
const RoundResultDB = require('../db/roundResult/roundResult.db.processor');
const UserDB = require('../db/user/user.db.proccessor');

/**
 * Color Betting Cron Job
 * Executes at 45 seconds of every minute (right when betting closes)
 * Processes the round results and updates bet statuses
 */

class ColorBettingCron {
  constructor(logger) {
    this.logger = logger || console;
    this.isProcessing = false;
    this.colorBetHistoryDB = new ColorBetHistoryDB();
    this.roundResultDB = new RoundResultDB();
    this.userDB = new UserDB();
    this.job = null;
  }

  /**
   * Initialize the cron job
   * Runs at 45 seconds of every minute
   */
  start() {
    // Cron pattern: "45 * * * * *" means at 45 seconds of every minute
    this.job = cron.schedule('45 * * * * *', async () => {
      await this.processBettingRound();
    }, {
      timezone: 'UTC'
    });

    this.logger.info('Color betting cron job started - executes at 45 seconds of every minute (UTC)');
  }

  /**
   * Main processing function
   * Called when betting closes
   */
  async processBettingRound() {
    if (this.isProcessing) {
      this.logger.warn('Previous round still processing, skipping...');
      return;
    }

    this.isProcessing = true;

    try {
      const now = moment().tz('UTC');
      const roundNumber = now.hours() * 60 + now.minutes();
      
      this.logger.info(`Processing round #${roundNumber} at ${now.format('HH:mm:ss')}`);

      // Step 1: Get all pending bets for this round
      const pendingBets = await this.getPendingBets(roundNumber);
      
      if (pendingBets.length === 0) {
        this.logger.info(`No bets to process for round #${roundNumber}`);
        // Still save the round result even if no bets
        const winningColor = this.generateWinningColor();
        await this.saveRoundResult(roundNumber, winningColor, 0, 0);
        return;
      }

      this.logger.info(`Found ${pendingBets.length} bets for round #${roundNumber}`);

      // Step 2: Generate the winning color
      const winningColor = this.generateWinningColor();
      this.logger.info(`Winning color for round #${roundNumber}: ${winningColor}`);

      // Step 3: Calculate total bets and amount
      const totalAmount = pendingBets.reduce((sum, bet) => sum + bet.amount, 0);

      // Step 4: Process each bet and update balances
      const { winnersCount, totalPayout } = await this.processBets(pendingBets, winningColor, roundNumber);

      // Step 5: Save the round result
      await this.saveRoundResult(roundNumber, winningColor, pendingBets.length, totalAmount, winnersCount, totalPayout);

      this.logger.info(`Successfully processed round #${roundNumber} - Winners: ${winnersCount}, Total Payout: ${totalPayout}`);

    } catch (error) {
      this.logger.error('Error processing betting round:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Get all pending bets for a specific round from all users
   */
  async getPendingBets(roundNumber) {
    try {
      // Get all user bet histories
      const allHistories = await this.colorBetHistoryDB.getByquery({});
      
      const pendingBets = [];
      
      // Extract pending bets for this round from all users
      for (const history of allHistories) {
        if (history.colorBetHistory && history.colorBetHistory.length > 0) {
          const userPendingBets = history.colorBetHistory.filter(
            bet => bet.roundNumber === roundNumber && bet.status === 'pending'
          );
          
          // Add userId to each bet for processing
          userPendingBets.forEach(bet => {
            pendingBets.push({
              ...bet.toObject(),
              userId: history.userId,
              historyId: history._id
            });
          });
        }
      }
      
      return pendingBets;
    } catch (error) {
      this.logger.error('Error getting pending bets:', error);
      return [];
    }
  }

  /**
   * Generate winning color using weighted randomization
   * Adjust probabilities as needed
   */
  generateWinningColor() {
    const random = Math.random() * 100;
    
    // Probabilities:
    // Red: 45%, Green: 45%, Black: 10%
    if (random < 45) return 'red';
    if (random < 90) return 'green';
    return 'black';
  }

  /**
   * Save the round result to database
   */
  async saveRoundResult(roundNumber, winningColor, totalBets, totalAmount, winnersCount = 0, totalPayout = 0) {
    try {
      const now = moment().tz('UTC');
      const timestamp = now.toDate();
      const date = now.format('YYYY-MM-DD'); // Format: 2024-11-04
      
      await this.roundResultDB.create({
        roundNumber,
        date,
        winningColor,
        timestamp,
        totalBets,
        totalAmount,
        winnersCount,
        totalPayout
      });

      this.logger.info(`Saved result for round #${roundNumber} on ${date}: ${winningColor}`);
    } catch (error) {
      this.logger.error('Error saving round result:', error);
      throw error;
    }
  }

  /**
   * Process all bets and update user balances
   */
  async processBets(bets, winningColor, roundNumber) {
    const winMultiplier = 2; // 2x payout for winning bets (red/green)
    const blackMultiplier = 10; // 10x payout for black (rare)
    
    let winnersCount = 0;
    let totalPayout = 0;

    for (const bet of bets) {
      try {
        const isWin = bet.color === winningColor;
        const multiplier = bet.color === 'black' ? blackMultiplier : winMultiplier;
        const payout = isWin ? bet.amount * multiplier : 0;
        const profit = isWin ? payout - bet.amount : -bet.amount;

        // Update bet status and payout in user's history
        await this.updateBetStatus(bet.userId, bet._id, isWin ? 'win' : 'lose', payout, roundNumber);

        // Update user balance if win
        if (isWin) {
          await this.updateUserBalance(bet.userId, payout);
          winnersCount++;
          totalPayout += payout;
        }

        this.logger.info(
          `Processed bet ${bet._id}: User ${bet.userId}, ${bet.color}, ` +
          `${isWin ? 'WON' : 'LOST'}, Payout: ${payout}`
        );

      } catch (error) {
        this.logger.error(`Error processing bet ${bet._id}:`, error);
      }
    }
    
    return { winnersCount, totalPayout };
  }

  /**
   * Update bet status and payout in user's color bet history
   */
  async updateBetStatus(userId, betId, status, payout, roundNumber) {
    try {
      await this.colorBetHistoryDB.updateOne(
        { 
          userId: userId,
          'colorBetHistory._id': betId
        },
        {
          $set: {
            'colorBetHistory.$.status': status,
            'colorBetHistory.$.payout': payout
          }
        }
      );
    } catch (error) {
      this.logger.error(`Error updating bet status for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Update user balance (add winnings to creditCoins)
   */
  async updateUserBalance(userId, amount) {
    try {
      const user = await this.userDB.get(userId);
      if (user) {
        const newBalance = (user.creditCoins || 0) + amount;
        await this.userDB.update(userId, { creditCoins: newBalance });
        this.logger.info(`Updated balance for user ${userId}: +${amount} (New balance: ${newBalance})`);
      }
    } catch (error) {
      this.logger.error(`Error updating user balance for ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Stop the cron job
   */
  stop() {
    if (this.job) {
      this.job.stop();
      this.logger.info('Color betting cron job stopped');
    }
  }

  /**
   * Get cron job status
   */
  getStatus() {
    return {
      isRunning: this.job ? true : false,
      isProcessing: this.isProcessing,
      nextExecution: this.job ? 'Every minute at 45 seconds (UTC)' : null
    };
  }
}

module.exports = ColorBettingCron;
