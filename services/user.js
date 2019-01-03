'use strict';

const db = require('../models');
const utils = require('../utils/utils');
const { createHash } = require('../utils/hashing');
const sessionProperties = ['id', 'email'];
const tweetProperties = ['id', 'user_id'];
const { AuthenticationError, ConflictError } = require('../utils/errors');
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

async function createTweet (id, text, timestamp) {
  try {
    let userTweet;

    await db.sequelize.transaction(async t => {
      userTweet = await db.UserTweet.create({
        user_id: id,
        text: text,
        timestamp: timestamp
      }, { transaction: t });
      if (!userTweet) {
        throw new Error('Failed to create user tweet');
      }
    });
    return getTweetProperties(userTweet);
  } catch (err) {
    throw err;
  }
}

function getTweetProperties (tweet) {
  const obj = utils.getSubset(tweetProperties, tweet);
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

async function follow (id, target) {
  if (id === target) throw new ConflictError();
  const User = await db.User.findOne({
    where: {
      id: id
    }
  });
  if (!User) {
    throw new AuthenticationError();
  }
  const targetUser = await db.User.findOne({
    where: {
      id: target
    }
  });
  if (!targetUser) {
    throw new AuthenticationError();
  }

  const Rel = await db.Relationship.findOne({
    where: {
      target: target,
      follower: id
    }
  });
  if (Rel) {
    throw new ConflictError();
  }

  let userFollow;
  await db.sequelize.transaction(async t => {
    userFollow = await db.Relationship.create({
      target: target,
      follower: id
    }, { transaction: t });
    if (!userFollow) {
      throw new Error('Failed to create relationship');
    }
  });
}

async function unfollow (id, target) {
  if (id === target) throw new ConflictError();
  const User = await db.User.findOne({
    where: {
      id: id
    }
  });
  if (!User) {
    throw new AuthenticationError();
  }
  const targetUser = await db.User.findOne({
    where: {
      id: target
    }
  });
  if (!targetUser) {
    throw new AuthenticationError();
  }
  const Rel = await db.Relationship.findOne({
    where: {
      target: target,
      follower: id
    }
  });
  if (!Rel) {
    throw new AuthenticationError();
  }

  await db.Relationship.destroy({
    where: {
      target: target,
      follower: id
    }
  });
}

module.exports = {
  register,
  login,
  getSessionProperties,
  getTweetProperties,
  createTweet,
  userDoesntExists,
  countUsers,
  follow,
  unfollow
};
