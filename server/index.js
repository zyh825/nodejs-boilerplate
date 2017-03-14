'use strict';
global.Promise = require('bluebird');

const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const morgan = require('morgan');

const logger = require('./utils/logger');
const api = require('./routers/api');
const proxy = require('./routers/proxy');
const errorHandler = require('./middlewares/errorHandler');

process.on('uncaughtException', err => {
  // handle the error safely
  logger.error("!!uncaughtException: ", err, err.stack);
});

const app = express();

app.set('trust proxy', ['loopback']);
app.disable('x-powered-by');
app.use(function (req, res, next) {
  req.real_ip = (req.ips || [])[0] || req.ip;
  next();
});

app.use(cookieParser());

app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.text({ type: 'text/plain' }));

// morgan.token('id', req => req.identity.uid);
// morgan.token('nick', req => req.identity.nick || req.identity.sub_nick);
app.use(morgan(':method :url :status :res[content-length] bit - :response-time ms', {
  stream: { write: logger.error },
  skip: (req, res) => res.statusCode < 500
}));

{
  // authentication may need here
  const router = express.Router();
  app.use('/api', router);
  api.setup(router);
}

{
  const router = express.Router();
  app.use('/proxy', router);
  proxy.setup(router);
}

// final error
errorHandler(app);

const server = app.listen(process.env.SERVER_BIND || 8089, function () {
  let { address, port } = server.address();
  logger.info(`Facade web server running at http://${address}:${port}`);
});
