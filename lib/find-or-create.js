const request = require('request');

module.exports = function (apiRequest) {
  return function findOrCreate(datasetMeta, cb) {
    apiRequest('put', {
        endpoint: `/datasets/${datasetMeta.id}`,
        body: JSON.stringify({ fields: datasetMeta.fields }),
      },  (err, response, body) => {
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
    );
  }
}

