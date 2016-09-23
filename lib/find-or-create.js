'use strict';

const datasets = require('./datasets');

module.exports = {
  put(apiRequest, datasetMeta, callback) {
    return apiRequest('put',
      {
        endpoint: `/datasets/${datasetMeta.id}`,
        body: JSON.stringify({ fields: datasetMeta.fields }),
      },
      (err, body) => {
        if (!err) {
          callback(err, datasets.createDataset(apiRequest, body));
        } else {
          callback(err);
        }
      }
    );
  },
};
