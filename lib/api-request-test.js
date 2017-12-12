const api = require('./api-request');
const nock = require('nock');
const request = require('request');

describe('api', () => {
  const HOST = 'https://example.com';
  const API_KEY = '123';
  const USER_AGENT = 'lolbot 0.1';
  const METHOD = 'get';
  const ENDPOINT = '/whoopie-do';
  const OPTIONS = { endpoint: ENDPOINT };

  it('makes requests with configured methods', () => {
    const apiRequest = api.apiRequest(HOST, API_KEY, USER_AGENT);
    const EXPECTED_OPTIONS = { url: `${HOST}${ENDPOINT}`, headers: { 'User-Agent': USER_AGENT } };
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
    const RESPONSE_BODY = { ha: 'ha' };

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

  describe('when the response status is not 200', () => {
    it('passes through error message', done => {
      const apiRequest = api.apiRequest(HOST, API_KEY, USER_AGENT);
      const ERROR_MESSAGE = 'problem';
      const ERROR_RESPONSE_BODY = { error: { message: ERROR_MESSAGE } };

      nock(HOST)[METHOD](ENDPOINT)
      .reply(400, ERROR_RESPONSE_BODY);

      apiRequest(METHOD, OPTIONS, (err, body) => {
        expect(body).toBeUndefined()
        expect(err).toEqual(new Error(ERROR_MESSAGE))
        done();
      });
    });

    describe('and the response JSON is not formatted correctly', () => {
      it('returns an appropriate error', (done) => {
        const apiRequest = api.apiRequest(HOST, API_KEY, USER_AGENT);
        const BAD_JSON_RESPONSE_BODY = { i: 'sorry' };

        nock(HOST)[METHOD](ENDPOINT)
        .reply(400, BAD_JSON_RESPONSE_BODY);

        apiRequest(METHOD, OPTIONS, (err, body) => {
          expect(body).toBeUndefined()
          expect(err).toEqual(new Error('Unknown error'))
          done();
        });
      });
    });
  });

  describe('when the response is not JSON formatted', () => {
    describe('and the response status is 200', () => {
      it('does not blow up', (done) => {
        const apiRequest = api.apiRequest(HOST, API_KEY, USER_AGENT);
        const BAD_RESPONSE_BODY = 'sorry';

        nock(HOST)[METHOD](ENDPOINT)
        .reply(200, BAD_RESPONSE_BODY);

        apiRequest(METHOD, OPTIONS, (err, body) => {
          expect(body).toBeUndefined()
          expect(err).toEqual(new Error('The response from the server was not valid JSON'))
          done();
        });
      });
    });

    describe('and the response status is not 200', () => {
      it('does not blow up', (done) => {
        const apiRequest = api.apiRequest(HOST, API_KEY, USER_AGENT);
        const BAD_RESPONSE_BODY = 'sorry';

        nock(HOST)[METHOD](ENDPOINT)
        .reply(400, BAD_RESPONSE_BODY);

        apiRequest(METHOD, OPTIONS, (err, body) => {
          expect(body).toBeUndefined()
          expect(err).toEqual(new Error('The response from the server was not valid JSON'))
          done();
        });
      });
    });
  });
});
