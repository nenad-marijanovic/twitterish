'use strict';

const hashing = require('../utils/hashing');
/**
 *Checks if password sent through the request matches the password hash from the user's data.
 *Returns true if password matches the one in the database.
 *
 * @param {string} hash
 * Contains the password hash from the user's data
 * @param {string} password
 * contains string of password sent through the request.
 */
async function checkPassword (hash, password) {
  const ok = await hashing.check(password, hash);

  if (!ok) {
    return false;
  }
  return true;
}

module.exports = {
  checkPassword
};
