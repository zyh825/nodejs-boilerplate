const querystring = require('querystring');
const get = require('lodash/get');
const Path = require('path');

const logger = require('../../utils/logger');

const endPoint = 'mbxc-internal.mcltd.cn';

const proxyMap = [
  ['/taoci-service']
];

module.exports = {
  setup: function (router) {
    proxyMap.forEach(([path, rawResponse]) => {
      router.use(`${path}*`, (req, res) => {
        let options = {
          url: 'http://' + Path.join(endPoint, path, req.params[0]),
          method: req.method,
          headers: {
            'content-type': get(req, 'headers[content-type]', 'application/json')
          }
        };
        if (Object.keys(req.query).length > 0) options.url += '?' + querystring.stringify(req.query);
        if (options.headers['content-type'] === 'application/json') {
          options.body = JSON.stringify(req.body);
        } else {
          options.form = req.body;
        }
        debugger;
        if (rawResponse) {
          return request(options).pipe(res);
        }
        request(options, (err, response, data) => {
          if (err) {
            logger.debug(`Error proxying ${req.params[0]}. ${err && err.toString && err.toString()}`);
            res.status(500).json({ code: 'e_unknown_error' });
            return;
          }
          if (response.statusCode !== 200) {
            try {
              res.status(response.statusCode).json(JSON.parse(data));
            } catch (e) {
              logger.debug(`Error proxying ${req.params[0]}, code ${response.statusCode}. ${JSON.stringify(data)}`);
              res.status(response.statusCode).json({ code: 'e_unknown_error', msg: data });
            }
            return;
          }

          if (response.headers['content-disposition']) {
            res.set('content-disposition', response.headers['content-disposition'])
              .status(200)
              .end(data, 'UTF-8');
          } else {
            res.header(response.headers).send(data);
          }
        });
      });
    });
  }
};

