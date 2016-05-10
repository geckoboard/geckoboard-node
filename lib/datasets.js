module.exports =  {
  createDataset: function (datasetMeta, apiRequest) {
    return {
      id: datasetMeta.id,
      put: function (body, cb) {
        const endpoint = `/datasets/${datasetMeta.id}/data`;
        apiRequest('put', { endpoint: endpoint, body: JSON.stringify(body) }, cb);
      },
    }
  }
}
