'use strict';

const db = require('../models');
const utils = require('../utils/utils');
const { createHash } = require('../utils/hashing');
const sessionProperties = ['id', 'email'];

async function register (email, password) {
  try {
    let user;

    await db.sequelize.transaction(async t => {
      const passwordHash = await createHash(password);

      user = await db.User.create({
        email: email,
        hash: passwordHash
      }, { transaction: t });

      if (!user) {
        throw new Error('Failed to create a user');
      }
    });
    return getSessionProperties(user);
  } catch (err) {
    throw err;
  }
}

function getSessionProperties (User) {
  const obj = utils.getSubset(sessionProperties, User);
  return obj;
}

async function countUsers (email) {
  return db.User.count({
    where: {
      email: email
    }
  });
}

async function userDoesntExists (email) {
  const userCount = await countUsers(email);
  return userCount === 0;
}

module.exports = {
  register,
  getSessionProperties,
  userDoesntExists,
  countUsers
};
