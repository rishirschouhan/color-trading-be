const userCntrl = require("./getuserController")
const loginCntrl = require("./loginController")
const signUpCntrl = require("./signUpController")
const verifyOtpCntrl = require("./verifyOtpController")
const updateUserCntrl = require("./updateUserController")

module.exports = {
    user:userCntrl,
    login:loginCntrl,
    signup:signUpCntrl,
    verifyOTP:verifyOtpCntrl,
    update:updateUserCntrl,
}