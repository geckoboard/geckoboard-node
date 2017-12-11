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
        try {
          const parsedBody = JSON.parse(body);
          cb(null, parsedBody);
        } catch (e) {
          cb(new Error('The response from the server was not valid JSON'));
        }
      } else {
        try {
          const parsedBody = JSON.parse(body);
          if (!parsedBody || !parsedBody.error || !parsedBody.error.message) {
            cb(new Error('Unknown error'));
          } else {
            cb(new Error(parsedBody.error.message));
          }
        } catch (e) {
          cb(new Error('The response from the server was not valid JSON'));
        }
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
