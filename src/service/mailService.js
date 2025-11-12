// emailService.js
const config = require('../config/config');
const nodemailer = require('nodemailer');

// Create transporter with improved timeout and connection settings
function createTransporter() {
    // Check if required email config exists
    if (!config.mailConfig.EMAIL_HOST || !config.mailConfig.EMAIL_USER || !config.mailConfig.EMAIL_PASSWORD) {
        console.error('❌ Email configuration missing. Please check your .env file.');
        console.error('Required: EMAIL_HOST, EMAIL_USER, EMAIL_PASSWORD');
        return null;
    }

    const transportConfig = {
        host: config.mailConfig.EMAIL_HOST,
        port: parseInt(config.mailConfig.EMAIL_PORT) || 587,
        secure: false, // false for STARTTLS, true for SSL on port 465
        auth: {
            user: config.mailConfig.EMAIL_USER,
            pass: config.mailConfig.EMAIL_PASSWORD
        },
        tls: {
            rejectUnauthorized: false,
            ciphers: 'SSLv3'
        },
        pool: true,
        maxConnections: 1, // Reduced for better stability
        maxMessages: 10,   // Reduced for better stability
        family: 4, // Force IPv4
        connectionTimeout: 60000,  // Increased to 60 seconds
        greetingTimeout: 30000,    // Increased to 30 seconds
        socketTimeout: 60000,      // Increased to 60 seconds
        logger: false,
        debug: false
    };

    console.log(`📧 Creating email transporter for: ${config.mailConfig.EMAIL_HOST}:${transportConfig.port}`);
    return nodemailer.createTransport(transportConfig);
}

let transporter = createTransporter();

/**
 * Send an email using SendGrid
 * @param {Object} options - Email details
 * @param {string} options.to - Recipient email address
 * @param {string} options.from - Sender (verified) email address
 * @param {string} options.subject - Subject line
 * @param {string} options.text - Plain text body
 * @param {string} options.html - HTML body
 * @returns {Promise} - Resolves if email sent, rejects if error
 */
async function sendEmail(options) {
    // Check if transporter was created successfully
    if (!transporter) {
        console.error('❌ Email transporter not initialized. Check your email configuration.');
        return false;
    }

    const mailOptions = {
        to: options.to,
        from: config.mailConfig.EMAIL_USER,
        subject: options.subject,
        text: options.text || '',
        html: options.html,
    };

    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const transientCodes = new Set(['ESOCKET', 'ETIMEDOUT', 'ECONNRESET', 'EAI_AGAIN', 'ENOTFOUND', 'ECONNREFUSED', 'ENOTFOUND']);
    const maxRetries = 3;

    // Test connection first
    try {
        console.log('🔍 Testing SMTP connection...');
        await transporter.verify();
        console.log('✅ SMTP connection verified successfully');
    } catch (verifyError) {
        console.error('❌ SMTP connection verification failed:');
        console.error('Error Code:', verifyError.code);
        console.error('Error Message:', verifyError.message);
        
        // Try to recreate transporter
        console.log('🔄 Attempting to recreate transporter...');
        transporter = createTransporter();
        if (!transporter) {
            return false;
        }
    }

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`📤 Sending email (attempt ${attempt}/${maxRetries})...`);
            let info = await transporter.sendMail(mailOptions);
            console.log('✅ Email sent successfully:', info.response);
            return info;
        } catch (error) {
            console.error(`❌ Email sending failed (attempt ${attempt}/${maxRetries}):`);
            console.error('Error Code:', error.code);
            console.error('Error Message:', error.message);

            if (transientCodes.has(error.code) && attempt < maxRetries) {
                const backoff = Math.min(2000 * Math.pow(2, attempt - 1), 10000);
                console.log(`⏳ Retrying in ${backoff}ms...`);
                await delay(backoff);
                
                // Recreate transporter on timeout errors
                if (error.code === 'ETIMEDOUT' || error.code === 'ESOCKET') {
                    console.log('🔄 Recreating transporter due to connection issue...');
                    transporter = createTransporter();
                    if (!transporter) {
                        return false;
                    }
                }
                continue;
            }

            if (error.code === 'ESOCKET' || error.code === 'ETIMEDOUT') {
                console.error('⚠️  Connection timeout - Possible causes:');
                console.error('   • Firewall blocking port 587');
                console.error('   • Network connectivity issues');
                console.error('   • SMTP server overloaded');
                console.error('   • Incorrect SMTP settings');
                if (error.address && error.port) {
                    console.error('   • Attempted connection to:', error.address, 'on port:', error.port);
                }
            }

            return false;
        }
    }

    return false;
}

module.exports = {
    sendEmail,
};
