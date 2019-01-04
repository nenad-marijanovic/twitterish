'use strict';

const db = require('../models');
const utils = require('../utils/utils');
const { createHash } = require('../utils/hashing');
const sessionProperties = ['id', 'email'];
const tweetProperties = ['id', 'user_id'];
const { AuthenticationError, ConflictError } = require('../utils/errors');
const auth = require('./auth');
const { MAX_TWEET_NUMBER } = process.env;
const Op = db.Sequelize.Op;

async function register (email, password, username, first_name, last_name) {
  try {
    let user;

    await db.sequelize.transaction(async t => {
      const passwordHash = await createHash(password);

      user = await db.User.create({
        email: email,
        hash: passwordHash,
        username: username,
        first_name: first_name,
        last_name: last_name
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
    return (userTweet.dataValues);
  } catch (err) {
    throw err;
  }
}

function getTweetProperties (tweet) {
  const obj = utils.getTweetSubset(tweetProperties, tweet);
  return obj;
}

async function countUsers (email) {
  return db.User.count({
    where: {
      email: email
    }
  });
}

async function countUsersByUsername (username) {
  return db.User.count({
    where: {
      username: username
    }
  });
}

async function userDoesntExists (email, username) {
  const userEmailCount = await countUsers(email);
  const usernameCount = await countUsersByUsername(username);
  if (usernameCount === 0 && userEmailCount === 0) return true;

  return false;
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

async function listUserTweets (id, offset) {
  const User = db.User.findOne({
    where: {
      id: id
    }
  });
  if (!User) {
    throw new AuthenticationError();
  }

  let tweets;

  tweets = await db.UserTweet.findAll({
    where: {
      user_id: id
    },
    attributes: ['id', 'text'],
    offset: +offset,
    limit: +MAX_TWEET_NUMBER,
    include: {
      model: db.User,
      attributes: ['username', 'id']
    }
  });
  return tweets;
}

async function listTargetTweets (id, offset) {
  const User = db.User.findOne({
    where: {
      id: id
    }
  });
  if (!User) {
    throw new AuthenticationError();
  }

  let targets = await getUserTargets(id);

  let tweets = await db.UserTweet.findAll({
    where: {
      user_id: {
        [Op.in]: targets
      }
    },
    attributes: ['id', 'user_id', 'text'],
    order: ['created_at'],
    limit: +MAX_TWEET_NUMBER,
    offset: +offset,
    include: {
      model: db.User,
      attributes: ['id', 'username']
    }
  });
  return tweets;
}

async function getUserTargets (id) {
  let targetList = await db.Relationship.findAll({
    where: {
      follower: id
    },
    attributes: ['target']
  });
  if (!targetList) {
    return new AuthenticationError();
  }

  let targets = [];
  targetList.forEach(element => {
    targets.push(element.dataValues.target);
  });
  console.log(targets);

  return targets;
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
  unfollow,
  listUserTweets,
  listTargetTweets,
  getUserTargets
};
