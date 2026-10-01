import { ApiError, apiClient } from '../apiClient';

describe('apiClient auth', () => {
  const originalToken = process.env.EXPO_PUBLIC_TMDB_ACCESS_TOKEN;
  const originalKey = process.env.EXPO_PUBLIC_TMDB_API_KEY;

  afterEach(() => {
    restore('EXPO_PUBLIC_TMDB_ACCESS_TOKEN', originalToken);
    restore('EXPO_PUBLIC_TMDB_API_KEY', originalKey);
    apiClient.defaults.adapter = undefined;
  });

  it('does not send a request when no TMDB credential is configured', async () => {
    delete process.env.EXPO_PUBLIC_TMDB_ACCESS_TOKEN;
    delete process.env.EXPO_PUBLIC_TMDB_API_KEY;
    let sent = false;
    apiClient.defaults.adapter = async () => {
      sent = true;
      throw new Error('should not send');
    };

    await expect(apiClient.get('/movie/upcoming')).rejects.toBeInstanceOf(ApiError);
    expect(sent).toBe(false);
  });

  it('sends the read access token as a bearer header', async () => {
    process.env.EXPO_PUBLIC_TMDB_ACCESS_TOKEN = 'read-token';
    delete process.env.EXPO_PUBLIC_TMDB_API_KEY;

    const config = await capture('/movie/upcoming');

    expect(config.headers.get('Authorization')).toBe('Bearer read-token');
    expect(config.params?.api_key).toBeUndefined();
  });

  it('sends the API key as a query parameter when no token is set', async () => {
    delete process.env.EXPO_PUBLIC_TMDB_ACCESS_TOKEN;
    process.env.EXPO_PUBLIC_TMDB_API_KEY = 'api-key';

    const config = await capture('/search/movie', { params: { query: 'nature' } });

    expect(config.headers.get('Authorization')).toBeUndefined();
    expect(config.params).toMatchObject({ api_key: 'api-key', query: 'nature' });
  });
});

function restore(key: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[key];
    return;
  }

  process.env[key] = value;
}

async function capture(url: string, config?: { params?: Record<string, unknown> }) {
  let captured: { headers: { get: (name: string) => string | undefined }; params?: Record<string, unknown> } | undefined;

  apiClient.defaults.adapter = async (request) => {
    captured = request as typeof captured;
    return {
      data: {},
      status: 200,
      statusText: 'OK',
      headers: {},
      config: request,
    };
  };

  await apiClient.get(url, config);
  if (!captured) {
    throw new Error('request was not captured');
  }
  return captured;
}
