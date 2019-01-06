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

/**
 * Creates a new user entity in the database.
 * Creates a password hash,then enters a new row in users table via SQL Transaction with given parameters and
 returns session properties of user. @see sessionProperties()
 *
 * @param {string} email
 * @param {string} password
 * @param {string} username
 * @param {string} first_name
 * @param {string} last_name
 */
async function register (email, password, username, firstName, lastName) {
  try {
    let user;

    await db.sequelize.transaction(async t => {
      const passwordHash = await createHash(password);

      user = await db.User.create({
        email: email,
        hash: passwordHash,
        username: username,
        first_name: firstName,
        last_name: lastName
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

/**
 *Checks if user with given e-mail exists, then checks if password matches the one in the database.
 if all is correct, returns session properties of given user. @see getSessionProperties()
 *
 *
 * @param {string} email
 * @param {string} password
 */
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

/**
 * For a given User(models/user.js) returns a data subset(e-mail and id, declared in @const sessionProperties)
 *
 * @param {User} User
 */
function getSessionProperties (User) {
  const obj = utils.getSubset(sessionProperties, User);
  return obj;
}

/**
 *Creates a user_post through an SQL transaction and returns the entire user_post entity.
 *
 * @param {bigint.unsigned} id
 * The ID of user who's creating a post.
 * @param {string} text
 * Content of the post.
 * @param {bigint.unsigned} timestamp
 * Records the time of the post's creation.
 */
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

/**
 *Returns id of a tweet entity, and the id of an user who created it.
 *Similar to @see sessionProperties(), returns a subset of a tweet defined in @const tweetProperties.
 *
 * @param {UserTweet} tweet
 */
function getTweetProperties (tweet) {
  const obj = utils.getTweetSubset(tweetProperties, tweet);
  return obj;
}

/**
 *Checks number of users in database with given email. Used for validating if user already exists or not. @see userDoesntExists()
 *
 * @param {string} email
 */
async function countUsers (email) {
  return db.User.count({
    where: {
      email: email
    }
  });
}

/**
 *Checks if there are any users that already have a given username.
 *Used for validating if a username is unique or not.
 *
 * @param {string} username
 * Username of user trying to register.
 */
async function countUsersByUsername (username) {
  return db.User.count({
    where: {
      username: username
    }
  });
}

/**
 *Checks if user currently exists by checking if there are any users with given e-mail*@see countUsers() )
 or username(@see countUsersByUsername) )
 * @param {string} email
 * @param {string} username
 */
async function userDoesntExists (email, username) {
  const userEmailCount = await countUsers(email);
  const usernameCount = await countUsersByUsername(username);
  if (usernameCount === 0 && userEmailCount === 0) return true;

  return false;
}

/**
 *Checks if sent id's are the same, if not checks if users are existing.
 If this relationship doesn't already exist, creates a Relationship entity(from models/relationship.js) with given id's.
 *
 * @param {bigint.unsigned} id
 * Contains the id of user that wants to follow a different user
 * @param {bigint.unsigned} target
 * Contains the id of user that is being followed.
 */
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

/**
 *Checks if users with given id's exist, and if the relationship between them exists. If so, deletes the relationship
 and the users can't see eachother's posts anymore.
 *
 * @param {bigint.unsigned} id
 * @param {bigint.unsigned} target
 */
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

/**
 *If given user exists, Returns latest @const MAX_TWEET_NUMBER posts(entered in .env) with given @param offset
 This function shows only posts of one user.
 * @param {bigint.unsigned} id
 * Id of user who's tweets are shown
 * @param {int} offset
 * Number of rows that are skipped when getting the list(if user has requested to see older posts)
 * should be bigger than 0.
 */
async function listUserTweets (id, page, tweetNumber) {
  let offset = page * tweetNumber;
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
    limit: +tweetNumber,
    include: {
      model: db.User,
      attributes: ['username', 'id']
    }
  });
  return tweets;
}

/**
 *If there's a user with given id, gets @const MAX_TWEET_NUMBER(from .env) of tweets from targets that the user
 is following, with given @param offset .
 * @param {bigint.unsigned} id
 * Id of user who wants to see their follower's posts.
 * @param {bigint.unsigned} offset
 */
async function listTargetTweets (id, page, tweetNumber) {
  let offset = page * tweetNumber;
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
    limit: +tweetNumber,
    offset: +offset,
    include: {
      model: db.User,
      attributes: ['id', 'username']
    }
  });
  return tweets;
}
/**
 *Gets all id's from targets this user follows, and returns the array to @see listTargetTweets()
 * @param {bigint.unsigned} id
 */
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
