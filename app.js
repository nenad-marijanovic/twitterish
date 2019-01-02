'use strict';

require('dotenv').config();
const logger = require('./utils/logger');

const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');

const { mobileRouter } = require('./routes');

const baseUrl = '/rest/v1/';

const { PORT } = process.env;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(baseUrl, mobileRouter);

const port = PORT;
const server = http.createServer(app);

server.listen(port, () => logger.info(`Listening on ${port}`));
