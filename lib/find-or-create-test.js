'use strict';

const findOrCreate = require('./find-or-create'),
  datasets = require('./datasets');

describe('findOrCreate', () => {
  const DATASET_ID = 'sales.gross',
    FIELDS = {
      number: { type: 'number', name: 'Number' },
    },
    DATASET_REQUEST = {
      id: DATASET_ID,
      fields: FIELDS,
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

  fit('makes a request to create a dataset', () => {
    findOrCreate(apiRequest)(DATASET_REQUEST, callback);

    expect(apiRequest).toHaveBeenCalledWith(
      'put',
      {
        endpoint: `/datasets/${DATASET_ID}`,
        body: JSON.stringify({ fields: FIELDS }),
      },
      jasmine.any(Function)
    );

    apiRequest.calls.mostRecent().args[2](null, DATASET_RESPONSE);

    expect(datasets.createDataset).toHaveBeenCalledWith(DATASET_RESPONSE, apiRequest);
    expect(callback).toHaveBeenCalledWith(null, DATASET_INSTANCE);
  });

  fit('yields an error when the request fails', () => {
    const ERROR = new Error('well this sucks');
    findOrCreate(apiRequest)(DATASET_REQUEST, callback);
    apiRequest.calls.mostRecent().args[2](ERROR);

    expect(datasets.createDataset).not.toHaveBeenCalled();
    expect(callback).toHaveBeenCalledWith(ERROR);
  });
});
