'use strict';

const { AuthorizationError } = require('../utils/errors');

function user (req, res, next) {
  const sentUserId = +req.params.id;
  if (sentUserId !== 0 && req.session.user && +req.session.user.id === sentUserId) {
    next();
  } else {
    next(new AuthorizationError());
  }
}

module.exports = {
  user
};
