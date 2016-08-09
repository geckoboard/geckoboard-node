'use strict';

const client = require('./api-client');
const datasets = require('./datasets');
const findOrCreate = require('./find-or-create');

describe('client', () => {
  const CALLBACK = () => {};
  let subject, apiRequest;

  beforeEach(() => {
    apiRequest = jasmine.createSpy('apiRequest');
    subject = client.getClient(apiRequest);
  });

  describe('#ping', () => {
    it('makes a ping request', () => {
      subject.ping(CALLBACK);

      expect(apiRequest).toHaveBeenCalledWith(
        'get', { endpoint: '/' }, CALLBACK
      );
    });
  });

  describe('.datasets#findOrCreate', () => {
    it('makes a request for a dataset', () => {
      const DATASET_PAYLOAD = { id: 'foo' };
      spyOn(findOrCreate, 'put');

      subject.datasets.findOrCreate(DATASET_PAYLOAD, CALLBACK);

      expect(findOrCreate.put).toHaveBeenCalledWith(apiRequest, DATASET_PAYLOAD, CALLBACK);
    });
  });

  describe('.datasets#delete', () => {
    it('makes a delete request', () => {
      const DATASET_ID = '123';
      const deleteSpy = jasmine.createSpy('delete');
      spyOn(datasets, 'createDataset').and.returnValue({
        delete: deleteSpy,
      });
      subject.datasets.delete(DATASET_ID, CALLBACK);

      expect(datasets.createDataset).toHaveBeenCalledWith(apiRequest, { id: DATASET_ID });
      expect(deleteSpy).toHaveBeenCalledWith(CALLBACK);
    });
  });
});
