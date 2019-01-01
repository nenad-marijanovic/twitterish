'use strict';

require('dotenv').config();
const logger = require('./utils/logger');

const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');

const { mobileRouter } = require('./routes');

const mobileBaseUrl = '/rest/twitterish/';

const { PORT } = process.env;

// backend server start
const app = express();

// setup client middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(mobileBaseUrl, mobileRouter);

const port = PORT;
const server = http.createServer(app);

server.listen(port, () => logger.info(`Listening on ${port}`));
