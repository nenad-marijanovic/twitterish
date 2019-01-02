'use strict';

const expressSession = require('express-session');
const MySQLStore = require('express-mysql-session')(expressSession);
const { sessionStoreOtions } = require('../config');

const {
  SESSION_KEY,
  SESSION_SECRET,
  SESSION_COOKIE_MAX_AGE,
  SESSION_COOKIE_SECURE
} = process.env;

const sessionStore = new MySQLStore(sessionStoreOtions);

var session = expressSession({
  key: SESSION_KEY,
  secret: SESSION_SECRET,
  store: sessionStore,
  unset: 'destroy',
  createDatabaseTable: true,
  resave: false,
  saveUninitialized: true, // todo: research this one
  cookie: {
    maxAge: +SESSION_COOKIE_MAX_AGE,
    sameSite: 'lax', // todo: maybe go with 'strict'?
    secure: SESSION_COOKIE_SECURE !== 'false'
  }
});

module.exports = session;
