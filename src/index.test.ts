import { Geckoboard } from './index';
import { MockAgent, setGlobalDispatcher, Interceptable } from 'undici';
import { version as v } from '../package.json';

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
    expect(gb.version).toBe(v);
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
          'user-agent': 'Geckoboard Node Client ' + v,
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
          'user-agent': 'Geckoboard Node Client ' + v,
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
      .reply(201, serverSpy);

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
          'user-agent': 'Geckoboard Node Client ' + v,
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
          'User-Agent': 'Geckoboard Node Client ' + v,
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
          'user-agent': 'Geckoboard Node Client ' + v,
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

  it.each([
    {
      datetime: new Date('2018'),
      expected: '2018-01-01T00:00:00.000Z',
      description: 'just a year string',
    },
    {
      datetime: new Date('2018-02'),
      expected: '2018-02-01T00:00:00.000Z',
      description: 'just a month string',
    },
    {
      datetime: new Date('2018-03-02'),
      expected: '2018-03-02T00:00:00.000Z',
      description: 'just a date string',
    },
    {
      datetime: new Date('2018-04-05T12:00:00.000Z'),
      expected: '2018-04-05T12:00:00.000Z',
      description: 'a UTC datetime string',
    },
    {
      datetime: new Date('2013-09-15T05:53:00+08:00'),
      expected: '2013-09-14T21:53:00.000Z',
      description: 'a datetime string with timezone information (+ positve)',
    },
    {
      datetime: new Date('2018-01-12T20:00:00-10:00'),
      expected: '2018-01-13T06:00:00.000Z',
      description: 'a datetime string with timezone information (- negative)',
    },
    {
      datetime: new Date('2018-01-12T00:00:01'),
      expected: '2018-01-11T23:00:01.000Z',
      description: 'a datetime string in local time (mocked to `Europe/Paris`)',
    },
  ])(
    'can use date object that is constructed with $description that will be converted to UTC to append datetime data',
    async ({ datetime, expected }) => {
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
          timestamp: datetime,
          steps: 8190,
        },
      ]);
      expect(serverSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          path: '/datasets/steps.by.day/data',
          headers: expect.objectContaining({
            authorization: `Basic ${btoa('API_KEY:')}`,
            'user-agent': 'Geckoboard Node Client ' + v,
            'content-type': 'application/json',
          }),
          body: JSON.stringify({
            data: [
              {
                timestamp: expected,
                steps: 8190,
              },
            ],
          }),
        }),
      );
    },
  );

  it.each([
    {
      date: new Date('2018'),
      expected: '2018-01-01',
      description: 'just a year string',
    },
    {
      date: new Date('2018-02'),
      expected: '2018-02-01',
      description: 'just a month string',
    },
    {
      date: new Date('2018-03-02'),
      expected: '2018-03-02',
      description: 'just a date string',
    },
    {
      date: new Date('2018-04-05T12:00:00.000Z'),
      expected: '2018-04-05',
      description: 'a UTC datetime string',
    },
    {
      date: new Date('2013-09-15T05:53:00+08:00'),
      expected: '2013-09-14',
      description: 'a datetime string with timezone information (+ positve)',
    },
    {
      date: new Date('2018-01-12T20:00:00-10:00'),
      expected: '2018-01-13',
      description: 'a datetime string with timezone information (- negative)',
    },
    {
      date: new Date('2018-01-12T00:00:01'),
      expected: '2018-01-11',
      description: 'a datetime string in local time (mocked to `Europe/Paris`)',
    },
  ])(
    'can use date object that is constructed with $description that will be converted to UTC to append date data',
    async ({ date, expected }) => {
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
          day: date,
          steps: 819,
        },
      ]);
      expect(serverSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          path: '/datasets/steps.by.day/data',
          headers: expect.objectContaining({
            authorization: `Basic ${btoa('API_KEY:')}`,
            'user-agent': 'Geckoboard Node Client ' + v,
            'content-type': 'application/json',
          }),
          body: JSON.stringify({
            data: [
              {
                timestamp: '2018-01-01T12:00:00.000Z',
                day: expected,
                steps: 819,
              },
            ],
          }),
        }),
      );
    },
  );

  it('will error if there is an issue appending to a dataset', async () => {
    mockPool
      .intercept({
        method: 'POST',
        path: '/datasets/steps.by.day/data',
        headers: {
          Authorization: `Basic ${btoa('API_KEY:')}`,
          'User-Agent': 'Geckoboard Node Client ' + v,
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
          'user-agent': 'Geckoboard Node Client ' + v,
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

  it.each([
    {
      datetime: new Date('2018'),
      expected: '2018-01-01T00:00:00.000Z',
      description: 'just a year string',
    },
    {
      datetime: new Date('2018-02'),
      expected: '2018-02-01T00:00:00.000Z',
      description: 'just a month string',
    },
    {
      datetime: new Date('2018-03-02'),
      expected: '2018-03-02T00:00:00.000Z',
      description: 'just a date string',
    },
    {
      datetime: new Date('2018-04-05T12:00:00.000Z'),
      expected: '2018-04-05T12:00:00.000Z',
      description: 'a UTC datetime string',
    },
    {
      datetime: new Date('2013-09-15T05:53:00+08:00'),
      expected: '2013-09-14T21:53:00.000Z',
      description: 'a datetime string with timezone information (+ positve)',
    },
    {
      datetime: new Date('2018-01-12T20:00:00-10:00'),
      expected: '2018-01-13T06:00:00.000Z',
      description: 'a datetime string with timezone information (- negative)',
    },
    {
      datetime: new Date('2018-01-12T00:00:01'),
      expected: '2018-01-11T23:00:01.000Z',
      description: 'a datetime string in local time (mocked to `Europe/Paris`)',
    },
  ])(
    'can use date object that is constructed with $description that will be converted to UTC to replace datetime data',
    async ({ datetime, expected }) => {
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
          timestamp: datetime,
          steps: 8190,
        },
      ]);
      expect(serverSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'PUT',
          path: '/datasets/steps.by.day/data',
          headers: expect.objectContaining({
            authorization: `Basic ${btoa('API_KEY:')}`,
            'user-agent': 'Geckoboard Node Client ' + v,
            'content-type': 'application/json',
          }),
          body: JSON.stringify({
            data: [
              {
                timestamp: expected,
                steps: 8190,
              },
            ],
          }),
        }),
      );
    },
  );

  it.each([
    {
      date: new Date('2018'),
      expected: '2018-01-01',
      description: 'just a year string',
    },
    {
      date: new Date('2018-02'),
      expected: '2018-02-01',
      description: 'just a month string',
    },
    {
      date: new Date('2018-03-02'),
      expected: '2018-03-02',
      description: 'just a date string',
    },
    {
      date: new Date('2018-04-05T12:00:00.000Z'),
      expected: '2018-04-05',
      description: 'a UTC datetime string',
    },
    {
      date: new Date('2013-09-15T05:53:00+08:00'),
      expected: '2013-09-14',
      description: 'a datetime string with timezone information (+ positve)',
    },
    {
      date: new Date('2018-01-12T20:00:00-10:00'),
      expected: '2018-01-13',
      description: 'a datetime string with timezone information (- negative)',
    },
    {
      date: new Date('2018-01-12T00:00:01'),
      expected: '2018-01-11',
      description: 'a datetime string in local time (mocked to `Europe/Paris`)',
    },
  ])(
    'can use date object that is constructed with $description that will be converted to UTC to replace date data',
    async ({ date, expected }) => {
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
          day: date,
          steps: 819,
        },
      ]);
      expect(serverSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'PUT',
          path: '/datasets/steps.by.day/data',
          headers: expect.objectContaining({
            authorization: `Basic ${btoa('API_KEY:')}`,
            'user-agent': 'Geckoboard Node Client ' + v,
            'content-type': 'application/json',
          }),
          body: JSON.stringify({
            data: [
              {
                timestamp: '2018-01-01T12:00:00.000Z',
                day: expected,
                steps: 819,
              },
            ],
          }),
        }),
      );
    },
  );

  it('will error if there is an issue replacing a dataset', async () => {
    mockPool
      .intercept({
        method: 'PUT',
        path: '/datasets/steps.by.day/data',
        headers: {
          Authorization: `Basic ${btoa('API_KEY:')}`,
          'User-Agent': 'Geckoboard Node Client ' + v,
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
          'user-agent': 'Geckoboard Node Client ' + v,
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
          'User-Agent': 'Geckoboard Node Client ' + v,
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
