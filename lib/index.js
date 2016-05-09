const version = require('../package.json').version,
  ping = require('./ping');

const HOST = process.env.API_HOST || 'https://api.geckoboard.com';

const gb = function (apiKey) {
  return {
    ping: ping(HOST, apiKey),
  }
};

gb.VERSION = version

module.exports = gb;
