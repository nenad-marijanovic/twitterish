'use strict';

require('dotenv').config();

const {
  TEST_INSTALLATION,
  DB_USER,
  DB_PASSWORD,
  DB_DATABASE,
  DB_HOST,
  DB_PORT
} = process.env;

const config = {
  [process.env.NODE_ENV]: {
    username: DB_USER,
    password: DB_PASSWORD,
    database: DB_DATABASE,
    host: DB_HOST,
    port: DB_PORT,
    dialect: 'mysql'
  },

  sequelizeOptions: {
    host: DB_HOST,
    port: DB_PORT,
    dialect: 'mysql',
    define: {
      charset: 'utf8',
      dialectOptions: {
        collate: 'utf8_general_ci'
      }
    },
    pool: {
      max: 50,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },
  sessionStoreOtions: {
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_DATABASE
  },
  constants: {
    passwordMissesAllowed: 10,
    totpMissesAllowed: 10,
    pinMissesAllowed: 2,
    totpChangeWindowMins: 1440, // 1 day
    passwordChangeWindowMins: 1440, // 1 day
    totpWindow: 1,
    mobilePinLength: 4,
    minPassLength: 8,
    pinMsDelay: 1000 * 60 * 15 // 15 mins
  },
  paths: {
    emailConfirmationSuccessPath: '/profile?emailConfirmationBackend=success',
    emailConfirmationFailurePath: '/profile?emailConfirmationBackend=failed',
    totpChangePath: '/reset-two-factor',
    passwordChangePath: '/reset-password'
  },
  orderConfig: {
    emptyReference: (TEST_INSTALLATION === 'true'),
    orderDueTime: 1000 * 60 * 60 * 72 // due date for order payments - 72h
  },
  periodHandler: {
    roundLimit: 10, // how many pending addresses it will get from db at once
    roundSleep: 10, // how many seconds to sleep inside timestamp turn's round
    smallSleep: 60, // how many seconds to sleep between one timestamp turns
    bigSleep: 3600 // how many seconds to sleep waiting for next timestamp
  },
  txWatcherOptions: {
    dateFormat: 'YYYY-MM-DD'
  }
};

module.exports = config;
