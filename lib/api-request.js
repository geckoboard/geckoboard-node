const request = require('request');

module.exports = function (HOST, API_KEY, USER_AGENT) {
  return {
    apiRequest: function (method, options, cb) {
      const requestOptions = {
        url: `${HOST}${options.endpoint}`,
        headers: { 'User-Agent': USER_AGENT },
      };

      if (options.body) {
        requestOptions.body = options.body;
      }
      request[method](requestOptions, cb).auth(API_KEY, '');
    }
  };
};
