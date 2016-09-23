const api = require('./api-request');
const nock = require('nock');
const request = require('request');

describe('api', () => {
  const HOST = 'https://example.com',
    API_KEY = '123',
    USER_AGENT = 'lolbot 0.1';

  it('makes requests with configured methods', () => {
    const apiRequest = api.apiRequest(HOST, API_KEY, USER_AGENT);
    const OPTIONS = { endpoint: '/whoopie-do' },
      EXPECTED_OPTIONS = { url: `${HOST}/whoopie-do`, headers: { 'User-Agent': USER_AGENT } };
    ['get', 'put', 'post', 'delete'].forEach(method => {
      const authSpy = jasmine.createSpy('auth');
      const CALLBACK = () => {};
      spyOn(request, method).and.callFake(() => ({ auth: authSpy }));
      apiRequest(method, OPTIONS, CALLBACK);

      expect(request[method]).toHaveBeenCalled();
      expect(request[method].calls.mostRecent().args[0]).toEqual(EXPECTED_OPTIONS);
      expect(authSpy).toHaveBeenCalledWith(API_KEY, '');
    });
  });

  it('calls the given callback with response', (done) => {
    const apiRequest = api.apiRequest(HOST, API_KEY, USER_AGENT);
    const METHOD = 'get',
      ENDPOINT = '/whoopie-do',
      OPTIONS = { endpoint: ENDPOINT },
      RESPONSE_BODY = { ha: 'ha' };

    nock(HOST)[METHOD](ENDPOINT)
    .matchHeader('User-Agent', USER_AGENT)
    .basicAuth({
      user: API_KEY,
      pass: '',
    })
    .reply(200, RESPONSE_BODY, {
      'Content-Type': 'application/json',
    });

    apiRequest(METHOD, OPTIONS, (err, body) => {
      expect(body).toEqual(RESPONSE_BODY);
      expect(err).toBeNull()
      done();
    });
  });
});
