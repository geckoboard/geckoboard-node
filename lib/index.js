const version = require('../package.json').version,
  deleteDataset = require('./delete'),
  api = require('./api-request'),
  findOrCreate = require('./find-or-create'),
  ping = require('./ping');

const HOST = process.env.API_HOST || 'https://api.geckoboard.com',
  USER_AGENT =  `Geckoboard Node Client ${version}`;


const gb = function (apiKey) {
  const apiRequest = api(HOST, apiKey, USER_AGENT).apiRequest;
  return {
    ping: ping(apiRequest),
    datasets: {
      findOrCreate: findOrCreate(apiRequest),
      delete: function (datasetId, cb) {
        deleteDataset.delete(apiRequest, datasetId, cb);
      },
    },
  }
};

gb.VERSION = version

module.exports = gb;
