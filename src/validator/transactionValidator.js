const Joi = require("joi");

const withdrawValidator = (req, res, next) => {
    const { body } = req;

    const schema = Joi.object({
        amount: Joi.number().min(100).required().messages({
            'number.min': 'Minimum withdrawal amount is 100 Rs',
            'any.required': 'Amount is required'
        }),
        paymentMethod: Joi.string().valid('bank', 'upi', 'crypto').required().messages({
            'any.only': 'Payment method must be bank, upi, or crypto',
            'any.required': 'Payment method is required'
        }),
        // Bank details
        bankAccountNumber: Joi.when('paymentMethod', {
            is: 'bank',
            then: Joi.string().pattern(/^[0-9]{9,18}$/).required().messages({
                'string.pattern.base': 'Bank account number must be 9-18 digits',
                'any.required': 'Bank account number is required for bank withdrawal'
            }),
            otherwise: Joi.forbidden()
        }),
        ifscCode: Joi.when('paymentMethod', {
            is: 'bank',
            then: Joi.string().pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/).uppercase().required().messages({
                'string.pattern.base': 'Invalid IFSC code format',
                'any.required': 'IFSC code is required for bank withdrawal'
            }),
            otherwise: Joi.forbidden()
        }),
        // UPI details
        upiId: Joi.when('paymentMethod', {
            is: 'upi',
            then: Joi.string().pattern(/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/).required().messages({
                'string.pattern.base': 'Invalid UPI ID format',
                'any.required': 'UPI ID is required for UPI withdrawal'
            }),
            otherwise: Joi.forbidden()
        }),
        // Crypto details
        walletAddress: Joi.when('paymentMethod', {
            is: 'crypto',
            then: Joi.string().min(26).max(62).required().messages({
                'string.min': 'Wallet address must be at least 26 characters',
                'string.max': 'Wallet address must not exceed 62 characters',
                'any.required': 'Wallet address is required for crypto withdrawal'
            }),
            otherwise: Joi.forbidden()
        }),
        remarks: Joi.string().max(500).optional()
    });

    try {
        const { error, value } = schema.validate(body, {
            abortEarly: false,
            stripUnknown: true
        });
        
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }
        
        // Get uid from access token middleware
        const uid = req.locals?.value?.uid;
        if (!uid) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized - User ID not found'
            });
        }
        
        req.locals = { value, uid };
        next();
    } catch (err) {
        console.error('Withdraw validation error:', err);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};

const depositValidator = (req, res, next) => {
    const { body } = req;

    const schema = Joi.object({
        amount: Joi.number().min(20).required().messages({
            'number.min': 'Minimum deposit amount is 20 Rs',
            'any.required': 'Amount is required'
        }),
    });

    try {
        const { error, value } = schema.validate(body, {
            abortEarly: false,
            stripUnknown: true
        });
        
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }
        
        // Get uid from access token middleware
        const uid = req.locals?.value?.uid;
        if (!uid) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized - User ID not found'
            });
        }
        
        req.locals = { value, uid };
        next();
    } catch (err) {
        console.error('Deposit validation error:', err);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};

const updateTransactionStatusValidator = (req, res, next) => {
    const { body, params } = req;

    // Check if this is a direct deposit (email in body) or transaction status update (transactionId in params)
    const isDirectDeposit = body.email && body.amount;

    if (isDirectDeposit) {
        // Validate direct deposit via email
        const bodySchema = Joi.object({
            email: Joi.string().email().required().messages({
                'string.email': 'Please provide a valid email address',
                'any.required': 'Email is required'
            }),
            amount: Joi.number().min(20).required().messages({
                'number.min': 'Minimum deposit amount is 20 Rs',
                'any.required': 'Amount is required'
            }),
            status: Joi.string().valid('done', 'rejected', 'failed').required().messages({
                'any.only': 'status must be done, rejected, or failed',
                'any.required': 'status is required'
            }), 
            remarks: Joi.string().max(500).optional()
        });

        try {
            const { error: bodyError, value: bodyValue } = bodySchema.validate(body, {
                abortEarly: false,
                stripUnknown: true
            });
            
            if (bodyError) {
                return res.status(400).json({
                    success: false,
                    message: bodyError.details[0].message
                });
            }
            
            // Get admin ID from admin API auth middleware
            const adminId = req.locals?.adminId || req.locals?.value?.uid || 'system';
            
            req.locals = { 
                value: bodyValue,
                isDirectDeposit: true,
                adminId: adminId 
            };
            next();
        } catch (err) {
            console.error('Direct deposit validation error:', err);
            return res.status(500).json({
                success: false,
                message: 'Internal Server Error'
            });
        }
    } else {
        
        const bodySchema = Joi.object({
            transactionId: Joi.string().required(),
            status: Joi.string().valid('done', 'rejected', 'failed').required().messages({
                'any.only': 'status must be done, rejected, or failed',
                'any.required': 'status is required'
            }),
            remarks: Joi.string().max(500).optional()
        });

        try {
            // Validate body
            const { error: bodyError, value: bodyValue } = bodySchema.validate(body, {
                abortEarly: false,
                stripUnknown: true
            });
            
            if (bodyError) {
                return res.status(400).json({
                    success: false,
                    message: bodyError.details[0].message
                });
            }
            
            // Get admin ID from admin API auth middleware (or use existing if present)
            const adminId = req.locals?.adminId || req.locals?.value?.uid || 'system';
            
            req.locals = { 
                value: bodyValue, 
                transactionId: bodyValue.transactionId,
                isDirectDeposit: false,
                adminId: adminId 
            };
            next();
        } catch (err) {
            console.error('Update transaction status validation error:', err);
            return res.status(500).json({
                success: false,
                message: 'Internal Server Error'
            });
        }
    }
};

const getTransactionHistoryValidator = (req, res, next) => {
    const { query } = req;

    const schema = Joi.object({
        type: Joi.string().valid('withdraw', 'deposit', 'all').optional().default('all'),
        status: Joi.string().valid('in-progress', 'credited', 'added', 'rejected', 'failed', 'all').optional().default('all'),
        page: Joi.number().integer().min(1).optional().default(1),
        limit: Joi.number().integer().min(1).max(100).optional().default(10)
    });

    try {
        const { error, value } = schema.validate(query, {
            abortEarly: false,
            stripUnknown: true
        });
        
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }
        
        // Get uid from access token middleware
        const uid = req.locals?.value?.uid;
        if (!uid) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized - User ID not found'
            });
        }
        
        req.locals = { value, uid };
        next();
    } catch (err) {
        console.error('Get transaction history validation error:', err);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};

module.exports = {
    withdrawValidator,
    updateTransactionStatusValidator,
    getTransactionHistoryValidator
};
