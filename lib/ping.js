const request = require('request');

module.exports = function (apiRequest) {
  return function ping(cb) {
    apiRequest('get', {
        endpoint: '/',
      },
      (err, response, body) => {
        if (err) {
          cb(err);
          return;
        }
        if (response.statusCode >= 200 && response.statusCode < 300) {
          cb(null);
        } else {
          cb(new Error(JSON.parse(body).error.message));
        }
      }
    )
  }
}
