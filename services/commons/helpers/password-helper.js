const crypto = require('crypto');

// Encrypts the given password
export function getEncryptedPassword(password) {
  let hash = crypto
    .createHash('md5')
    .update(password)
    .digest('hex');

  return hash;
}
