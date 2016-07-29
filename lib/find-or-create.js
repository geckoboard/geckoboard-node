const datasets = require('./datasets');

module.exports = (apiRequest) => (datasetMeta, callback) => {
  return apiRequest('put',
    {
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
};
