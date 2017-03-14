'use strict';

module.exports = function (app) {
  // catch 404 and forward to error handler
  app.use(function (req, res, next) {
    const err = new Error('Not Found');
    err.status = 404;
    err.code = 'resource_not_found';
    err.message = `${req.originalUrl} is not found`;
    next(err);
  });

  // the final error handler
  app.use(function (err, req, res) {
    res
      .status(err.status || 500)
      .json({
        message: err.message,
        error: err,
        errorStack: process.NODE_ENV === 'development' ? err.stack : null
      });
  });
};
