import Geckoboard from './index';
import { MockAgent, setGlobalDispatcher } from 'undici';

describe('Geckoboard', () => {
  it('has the version set correctly', () => {
    const gb = new Geckoboard('API_KEY');
    expect(gb.version).toBe('2.0.0');
  });

  it('can ping the api server', async () => {
    const mockAgent = new MockAgent();
    setGlobalDispatcher(mockAgent);

    const mockPool = mockAgent.get('https://api.geckoboard.com');
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

    expect(() => mockAgent.assertNoPendingInterceptors()).not.toThrow();
  });

  it('will error if ping is not authorized', async () => {
    const mockAgent = new MockAgent();
    setGlobalDispatcher(mockAgent);

    const mockPool = mockAgent.get('https://api.geckoboard.com');
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
    expect(() => mockAgent.assertNoPendingInterceptors()).not.toThrow();
  });

  it('will error with default message when error is upexpected', async () => {
    const mockAgent = new MockAgent();
    setGlobalDispatcher(mockAgent);

    const mockPool = mockAgent.get('https://api.geckoboard.com');
    mockPool
      .intercept({
        path: '/',
      })
      .reply(500, {});

    const gb = new Geckoboard('BAD_API_KEY');
    expect(async () => await gb.ping()).rejects.toThrow(
      new Error('Something went wrong with the request'),
    );
    expect(() => mockAgent.assertNoPendingInterceptors()).not.toThrow();
  });

  it('can create a dataset', async () => {
    const mockAgent = new MockAgent();
    setGlobalDispatcher(mockAgent);

    const mockPool = mockAgent.get('https://api.geckoboard.com');
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
    const dataset = gb.defineDataset({
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
    await dataset.create();

    expect(() => mockAgent.assertNoPendingInterceptors()).not.toThrow();
  });

  it('will error if there is an issue creating a dataset', async () => {
    const mockAgent = new MockAgent();
    setGlobalDispatcher(mockAgent);

    const mockPool = mockAgent.get('https://api.geckoboard.com');
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
    expect(() => mockAgent.assertNoPendingInterceptors()).not.toThrow();
  });
});
