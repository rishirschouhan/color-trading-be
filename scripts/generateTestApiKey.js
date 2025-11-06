const crypto = require('crypto');

/**
 * Quick test API key generator
 * Generates encrypted API key for testing
 */

// Test configuration - you can change these
const ADMIN_API_KEY = 'test-admin-key-123';
const ADMIN_API_ENCRYPTION_KEY = 'test-encryption-key-456';

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

// Generate encrypted API key
console.log('\n🔐 TEST API Key Generator\n');
console.log('='.repeat(70));

const encryptedKey = encrypt(ADMIN_API_KEY, ADMIN_API_ENCRYPTION_KEY);

console.log('\n📋 Test Configuration:');
console.log('-'.repeat(70));
console.log(`Plain API Key:       ${ADMIN_API_KEY}`);
console.log(`Encryption Key:      ${ADMIN_API_ENCRYPTION_KEY}`);

console.log('\n🔑 Encrypted API Key (copy this):');
console.log('-'.repeat(70));
console.log(encryptedKey);

console.log('\n📝 Add to your .env file:');
console.log('-'.repeat(70));
console.log(`ADMIN_API_KEY=${ADMIN_API_KEY}`);
console.log(`ADMIN_API_ENCRYPTION_KEY=${ADMIN_API_ENCRYPTION_KEY}`);
console.log(`ADMIN_IP_WHITELIST=127.0.0.1,::1`);

console.log('\n🧪 Test with cURL:');
console.log('-'.repeat(70));
console.log(`
curl -X PUT http://localhost:3000/api/transaction/status/TXN123456 \\
  -H "X-API-Key: ${encryptedKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "status": "credited",
    "remarks": "Test payment"
  }'
`);

console.log('='.repeat(70));
console.log('\n✅ Ready to test!\n');
