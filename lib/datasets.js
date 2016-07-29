const deleteDataset = require('./delete');

module.exports = {
  createDataset(datasetMeta, apiRequest) {
    return {
      id: datasetMeta.id,
      put(data, cb) {
        const endpoint = `/datasets/${datasetMeta.id}/data`;
        apiRequest('put', { endpoint, body: JSON.stringify({ data }) }, cb);
      },
      delete(cb) {
        deleteDataset.delete(apiRequest, datasetMeta.id, cb);
      },
    };
  },
};
