const request = require('request');

module.exports = function (apiRequest) {
  return function findOrCreate(datasetMeta, callback) {
    apiRequest('put', {
        endpoint: `/datasets/${datasetMeta.id}`,
        body: JSON.stringify({ fields: datasetMeta.fields }),
      },
      callback
    );
  }
}

