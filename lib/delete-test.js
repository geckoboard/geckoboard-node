const deleteDataset = require('./delete'),
  api = require('./api-request'),
  nock = require('nock');

describe('delete', () => {
  const HOST = 'https://example.com',
    API_KEY = '123',
    USER_AGENT = 'lolbot 0.1',
    API_REQUEST = api(HOST, API_KEY, USER_AGENT).apiRequest,
    DATASET_ID = 'dr.octagon';

  it('sends a delete request', (done) => {
    const server = nock(HOST).delete(`/datasets/${DATASET_ID}`)
      .matchHeader('User-Agent', USER_AGENT)
      .basicAuth({
        user: API_KEY,
        pass: '',
      })
      .reply(200, {}, {
        'Content-Type': 'application/json',
      });
    deleteDataset.delete(API_REQUEST, DATASET_ID, (err) => {
      expect(err).toBe(null);
      server.done();
      done();
    });
  });

  it('handles authentication error', (done) => {
    const ERROR_MESSAGE = 'Your API key is invalid',
    ERROR = { error: { message: ERROR_MESSAGE } },
    server = nock(HOST).delete(`/datasets/${DATASET_ID}`)
    .matchHeader('User-Agent', USER_AGENT)
    .reply(401, ERROR, {
      'Content-Type': 'application/json',
    });

    deleteDataset.delete(API_REQUEST, DATASET_ID, (err) => {
      expect(err).toEqual(new Error(ERROR_MESSAGE));
      server.done();
      done();
    });
  });

  it('handles a request error', (done) => {
    const ERROR_MESSAGE = 'no';
    nock(HOST).delete(`/datasets/${DATASET_ID}`).replyWithError(ERROR_MESSAGE);

    deleteDataset.delete(API_REQUEST, DATASET_ID, (err) => {
      expect(err).toEqual(new Error(ERROR_MESSAGE));
      done();
    });
  });
});
