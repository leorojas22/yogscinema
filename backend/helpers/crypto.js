const crypto = require("crypto");
const config = require(process.cwd() + "/config");

const ENCRYPTION_KEY 	= config.encryptionKey;
const IV_LENGTH 		= 16; // For AES, this is always 16



const encrypt = (text) => {
    let iv = crypto.randomBytes(IV_LENGTH);
    let cipher = crypto.createCipheriv('aes-256-cbc', new Buffer(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text);

    encrypted = Buffer.concat([encrypted, cipher.final()]);

    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

const decrypt = (text) => {
    let textParts = text.split(':');
    let iv = new Buffer(textParts.shift(), 'hex');
    let encryptedText = new Buffer(textParts.join(':'), 'hex');
    let decipher = crypto.createDecipheriv('aes-256-cbc', new Buffer(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);

    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString();
}

const sha1 = (text) => {
    return crypto.createHash("sha1").update(text).digest("hex");
}

const base64 = {
    encode: (text) => {
        return Buffer.from(text).toString("base64");
    },
    decode: (text) => {
        return Buffer.from(text, "base64").toString();
    }
}

module.exports = { decrypt, encrypt, sha1, base64 };
