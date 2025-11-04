const express = require('express');
const accessToken = require("../middleware/accesstoken.js")
const userCntrl = require("../controller/user/index.js")
const UserReqValidator = require("../validator/userReqValidator.js");
const refreshToken = require("../middleware/refreshToken.js");

const routes = express();

routes.post('/login', UserReqValidator.userLoginValidator, userCntrl.login)

routes.post('/sign-up', UserReqValidator.signUpValidator, userCntrl.signup)

routes.post('/verify-otp', UserReqValidator.verifyOtpValidator, userCntrl.verifyOTP)

routes.get('/refresh-token', refreshToken)

routes.get('/get-profile', accessToken, userCntrl.user)
routes.put('/update-user', accessToken, UserReqValidator.updateUserValidator, userCntrl.update)

module.exports = routes;