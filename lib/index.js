const version = require('../package.json').version,
  findOrCreate = require('./find-or-create'),
  ping = require('./ping');

const HOST = process.env.API_HOST || 'https://api.geckoboard.com',
  USER_AGENT =  `Geckoboard Node Client ${version}`;


const gb = function (apiKey) {
  return {
    ping: ping(HOST, apiKey, USER_AGENT),
    datasets: {
      findOrCreate: findOrCreate(HOST, apiKey, USER_AGENT),
    },
  }
};

gb.VERSION = version

module.exports = gb;
