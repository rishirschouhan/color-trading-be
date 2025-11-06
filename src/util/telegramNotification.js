const TelegramBot = require('node-telegram-bot-api');
const https = require('https');

class TelegramNotification {
    constructor() {
        this.botToken = process.env.TELEGRAM_BOT_TOKEN;
        this.chatId = process.env.TELEGRAM_CHAT_ID;
        
        console.log('Initializing Telegram bot...');
        console.log('Bot token present:', !!this.botToken);
        console.log('Chat ID present:', !!this.chatId);
        
        // Validate bot token format
        if (this.botToken && !this.botToken.match(/^\d+:[A-Za-z0-9_-]+$/)) {
            console.warn('Invalid Telegram bot token format. Expected format: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz');
            console.warn('Token starts with:', this.botToken.substring(0, 10) + '...');
            this.bot = null;
            return;
        }
        
        // Initialize bot only if token is configured
        if (this.botToken) {
            try {
                this.bot = new TelegramBot(this.botToken, { 
                    polling: false,
                    filepath: false,
                    request: {
                        agentClass: https.Agent,
                        agentOptions: {
                            rejectUnauthorized: false,
                            keepAlive: true
                        }
                    }
                });
                
                console.log('✅ Telegram bot initialized successfully');
            } catch (error) {
                console.error('❌ Failed to initialize Telegram bot:', error.message);
                this.bot = null;
            }
        } else {
            console.warn('⚠️ Telegram bot token not configured in environment variables');
        }
    }

    async sendMessage(message) {
        try {
            if (!this.botToken || !this.chatId) {
                console.warn('Telegram bot token or chat ID not configured');
                return { success: false, message: 'Telegram not configured' };
            }

            if (!this.bot) {
                console.warn('Telegram bot not initialized');
                return { success: false, message: 'Telegram bot not initialized' };
            }

            const response = await this.bot.sendMessage(this.chatId, message, {
                parse_mode: 'HTML'
            });

            console.log('Telegram notification sent successfully');
            return { success: true, data: response };
        } catch (error) {
             console.error('Telegram notification error:', error);
            // Log only essential error information
            const errorMessage = error.response?.body?.description || error.message;
            
            // Don't log full HTML error responses
            if (errorMessage.includes('<!DOCTYPE') || errorMessage.includes('<html')) {
                console.error('Telegram notification error: Invalid bot token or API endpoint issue');
            } else {
                console.error('Telegram notification error:', errorMessage);
            }
            
            return { success: false, error: errorMessage };
        }
    }

    formatWithdrawalNotification(transaction, user) {
        const paymentDetails = this.getPaymentDetails(transaction);
        
        return `
🔴 <b>WITHDRAWAL REQUEST</b> 🔴

📋 <b>Transaction ID:</b> ${transaction.transactionId}
👤 <b>User:</b> ${user.name || 'N/A'} (${user.email})
💰 <b>Amount:</b> ₹${transaction.amount}
💳 <b>Payment Method:</b> ${transaction.paymentMethod?.toUpperCase()}

${paymentDetails}

⏰ <b>Requested At:</b> ${new Date(transaction.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
${transaction.remarks ? `📝 <b>Remarks:</b> ${transaction.remarks}` : ''}

⚠️ <b>Action Required:</b> Please process this withdrawal request.
        `.trim();
    }

    formatDepositNotification(transaction, user) {
        const paymentDetails = this.getPaymentDetails(transaction);
        
        return `
🟢 <b>DEPOSIT REQUEST</b> 🟢

📋 <b>Transaction ID:</b> ${transaction.transactionId}
👤 <b>User:</b> ${user.name || 'N/A'} (${user.email})
💰 <b>Amount:</b> ₹${transaction.amount}
💳 <b>Payment Method:</b> ${transaction.paymentMethod?.toUpperCase()}

${paymentDetails}

${transaction.referenceId ? `🔖 <b>Reference ID:</b> ${transaction.referenceId}` : ''}
⏰ <b>Requested At:</b> ${new Date(transaction.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
${transaction.remarks ? `📝 <b>Remarks:</b> ${transaction.remarks}` : ''}

⚠️ <b>Action Required:</b> Please verify and process this deposit.
        `.trim();
    }

    getPaymentDetails(transaction) {
        switch (transaction.paymentMethod) {
            case 'bank':
                return `🏦 <b>Bank Account:</b> ${transaction.bankAccountNumber}
🔢 <b>IFSC Code:</b> ${transaction.ifscCode}`;
            case 'upi':
                return `📱 <b>UPI ID:</b> ${transaction.upiId}`;
            case 'crypto':
                return `₿ <b>Wallet Address:</b> ${transaction.walletAddress}`;
            default:
                return '';
        }
    }

    async notifyWithdrawal(transaction, user) {
        const message = this.formatWithdrawalNotification(transaction, user);
        return await this.sendMessage(message);
    }

    async notifyDeposit(transaction, user) {
        const message = this.formatDepositNotification(transaction, user);
        return await this.sendMessage(message);
    }
}

module.exports = TelegramNotification;
