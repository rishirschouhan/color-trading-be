// emailService.js
const config = require('../config/config');
const nodemailer = require('nodemailer');
const https = require('https');

// Create transporter with improved timeout and connection settings
function createTransporter() {
    // Check if required email config exists
    if (!config.mailConfig.EMAIL_HOST || !config.mailConfig.EMAIL_USER || !config.mailConfig.EMAIL_PASSWORD) {
        console.error('❌ Email configuration missing. Please check your .env file.');
        console.error('Required: EMAIL_HOST, EMAIL_USER, EMAIL_PASSWORD');
        return null;
    }

    // Detect if running on Render or similar cloud platform
    const isCloudDeployment = process.env.RENDER || process.env.NODE_ENV === 'production';
    
    const transportConfig = {
        host: config.mailConfig.EMAIL_HOST,
        port: parseInt(config.mailConfig.EMAIL_PORT) || (isCloudDeployment ? 2587 : 587),
        secure: false, // false for STARTTLS, true for SSL on port 465
        auth: {
            user: config.mailConfig.EMAIL_USER,
            pass: config.mailConfig.EMAIL_PASSWORD
        },
        tls: {
            rejectUnauthorized: false,
            ciphers: 'SSLv3'
        },
        pool: !isCloudDeployment, // Disable pooling on cloud platforms
        maxConnections: isCloudDeployment ? 1 : 2,
        maxMessages: isCloudDeployment ? 1 : 10,
        family: 4, // Force IPv4
        connectionTimeout: isCloudDeployment ? 30000 : 60000,
        greetingTimeout: isCloudDeployment ? 15000 : 30000,
        socketTimeout: isCloudDeployment ? 30000 : 60000,
        logger: false,
        debug: false
    };

    // Log deployment environment
    if (isCloudDeployment) {
        console.log('🌐 Cloud deployment detected - using optimized SMTP settings');
        console.log('📧 SMTP Config:', {
            host: transportConfig.host,
            port: transportConfig.port,
            secure: transportConfig.secure
        });
    }

    console.log(`📧 Creating email transporter for: ${config.mailConfig.EMAIL_HOST}:${transportConfig.port}`);
    return nodemailer.createTransport(transportConfig);
}

let transporter = createTransporter();

// Fallback email function using SendGrid HTTP API (works better on cloud platforms)
async function sendEmailViaSendGrid(options) {
    const sendgridApiKey = process.env.SENDGRID_API_KEY;
    
    if (!sendgridApiKey) {
        console.log('⚠️  SendGrid API key not found, cannot use HTTP fallback');
        return false;
    }

    const emailData = JSON.stringify({
        personalizations: [{
            to: [{ email: options.to }],
            subject: options.subject
        }],
        from: { email: config.mailConfig.EMAIL_USER },
        content: [
            { type: 'text/plain', value: options.text || '' },
            { type: 'text/html', value: options.html || options.text || '' }
        ]
    });

    const requestOptions = {
        hostname: 'api.sendgrid.com',
        port: 443,
        path: '/v3/mail/send',
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${sendgridApiKey}`,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(emailData)
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(requestOptions, (res) => {
            let responseData = '';
            res.on('data', (chunk) => responseData += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    console.log('✅ Email sent via SendGrid HTTP API');
                    resolve(true);
                } else {
                    console.error('❌ SendGrid API error:', res.statusCode, responseData);
                    resolve(false);
                }
            });
        });

        req.on('error', (error) => {
            console.error('❌ SendGrid HTTP request failed:', error.message);
            resolve(false);
        });

        req.setTimeout(30000, () => {
            console.error('❌ SendGrid HTTP request timeout');
            req.destroy();
            resolve(false);
        });

        req.write(emailData);
        req.end();
    });
}

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
                
                // Try HTTP API fallback on cloud platforms
                const isCloudDeployment = process.env.RENDER || process.env.NODE_ENV === 'production';
                if (isCloudDeployment) {
                    console.log('🔄 Attempting HTTP API fallback...');
                    const fallbackResult = await sendEmailViaSendGrid(options);
                    if (fallbackResult) {
                        return fallbackResult;
                    }
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
