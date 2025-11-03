const colorBetHistoryDB = require('../db/colorBetHistory/colorBetHistory.db.processor'); // Your DB processor
const util = require('../util/util');
const userDB = require('../db/user/user.db.proccessor');

class colorBetHistoryService {
  constructor() {
    this.colorBetHistoryDB = new colorBetHistoryDB();
    this.userDB = new userDB();
  }

  /**
   * Inserts a new bet into the user's history and keeps only the last 10 bets.
   * Deducts credits from user if sufficient balance, else throws error.
   * @param {String} uid - User ID
   * @param {Object} betData - Bet details: roundNumber, color, amount, status, timestamp
   * @returns {Object} - Updated user and bet history
   */
  async updateColorHistory(uid, betData) {
    try {
      if (!uid || !betData || !betData.roundNumber || !betData.color || !betData.amount || !betData.status) {
        throw { httpCode: 400, code: 'invalid-data', message: 'Missing required bet fields' };
      }

      // 1. Fetch user
      const user = await this.userDB.get(uid);
      if (!user) {
        throw { httpCode: 404, code: 'user-not-found', message: 'User not found' };
      }

      // 2. Check available credits
      if ((user.creditCoins ?? 0) < betData.amount) {
        throw { httpCode: 400, code: 'insufficient-credits', message: 'Insufficient Credit Coins' };
      }

      // 3. Deduct credits
      const newCreditCoins = (user.creditCoins ?? 0) - betData.amount;
      await this.userDB.update(uid, { creditCoins: newCreditCoins });

      // 4. Save bet record in UserColorBetHistory
      const newBet = {
        roundNumber: betData.roundNumber,
        color: betData.color,
        amount: betData.amount,
        status: betData.status,
        payout: 0, // Will be updated by cron when round is processed
        timestamp: betData.timestamp || new Date()
      };

      const updatedHistory = await this.colorBetHistoryDB.updateOne(
        { userId: uid },
        {
          $push: {
            colorBetHistory: {
              $each: [newBet],
              $slice: -10
            }
          }
        },
        { upsert: true, new: true }
      );

      // 5. Return updated user data and bet history
      const updatedUser = await this.userDB.get(uid);
      return util.responseFormate({ user: updatedUser, betHistory: updatedHistory });
    } catch (error) {
      console.error('Error in updateColorHistory:', error);
      throw error;
    }
  }

  /**
   * 
   *  bet: Joi.number().integer().min(1).required(),
    mins: Joi.number().min(1).required(),
    revealed: Joi.number().min(1).required(),
    status: Joi.string().valid("win", "lose").required(),
    payOut: Joi.number().min(10).required(),
    timestamp: Joi.date().iso().optional()
   */

  async updateMiningGameUserHistory(uid, betData) {
    try {
      if (!uid || !betData || !betData.bet || !betData.mins || !betData.revealed || !betData.status || !betData.multiplier) {
        throw { httpCode: 400, code: 'invalid-data', message: 'Missing required bet fields' };
      }

      // 1. Fetch user
      const user = await this.userDB.get(uid);
      if (!user) {
        throw { httpCode: 404, code: 'user-not-found', message: 'User not found' };
      }

      // 2. Check available credits
      if ((user.creditCoins ?? 0) < betData.bet) {
        throw { httpCode: 400, code: 'insufficient-credits', message: 'Insufficient Credit Coins' };
      }

      // 3. Deduct bet amount from credits
      let newCreditCoins = (user.creditCoins ?? 0) - betData.bet;

      // 4. Add payout if win
      if (betData.status === 'win') {
        newCreditCoins += betData.payOut;
      }

      await this.userDB.update(uid, { creditCoins: newCreditCoins });

      // 5. Save bet record in UserColorBetHistory
      const newBet = {
        bet: betData.bet,
        mins: betData.mins,
        revealed: betData.revealed,
        status: betData.status,
        payOut: betData.payOut,
        multiplier: betData.multiplier || 1,
        timestamp: betData.timestamp || new Date()
      };

      const updatedHistory = await this.colorBetHistoryDB.updateOne(
        { userId: uid },
        {
          $push: {
            miningGamesHistory: {
              $each: [newBet],
              $slice: -10
            }
          }
        },
        { upsert: true, new: true }
      );

      // 6. Return updated user data and bet history
      const updatedUser = await this.userDB.get(uid);
      return util.responseFormate({ user: updatedUser, betHistory: updatedHistory });
    } catch (error) {
      console.error('Error in updateMiningGameUserHistory:', error);
      throw error;
    }
  }

  async updateStairGameUserHistory(uid, betData) {
    try {
      if (!uid || !betData || !betData.bet || !betData.level || !betData.multiplier || !betData.status) {
        throw { httpCode: 400, code: 'invalid-data', message: 'Missing required bet fields' };
      }

      // 1. Fetch user
      const user = await this.userDB.get(uid);
      if (!user) {
        throw { httpCode: 404, code: 'user-not-found', message: 'User not found' };
      }

      // 2. Check available credits
      if ((user.creditCoins ?? 0) < betData.bet) {
        throw { httpCode: 400, code: 'insufficient-credits', message: 'Insufficient Credit Coins' };
      }

      // 3. Deduct bet amount from credits
      let newCreditCoins = (user.creditCoins ?? 0) - betData.bet;

      // 4. Add payout if win
      if (betData.status === 'win') {
        newCreditCoins += betData.payOut;
      }

      await this.userDB.update(uid, { creditCoins: newCreditCoins });

      // 5. Save bet record in UserColorBetHistory
      const newBet = {
        bet: betData.bet,
        level: betData.level,
        multiplier: betData.multiplier,
        status: betData.status,
        payOut: betData.payOut,
        timestamp: betData.timestamp || new Date()
      };

      const updatedHistory = await this.colorBetHistoryDB.updateOne(
        { userId: uid },
        {
          $push: {
            stairGamesHistory: {
              $each: [newBet],
              $slice: -10
            }
          }
        },
        { upsert: true, new: true }
      );

      // 6. Return updated user data and bet history
      const updatedUser = await this.userDB.get(uid);
      return util.responseFormate({ user: updatedUser, betHistory: updatedHistory });
    } catch (error) {
      console.error('Error in updateStairGameUserHistory:', error);
      throw error;
    }
  }

  async updateLudoGameUserHistory(uid, betData) {
    try {
      if (!uid || !betData || !betData.bet || !betData.guess || !betData.roll || !betData.status) {
        throw { httpCode: 400, code: 'invalid-data', message: 'Missing required bet fields' };
      }

      // 1. Fetch user
      const user = await this.userDB.get(uid);
      if (!user) {
        throw { httpCode: 404, code: 'user-not-found', message: 'User not found' };
      }

      // 2. Check available credits
      if ((user.creditCoins ?? 0) < betData.bet) {
        throw { httpCode: 400, code: 'insufficient-credits', message: 'Insufficient Credit Coins' };
      }

      // 3. Deduct bet amount from credits
      let newCreditCoins = (user.creditCoins ?? 0) - betData.bet;

      // 4. Add payout if win
      if (betData.status === 'win') {
        newCreditCoins += betData.payOut;
      }

      await this.userDB.update(uid, { creditCoins: newCreditCoins });

      // 5. Save bet record in UserColorBetHistory
      const newBet = {
        bet: betData.bet,
        guess: betData.guess,
        roll: betData.roll,
        status: betData.status,
        payOut: betData.payOut,
        timestamp: betData.timestamp || new Date()
      };

      const updatedHistory = await this.colorBetHistoryDB.updateOne(
        { userId: uid },
        {
          $push: {
            ludoGamesHistory: {
              $each: [newBet],
              $slice: -10
            }
          }
        },
        { upsert: true, new: true }
      );

      // 6. Return updated user data and bet history
      const updatedUser = await this.userDB.get(uid);
      return util.responseFormate({ user: updatedUser, betHistory: updatedHistory });
    } catch (error) {
      console.error('Error in updateLudoGameUserHistory:', error);
      throw error;
    }
  }
  /**
   * Fetches the last 10 bets for a user
   * @param {String} uid - User ID
   * @returns {Object} - Bet history
   */
  async getUserHistory(uid) {
    try {
      const history = await this.colorBetHistoryDB.getByquery({ userId: uid });
      if (!history || history.length === 0) {
        throw { httpCode: 404, code: 'history-not-found', message: 'No bet history found for this user' };
      }
      return history;
    } catch (error) {
      console.error('Error in getUserHistory:', error);
      throw error;
    }
  }
}

module.exports = colorBetHistoryService;