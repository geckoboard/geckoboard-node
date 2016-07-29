const gb = require('./index'),
  nock = require('nock'),
  packageJSON = require('../package.json');

describe('gb', () => {
  it('sets the version based on package.json', () => {
    expect(gb.VERSION).toEqual(packageJSON.version);
  });

  describe('.datasets.delete', () => {
    it('sends request to delete a dataset', (done) => {
      const DATASET_ID = '444',
        API_KEY = '321',
        HOST = 'https://api.geckoboard.com',
        USER_AGENT = `Geckoboard Node Client ${packageJSON.version}`,
        server = nock(HOST).delete(`/datasets/${DATASET_ID}`)
        .matchHeader('User-Agent', USER_AGENT)
        .basicAuth({
          user: API_KEY,
          pass: '',
        })
        .reply(200, {}, {
          'Content-Type': 'application/json',
        });

      gb(API_KEY).datasets.delete(DATASET_ID, (err) => {
        expect(err).toBe(null);
        server.done()
        done();
      });
    });
  });
});
