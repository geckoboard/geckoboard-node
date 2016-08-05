module.exports = (apiRequest) => (callback) => apiRequest('get', { endpoint: '/' }, callback);
