'use strict';

const deleteDataset = require('./delete');

describe('delete', () => {
  it('sends a delete request', () => {
    const DATASET_ID = 'dr.octagon';
    const apiRequest = jasmine.createSpy('apiRequest');
    const callback = jasmine.createSpy('callback');

    deleteDataset.delete(apiRequest, DATASET_ID, callback);

    expect(apiRequest).toHaveBeenCalledWith('delete', { endpoint: `/datasets/${DATASET_ID}`}, callback);
  });
});
