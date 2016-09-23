'use strict';

module.exports = {
  createDataset(apiRequest, datasetMeta) {
    return {
      id: datasetMeta.id,
      put(data, cb) {
        const endpoint = `/datasets/${datasetMeta.id}/data`;
        apiRequest('put', { endpoint, body: JSON.stringify({ data }) }, cb);
      },
      delete(cb) {
        apiRequest('delete', { endpoint: `/datasets/${datasetMeta.id}` }, cb);
      },
    };
  },
};
