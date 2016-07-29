module.exports = {
  delete(apiRequest, datasetId, cb) {
    apiRequest('delete', { endpoint: `/datasets/${datasetId}` }, cb);
  },
};
