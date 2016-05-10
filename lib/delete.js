module.exports = {
  delete: function(apiRequest, datasetId, cb) {
    apiRequest('delete', { endpoint: `/datasets/${datasetId}` }, cb);
  },
};
