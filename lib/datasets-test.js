'use strict';

const datasets = require('./datasets');

describe('createDataset', () => {
  const DATASET_ID = 111;
  const CALLBACK = () => {};
  const DATASET_META = {
    id: DATASET_ID,
    fields: {
      number: { name: 'foo', type: 'bar' },
    },
  };

  let apiRequest;

  beforeEach(() => {
    apiRequest = jasmine.createSpy('apiRequest');
  });

  describe('.put', () => {
    const DATA = [{ number: 8192 }];

    it('updates dataset with new data', () => {
      const dataset = datasets.createDataset(apiRequest, DATASET_META);
      dataset.put(DATA, CALLBACK);

      expect(apiRequest).toHaveBeenCalledWith(
        'put',
        { endpoint: `/datasets/${DATASET_ID}/data`, body: JSON.stringify({ data: DATA }) },
        CALLBACK
      );
    });
  });

  describe('.post', () => {
    const DATA = [{ number: 8192 }];

    it('adds data to the dataset', () => {
      const dataset = datasets.createDataset(apiRequest, DATASET_META);
      dataset.post(DATA, null, CALLBACK);

      expect(apiRequest).toHaveBeenCalledWith(
        'post',
        { endpoint: `/datasets/${DATASET_ID}/data`, body: JSON.stringify({ data: DATA }) },
        CALLBACK
      );
    });

    it('supports an optional `delete_by` parameter', () => {
      const dataset = datasets.createDataset(apiRequest, DATASET_META);
      const DELETE_BY = 'foo';
      dataset.post(DATA, { delete_by: DELETE_BY }, CALLBACK);

      expect(apiRequest).toHaveBeenCalledWith(
        'post',
        {
          endpoint: `/datasets/${DATASET_ID}/data`,
          body: JSON.stringify({ data: DATA, delete_by: DELETE_BY }),
        },
        CALLBACK
      );
    });
  });

  describe('.delete', () => {
    it('request deletion of the respective dataset', () => {
      const dataset = datasets.createDataset(apiRequest, DATASET_META);
      dataset.delete(CALLBACK);

      expect(apiRequest).toHaveBeenCalledWith(
        'delete',
        { endpoint: `/datasets/${DATASET_ID}` },
        CALLBACK
      );
    });
  });
});
