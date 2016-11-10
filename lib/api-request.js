'use strict';

const request = require('request');

module.exports = {
  apiRequest: (HOST, API_KEY, USER_AGENT) => (method, options, cb) => {
    function callback(err, response, body) {
      if (err) {
        cb(err);
        return;
      }
      if (response.statusCode >= 200 && response.statusCode < 300) {
        var json;
        try {
          json = JSON.parse(body);
        } catch (ex) {
          return cb(new Error('Unparseable response'));
        }
        cb(null, json);
      } else {
        var json;
        try {
          json = JSON.parse(body);
        } catch (ex) {
          return cb(new Error('Unparseable response'));
        }
        if (!json&&!json.error&&!json.error.message)
          return cb(new Error('Unknown error'));
        cb(new Error(json.error.message));
      }
    }
    const requestOptions = {
      url: `${HOST}${options.endpoint}`,
      headers: { 'User-Agent': USER_AGENT },
    };

    if (options.body) {
      requestOptions.body = options.body;
    }
    request[method](requestOptions, callback).auth(API_KEY, '');
  },
};
