const express = require('express');
const router = express.Router();
const transactionController = require('../controller/transaction');
const accesstoken = require('../middleware/accesstoken');
const adminApiAuth = require('../middleware/adminApiAuth');
const {
    withdrawValidator,
    updateTransactionStatusValidator,
    getTransactionHistoryValidator
} = require('../validator/transactionValidator');

// User endpoints - Secure transaction routes with validation
router.post('/withdraw', accesstoken, withdrawValidator, transactionController.withdrawTransaction);
router.get('/history', accesstoken, getTransactionHistoryValidator, transactionController.getTransactions);

// Admin endpoint - Direct deposit via email (requires encrypted API key + IP whitelist)
router.post('/status', adminApiAuth, updateTransactionStatusValidator, transactionController.updateTransactionStatus);

module.exports = router;
