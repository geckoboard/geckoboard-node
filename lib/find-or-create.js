const request = require('request'),
  datasets = require('./datasets');

module.exports = function (apiRequest) {
  return function findOrCreate(datasetMeta, callback) {
    apiRequest('put', {
        endpoint: `/datasets/${datasetMeta.id}`,
        body: JSON.stringify({ fields: datasetMeta.fields }),
      },
      (err, body) => {
        if (!err) {
          callback(err, datasets.createDataset(body, apiRequest));
        } else {
          callback(err);
        }
      }
    );
  }
}

