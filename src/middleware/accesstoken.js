const Config = require('../config/config');
const userDB = require('../db/user/user.db.proccessor');
const JWT = require('jsonwebtoken');
const { responseFormate } = require('../util/util');

module.exports = async (request, response, next) => {
  try {
    const accessToken = request.headers['authorization']?.split(' ')[1];
    if (!accessToken) return response.status(404).send({ code: "accesstoken required in headers" })
    const accessTokenDecoded = JWT.decode(accessToken);
    const secret = Config.jwt.user.secret
    JWT.verify(accessToken, secret);

    let userData;
    const userDatabase = new userDB();
    userData = await userDatabase.get(accessTokenDecoded.uid);


    if (!userData) return response.status(404).send({ code: "Invalid-Access-Token" });
    request.locals = { value: responseFormate(userData, false) }
    next();
  } catch (error) {
    console.error(`-- error in verifyAccessToken in access token service: ` + error.stack)
    switch (error.message) {
      case 'invalid token':
      case 'jwt expired':
      case 'jwt malformed':
      case 'jwt not active':
      case 'jwt signature is required':
      case 'invalid signature':
      case 'invalid algorithm':
        console.error(error.message);
        return response.status(404).send({ code: "Invalid-Access-Token" })
      default:
        return response.status(500).send({ code: "Invalid-Access-Token" })
    }
  }
}