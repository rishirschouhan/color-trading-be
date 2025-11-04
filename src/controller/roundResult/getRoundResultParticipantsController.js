const RoundResultService = require('../../service/roundResultService');

const roundResultService = new RoundResultService();

/**
 * Get participant count for a specific round
 */
const getRoundResultParticipants = async (req, res, next) => {
  try {
    const { roundNumber } = req.params;
    
    if (!roundNumber) {
      return res.status(400).send({
        code: 'invalid-request',
        message: 'Round number is required'
      });
    }

    const count = await roundResultService.getRoundParticipantsCount(parseInt(roundNumber));
    
    res.status(200).send({
      roundNumber: parseInt(roundNumber),
      participantsCount: count
    });
  } catch (error) {
    next(error);
  }
};

module.exports = getRoundResultParticipants;
