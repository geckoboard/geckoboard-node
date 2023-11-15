import Geckoboard from './index';
import { MockAgent, setGlobalDispatcher, Interceptable } from 'undici';

const prepareDatasetForCreation = (mockPool: Interceptable) => {
  mockPool
    .intercept({
      method: 'PUT',
      path: '/datasets/steps.by.day',
      headers: {
        Authorization: `Basic ${btoa('API_KEY:')}`,
        'User-Agent': 'Geckoboard Node Client 2.0.0',
        'Content-type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          steps: {
            type: 'number',
            name: 'Steps',
            optional: false,
          },
          timestamp: {
            type: 'datetime',
            name: 'Date',
          },
        },
        unique_by: ['timestamp'],
      }),
    })
    .reply(
      200,
      JSON.stringify({
        id: 'steps.by.day',
        fields: {
          steps: {
            type: 'number',
            name: 'Steps',
            optional: false,
          },
          timestamp: {
            type: 'datetime',
            name: 'Date',
          },
        },
        unique_by: ['timestamp'],
      }),
    );

  const gb = new Geckoboard('API_KEY');
  return gb.defineDataset({
    id: 'steps.by.day',
    fields: {
      steps: {
        type: 'number',
        name: 'Steps',
        optional: false,
      },
      timestamp: {
        type: 'datetime',
        name: 'Date',
      },
    },
    uniqueBy: ['timestamp'],
  });
};
describe('Geckoboard', () => {
  let mockAgent: MockAgent;
  let mockPool: Interceptable;

  beforeEach(() => {
    mockAgent = new MockAgent();
    // If request are made that do not have an interceptor, they
    // will actually be made over the net unless we call this method.
    mockAgent.disableNetConnect();
    setGlobalDispatcher(mockAgent);

    mockPool = mockAgent.get('https://api.geckoboard.com');
  });

  afterEach(() => {
    expect(() => mockAgent.assertNoPendingInterceptors()).not.toThrow();
  });

  it('has the version set correctly', () => {
    const gb = new Geckoboard('API_KEY');
    expect(gb.version).toBe('2.0.0');
  });

  it('can ping the api server', async () => {
    mockPool
      .intercept({
        path: '/',
        headers: {
          Authorization: `Basic ${btoa('API_KEY:')}`,
          'User-Agent': 'Geckoboard Node Client 2.0.0',
        },
      })
      .reply(200, '{}');

    const gb = new Geckoboard('API_KEY');
    await gb.ping();
  });

  it('will error if ping is not authorized', async () => {
    mockPool
      .intercept({
        path: '/',
      })
      .reply(
        401,
        JSON.stringify({
          error: {
            message: 'Your API key is invalid',
          },
        }),
      );

    const gb = new Geckoboard('BAD_API_KEY');
    expect(async () => await gb.ping()).rejects.toThrow(
      new Error('Your API key is invalid'),
    );
  });

  it('will error with default message when error is upexpected', async () => {
    mockPool
      .intercept({
        path: '/',
      })
      .reply(500, {});

    const gb = new Geckoboard('BAD_API_KEY');
    expect(async () => await gb.ping()).rejects.toThrow(
      new Error('Something went wrong with the request'),
    );
  });

  it('can create a dataset', async () => {
    const dataset = prepareDatasetForCreation(mockPool);
    await dataset.create();
  });

  it('will error if there is an issue creating a dataset', async () => {
    mockPool
      .intercept({
        method: 'PUT',
        path: '/datasets/problems.by.day',
        headers: {
          Authorization: `Basic ${btoa('API_KEY:')}`,
          'User-Agent': 'Geckoboard Node Client 2.0.0',
          'Content-type': 'application/json',
        },
        body: JSON.stringify({
          fields: {
            timestamp: {
              type: 'datetime',
              name: 'Date',
            },
          },
          unique_by: ['timestamp'],
        }),
      })
      .reply(500, '{}');

    const gb = new Geckoboard('API_KEY');
    const dataset = gb.defineDataset({
      id: 'problems.by.day',
      fields: {
        timestamp: {
          type: 'datetime',
          name: 'Date',
        },
      },
      uniqueBy: ['timestamp'],
    });

    expect(async () => await dataset.create()).rejects.toThrow(
      new Error('Something went wrong with the request'),
    );
  });

  it('can append data to a dataset', async () => {
    mockPool
      .intercept({
        method: 'POST',
        path: '/datasets/steps.by.day/data',
        headers: {
          Authorization: `Basic ${btoa('API_KEY:')}`,
          'User-Agent': 'Geckoboard Node Client 2.0.0',
          'Content-type': 'application/json',
        },
        body: JSON.stringify({
          data: [
            {
              timestamp: '2018-01-01T12:00:00Z',
              steps: 819,
            },
            {
              timestamp: '2018-01-02T12:00:00Z',
              steps: 409,
            },
            {
              timestamp: '2018-01-03T12:00:00Z',
              steps: 164,
            },
          ],
        }),
      })
      .reply(200, '{}');
    const dataset = prepareDatasetForCreation(mockPool);
    await dataset.create();
    dataset.append([
      {
        timestamp: '2018-01-01T12:00:00Z',
        steps: 819,
      },
      {
        timestamp: '2018-01-02T12:00:00Z',
        steps: 409,
      },
      {
        timestamp: '2018-01-03T12:00:00Z',
        steps: 164,
      },
    ]);
  });

  it('will error if there is an issue appending to a dataset', async () => {
    mockPool
      .intercept({
        method: 'POST',
        path: '/datasets/steps.by.day/data',
        headers: {
          Authorization: `Basic ${btoa('API_KEY:')}`,
          'User-Agent': 'Geckoboard Node Client 2.0.0',
          'Content-type': 'application/json',
        },
        body: JSON.stringify({
          data: [
            {
              timestamp: '2018-01-01T12:00:00Z',
              steps: 819,
            },
          ],
        }),
      })
      .reply(500, '{}');
    const dataset = prepareDatasetForCreation(mockPool);
    await dataset.create();
    expect(
      async () =>
        await dataset.append([
          {
            timestamp: '2018-01-01T12:00:00Z',
            steps: 819,
          },
        ]),
    ).rejects.toThrow(new Error('Something went wrong with the request'));
  });

  it('can replace data in a dataset', async () => {
    mockPool
      .intercept({
        method: 'PUT',
        path: '/datasets/steps.by.day/data',
        headers: {
          Authorization: `Basic ${btoa('API_KEY:')}`,
          'User-Agent': 'Geckoboard Node Client 2.0.0',
          'Content-type': 'application/json',
        },
        body: JSON.stringify({
          data: [
            {
              timestamp: '2018-01-01T12:00:00Z',
              steps: 819,
            },
            {
              timestamp: '2018-01-02T12:00:00Z',
              steps: 409,
            },
            {
              timestamp: '2018-01-03T12:00:00Z',
              steps: 164,
            },
          ],
        }),
      })
      .reply(200, '{}');
    const dataset = prepareDatasetForCreation(mockPool);
    await dataset.create();
    dataset.replace([
      {
        timestamp: '2018-01-01T12:00:00Z',
        steps: 819,
      },
      {
        timestamp: '2018-01-02T12:00:00Z',
        steps: 409,
      },
      {
        timestamp: '2018-01-03T12:00:00Z',
        steps: 164,
      },
    ]);
  });

  it('will error if there is an issue replacing a dataset', async () => {
    mockPool
      .intercept({
        method: 'PUT',
        path: '/datasets/steps.by.day/data',
        headers: {
          Authorization: `Basic ${btoa('API_KEY:')}`,
          'User-Agent': 'Geckoboard Node Client 2.0.0',
          'Content-type': 'application/json',
        },
        body: JSON.stringify({
          data: [
            {
              timestamp: '2018-01-01T12:00:00Z',
              steps: 819,
            },
          ],
        }),
      })
      .reply(500, '{}');
    const dataset = prepareDatasetForCreation(mockPool);
    await dataset.create();
    expect(
      async () =>
        await dataset.replace([
          {
            timestamp: '2018-01-01T12:00:00Z',
            steps: 819,
          },
        ]),
    ).rejects.toThrow(new Error('Something went wrong with the request'));
  });
});
