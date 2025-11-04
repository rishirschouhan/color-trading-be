const RoundResultDB = require('../db/roundResult/roundResult.db.processor');
const util = require('../util/util');

class RoundResultService {
  constructor() {
    this.roundResultDB = new RoundResultDB();
  }

  /**
   * Get round result by round number
   * @param {Number} roundNumber - Round number
   * @returns {Object} Round result
   */
  async getRoundResult(roundNumber) {
    try {
      const result = await this.roundResultDB.getByRoundNumber(roundNumber);
      if (!result) {
        throw { httpCode: 404, code: 'round-not-found', message: 'Round result not found' };
      }
      return util.roundResultResponseFormat(result);
    } catch (error) {
      console.error('Error in getRoundResult:', error);
      throw error;
    }
  }

  /**
   * Get latest round results
   * @param {Number} limit - Number of results to return
   * @returns {Object} Array of round results
   */
  async getLatestResults(limit = 10) {
    try {
      const results = await this.roundResultDB.getLatest(limit);
      return util.roundResultResponseFormat(results);
    } catch (error) {
      console.error('Error in getLatestResults:', error);
      throw error;
    }
  }

  /**
   * Get current round number
   * @returns {Object} Current round number
   */
  getCurrentRoundNumber() {
    try {
      const moment = require('moment-timezone');
      const now = moment().tz('UTC');
      const roundNumber = now.hours() * 60 + now.minutes();
      return { 
        roundNumber,
        timestamp: now.toISOString(),
        secondsRemaining: 60 - now.seconds()
      };
    } catch (error) {
      console.error('Error in getCurrentRoundNumber:', error);
      throw error;
    }
  }

  /**
   * Get participant count for a specific round
   * @param {Number} roundNumber - Round number
   * @returns {Number} Participant count
   */
  async getRoundParticipantsCount(roundNumber) {
    try {
      const count = await this.roundResultDB.getParticipantsCount(roundNumber);
      return count;
    } catch (error) {
      console.error('Error in getRoundParticipantsCount:', error);
      return 0;
    }
  }
}

module.exports = RoundResultService;
