const withdrawTransaction = require('./withdrawController');
const depositTransaction = require('./depositController');
const getTransactions = require('./getTransactionsController');
const updateTransactionStatus = require('./updateTransactionStatusController');

module.exports = {
    withdrawTransaction,
    depositTransaction,
    getTransactions,
    updateTransactionStatus
};
