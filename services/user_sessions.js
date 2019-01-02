'use strict';

const db = require('../models');
const logger = require('../utils/logger');

// const Op = db.Sequelize.Op;

async function setUserSession (sessionId, userId) {
  const user = await db.UserSession.create({ user_id: userId, session_id: sessionId });

  if (!user) {
    throw new Error();
  }
}

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
