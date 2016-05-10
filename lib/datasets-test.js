const datasets = require('./datasets'),
  api = require('./api-request'),
  deleteDataset = require('./delete'),
  nock = require('nock');

describe('createDataset', () => {
  const HOST = 'https://example.com',
    API_KEY = '123',
    USER_AGENT = 'lolbot 0.1',
    API_REQUEST = api(HOST, API_KEY, USER_AGENT).apiRequest,
    DATASET_ID = 111,
    DATASET_META = {
      id: DATASET_ID,
      fields: {
        number: { name: 'Number', type: 'number' },
        datatime: { name: 'Date', type: 'datatime' },
      }
    },
    DATA = [
       { datatime: '2016-01-01T12:00:00Z', number: 8192 }
    ];

  describe('.put', () => {
    it('updates dataset with new data', (done) => {
      const server = nock(HOST).put(`/datasets/${DATASET_ID}/data`, { data: DATA })
        .matchHeader('User-Agent', USER_AGENT)
        .basicAuth({
          user: API_KEY,
          pass: ''
        })
        .reply(200, {}, {
          'Content-Type': 'application/json',
        }),
        dataset = datasets.createDataset(DATASET_META, API_REQUEST);

      dataset.put(DATA, (err) => {
        expect(err).toBe(null);
        server.done();
        done();
      });
    });

    it('handles authentication error', (done) => {
      const ERROR_MESSAGE = 'Your API key is invalid',
      ERROR = { error: { message: ERROR_MESSAGE } },
      server = nock(HOST).put(`/datasets/${DATASET_ID}/data`, { data: DATA })
      .matchHeader('User-Agent', USER_AGENT)
      .reply(401, ERROR, {
        'Content-Type': 'application/json',
      }),
      dataset = datasets.createDataset(DATASET_META, API_REQUEST);

      dataset.put(DATA, (err) => {
        expect(err).toEqual(new Error(ERROR_MESSAGE));
        server.done();
        done();
      });
    });

    it('handles a request error', (done) => {
      const ERROR_MESSAGE = 'no',
        server = nock(HOST).put(`/datasets/${DATASET_ID}/data`).replyWithError(ERROR_MESSAGE);
        dataset = datasets.createDataset(DATASET_META, API_REQUEST);

      dataset.put(DATA, (err) => {
        expect(err).toEqual(new Error(ERROR_MESSAGE));
        done();
      });
    });
  });

  describe('.delete', () => {
    it('request deletion of the respective dataset', () => {
      const dataset = datasets.createDataset(DATASET_META, API_REQUEST),
      CALLBACK = () => {};

      spyOn(deleteDataset, 'delete');
      dataset.delete(CALLBACK);
      expect(deleteDataset.delete).toHaveBeenCalledWith(API_REQUEST, DATASET_ID, CALLBACK);
    });
  });
});
