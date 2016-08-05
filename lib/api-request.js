const request = require('request');

module.exports = (HOST, API_KEY, USER_AGENT) => {
  return {
    apiRequest(method, options, cb) {
      function callback(err, response, body) {
        if (err) {
          cb(err);
          return;
        }
        if (response.statusCode >= 200 && response.statusCode < 300) {
          cb(null, JSON.parse(body));
        } else {
          cb(new Error(JSON.parse(body).error.message));
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
};
