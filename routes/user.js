'use strict';

const userServices = require('../services/user');
const Response = require('../utils/response');
const authSessions = require('./authSessions');
const userSessionService = require('../services/user_sessions');
const { ConflictError, AuthenticationError } = require('../utils/errors');

async function register (req, res, next) {
  try {
    const { email, password } = req.body;

    const ok = await userServices.userDoesntExists(email);

    if (!ok) {
      next(new ConflictError());
    } else {
      const sessionProp = await userServices.register(email, password);
      authSessions.setAuthenticated(req, sessionProp);

      await userSessionService.setUserSession(req.session.id, req.session.user.id);

      res.status(200)
        .send(Response.success(sessionProp))
        .end();
    }
  } catch (err) {
    next(err);
  }
}

async function login (req, res, next) {
  try {
    const { email, password } = req.body;

    const sessionProp = await userServices.login(email, password);

    if (sessionProp) {
      authSessions.setAuthenticated(req, sessionProp);

      const userId = req.session.user.id;

      await userSessionService.setUserSession(req.sessionID, userId);

      res.status(200)
        .send(Response.success(sessionProp))
        .end();
    } else {
      next(new AuthenticationError());
    }
  } catch (err) {
    next(err);
  }
}

async function me (req, res, next) {
  const user = req.session.user;
  if (!user) {
    next(new AuthenticationError());
    return;
  }
  const userData = await userServices.getSessionProperties(req.session.user);
  if (!userData) {
    next(new AuthenticationError());
    return;
  }

  res.status(200)
    .send(Response.success(userData));
}

module.exports = {
  register,
  login,
  me
};
