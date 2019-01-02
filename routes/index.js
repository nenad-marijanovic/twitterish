'use strict';

const express = require('express');
const bodyParser = require('body-parser');

const h = require('./handlers');
const user = require('./user');
const val = require('../validators');
const session = require('./session');
const mobileRouter = express.Router();

mobileRouter.use(session);
mobileRouter.use(bodyParser.json());
mobileRouter.use(bodyParser.urlencoded({
  extended: true
}));

mobileRouter.post(`/user/register`, val.user.register, user.register, h.ok);
mobileRouter.post(`/user/login`, val.user.login, user.login, h.ok);
mobileRouter.get(`/user/me`, user.me, h.ok);

mobileRouter.use(h.notFound);
mobileRouter.use(h.error);

module.exports = {
  mobileRouter
};
