const findOrCreate = require('./find-or-create'),
  api = require('./api-request'),
  datasets = require('./datasets'),
  nock = require('nock');

describe('findOrCreate', () => {
  const HOST = 'https://example.com',
    API_KEY = '123',
    USER_AGENT = 'lolbot 0.1',
    API_REQUEST = api(HOST, API_KEY, USER_AGENT).apiRequest,
    DATASET_ID = 'sales.gross',
    NUMBER_FIELD = { type: 'number', name: 'Number' },
    DATETIME_FIELD = { type: 'datetime', name: 'Datetime' },
    VALID_FIELDS = {
      number: NUMBER_FIELD,
      datetime: DATETIME_FIELD,
    },
    VALID_DATASET = {
      id: DATASET_ID,
      fields: VALID_FIELDS,
    };

  it('makes a request to create a dataset', (done) => {
    const server = nock(HOST).put(`/datasets/${DATASET_ID}`, { fields: VALID_FIELDS })
    .matchHeader('User-Agent', USER_AGENT)
    .basicAuth({
      user: API_KEY,
      pass: '',
    })
    .reply(200, VALID_DATASET, {
      'Content-Type': 'application/json',
    });

    spyOn(datasets, 'createDataset').and.returnValue({ id: DATASET_ID });

    findOrCreate(API_REQUEST)(VALID_DATASET, (err, dataset) => {
      expect(datasets.createDataset).toHaveBeenCalledWith(VALID_DATASET, API_REQUEST);
      expect(dataset.id).toEqual(DATASET_ID);
      expect(err).toBe(null);
      server.done();
      done();
    });
  });

  it('handles authentication error', (done) => {
    const ERROR_MESSAGE = 'Your API key is invalid',
      ERROR = { error: { message: ERROR_MESSAGE } },
      server = nock(HOST).put(`/datasets/${DATASET_ID}`, { fields: VALID_FIELDS })
      .matchHeader('User-Agent', USER_AGENT)
      .reply(401, ERROR, {
        'Content-Type': 'application/json',
      });

    findOrCreate(API_REQUEST)(VALID_DATASET, (err) => {
      expect(err).toEqual(new Error(ERROR_MESSAGE));
      server.done();
      done();
    });
  });

  it('handles a request error', (done) => {
    const ERROR_MESSAGE = 'no';
    nock(HOST).put(`/datasets/${DATASET_ID}`).replyWithError(ERROR_MESSAGE);

    findOrCreate(API_REQUEST)(VALID_DATASET, (err) => {
      expect(err).toEqual(new Error(ERROR_MESSAGE));
      done();
    });
  });
});
