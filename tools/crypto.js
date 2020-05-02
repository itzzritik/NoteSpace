const CryptoJS = require('crypto-js'),
    encrypt = (plainString, KEY) => {
        var keyForCryptoJS = CryptoJS.enc.Base64.parse(KEY);
        var encryptedData = CryptoJS.AES.encrypt(plainString.trim(), keyForCryptoJS, { mode: CryptoJS.mode.ECB });
        return encryptedData.toString().replace(/\r?\n|\r/g, '');
    },
    decrypt = (encryptString, KEY) => {
        var keyForCryptoJS = CryptoJS.enc.Base64.parse(KEY);
        var decodeBase64 = CryptoJS.enc.Base64.parse(encryptString.trim());
        var decryptedData = CryptoJS.AES.decrypt({ ciphertext: decodeBase64 }, keyForCryptoJS, { mode: CryptoJS.mode.ECB });
        return decryptedData.toString(CryptoJS.enc.Utf8);
    };

module.exports = { encrypt, decrypt };