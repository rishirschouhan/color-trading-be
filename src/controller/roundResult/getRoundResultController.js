const RoundResultService = require('../../service/roundResultService');

const roundResultService = new RoundResultService();

/**
 * Get round result by round number
 */
const getRoundResult = async (req, res, next) => {
  try {
    const { roundNumber } = req.params;
    
    if (!roundNumber) {
      return res.status(400).send({
        code: 'invalid-request',
        message: 'Round number is required'
      });
    }

    const result = await roundResultService.getRoundResult(parseInt(roundNumber));
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};

module.exports = getRoundResult;
