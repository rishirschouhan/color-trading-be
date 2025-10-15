const { string } = require('joi');
const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const signUpReqSchema = new Schema({
    countryCode: {
        type: String,
        length: 3,
    },
    phoneNumber: {
        type: Number,
        length: 10,
        match: /[1-9]/,
        index: true,
    },
    email: {
        type: String,
        index: true,

    },
    otp: {
        type: Number,
        length: 4,
        match: /[1-9]/
    },
    createAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
}, { versionKey: false });



const signUpReqModal = mongoose.model('signUpReq', signUpReqSchema);

module.exports = signUpReqModal;