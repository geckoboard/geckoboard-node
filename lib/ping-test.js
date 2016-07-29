'use strict';

const ping = require('./ping');

describe('ping', () => {
  it('makes a request', () => {
    const CALLBACK = () => {};
    const apiRequest = jasmine.createSpy('apiRequest');
    ping(apiRequest)(CALLBACK);

    expect(apiRequest).toHaveBeenCalledWith('get', { endpoint: '/' }, CALLBACK);
  });
});
