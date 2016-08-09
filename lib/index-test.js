'use strict';

const gb = require('./index');
const api = require('./api-request');
const client = require('./api-client');
const packageJSON = require('../package.json');

describe('gb', () => {
  it('sets the version based on package.json', () => {
    expect(gb.VERSION).toEqual(packageJSON.version);
  });

  it('returns the api client', () => {
    const HOST = 'https://api.geckoboard.com';
    const USER_AGENT = `Geckoboard Node Client ${packageJSON.version}`;
    const API_KEY = '321';
    const API_REQUEST = () => {};
    const API_CLIENT = {};
    spyOn(api, 'apiRequest').and.returnValue(API_REQUEST);
    spyOn(client, 'getClient').and.returnValue(API_CLIENT);

    const result = gb(API_KEY);

    expect(api.apiRequest).toHaveBeenCalledWith(
      HOST, API_KEY, USER_AGENT
    );
    expect(client.getClient).toHaveBeenCalledWith(
      API_REQUEST
    );
    expect(result).toBe(API_CLIENT);
  });
});
