const findOrCreate = require('./find-or-create'),
  nock = require('nock');

describe('findOrCreate', () => {
  const HOST = 'https://example.com',
    API_KEY = '123',
    DATASET_ID = 'sales.gross',
    USER_AGENT = 'lolbot 0.1',
    NUMBER_FIELD = { type: 'number', name: 'Number' },
    DATETIME_FIELD = { type: 'datetime', name: 'Datetime' },
    VALID_DATASET = {
      id: DATASET_ID,
      fields: {
        number: NUMBER_FIELD,
        datetime: DATETIME_FIELD,
      }
    };

  it('makes a request to create a dataset', (done) => {
    const server = nock(HOST).put(`/datasets/${DATASET_ID}`, VALID_DATASET)
    .matchHeader('User-Agent', USER_AGENT)
    .basicAuth({
      user: API_KEY,
      pass: ''
    })
    .reply(200, {}, {
      'Content-Type': 'application/json',
    });

    findOrCreate(HOST, API_KEY, USER_AGENT)(VALID_DATASET, (err) => {
      expect(err).toBe(null);
      server.done();
      done();
    });
  });

  it('handles authentication error', (done) => {
    const ERROR_MESSAGE = 'Your API key is invalid',
      ERROR = { error: { message: ERROR_MESSAGE } },
      server = nock(HOST).put(`/datasets/${DATASET_ID}`,VALID_DATASET)
      .matchHeader('User-Agent', USER_AGENT)
      .reply(401, ERROR, {
        'Content-Type': 'application/json',
      });

    findOrCreate(HOST, API_KEY, USER_AGENT)(VALID_DATASET, (err) => {
      expect(err).toEqual(new Error(ERROR_MESSAGE));
      server.done();
      done();
    });
  });

  it('handles a request error', (done) => {
    const ERROR_MESSAGE = 'no',
      server = nock(HOST).put(`/datasets/${DATASET_ID}`).replyWithError(ERROR_MESSAGE);
    findOrCreate(HOST, API_KEY)(VALID_DATASET, (err) => {
      expect(err).toEqual(new Error(ERROR_MESSAGE));
      done();
    });
  });
});
