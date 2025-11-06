const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const transactionSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ['withdraw', 'deposit'],
        required: true,
        index: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    paymentMethod: {
        type: String,
        enum: ['bank', 'upi', 'crypto'],
        required: function() {
            // Payment method only required for withdrawals
            return this.type === 'withdraw';
        }
    },
    // Bank details
    bankAccountNumber: {
        type: String,
        trim: true,
        validate: {
            validator: function(v) {
                if (this.paymentMethod === 'bank') {
                    return v && /^[0-9]{9,18}$/.test(v);
                }
                return true;
            },
            message: 'Invalid bank account number'
        }
    },
    ifscCode: {
        type: String,
        trim: true,
        uppercase: true,
        validate: {
            validator: function(v) {
                if (this.paymentMethod === 'bank') {
                    return v && /^[A-Z]{4}0[A-Z0-9]{6}$/.test(v);
                }
                return true;
            },
            message: 'Invalid IFSC code'
        }
    },
    // UPI details
    upiId: {
        type: String,
        trim: true,
        validate: {
            validator: function(v) {
                if (this.paymentMethod === 'upi') {
                    return v && /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(v);
                }
                return true;
            },
            message: 'Invalid UPI ID'
        }
    },
    // Crypto details
    walletAddress: {
        type: String,
        trim: true,
        validate: {
            validator: function(v) {
                if (this.paymentMethod === 'crypto') {
                    return v && v.length >= 26 && v.length <= 62;
                }
                return true;
            },
            message: 'Invalid wallet address'
        }
    },
    status: {
        type: String,
        enum: ['in-progress', 'done', 'rejected', 'failed'],
        default: 'in-progress',
        required: true,
        index: true
    },
    transactionId: {
        type: String,
        unique: true,
        required: true,
        index: true
    },
    // For deposit - user provided transaction reference
    referenceId: {
        type: String,
        trim: true
    },
    remarks: {
        type: String,
        trim: true,
        maxlength: 500
    },
    processedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    processedAt: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    versionKey: false,
    timestamps: true
});

// Pre-save validation
transactionSchema.pre('save', function(next) {
    // Validate payment method specific fields only for withdrawals
    if (this.type === 'withdraw' && this.paymentMethod) {
        if (this.paymentMethod === 'bank') {
            if (!this.bankAccountNumber || !this.ifscCode) {
                return next(new Error('Bank account number and IFSC code are required for bank transactions'));
            }
        } else if (this.paymentMethod === 'upi') {
            if (!this.upiId) {
                return next(new Error('UPI ID is required for UPI transactions'));
            }
        } else if (this.paymentMethod === 'crypto') {
            if (!this.walletAddress) {
                return next(new Error('Wallet address is required for crypto transactions'));
            }
        }
    }
    
    this.updatedAt = Date.now();
    next();
});

// Index for efficient queries
transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ status: 1, type: 1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
