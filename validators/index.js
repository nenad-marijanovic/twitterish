'use strict';

const { validationResult } = require('express-validator/check');
const { matchedData } = require('express-validator/filter');
const { ValidationError } = require('../utils/errors');

const user = require('./user');

function appendValidationError (validators) {
  let newValidators = {};
  Object.keys(validators).map(function (valName) {
    newValidators[valName] = [validators[valName], validationError];
  });
  return newValidators;
}

function validationError (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    next(new ValidationError(errors.mapped()));
  } else {
    req.query = matchedData(req, { locations: ['query'] });
    req.body = matchedData(req, { locations: ['body'] });
    next();
  }
}

module.exports = {
  user: appendValidationError(user)
};
