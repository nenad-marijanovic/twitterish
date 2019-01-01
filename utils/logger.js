'use strict';

const winston = require('winston');

const { NODE_ENV } = process.env;

const transports = {
  console: new winston.transports.Console({
    level: (NODE_ENV === 'production' ? 'info' : 'debug'),
    handleExceptions: true,
    humanReadableUnhandledException: true,
    stderrLevels: ['error', 'crit', 'alert', 'emerg'],
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.label({ label: 'backend' }),
      winston.format.printf(info => {
        return `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`;
      })
    )
  })
};

const logger = winston.createLogger({
  levels: winston.config.syslog.levels,
  transports: [
    transports.console
    // new winston.transports.File({ filename: 'backend.log' })
  ]
});

logger.stream = {
  write: (message, encoding) => {
    logger.info(typeof message === 'string' ? message.trim() : message);
  }
};

module.exports = logger;
