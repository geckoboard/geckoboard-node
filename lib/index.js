'use strict';

const version = require('../package.json').version;
const client = require('./api-client');
const api = require('./api-request');
const HOST = process.env.GECKOBOARD_API_HOST || 'https://api.geckoboard.com';
const USER_AGENT = `Geckoboard Node Client ${version}`;

const gb = function (apiKey) {
  const apiRequest = api.apiRequest(HOST, apiKey, USER_AGENT);
  return client.getClient(apiRequest);
};

gb.VERSION = version

module.exports = gb;
