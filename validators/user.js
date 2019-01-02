'use strict';

const { body } = require('express-validator/check');
const custom = require('./custom');
const config = require('../config');
const { valMsg } = require('../utils/validations');

const register = [
  body('email')
    .trim()
    .not().isEmpty().withMessage(valMsg('mail_req'))
    .isEmail().withMessage(valMsg('mail_invalid'))
    .isLength({ max: 42 }).withMessage(valMsg('mail_long')),
  body('password')
    .not().isEmpty().withMessage(valMsg('pass_req'))
    .isLength({ min: config.constants.mobilePinLength }).withMessage(valMsg('pass_min')),
  body('password_repeat')
    .not().isEmpty().withMessage(valMsg('pass_req'))
    .custom(custom.isEqual('password')).withMessage(valMsg('password_not_equal'))
];

const login = [
  body('email')
    .trim()
    .isEmail().withMessage(valMsg('mail_invalid')),
  body('password')
    .not().isEmpty().withMessage(valMsg('pass_req'))
];

module.exports = {
  register,
  login
};
