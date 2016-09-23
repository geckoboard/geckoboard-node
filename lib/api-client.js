'use strict';

const findOrCreate = require('./find-or-create');
const datasets = require('./datasets');

function getClient(apiRequest) {
  return {
    ping: (callback) => apiRequest('get', { endpoint: '/' }, callback),
    datasets: {
      findOrCreate(datasetMeta, cb) {
        findOrCreate.put(apiRequest, datasetMeta, cb);
      },
      delete(id, cb) {
        datasets.createDataset(apiRequest, { id }).delete(cb);
      },
    },
  }
}

module.exports = { getClient };
