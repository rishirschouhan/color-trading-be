const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const otpDataSchema = new Schema({
    countryCode: {
        type: String,
        maxlength: 3,
    },
    otp: {
        type: String,
        minlength: 4,
        maxlength: 6,
        match: /^[0-9]+$/
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
}, { versionKey: false });

const userSchema = new Schema({
    name: {
        type: String,
        // required: true,
        trim: true
    },
    emoji: {
        type: String,
        trim: true,
        maxlength: 10
    },
    age: {
        type: Number,
        min: 1,
        max: 150,
        index: true
    },
    countryCode: {
        type: String,
        maxlength: 3,
    },
    phoneNumber: {
        type: String,
        maxlength: 15,
        match: /^[1-9][0-9]*$/,
        index: true,
        sparse: true  // allows null values with unique index
    },
    email: {
        type: String,
        index: true,
        unique: true,
        required: true,
        lowercase: true,
        trim: true,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    creditCoins: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    otpData: otpDataSchema,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
}, { 
    versionKey: false,
    timestamps: true  // automatically handles createdAt and updatedAt
});

// Add pre-save middleware to update the updatedAt field
userSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;