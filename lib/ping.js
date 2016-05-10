const request = require('request');

module.exports = function (apiRequest) {
  return function ping(callback) {
    apiRequest('get', {
        endpoint: '/',
      },
      callback
    )
  }
}
