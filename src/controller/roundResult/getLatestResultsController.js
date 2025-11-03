const RoundResultService = require('../../service/roundResultService');

const roundResultService = new RoundResultService();

/**
 * Get latest round results
 */
const getLatestResults = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    if (limit < 1 || limit > 100) {
      return res.status(400).send({
        code: 'invalid-request',
        message: 'Limit must be between 1 and 100'
      });
    }

    const results = await roundResultService.getLatestResults(limit);
    res.status(200).send(results);
  } catch (error) {
    next(error);
  }
};

module.exports = getLatestResults;
