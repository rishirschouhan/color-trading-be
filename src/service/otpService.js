
const signUpReqDB = require('../db/signup/mongo.db.signupreq');
class otpService {
    constructor() {
        this.signUpReqDb = new signUpReqDB()
    }

    async verifyOtp(otpData) {
        try {
            const dbOtpData = (await this.signUpReqDb.getByquery({ email: otpData.email }))?.[0];
            if (!dbOtpData) throw { httpCode: 404, code: 'otp-not-found', message: `Please generate otp` }
            if (dbOtpData?.otp === otpData.otp) {
                await this.signUpReqDb.delete(dbOtpData._id)
                return { message: 'otp verified' };
            }
            throw { httpCode: 400, code: 'otp-invalid', message: `Invalid otp` }
        } catch (error) {
            throw error
        }
    }
}

module.exports = otpService;