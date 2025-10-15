const otpEmailTemplate = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{{emailTitle}}</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, {{primaryGradient}} 0%, {{secondaryGradient}} 100%);
            min-height: 100vh;
            color: #333;
        }
        
        .email-wrapper {
            padding: 30px 15px;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .email-container {
            max-width: 600px;
            width: 100%;
            background: #ffffff;
            border-radius: 20px;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
            overflow: hidden;
            position: relative;
        }
        
        .header {
            background: linear-gradient(135deg, {{headerPrimary}} 0%, {{headerSecondary}} 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            animation: pulse 3s ease-in-out infinite;
        }
        
        .header-icon {
            width: 90px;
            height: 90px;
            margin: 0 auto 20px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 45px;
            position: relative;
            z-index: 2;
            backdrop-filter: blur(10px);
            border: 2px solid rgba(255, 255, 255, 0.3);
        }
        
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
            position: relative;
            z-index: 2;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .header-subtitle {
            margin: 10px 0 0 0;
            font-size: 16px;
            opacity: 0.9;
            font-weight: 300;
            position: relative;
            z-index: 2;
        }
        
        .content {
            padding: 40px 30px;
            background: #ffffff;
        }
        
        .greeting {
            font-size: 18px;
            color: #2c3e50;
            margin-bottom: 25px;
            font-weight: 600;
        }
        
        .message {
            font-size: 16px;
            line-height: 1.6;
            color: #555;
            margin-bottom: 30px;
        }
        
        .otp-container {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border: 2px dashed {{borderColor}};
            border-radius: 15px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
            position: relative;
            overflow: hidden;
        }
        
        .otp-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(45deg, transparent 48%, rgba(255,255,255,0.1) 50%, transparent 52%);
            animation: shimmer 2s infinite;
        }
        
        .otp-label {
            font-size: 14px;
            color: #6c757d;
            margin-bottom: 15px;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .otp-code {
            font-size: 36px;
            font-weight: 900;
            color: {{primaryColor}};
            font-family: 'Courier New', monospace;
            letter-spacing: 8px;
            margin: 15px 0;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            position: relative;
            z-index: 1;
        }
        
        .otp-validity {
            font-size: 14px;
            color: #dc3545;
            font-weight: 600;
            margin-top: 15px;
        }
        
        .security-notice {
            background: linear-gradient(135deg, #fff3cd 0%, #fdf6e3 100%);
            border-left: 5px solid #ffc107;
            padding: 20px;
            margin: 30px 0;
            border-radius: 8px;
            font-size: 14px;
            line-height: 1.5;
        }
        
        .security-notice-icon {
            font-size: 20px;
            margin-right: 10px;
            vertical-align: middle;
        }
        
        .instructions {
            background: #f8f9fa;
            border-radius: 12px;
            padding: 25px;
            margin: 25px 0;
        }
        
        .instructions h3 {
            margin: 0 0 15px 0;
            color: #2c3e50;
            font-size: 18px;
            font-weight: 600;
        }
        
        .instructions ul {
            margin: 0;
            padding-left: 20px;
            color: #555;
        }
        
        .instructions li {
            margin-bottom: 8px;
            line-height: 1.5;
        }
        
        .cta-section {
            text-align: center;
            margin: 35px 0;
        }
        
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, {{buttonPrimary}} 0%, {{buttonSecondary}} 100%);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 50px;
            font-weight: 600;
            font-size: 16px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .footer {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            padding: 25px 30px;
            text-align: center;
            font-size: 13px;
            color: #6c757d;
            border-top: 1px solid #e9ecef;
        }
        
        .footer-links {
            margin: 15px 0;
        }
        
        .footer-links a {
            color: {{primaryColor}};
            text-decoration: none;
            margin: 0 10px;
            font-weight: 500;
        }
        
        .social-icons {
            margin: 20px 0 10px 0;
        }
        
        .social-icon {
            display: inline-block;
            width: 35px;
            height: 35px;
            background: {{primaryColor}};
            color: white;
            border-radius: 50%;
            text-align: center;
            line-height: 35px;
            margin: 0 5px;
            font-size: 16px;
            opacity: 0.8;
            transition: all 0.3s ease;
        }
        
        /* Responsive Design */
        @media (max-width: 600px) {
            .email-wrapper {
                padding: 15px 10px;
            }
            
            .header, .content {
                padding: 30px 20px;
            }
            
            .header h1 {
                font-size: 24px;
            }
            
            .otp-code {
                font-size: 28px;
                letter-spacing: 4px;
            }
        }
        
        /* Animations */
        @keyframes pulse {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 0.6; }
        }
        
        @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
        }
        
        .email-container {
            animation: slideUp 0.6s ease-out;
        }
        
        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="email-container">
            <div class="header">
                <div class="header-icon">{{headerIcon}}</div>
                <h1>{{headerTitle}}</h1>
                <p class="header-subtitle">{{headerSubtitle}}</p>
            </div>
            
            <div class="content">
                <div class="greeting">Hello {{userName}},</div>
                
                <div class="message">
                    {{mainMessage}}
                </div>
                
                <div class="otp-container">
                    <div class="otp-label">Your {{otpType}} Code</div>
                    <div class="otp-code">{{otpCode}}</div>
                    <div class="otp-validity">⏰ Valid for {{expiryTime}} minutes</div>
                </div>
                
                <div class="security-notice">
                    <span class="security-notice-icon">🔐</span>
                    <strong>Security Notice:</strong> Never share this code with anyone. Our team will never ask for your OTP via phone or email.
                </div>
                
                <div class="instructions">
                    <h3>{{instructionTitle}}</h3>
                    <ul>
                        {{instructionsList}}
                    </ul>
                </div>
                
                <div style="margin-top: 40px; padding-top: 30px; border-top: 2px solid #f8f9fa; text-align: center;">
                    <p style="color: #6c757d; margin: 0;">
                        If you didn't request this {{otpType}}, please ignore this email or contact our support team.
                    </p>
                </div>
            </div>
            
            <div class="footer">
                <div class="social-icons">
                    <span class="social-icon">📧</span>
                    <span class="social-icon">🔒</span>
                    <span class="social-icon">⚡</span>
                </div>
                <p>This is an automated message. Please do not reply to this email.</p>
                <div class="footer-links">
                    <a href="#">Privacy Policy</a> | 
                    <a href="#">Terms of Service</a> | 
                    <a href="#">Contact Support</a>
                </div>
                <p style="margin: 15px 0 0 0; font-size: 12px; opacity: 0.8;">
                    © 2024 Your Company Name. All rights reserved.
                </p>
            </div>
        </div>
    </div>
</body>
</html>
`;

// Configuration for different OTP types
const otpConfigs = {
    login: {
        emailTitle: 'Login Verification Code',
        headerIcon: '🔐',
        headerTitle: 'Secure Login',
        headerSubtitle: 'Verify your identity to continue',
        mainMessage: 'We received a request to sign in to your account. Use the verification code below to complete your login process.',
        instructionTitle: 'How to use this code:',
        instructionsList: `
            <li>Go back to the login page where you requested the code</li>
            <li>Enter the 6-digit code in the verification field</li>
            <li>Click "Verify" to complete your login</li>
            <li>You will be automatically signed in to your account</li>
        `,
        ctaSection: `
            <div class="cta-section">
                <a href="{{loginUrl}}" class="cta-button">Continue Login</a>
            </div>
        `,
        primaryGradient: '#667eea',
        secondaryGradient: '#764ba2',
        headerPrimary: '#4c63d2',
        headerSecondary: '#6c5ce7',
        primaryColor: '#6c5ce7',
        borderColor: '#6c5ce7',
        buttonPrimary: '#6c5ce7',
        buttonSecondary: '#a29bfe'
    },
    
    verification: {
        emailTitle: 'Account Verification Code',
        headerIcon: '✅',
        headerTitle: 'Verify Account',
        headerSubtitle: 'Complete your account setup',
        mainMessage: 'Thank you for signing up! Please use the verification code below to verify your email address and activate your account.',
        instructionTitle: 'Complete your verification:',
        instructionsList: `
            <li>Return to the verification page</li>
            <li>Enter the 6-digit code provided below</li>
            <li>Click "Verify Email" to activate your account</li>
            <li>You can then access all features of your account</li>
        `,
        ctaSection: `
            <div class="cta-section">
                <a href="{{verificationUrl}}" class="cta-button">Verify Account</a>
            </div>
        `,
        primaryGradient: '#11998e',
        secondaryGradient: '#38ef7d',
        headerPrimary: '#00b894',
        headerSecondary: '#00cec9',
        primaryColor: '#00b894',
        borderColor: '#00b894',
        buttonPrimary: '#00b894',
        buttonSecondary: '#55efc4'
    },
    
    passwordReset: {
        emailTitle: 'Password Reset Code',
        headerIcon: '🔄',
        headerTitle: 'Reset Password',
        headerSubtitle: 'Secure password recovery',
        mainMessage: 'We received a request to reset your password. Use the verification code below to create a new password for your account.',
        instructionTitle: 'Reset your password:',
        instructionsList: `
            <li>Go to the password reset page</li>
            <li>Enter the verification code below</li>
            <li>Create a strong new password</li>
            <li>Confirm your new password and save changes</li>
        `,
        ctaSection: `
            <div class="cta-section">
                <a href="{{resetUrl}}" class="cta-button">Reset Password</a>
            </div>
        `,
        primaryGradient: '#fd79a8',
        secondaryGradient: '#fdcb6e',
        headerPrimary: '#e84393',
        headerSecondary: '#fd79a8',
        primaryColor: '#e84393',
        borderColor: '#e84393',
        buttonPrimary: '#e84393',
        buttonSecondary: '#fd79a8'
    },
    
    twoFactor: {
        emailTitle: 'Two-Factor Authentication Code',
        headerIcon: '🛡️',
        headerTitle: '2FA Security',
        headerSubtitle: 'Enhanced account protection',
        mainMessage: 'Your account security is important to us. Please use the two-factor authentication code below to complete your secure login.',
        instructionTitle: 'Complete 2FA verification:',
        instructionsList: `
            <li>Enter the 6-digit code in the 2FA field</li>
            <li>Click "Authenticate" to proceed</li>
            <li>Your login will be completed securely</li>
            <li>Consider using an authenticator app for faster access</li>
        `,
        ctaSection: `
            <div class="cta-section">
                <a href="{{twoFactorUrl}}" class="cta-button">Complete 2FA</a>
            </div>
        `,
        primaryGradient: '#a29bfe',
        secondaryGradient: '#6c5ce7',
        headerPrimary: '#5f3dc4',
        headerSecondary: '#7950f2',
        primaryColor: '#7950f2',
        borderColor: '#7950f2',
        buttonPrimary: '#7950f2',
        buttonSecondary: '#a29bfe'
    }
};

// Function to generate OTP email based on type
function generateOtpEmail(otpType, options = {}) {
    const {
        userName = 'User',
        otpCode = '123456',
        expiryTime = 10,
        loginUrl = '#',
        verificationUrl = '#',
        resetUrl = '#',
        twoFactorUrl = '#'
    } = options;
    
    if (!otpConfigs[otpType]) {
        throw new Error(`Invalid OTP type: ${otpType}. Valid types are: ${Object.keys(otpConfigs).join(', ')}`);
    }
    
    const config = otpConfigs[otpType];
    
    let html = otpEmailTemplate;
    
    // Replace all template variables
    const replacements = {
        ...config,
        userName,
        otpCode,
        otpType: otpType.charAt(0).toUpperCase() + otpType.slice(1),
        expiryTime,
        loginUrl,
        verificationUrl,
        resetUrl,
        twoFactorUrl
    };
    
    Object.keys(replacements).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        html = html.replace(regex, replacements[key]);
    });
    
    return html;
}

module.exports = { generateOtpEmail, otpConfigs };