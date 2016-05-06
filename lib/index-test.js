const gb = require('./index'),
  package = require('../package.json');

describe('gb', () => {
  it('sets the version based on package.json', () => {
    expect(gb.VERSION).toEqual(package.version);
  });
});
