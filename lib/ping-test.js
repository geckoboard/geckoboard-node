const ping = require('./ping'),
  api = require('./api-request'),
  nock = require('nock');

describe('ping', () => {
  const HOST = 'https://example.com',
    USER_AGENT = 'lolbot 0.1',
    API_KEY = '123';
    API_REQUEST = api(HOST, API_KEY, USER_AGENT).apiRequest;

  it('makes a request', (done) => {
    const server = nock(HOST).get('/')
    .matchHeader('User-Agent', USER_AGENT)
    .basicAuth({
      user: API_KEY,
      pass: ''
    })
    .reply(200, {}, {
      'Content-Type': 'application/json',
    });

    ping(API_REQUEST)((err) => {
      expect(err).toBe(null);
      server.done();
      done();
    });
  });

  it('handles authentication error', (done) => {
    const ERROR_MESSAGE = 'Your API key is invalid',
      ERROR = { error: { message: ERROR_MESSAGE } },
      server = nock(HOST).get('/')
      .matchHeader('User-Agent', USER_AGENT)
      .reply(401, ERROR, {
        'Content-Type': 'application/json',
      });
    ping(API_REQUEST)((err) => {
      expect(err).toEqual(new Error(ERROR_MESSAGE));
      server.done();
      done();
    });
  });

  it('handles a request error', (done) => {
    const ERROR_MESSAGE = 'no',
      server = nock(HOST).get('/').replyWithError(ERROR_MESSAGE);
    ping(API_REQUEST)((err) => {
      expect(err).toEqual(new Error(ERROR_MESSAGE));
      done();
    });
  });
});
