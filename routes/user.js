'use strict';

const userServices = require('../services/user');
const Response = require('../utils/response');
const authSessions = require('./authSessions');
const userSessionService = require('../services/user_sessions');
const { ConflictError } = require('../utils/errors');

async function register (req, res, next) {
  try {
    const { email, password } = req.body;

    const ok = await userServices.userDoesntExists(email);

    if (!ok) {
      next(new ConflictError());
    } else {
      const sessionProp = await userServices.register(email, password);
      // console.log(sessionProp);
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

module.exports = {
  register
};
