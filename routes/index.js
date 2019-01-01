'use strict';

const express = require('express');
const bodyParser = require('body-parser');

const mobileRouter = express.Router();
mobileRouter.use(bodyParser.json());
mobileRouter.use(bodyParser.urlencoded({
  extended: true
}));

module.exports = {
    mobileRouter
  };