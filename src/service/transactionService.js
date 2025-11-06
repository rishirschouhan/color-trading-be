const transactionDB = require('../db/transaction/transaction.db.proccessor');
const userDB = require('../db/user/user.db.proccessor');
const TelegramNotification = require('../util/telegramNotification');
const mongoose = require('mongoose');

class TransactionService {
    constructor() {
        this.transactionDB = new transactionDB();
        this.userDB = new userDB();
        this.telegram = new TelegramNotification();
    }

    generateTransactionId() {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 10000);
        return `TXN${timestamp}${random}`;
    }

    async createWithdrawal(uid, withdrawalData) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Get user details
            const user = await this.userDB.get(uid);
            if (!user) {
                throw { httpCode: 404, code: 'user-not-found', message: 'User not found' };
            }

            // Check if user has sufficient balance
            if (user.creditCoins < withdrawalData.amount) {
                throw {
                    httpCode: 400,
                    code: 'insufficient-balance',
                    message: `Insufficient balance. Available: ₹${user.creditCoins}, Required: ₹${withdrawalData.amount}`
                };
            }

            // Deduct balance from user (1 Rs = 1 coin)
            const newBalance = user.creditCoins - withdrawalData.amount;
            await this.userDB.update(uid, { creditCoins: newBalance });

            // Create transaction record
            const transactionData = {
                userId: uid,
                type: 'withdraw',
                amount: withdrawalData.amount,
                paymentMethod: withdrawalData.paymentMethod,
                bankAccountNumber: withdrawalData.bankAccountNumber,
                ifscCode: withdrawalData.ifscCode,
                upiId: withdrawalData.upiId,
                walletAddress: withdrawalData.walletAddress,
                status: 'in-progress',
                transactionId: this.generateTransactionId(),
                remarks: withdrawalData.remarks
            };

            const transaction = await this.transactionDB.create(transactionData);

            // Commit transaction
            await session.commitTransaction();
            session.endSession();

            // Send Telegram notification (non-blocking)
            this.telegram.notifyWithdrawal(transaction, user).catch(err => {
                console.error('Failed to send Telegram notification:', err);
            });

            return {
                success: true,
                message: 'Withdrawal request submitted successfully',
                data: {
                    transactionId: transaction.transactionId,
                    amount: transaction.amount,
                    status: transaction.status,
                    newBalance: newBalance,
                    createdAt: transaction.createdAt
                }
            };
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }

    async createDeposit(uid, depositData) {
        try {
            // Get user details
            const user = await this.userDB.get(uid);
            if (!user) {
                throw { httpCode: 404, code: 'user-not-found', message: 'User not found' };
            }

            // Create transaction record
            const transactionData = {
                userId: uid,
                type: 'deposit',
                amount: depositData.amount,
                status: 'in-progress',
                transactionId: this.generateTransactionId(),
            };

            const transaction = await this.transactionDB.create(transactionData);

            // Send Telegram notification (non-blocking)
            this.telegram.notifyDeposit(transaction, user).catch(err => {
                console.error('Failed to send Telegram notification:', err);
            });

            return {
                success: true,
                message: 'Deposit request submitted successfully. Your account will be credited after verification.',
                data: {
                    transactionId: transaction.transactionId,
                    amount: transaction.amount,
                    status: transaction.status,
                    createdAt: transaction.createdAt
                }
            };
        } catch (error) {
            throw error;
        }
    }

    async createDirectDeposit(depositData, adminId) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Find user by email
            const user = await this.userDB.getByquery({ email: depositData.email });
            if (!user || user.length === 0) {
                throw {
                    httpCode: 404,
                    code: 'user-not-found',
                    message: 'User not found with the provided email address'
                };
            }

            const foundUser = user[0];

            // Generate transaction ID
            const transactionId = this.generateTransactionId();

            // Create transaction record with 'done' status
            const transactionData = {
                userId: foundUser._id,
                type: 'deposit',
                amount: depositData.amount,
                status: depositData.status || 'in-progress',
                transactionId: transactionId,
                remarks: depositData.remarks || '',
                processedAt: new Date()
            };

            // Only set processedBy if adminId is a valid ObjectId (not 'system')
            if (adminId && adminId !== 'system' && mongoose.Types.ObjectId.isValid(adminId)) {
                transactionData.processedBy = adminId;
            }

            const transaction = await this.transactionDB.create(transactionData);

            let newBalance = foundUser.creditCoins;
            // Credit user account only if status is 'done'
            if (depositData.status === 'done') {
                newBalance = foundUser.creditCoins + depositData.amount;
                await this.userDB.update(foundUser._id, { creditCoins: newBalance });
            }

            // Commit transaction
            await session.commitTransaction();
            session.endSession();

            // Send Telegram notification (non-blocking)
            this.telegram.notifyDeposit(transaction, foundUser).catch(err => {
                console.error('Failed to send Telegram notification:', err);
            });

            const message = depositData.status === 'done' 
                ? 'Deposit completed successfully. User account has been credited.'
                : 'Deposit transaction created successfully.';

            return {
                success: true,
                message: message,
                data: {
                    transactionId: transaction.transactionId,
                    email: foundUser.email,
                    amount: transaction.amount,
                    status: transaction.status,
                    newBalance: newBalance,
                    createdAt: transaction.createdAt,
                    processedAt: transaction.processedAt
                }
            };
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }

    async updateTransactionStatus(transactionId, statusData, adminId) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Get transaction
            const transaction = await this.transactionDB.getByTransactionId(transactionId);
            if (!transaction) {
                throw { httpCode: 404, code: 'transaction-not-found', message: 'Transaction not found' };
            }

            // Check if transaction is already processed
            if (transaction.status === 'done') {
                throw {
                    httpCode: 400,
                    code: 'already-processed',
                    message: 'Transaction already processed'
                };
            }

            const updateData = {
                status: statusData.status,
                remarks: statusData.remarks,
                processedAt: new Date()
            };

            // Only set processedBy if adminId is a valid ObjectId (not 'system')
            if (adminId && adminId !== 'system' && mongoose.Types.ObjectId.isValid(adminId)) {
                updateData.processedBy = adminId;
            }

            // If deposit is approved, add credit to user
            if (transaction.type === 'deposit' && statusData.status === 'done') {
                const user = await this.userDB.get(transaction.userId._id);
                if (!user) {
                    throw { httpCode: 404, code: 'user-not-found', message: 'User not found' };
                }

                const newBalance = user.creditCoins + transaction.amount;
                await this.userDB.update(transaction.userId._id, { creditCoins: newBalance });
            }

            // If withdrawal is rejected, refund the amount
            if (transaction.type === 'withdraw' && (statusData.status === 'rejected' || statusData.status === 'failed')) {
                const user = await this.userDB.get(transaction.userId._id);
                if (!user) {
                    throw { httpCode: 404, code: 'user-not-found', message: 'User not found' };
                }

                const newBalance = user.creditCoins + transaction.amount;
                await this.userDB.update(transaction.userId._id, { creditCoins: newBalance });
            }

            // Update transaction
            const updatedTransaction = await this.transactionDB.update(transactionId, updateData);

            await session.commitTransaction();
            session.endSession();

            return {
                success: true,
                message: 'Transaction status updated successfully',
                data: updatedTransaction
            };
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }

    async getTransactionHistory(uid, filters) {
        try {
            const query = { userId: uid };

            // Add type filter
            if (filters.type && filters.type !== 'all') {
                query.type = filters.type;
            }

            // Add status filter
            if (filters.status && filters.status !== 'all') {
                query.status = filters.status;
            }

            const result = await this.transactionDB.getByQueryPaginated(
                query,
                filters.page,
                filters.limit
            );

            return {
                success: true,
                data: result.transactions,
                pagination: result.pagination
            };
        } catch (error) {
            throw error;
        }
    }

    async getTransactionById(transactionId) {
        try {
            const transaction = await this.transactionDB.getByTransactionId(transactionId);
            if (!transaction) {
                throw { httpCode: 404, code: 'transaction-not-found', message: 'Transaction not found' };
            }

            return {
                success: true,
                data: transaction
            };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = TransactionService;
