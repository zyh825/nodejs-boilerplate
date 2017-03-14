'use strict';
const os = require('os');
const winston = require('winston');
const WinstonGraylog2 = require('winston-graylog2');

let options = {
  exitOnError: false,
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transports: [
    process.env.NODE_ENV === 'production' ? new (WinstonGraylog2)({
        name: 'Graylog',
        silent: false,
        handleExceptions: false,
        graylog: {
          servers: [
            { 'host': process.env.LOG_HOST, port: 12201 }
          ],
          facility: process.env.SERVICE_NAME,
          hostname: process.env.LOG_SOURCE || require('os').hostname()
        }
      }) : new winston.transports.Console()
  ]
};

let logger = new (winston.Logger)(options);

module.exports = logger;
