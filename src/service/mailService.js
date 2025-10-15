// emailService.js
const config = require('../config/config');
const nodemailer = require('nodemailer');

// Set your SendGrid API key (use .env in real projects)
let transporter = nodemailer.createTransport({
    host: config.mailConfig.EMAIL_HOST,
    port: config.mailConfig.EMAIL_PORT,
    secure: true,
    port: 465,
    auth: {
        user: config.mailConfig.EMAIL_USER,
        pass: config.mailConfig.EMAIL_PASSWORD
    }
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
        console.log('Email sent:', info.response);
        return info; // Return the info object for successful sends
    } catch (error) {
        console.log('Error:', error);
        return false
    }

}

module.exports = {
    sendEmail,
};
