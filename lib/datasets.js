'use strict';

module.exports = {
  createDataset(apiRequest, datasetMeta) {
    const endpoint = `/datasets/${datasetMeta.id}/data`;

    return {
      id: datasetMeta.id,
      put(data, cb) {
        apiRequest('put', { endpoint, body: JSON.stringify({ data }) }, cb);
      },
      post(data, options, cb) {
        const delete_by = options && options.delete_by || undefined;

        apiRequest('post', {
          endpoint,
          body: JSON.stringify({ data, delete_by }),
        }, cb);
      },
      delete(cb) {
        apiRequest('delete', { endpoint: `/datasets/${datasetMeta.id}` }, cb);
      },
    };
  },
};
