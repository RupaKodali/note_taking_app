const crypto = require("crypto");

// Generate a random initialization vector (IV)
const iv = crypto.randomBytes(16);

// Encrypting text using AES-128-CTR
function encrypt(text, key) {
   const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
   let encrypted = cipher.update(text, 'utf8', 'hex');
   encrypted += cipher.final('hex');
   return { iv: iv.toString('hex'), encryptedData: encrypted };
}

// Decrypting text using AES-128-CTR
function decrypt(text, key) {
   const iv = Buffer.from(text.iv, 'hex');
   const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
   let decrypted = decipher.update(text.encryptedData, 'hex', 'utf8');
   decrypted += decipher.final('utf8');
   return decrypted;
}

export { encrypt, decrypt };
