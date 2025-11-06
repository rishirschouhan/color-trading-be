const TransactionService = require('../../service/transactionService');

module.exports = async (req, res, next) => {
    try {
        const transactionService = new TransactionService();
        const { value, uid } = req.locals;

        const result = await transactionService.createDeposit(uid, value);
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
        console.error('Deposit error:', error.stack);
        res.status(500).send({ 
            success: false,
            message: 'Internal Server Error' 
        });
    }
};
