const TransactionService = require('../../service/transactionService');

module.exports = async (req, res, next) => {
    try {
        const transactionService = new TransactionService();
        const { value, transactionId, isDirectDeposit, adminId } = req.locals;

        let result;
        if (isDirectDeposit) {
            // Handle direct deposit via email
            result = await transactionService.createDirectDeposit(value, adminId);
        } else {
            // Handle existing transaction status update
            result = await transactionService.updateTransactionStatus(transactionId, value, adminId);
        }
        
        return res.status(200).send(result);
    } catch (error) {
        if (error.code && error.message) {
            const statusCode = error.httpCode || 400;
            return res.status(statusCode).send({ 
                success: false,
                code: error.code, 
                message: error.message 
            });
        }
        console.error('Transaction operation error:', error.stack);
        res.status(500).send({ 
            success: false,
            message: 'Internal Server Error' 
        });
    }
};
