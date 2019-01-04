'use strict';

const db = require('../models');
const logger = require('../utils/logger');
/**
 * Function creates a row in user_session table, where we hold the link between the user and express-session
 *
 * @param {string} sessionId
 * sessionId contains the generated session from models/session.js
 * @param {int} userId
 * This is the id of the user we're creating the user_session for
 */
async function setUserSession (sessionId, userId) {
  const user = await db.UserSession.create({ user_id: userId, session_id: sessionId });

  if (!user) {
    throw new Error();
  }
}
/**
 * Removes the user_session session id
 *
 * @param {string} sessionId
 * Contains session_id for a given user_session
 *
 */
async function deleteUserSession (sessionId) {
  try {
    await db.UserSession.destroy({
      where: {
        session_id: sessionId
      }
    });
  } catch (err) {
    logger.error(err.stack);
  }
}

module.exports = {
  setUserSession,
  deleteUserSession
};
