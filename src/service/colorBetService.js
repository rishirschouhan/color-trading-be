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
  async updateUserHistory(uid, betData) {
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
        timestamp: betData.timestamp || new Date()
      };

      const updatedHistory = await this.colorBetHistoryDB.updateOne(
        { userId: uid },
        {
          $push: {
            bets: {
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
      console.error('Error in updateUserHistory:', error);
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
      console.log(":::::Fetched History", history);
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