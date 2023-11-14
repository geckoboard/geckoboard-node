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
  });
});
