import Geckoboard from './index';
import { MockAgent, setGlobalDispatcher, Interceptable } from 'undici';

describe('Geckoboard', () => {
  const ORIGINAL_ENV = process.env;

  let mockAgent: MockAgent;
  let mockPool: Interceptable;

  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };

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

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it('has the version set correctly', () => {
    const gb = new Geckoboard('API_KEY');
    expect(gb.version).toBe('2.0.0');
  });

  it('can ping the api server', async () => {
    const serverSpy = jest.fn().mockReturnValue({});
    mockPool.intercept({ path: '/' }).reply(200, serverSpy);

    const gb = new Geckoboard('API_KEY');
    await gb.ping();
    expect(serverSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        path: '/',
        headers: expect.objectContaining({
          authorization: `Basic ${btoa('API_KEY:')}`,
          'user-agent': 'Geckoboard Node Client 2.0.0',
        }),
      }),
    );
  });

  it('can use a custom API host', async () => {
    const serverSpy = jest.fn().mockReturnValue({});

    const GECKOBOARD_API_HOST = 'https://api.deadpan.com';
    process.env.GECKOBOARD_API_HOST = GECKOBOARD_API_HOST;
    mockPool = mockAgent.get(GECKOBOARD_API_HOST);

    mockPool.intercept({ path: '/' }).reply(200, serverSpy);

    const gb = new Geckoboard('API_KEY');
    await gb.ping();
    expect(serverSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        path: '/',
        headers: expect.objectContaining({
          authorization: `Basic ${btoa('API_KEY:')}`,
          'user-agent': 'Geckoboard Node Client 2.0.0',
        }),
      }),
    );
  });

  it('will error if ping is not authorized', async () => {
    mockPool.intercept({ path: '/' }).reply(
      401,
      JSON.stringify({
        error: {
          message: 'Your API key is invalid',
        },
      }),
    );

    const gb = new Geckoboard('BAD_API_KEY');
    await expect(gb.ping()).rejects.toThrow(
      new Error('Your API key is invalid'),
    );
  });

  it('will error with default message when error is upexpected', async () => {
    mockPool.intercept({ path: '/' }).reply(500, {});

    const gb = new Geckoboard('BAD_API_KEY');
    await expect(gb.ping()).rejects.toThrow(
      new Error('Something went wrong with the request'),
    );
  });

  it('can create a dataset', async () => {
    const serverSpy = jest.fn().mockReturnValue(
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
    mockPool
      .intercept({ method: 'PUT', path: '/datasets/steps.by.day' })
      .reply(200, serverSpy);

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
    expect(serverSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'PUT',
        path: '/datasets/steps.by.day',
        headers: expect.objectContaining({
          authorization: `Basic ${btoa('API_KEY:')}`,
          'user-agent': 'Geckoboard Node Client 2.0.0',
          'content-type': 'application/json',
        }),
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
      }),
    );
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

    await expect(dataset.create()).rejects.toThrow(
      new Error('Something went wrong with the request'),
    );
  });

  it('can append data to a dataset', async () => {
    const serverSpy = jest.fn().mockReturnValue('{}');
    mockPool
      .intercept({
        method: 'POST',
        path: '/datasets/steps.by.day/data',
      })
      .reply(200, serverSpy);
    const dataset = prepareDataset();
    await dataset.append([
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
    expect(serverSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        path: '/datasets/steps.by.day/data',
        headers: expect.objectContaining({
          authorization: `Basic ${btoa('API_KEY:')}`,
          'user-agent': 'Geckoboard Node Client 2.0.0',
          'content-type': 'application/json',
        }),
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
      }),
    );
  });

  it('can append data to a dataset using the Date object', async () => {
    const serverSpy = jest.fn().mockReturnValue('{}');
    mockPool
      .intercept({
        method: 'POST',
        path: '/datasets/steps.by.day/data',
      })
      .reply(200, serverSpy);
    const dataset = prepareDataset();
    await dataset.append([
      {
        timestamp: new Date('2018-01-01T12:00:00Z'),
        day: new Date('2018-01-01'),
        steps: 819,
      },
      {
        timestamp: new Date('2018-01-02T12:00:00Z'),
        day: new Date('2018-01-02'),
        steps: 409,
      },
      {
        timestamp: new Date('2018-01-03T12:00:00Z'),
        day: new Date('2018-01-03'),
        steps: 164,
      },
    ]);
    expect(serverSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        path: '/datasets/steps.by.day/data',
        headers: expect.objectContaining({
          authorization: `Basic ${btoa('API_KEY:')}`,
          'user-agent': 'Geckoboard Node Client 2.0.0',
          'content-type': 'application/json',
        }),
        body: JSON.stringify({
          data: [
            {
              timestamp: '2018-01-01T12:00:00.000Z',
              day: '2018-01-01',
              steps: 819,
            },
            {
              timestamp: '2018-01-02T12:00:00.000Z',
              day: '2018-01-02',
              steps: 409,
            },
            {
              timestamp: '2018-01-03T12:00:00.000Z',
              day: '2018-01-03',
              steps: 164,
            },
          ],
        }),
      }),
    );
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
    const dataset = prepareDataset();
    await expect(
      dataset.append([
        {
          timestamp: '2018-01-01T12:00:00Z',
          steps: 819,
        },
      ]),
    ).rejects.toThrow(new Error('Something went wrong with the request'));
  });

  it('can replace data in a dataset', async () => {
    const serverSpy = jest.fn().mockReturnValue('{}');
    mockPool
      .intercept({
        method: 'PUT',
        path: '/datasets/steps.by.day/data',
      })
      .reply(200, serverSpy);
    const dataset = prepareDataset();
    await dataset.replace([
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
    expect(serverSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'PUT',
        path: '/datasets/steps.by.day/data',
        headers: expect.objectContaining({
          authorization: `Basic ${btoa('API_KEY:')}`,
          'user-agent': 'Geckoboard Node Client 2.0.0',
          'content-type': 'application/json',
        }),
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
      }),
    );
  });

  it('can replace data for a dataset using the Date object', async () => {
    const serverSpy = jest.fn().mockReturnValue('{}');
    mockPool
      .intercept({
        method: 'PUT',
        path: '/datasets/steps.by.day/data',
      })
      .reply(200, serverSpy);
    const dataset = prepareDataset();
    await dataset.replace([
      {
        timestamp: new Date('2018-01-01T12:00:00Z'),
        day: new Date('2018-01-01'),
        steps: 819,
      },
      {
        timestamp: new Date('2018-01-02T12:00:00Z'),
        day: new Date('2018-01-02'),
        steps: 409,
      },
      {
        timestamp: new Date('2018-01-03T12:00:00Z'),
        day: new Date('2018-01-03'),
        steps: 164,
      },
    ]);
    expect(serverSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'PUT',
        path: '/datasets/steps.by.day/data',
        headers: expect.objectContaining({
          authorization: `Basic ${btoa('API_KEY:')}`,
          'user-agent': 'Geckoboard Node Client 2.0.0',
          'content-type': 'application/json',
        }),
        body: JSON.stringify({
          data: [
            {
              timestamp: '2018-01-01T12:00:00.000Z',
              day: '2018-01-01',
              steps: 819,
            },
            {
              timestamp: '2018-01-02T12:00:00.000Z',
              day: '2018-01-02',
              steps: 409,
            },
            {
              timestamp: '2018-01-03T12:00:00.000Z',
              day: '2018-01-03',
              steps: 164,
            },
          ],
        }),
      }),
    );
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
    const dataset = prepareDataset();
    await expect(
      dataset.replace([
        {
          timestamp: '2018-01-01T12:00:00Z',
          steps: 819,
        },
      ]),
    ).rejects.toThrow(new Error('Something went wrong with the request'));
  });

  it('can delete a dataset', async () => {
    const serverSpy = jest.fn().mockReturnValue('{}');
    mockPool
      .intercept({
        method: 'DELETE',
        path: '/datasets/steps.by.day',
      })
      .reply(200, serverSpy);
    const dataset = prepareDataset();
    await dataset.delete();
    expect(serverSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'DELETE',
        path: '/datasets/steps.by.day',
        headers: expect.objectContaining({
          authorization: `Basic ${btoa('API_KEY:')}`,
          'user-agent': 'Geckoboard Node Client 2.0.0',
        }),
      }),
    );
  });

  it('will error if there is an issue deleting a dataset', async () => {
    mockPool
      .intercept({
        method: 'DELETE',
        path: '/datasets/steps.by.day',
        headers: {
          Authorization: `Basic ${btoa('API_KEY:')}`,
          'User-Agent': 'Geckoboard Node Client 2.0.0',
        },
      })
      .reply(500, '{}');
    const dataset = prepareDataset();
    await expect(dataset.delete()).rejects.toThrow(
      new Error('Something went wrong with the request'),
    );
  });
});

const prepareDataset = () => {
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
      day: {
        type: 'date',
        name: 'Day',
        optional: true,
      },
    },
    uniqueBy: ['timestamp'],
  });
};
