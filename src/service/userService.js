
const userDB = require('../db/user/user.db.proccessor');
const signUpReqDB = require('../db/signup/signup.db.proccessor');
const { UserSchema } = require('../util/schema/userSchema');
const util = require('../util/util');
const { sendOTP } = require('./smsService');
const { sendEmail } = require('./mailService');
const { generateOtpEmail } = require('../templates/otpMail');

class userService {
    constructor() {
        this.userDB = new userDB()
        this.signUpReqDb = new signUpReqDB()

    }

    async getUser({ uid }) {
        try {
            const user = await this.userDB.get(uid);
            console.log("::::::::::user", user);
            if (!user) throw { httpCode: 404, code: 'user-not-found', message: `Invalid User Id` }
            return user;
        } catch (error) {
            throw error
        }
    }


    async userLogin(loginData) {
        try {
            let userData
            // TODO: convert email to lower case before db call 
            if (loginData.email) {
                userData = (await this.userDB.getByquery({ email: loginData.email }))?.[0]
            } else if (loginData.phoneNumber) {
                userData = (await this.userDB.getByquery({ phoneNumber: loginData.phoneNumber }))?.[0];
            }
            if (!userData) throw { httpCode: 404, code: 'user-not-found', message: loginData.email ? `This email ${loginData.email}  does not exist` : `This phoneNumber ${loginData.phoneNumber} does not exist` }

            if (loginData.otp !== userData?.otpData?.otp) {
                throw { httpCode: 400, code: 'invalide-otp', message: `Invalid otp` }
            };

            await this.userDB.update(userData._id, { otpData: null })

            return util.responseFormate(userData);
        } catch (error) {
            throw error
        }
    }

    async signUp(signUpData) {
        try {
            let querData = {}
            if (signUpData.email) {
                querData = { email: signUpData.email }
            } else if (signUpData.phoneNumber) {
                querData = { phoneNumber: signUpData.phoneNumber }
            }

            const userData = (await this.userDB.getByquery(querData))?.[0]
            const otpData = util.generateOTP(signUpData)
            if (userData) {
                await this.userDB.update(userData._id, { otpData: otpData })
            } else {
                await this.userDB.create({ ...new UserSchema(signUpData), otpData })
            }
            const otpOptions = [];
            console.log("::::::::::otpData", otpData);
            if (signUpData.phoneNumber) otpOptions.push(sendOTP(signUpData.countryCode || '+880' + signUpData.phoneNumber, 'login'));
            if (signUpData.email) {
                otpOptions.push(sendEmail({
                    to: signUpData.email,
                    subject: "Login OTP",
                    text: 'Login Otp',
                    html: generateOtpEmail('login', { otpCode: otpData.otp }),
                }))
            }
            Promise.all(otpOptions)
            return { message: 'Do Register with your otp' };
        } catch (error) {
            throw error
        }
    }
    async updateUser(uid, userData) {
        try {
            // TODO: convert email to lower case before db call 
            const emailData = userData.email && (await this.userDB.getByquery({ email: userData.email }))?.[0]
            if (emailData && emailData.email) {
                if (userData.email != emailData.email) {
                    throw { code: 'duplicate-email', message: `This email is already exist ${userData.email}` }
                } else if (userData.email === emailData.email) {
                    delete userData.email;
                }
            }
            const phoneData = userData.phoneNumber && (await this.userDB.getByquery({ phoneNumber: userData.phoneNumber }))?.[0]
            if (phoneData && phoneData.phoneNumber) {
                if (phoneData.phoneNumber != userData.phoneNumber) {
                    throw { code: 'duplicate-phones-number', message: `This phoneNumber is already exist ${userData.phoneNumber}` }
                } else if (phoneData.phoneNumber === userData.phoneNumber) {
                    delete userData.phoneNumber;
                }
            }

            const updateData = {
                countryCode: userData.countryCode,
                phoneNumber: userData.phoneNumber,
                email: userData.email,
                name: userData.name,
                emoji: userData.emoji
            }
            await this.userDB.update(uid, JSON.parse(JSON.stringify(updateData)));
            const user = await this.userDB.get(uid)
            return util.responseFormate(user);
        } catch (error) {
            console.log(error)
            throw error
        }
    }
   
}



module.exports = userService;