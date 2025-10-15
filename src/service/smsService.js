// smsService.js
const twilio = require('twilio');

// Use environment variables or a config file in real apps
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

/**
 * Send OTP via SMS using Twilio
 * @param {string} phoneNumber - Recipient phone number (E.164 format, e.g. +91XXXXXXXXXX)
 * @param {string} otp - OTP code
 * @param {string} type - Type of OTP (e.g. 'login', 'register', 'verify', etc.)
 */
async function sendOTP(phoneNumber, otp, type = 'verify') {
  const messageBody = getMessageBody(otp, type);

  try {
    const message = await client.messages.create({
      body: messageBody,
      from: twilioNumber,
      to: phoneNumber,
    });

    console.log('SMS sent:', message.sid);
    return { success: true, sid: message.sid };
   
  } catch (error) {
    console.error('Twilio SMS Error:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Get dynamic message body based on type
 */
function getMessageBody(otp, type) {
  const action = {
    login: 'login to your account',
    register: 'complete your registration',
    verify: 'verify your identity',
  }[type] || 'verify your action';

  return `Your OTP to ${action} is ${otp}. It is valid for 5 minutes. Do not share it with anyone.`;
}

module.exports = { sendOTP };
