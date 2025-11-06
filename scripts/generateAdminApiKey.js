const crypto = require('crypto');

/**
 * Utility script to generate encrypted API key
 * Usage: node scripts/generateAdminApiKey.js
 */

// Configuration
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'your-secret-api-key-here';
const ADMIN_API_ENCRYPTION_KEY = process.env.ADMIN_API_ENCRYPTION_KEY || 'your-encryption-key-here';

const algorithm = 'aes-256-cbc';

function encrypt(text, encryptionKey) {
    try {
        // Generate random IV (initialization vector)
        const iv = crypto.randomBytes(16);
        
        // Create key from encryption key (must be 32 bytes for aes-256)
        const key = crypto.scryptSync(encryptionKey, 'salt', 32);
        
        // Create cipher
        const cipher = crypto.createCipheriv(algorithm, key, iv);
        
        // Encrypt the text
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        // Return IV and encrypted data (both needed for decryption)
        return `${iv.toString('hex')}:${encrypted}`;
    } catch (error) {
        console.error('Encryption error:', error.message);
        return null;
    }
}

function decrypt(encryptedText, encryptionKey) {
    try {
        const parts = encryptedText.split(':');
        if (parts.length !== 2) {
            throw new Error('Invalid encrypted format');
        }

        const iv = Buffer.from(parts[0], 'hex');
        const encryptedData = Buffer.from(parts[1], 'hex');
        
        const key = crypto.scryptSync(encryptionKey, 'salt', 32);
        
        const decipher = crypto.createDecipheriv(algorithm, key, iv);
        let decrypted = decipher.update(encryptedData);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        
        return decrypted.toString();
    } catch (error) {
        console.error('Decryption error:', error.message);
        return null;
    }
}

// Generate encrypted API key
console.log('\n🔐 Admin API Key Generator\n');
console.log('=' .repeat(60));

if (ADMIN_API_KEY === 'your-secret-api-key-here' || ADMIN_API_ENCRYPTION_KEY === 'your-encryption-key-here') {
    console.log('\n⚠️  WARNING: Using default keys. Please set environment variables:\n');
    console.log('   ADMIN_API_KEY=your-secret-api-key');
    console.log('   ADMIN_API_ENCRYPTION_KEY=your-encryption-key\n');
    console.log('Or update the values in this script.\n');
}

const encryptedKey = encrypt(ADMIN_API_KEY, ADMIN_API_ENCRYPTION_KEY);

console.log('\n📋 Configuration:');
console.log('-'.repeat(60));
console.log(`Plain API Key:       ${ADMIN_API_KEY}`);
console.log(`Encryption Key:      ${ADMIN_API_ENCRYPTION_KEY}`);
console.log('\n🔑 Encrypted API Key (use this in X-API-Key header):');
console.log('-'.repeat(60));
console.log(`${encryptedKey}`);

// Verify decryption works
const decrypted = decrypt(encryptedKey, ADMIN_API_ENCRYPTION_KEY);
console.log('\n✅ Verification:');
console.log('-'.repeat(60));
console.log(`Decrypted Key:       ${decrypted}`);
console.log(`Match:               ${decrypted === ADMIN_API_KEY ? '✓ Success' : '✗ Failed'}`);

console.log('\n📝 Usage Example:');
console.log('-'.repeat(60));
console.log(`
curl -X PUT http://localhost:3000/api/transaction/status/TXN123456 \\
  -H "X-API-Key: ${encryptedKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "status": "credited",
    "remarks": "Payment processed"
  }'
`);

console.log('\n💡 Add to your .env file:');
console.log('-'.repeat(60));
console.log(`ADMIN_API_KEY=${ADMIN_API_KEY}`);
console.log(`ADMIN_API_ENCRYPTION_KEY=${ADMIN_API_ENCRYPTION_KEY}`);
console.log(`ADMIN_IP_WHITELIST=127.0.0.1,::1,your.server.ip.here`);

console.log('\n' + '='.repeat(60) + '\n');
