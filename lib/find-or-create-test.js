'use strict';

const findOrCreate = require('./find-or-create');
const datasets = require('./datasets');

describe('findOrCreate', () => {
  describe('.put', () => {
    const DATASET_ID = 'sales.gross',
      FIELDS = {
        timestamp: { type: 'datetime' },
        number: { type: 'number', name: 'Number' },
      },
      UNIQUE_BY = ['timestamp'],
      DATASET_REQUEST = {
        id: DATASET_ID,
        fields: FIELDS,
        unique_by: UNIQUE_BY,
      },
      DATASET_RESPONSE = {
        id: DATASET_ID,
        fields: FIELDS,
      },
      DATASET_INSTANCE = { id: DATASET_ID };

    let apiRequest;
    let callback;

    beforeEach(() => {
      apiRequest = jasmine.createSpy('apiRequest');
      callback = jasmine.createSpy('callback');

      spyOn(datasets, 'createDataset').and.returnValue(DATASET_INSTANCE);
    });

    it('makes a request to create a dataset', () => {
      findOrCreate.put(apiRequest, DATASET_REQUEST, callback);

      expect(apiRequest).toHaveBeenCalledWith(
        'put',
        {
          endpoint: `/datasets/${DATASET_ID}`,
          body: JSON.stringify({ fields: FIELDS, unique_by: UNIQUE_BY }),
        },
        jasmine.any(Function)
      );

      apiRequest.calls.mostRecent().args[2](null, DATASET_RESPONSE);

      expect(datasets.createDataset).toHaveBeenCalledWith(apiRequest, DATASET_RESPONSE);
      expect(callback).toHaveBeenCalledWith(null, DATASET_INSTANCE);
    });

    it('yields an error when the request fails', () => {
      const ERROR = new Error('well this sucks');
      findOrCreate.put(apiRequest, DATASET_REQUEST, callback);
      apiRequest.calls.mostRecent().args[2](ERROR);

      expect(datasets.createDataset).not.toHaveBeenCalled();
      expect(callback).toHaveBeenCalledWith(ERROR);
    });
  });
});
