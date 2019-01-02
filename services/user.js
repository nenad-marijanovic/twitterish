'use strict';

const db = require('../models');
const utils = require('../utils/utils');
const { createHash } = require('../utils/hashing');
const sessionProperties = ['id', 'email'];
const { AuthenticationError } = require('../utils/errors');
const auth = require('./auth');

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

async function login (email, password) {
  const User = await db.User.findOne({
    where: {
      email: email
    }
  });
  if (!User) {
    throw new AuthenticationError();
  }

  const ok = await auth.checkPassword(User.hash, password);

  if (!ok) {
    throw new AuthenticationError();
  }
  return getSessionProperties(User.dataValues);
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
  login,
  getSessionProperties,
  userDoesntExists,
  countUsers
};
