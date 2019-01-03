'use strict';

const userServices = require('../services/user');
const Response = require('../utils/response');
const authSessions = require('./authSessions');
const userSessionService = require('../services/user_sessions');
const moment = require('moment');
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

async function logout (req, res, next) {
  try {
    authSessions.destroy(req);
    await userSessionService.deleteUserSession(req.sessionID);

    next();
  } catch (err) {
    next(err);
  }
}

async function createTweet (req, res, next) {
  try {
    const { text } = req.body;
    const timestamp = moment().unix();
    if (!timestamp) {
      throw new Error('Failed to get current timestamp');
    }

    const tweet = await userServices.createTweet(req.params.id, text, timestamp);
    res.status(200)
      .send(Response.success(tweet));
  } catch (err) {
    next(err);
  }
}

async function follow (req, res, next) {
  try {
    const { target } = req.body;
    const id = req.params.id;
    await userServices.follow(id, target);
    res.status(200)
      .end();
  } catch (err) {
    next(err);
  }
}

async function unfollow (req, res, next) {
  try {
    const { target } = req.body;
    await userServices.unfollow(req.params.id, target);
    res.status(200)
      .end();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login,
  me,
  logout,
  createTweet,
  follow,
  unfollow
};
