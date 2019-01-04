'use strict';

const crypto = require('crypto');

const DIGEST = 'sha512';
const ITERATIONS = 100000;
const KEY_LEN = 64;
const SALT_BYTES = 256 / 8;

function createHash (value) {
  return createHashHex(value);
}

function createHashHex (value, salt = getSaltHex(), iterations = ITERATIONS) {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(value, salt, +iterations, KEY_LEN, DIGEST, (err, derivedKey) => {
      if (err) {
        reject(err);
      } else {
        resolve([derivedKey.toString('hex'), salt, +iterations].join(':'));
      }
    });
  });
}

function getSaltHex () {
  return crypto.randomBytes(SALT_BYTES).toString('hex');
}

async function check (value, hash) {
  const p = hash.split(':');

  if (p.length === 3) {
    const newHash = await createHashHex(value, p[1], p[2]);
    return newHash === hash;
  }
  return false;
}

module.exports = {
  createHash,
  check
};
