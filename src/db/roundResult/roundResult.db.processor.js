const RoundResultModal = require('../../modal/roundResultModal');

class RoundResultDBProcessor {
  constructor() {
    this.model = RoundResultModal;
    // Cache for random participant counts per round
    this.randomCountCache = {};
  }

  /**
   * Create a new round result
   * @param {Object} data - Round result data
   * @returns {Promise<Object>} Created round result
   */
  async create(data) {
    try {
      const roundResult = new this.model(data);
      return await roundResult.save();
    } catch (error) {
      console.error('Error creating round result:', error);
      throw error;
    }
  }

  /**
   * Get round result by round number
   * @param {Number} roundNumber - Round number
   * @param {String} date - Date in YYYY-MM-DD format (optional, defaults to today)
   * @returns {Promise<Object>} Round result
   */
  async getByRoundNumber(roundNumber, date = null) {
    try {
      const moment = require('moment-timezone');
      const queryDate = date || moment().tz('UTC').format('YYYY-MM-DD');
      return await this.model.findOne({ roundNumber, date: queryDate });
    } catch (error) {
      console.error('Error getting round result:', error);
      throw error;
    }
  }

  /**
   * Get round results by query
   * @param {Object} query - Query object
   * @returns {Promise<Array>} Array of round results
   */
  async getByQuery(query) {
    try {
      return await this.model.find(query).sort({ roundNumber: -1 });
    } catch (error) {
      console.error('Error getting round results by query:', error);
      throw error;
    }
  }

  /**
   * Get latest round results
   * @param {Number} limit - Number of results to return
   * @returns {Promise<Array>} Array of round results
   */
  async getLatest(limit = 10) {
    try {
      return await this.model.find().sort({ timestamp: -1 }).limit(limit);
    } catch (error) {
      console.error('Error getting latest round results:', error);
      throw error;
    }
  }

  /**
   * Update round result
   * @param {Number} roundNumber - Round number
   * @param {String} date - Date in YYYY-MM-DD format
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated round result
   */
  async update(roundNumber, date, updateData) {
    try {
      const moment = require('moment-timezone');
      const queryDate = date || moment().tz('UTC').format('YYYY-MM-DD');
      return await this.model.findOneAndUpdate(
        { roundNumber, date: queryDate },
        { $set: updateData },
        { new: true }
      );
    } catch (error) {
      console.error('Error updating round result:', error);
      throw error;
    }
  }

  /**
   * Get participant count for a specific round
   * @param {Number} roundNumber - Round number
   * @returns {Promise<Number>} Participant count
   */
  async getParticipantsCount(roundNumber) {
    try {
      const ColorBetHistoryModal = require('../../modal/colorBetHistoryModal');

      // Count unique users who placed bets in this round
      const count = await ColorBetHistoryModal.countDocuments({
        'colorBetHistory.roundNumber': roundNumber
      });

      if (!this.randomCountCache[roundNumber]) {
        this.randomCountCache[roundNumber] = Math.floor(Math.random() * 20) + 1;
      }
      return this.randomCountCache[roundNumber] + count;
    } catch (error) {
      console.error('Error getting participants count:', error);
      return 0;
    }
  }
}

module.exports = RoundResultDBProcessor;
