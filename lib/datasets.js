'use strict';

module.exports = {
  createDataset(apiRequest, datasetMeta) {
    const updateData = (method) => (data, cb) => {
      const endpoint = `/datasets/${datasetMeta.id}/data`;
      apiRequest(method, { endpoint, body: JSON.stringify({ data }) }, cb);
    }

    return {
      id: datasetMeta.id,
      put: updateData('put'),
      post: updateData('post'),
      delete(cb) {
        apiRequest('delete', { endpoint: `/datasets/${datasetMeta.id}` }, cb);
      },
    };
  },
};
