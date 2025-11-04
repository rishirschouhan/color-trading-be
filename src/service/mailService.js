// emailService.js
const config = require('../config/config');
const nodemailer = require('nodemailer');

// Set your SendGrid API key (use .env in real projects)
let transporter = nodemailer.createTransport({
    host: config.mailConfig.EMAIL_HOST,
    port: 587, // Use 587 for STARTTLS (more reliable than 465)
    secure: false, // false for STARTTLS, true for SSL on port 465
    auth: {
        user: config.mailConfig.EMAIL_USER,
        pass: config.mailConfig.EMAIL_PASSWORD
    },
    tls: {
        rejectUnauthorized: false // Accept self-signed certificates (use cautiously)
    },
    connectionTimeout: 10000, // 10 seconds timeout
    greetingTimeout: 10000,
    socketTimeout: 10000
});

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
    const mailOptions = {
        to: options.to,
        from: config.mailConfig.EMAIL_USER,
        subject: options.subject,
        text: options.text || '',
        html: options.html,
    };

    try {
        let info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully:', info.response);
        return info; // Return the info object for successful sends
    } catch (error) {
        console.error('❌ Email sending failed:');
        console.error('Error Code:', error.code);
        console.error('Error Message:', error.message);
        
        if (error.code === 'ESOCKET' || error.code === 'ETIMEDOUT') {
            console.error('⚠️  Connection timeout - Check firewall/network settings');
            console.error('Attempted connection to:', error.address, 'on port:', error.port);
        }
        
        return false;
    }

}

module.exports = {
    sendEmail,
};
