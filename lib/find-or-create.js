const request = require('request');

module.exports = function (HOST, API_KEY) {
  return function findOrCreate(dataset, cb) {
    request.put({
        url: `${HOST}/datasets/${dataset.id}`,
        body: JSON.stringify(dataset),
      },  (err, response, body) => {
        if (err) {
          cb(err);
          return;
        }
        if (response.statusCode >= 200 && response.statusCode < 300) {
          cb(null);
        } else {
          cb(new Error(JSON.parse(body).error.message));
        }
      }
    )
    .auth(API_KEY, '')
  }
}

