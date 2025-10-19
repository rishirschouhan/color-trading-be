const colorBetHistoryService = require('../../service/colorBetService');

module.exports = async (req, res, next) => {
  try {
    const ColorBetHistoryService = new colorBetHistoryService();
    const { value } = req.locals
    console.log(":::::UID in get user history controller", value.uid);
    const result = await ColorBetHistoryService.getUserHistory(value.uid);
    return res.status(200).send(result);
  } catch (error) {
    if (error.code && error.message) {
      return res.status(error.httpCode || 400).send({ code: error.code, message: error.message });
    }
    console.error('error', error.stack);
    res.status(500).send({ message: 'Internal Server Error' });
  }
};