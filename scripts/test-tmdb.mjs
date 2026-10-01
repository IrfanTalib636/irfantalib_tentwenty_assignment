import assert from 'node:assert/strict';
import { loadProjectEnv } from '@expo/env';
import axios from 'axios';

loadProjectEnv(process.cwd(), { silent: true });

const savedToken = process.env.EXPO_PUBLIC_TMDB_ACCESS_TOKEN;
const savedApiKey = process.env.EXPO_PUBLIC_TMDB_API_KEY;

const { ApiError, apiClient } = await import('../src/api/apiClient.ts');
const { getImageUrl } = await import('../src/api/images.ts');
const movies = await import('../src/api/movies.ts');

function restoreCredentials() {
  if (savedToken === undefined) {
    delete process.env.EXPO_PUBLIC_TMDB_ACCESS_TOKEN;
  } else {
    process.env.EXPO_PUBLIC_TMDB_ACCESS_TOKEN = savedToken;
  }

  if (savedApiKey === undefined) {
    delete process.env.EXPO_PUBLIC_TMDB_API_KEY;
  } else {
    process.env.EXPO_PUBLIC_TMDB_API_KEY = savedApiKey;
  }
}

async function captureRequest(run) {
  let captured;
  const originalAdapter = apiClient.defaults.adapter;

  apiClient.defaults.adapter = async (config) => {
    captured = config;
    return {
      data: {
        id: 1,
        page: 1,
        results: [],
        total_pages: 1,
        total_results: 0,
        backdrops: [],
        posters: [],
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    };
  };

  try {
    const data = await run();
    return { data, config: captured };
  } finally {
    apiClient.defaults.adapter = originalAdapter;
  }
}

function headerValue(config, name) {
  return config.headers.get(name);
}

delete process.env.EXPO_PUBLIC_TMDB_ACCESS_TOKEN;
delete process.env.EXPO_PUBLIC_TMDB_API_KEY;

let sentWithoutCredentials = false;
const originalAdapter = apiClient.defaults.adapter;
apiClient.defaults.adapter = async () => {
  sentWithoutCredentials = true;
  throw new Error('Request should not be sent without credentials');
};

await assert.rejects(
  () => apiClient.get('/movie/upcoming'),
  (error) => error instanceof ApiError,
);
assert.equal(sentWithoutCredentials, false);
apiClient.defaults.adapter = originalAdapter;
console.log('missing credentials: request blocked');

process.env.EXPO_PUBLIC_TMDB_ACCESS_TOKEN = 'test-token';
delete process.env.EXPO_PUBLIC_TMDB_API_KEY;

const bearer = await captureRequest(() =>
  movies.getUpcomingMovies(2),
);
assert.equal(headerValue(bearer.config, 'Authorization'), 'Bearer test-token');
assert.equal(bearer.config.params?.api_key, undefined);
assert.equal(bearer.config.params.page, 2);
assert.equal(bearer.config.url, '/movie/upcoming');
console.log('bearer token: Authorization header attached');

delete process.env.EXPO_PUBLIC_TMDB_ACCESS_TOKEN;
process.env.EXPO_PUBLIC_TMDB_API_KEY = 'test-key';

const keyed = await captureRequest(() => movies.searchMovies('nature', 3));
assert.equal(headerValue(keyed.config, 'Authorization'), undefined);
assert.equal(keyed.config.params.api_key, 'test-key');
assert.equal(keyed.config.params.query, 'nature');
assert.equal(keyed.config.url, '/search/movie');
console.log('api_key: query parameter attached');

process.env.EXPO_PUBLIC_TMDB_ACCESS_TOKEN = 'preferred-token';
process.env.EXPO_PUBLIC_TMDB_API_KEY = 'ignored-key';

const preferred = await captureRequest(() => movies.getMovieDetails(11));
assert.equal(
  headerValue(preferred.config, 'Authorization'),
  'Bearer preferred-token',
);
assert.equal(preferred.config.params?.api_key, undefined);
assert.equal(preferred.config.url, '/movie/11');
console.log('both credentials: bearer token is used');

const videos = await captureRequest(() => movies.getMovieVideos(11));
assert.equal(videos.config.url, '/movie/11/videos');

const images = await captureRequest(() => movies.getMovieImages(11));
assert.equal(images.config.url, '/movie/11/images');
console.log('detail, videos, and images paths are correct');

assert.equal(
  getImageUrl('/abc.jpg', 'w500'),
  'https://image.tmdb.org/t/p/w500/abc.jpg',
);
assert.equal(getImageUrl(null), null);
console.log('image CDN url built without an API key');

restoreCredentials();

const unauthenticated = await axios.get(
  'https://api.themoviedb.org/3/movie/upcoming',
  {
    validateStatus: () => true,
    timeout: 15000,
  },
);
assert.equal(unauthenticated.status, 401);
assert.equal(unauthenticated.data.status_code, 7);
console.log(
  `live TMDB without credentials: ${unauthenticated.status} ${unauthenticated.data.status_message}`,
);

const liveToken = savedToken?.trim();
const liveApiKey = savedApiKey?.trim();

if (!liveToken && !liveApiKey) {
  console.log(
    'live authenticated calls skipped: add EXPO_PUBLIC_TMDB_ACCESS_TOKEN or EXPO_PUBLIC_TMDB_API_KEY to .env',
  );
  process.exit(0);
}

const upcoming = await movies.getUpcomingMovies();
assert.ok(upcoming.results.length > 0);
const movie = upcoming.results[0];
assert.equal(typeof movie.id, 'number');
assert.equal(typeof movie.title, 'string');

const details = await movies.getMovieDetails(movie.id);
assert.equal(details.id, movie.id);

const videoResults = await movies.getMovieVideos(movie.id);
assert.ok(Array.isArray(videoResults));

const imageResults = await movies.getMovieImages(movie.id);
assert.ok(Array.isArray(imageResults.posters));

const search = await movies.searchMovies(movie.title);
assert.ok(search.results.some((result) => result.id === movie.id));

const imageUrl = getImageUrl(movie.poster_path, 'w185');
if (imageUrl) {
  const image = await axios.get(imageUrl, {
    validateStatus: () => true,
    timeout: 15000,
    responseType: 'stream',
  });
  image.data.destroy();
  assert.equal(image.status, 200);
}

console.log(
  `live TMDB authenticated: upcoming, detail, videos, images, search, and poster for "${movie.title}"`,
);
