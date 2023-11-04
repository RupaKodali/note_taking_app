import crypto from 'crypto';

function encryptNote(noteContent, encryptionKey) {
    console.log("encryptionKey",encryptionKey,encryptionKey.length);
    const iv = crypto.randomBytes(16); // Generate a random IV
    const cipher = crypto.createCipheriv('aes-256-cbc', encryptionKey, iv);
    const encryptedNoteContent = cipher.update(noteContent, 'utf8', 'hex') + cipher.final('hex');
    return {
        iv: iv.toString('hex'),
        encryptedNoteContent,
    };
}

function decryptNote(encryptedNote, encryptionKey) {
    const iv = Buffer.from(encryptedNote.iv, 'hex'); // Parse the IV from the input
    const decipher = crypto.createDecipheriv('aes-256-cbc', encryptionKey, iv);
    const decryptedNoteContent = decipher.update(encryptedNote.encryptedNoteContent, 'hex', 'utf8') + decipher.final('utf8');
    return decryptedNoteContent;
}

export { encryptNote, decryptNote };
