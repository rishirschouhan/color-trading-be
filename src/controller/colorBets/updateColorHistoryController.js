const colorBetHistoryService = require('../../service/colorBetService');

module.exports = async (req, res, next) => {
  try {
    const ColorBetHistoryService = new colorBetHistoryService();
    const { value, uid } = req.locals;

    const result = await ColorBetHistoryService.updateColorHistory(uid, value);
    return res.status(200).send(result);
  } catch (error) {
    if (error.code && error.message) {
      return res.status(400).send({ code: error.code, message: error.message });
    }
    console.error('error', error.stack);
    res.status(500).send({ message: 'Internal Server Error' });
  }
};