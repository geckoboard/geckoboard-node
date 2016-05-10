module.exports =  {
  createDataset: function (datasetMeta, apiRequest) {
    return {
      id: datasetMeta.id,
      put: function (data, cb) {
        const endpoint = `/datasets/${datasetMeta.id}/data`;
        apiRequest('put', { endpoint: endpoint, body: JSON.stringify({ data: data }) }, cb);
      },
    }
  }
}
