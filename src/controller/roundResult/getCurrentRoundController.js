const RoundResultService = require('../../service/roundResultService');

const roundResultService = new RoundResultService();

/**
 * Get current round number and time remaining
 */
const getCurrentRound = async (req, res, next) => {
  try {
    const result = roundResultService.getCurrentRoundNumber();
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};

module.exports = getCurrentRound;
