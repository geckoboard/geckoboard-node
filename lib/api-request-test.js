const api = require('./api-request'),
  request = require('request');

describe('api', () => {
  const HOST = 'https://example.com',
    API_KEY = '123',
    USER_AGENT = 'lolbot 0.1';

  it('makes requests with configured methods', () => {
    apiRequest = api(HOST, API_KEY, USER_AGENT).apiRequest;
    const OPTIONS = { endpoint: '/whoopie-do' },
      EXPECTED_OPTIONS =  { url: `${HOST}/whoopie-do`, headers: { 'User-Agent': USER_AGENT } };
    ['get', 'put', 'post', 'delete'].forEach(method => {
      const authSpy = jasmine.createSpy('auth'),
        CALLBACK = () => {};
      spyOn(request, method).and.callFake(() => {
        return { auth: authSpy }
      });
      apiRequest(method, OPTIONS, CALLBACK);
      expect(request[method]).toHaveBeenCalledWith(EXPECTED_OPTIONS, CALLBACK);
      expect(authSpy).toHaveBeenCalledWith(API_KEY, '');
    });
  });
});
