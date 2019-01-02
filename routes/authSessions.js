'use strict';

const { AuthenticationError } = require('../utils/errors');

const STATE_AUTHENTICATED = 1;

function authenticated (req, res, next) {
  if (req.session.user && req.session.state === STATE_AUTHENTICATED) {
    next();
  } else {
    next(new AuthenticationError());
  }
}

function setAuthenticated (req, sessionProperties, next) {
  if (sessionProperties) {
    req.session.user = sessionProperties;
    req.session.state = STATE_AUTHENTICATED;
  } else {
    next(new AuthenticationError());
  }
}

function destroy (req) {
  req.session.destroy();
}

module.exports = {
  authenticated,
  setAuthenticated,
  destroy
};
