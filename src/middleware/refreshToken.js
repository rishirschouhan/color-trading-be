const Config = require('../config/config');
const userDB = require('../db/user/user.db.proccessor');
const JWT = require('jsonwebtoken');
const { refreshToken } = require('../util/util');

module.exports = async (request, response, next) => {
  try {
    const refreshtoken = request.headers['authorization']?.split(' ')[1]
    if (!refreshtoken) return response.status(404).send({ code: "refreshtoken required in headers" });
    const refreshTokenDecoded = JWT.decode(refreshtoken);
    const secret = Config.jwt.user.secret
    JWT.verify(refreshtoken, secret);

    const userDatabase = new userDB();
    const userData = await userDatabase.get(refreshTokenDecoded.uid);

    if (!userData) return response.status(404).send({ code: "Invalid-refresh-Token" })

    const authTokens = refreshToken({ uid: refreshTokenDecoded.uid, role: refreshTokenDecoded.role }, refreshtoken);

    return response.status(200).send(authTokens);

  } catch (error) {
    console.error(`-- error in verifyrefreshToken in refresh token service: ` + error.stack)
    switch (error.message) {
      case 'invalid token':
      case 'jwt expired':
      case 'jwt malformed':
      case 'jwt not active':
      case 'jwt signature is required':
      case 'invalid signature':
      case 'invalid algorithm':
        console.error(error.message);
        return response.status(401).send({ code: "Invalid-refresh-Token" })
      default:
        return response.status(401).send({ code: "Invalid-refresh-Token" })
    }
  }
}