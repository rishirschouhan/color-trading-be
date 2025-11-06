const crypto = require('crypto');

/**
 * Admin API Authentication Middleware
 * - Validates encrypted API key from X-API-Key header
 * - Validates IP address against whitelist
 * - No user access token required
 */

class AdminApiAuth {
    constructor() {
        // Get configuration from environment variables
        this.apiKey = process.env.ADMIN_API_KEY;
        this.encryptionKey = process.env.ADMIN_API_ENCRYPTION_KEY;
        this.ipWhitelist = process.env.ADMIN_IP_WHITELIST ? 
            process.env.ADMIN_IP_WHITELIST.split(',').map(ip => ip.trim()) : 
            [];
        
        // Algorithm for encryption/decryption
        this.algorithm = 'aes-256-cbc';
    }

    /**
     * Decrypt the API key from header
     */
    decrypt(encryptedText) {
        try {
            // Encrypted text format: iv:encryptedData
            const parts = encryptedText.split(':');
            if (parts.length !== 2) {
                throw new Error('Invalid encrypted format');
            }

            const iv = Buffer.from(parts[0], 'hex');
            const encryptedData = Buffer.from(parts[1], 'hex');
            
            // Create key from encryption key (must be 32 bytes for aes-256)
            const key = crypto.scryptSync(this.encryptionKey, 'salt', 32);
             console.log("::",key)
            
            const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
            let decrypted = decipher.update(encryptedData);
            decrypted = Buffer.concat([decrypted, decipher.final()]);
            
            return decrypted.toString();
        } catch (error) {
            console.error('Decryption error:', error.message);
            return null;
        }
    }

    /**
     * Get client IP address
     */
    getClientIp(request) {
        // Check various headers for IP (in case behind proxy)
        const forwarded = request.headers['x-forwarded-for'];
        if (forwarded) {
            return forwarded.split(',')[0].trim();
        }
        
        const realIp = request.headers['x-real-ip'];
        if (realIp) {
            return realIp.trim();
        }
        
        return request.connection.remoteAddress || 
               request.socket.remoteAddress || 
               request.connection.socket?.remoteAddress ||
               request.ip;
    }

    /**
     * Validate IP against whitelist
     */
    isIpWhitelisted(clientIp) {
        // If no whitelist configured, allow all (not recommended for production)
        if (this.ipWhitelist.length === 0) {
            console.warn('⚠️ WARNING: No IP whitelist configured. All IPs allowed.');
            return true;
        }

        // Normalize IPv6 localhost to IPv4
        const normalizedIp = clientIp === '::1' || clientIp === '::ffff:127.0.0.1' ? 
            '127.0.0.1' : clientIp;

        // Check if IP is in whitelist
        return this.ipWhitelist.some(whitelistedIp => {
            // Support for CIDR notation or exact match
            if (whitelistedIp.includes('/')) {
                // CIDR range check (simplified - for exact match use a library like 'ip-range-check')
                return normalizedIp.startsWith(whitelistedIp.split('/')[0].split('.').slice(0, 3).join('.'));
            }
            return normalizedIp === whitelistedIp || whitelistedIp === '*';
        });
    }

    /**
     * Middleware function
     */
    authenticate() {
        return async (request, response, next) => {
            try {
                // 1. Check if API key is configured
                if (!this.apiKey || !this.encryptionKey) {
                    console.error('Admin API authentication not configured');
                    return response.status(500).json({
                        success: false,
                        code: 'config-error',
                        message: 'Admin API authentication not configured'
                    });
                }

                // 2. Get encrypted API key from header
                const encryptedApiKey = request.headers['x-api-key'];
                if (!encryptedApiKey) {
                    return response.status(401).json({
                        success: false,
                        code: 'missing-api-key',
                        message: 'X-API-Key header is required'
                    });
                }

                // 3. Decrypt and validate API key
                const decryptedKey = this.decrypt(encryptedApiKey);
                if (!decryptedKey || decryptedKey !== this.apiKey) {
                    console.warn('Invalid API key attempt');
                    return response.status(403).json({
                        success: false,
                        code: 'invalid-api-key',
                        message: 'Invalid API key'
                    });
                }

                // 4. Get client IP
                const clientIp = this.getClientIp(request);
                console.log(` Admin API request from IP: ${clientIp}`);

                // 5. Validate IP whitelist
                if (!this.isIpWhitelisted(clientIp)) {
                    console.warn(`Unauthorized IP attempt: ${clientIp}`);
                    return response.status(403).json({
                        success: false,
                        code: 'ip-not-whitelisted',
                        message: 'Access denied: IP address not whitelisted'
                    });
                }

                // 6. Set admin context (no user data needed)
                request.locals = {
                    adminId: 'system', // You can customize this
                    isAdmin: true,
                    clientIp: clientIp
                };

                console.log('Admin API authentication successful');
                next();
            } catch (error) {
                console.error('Admin API auth error:', error.stack);
                return response.status(500).json({
                    success: false,
                    code: 'auth-error',
                    message: 'Authentication error'
                });
            }
        };
    }
}

// Export singleton instance
const adminApiAuth = new AdminApiAuth();
module.exports = adminApiAuth.authenticate();
