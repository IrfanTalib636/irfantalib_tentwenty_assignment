import {
  getWatchViewState,
  loadMoreMovies,
  MOVIE_PAGE_SIZE,
  visibleMovies,
  WATCH_COPY,
} from '../watchState';
import type { Movie } from '../../api/movies';

const movie: Movie = {
  id: 1,
  title: 'Free Guy',
  overview: '',
  poster_path: '/poster.jpg',
  backdrop_path: '/backdrop.jpg',
  release_date: '2021-08-13',
  vote_average: 7.5,
};

const base = {
  movies: [] as Movie[],
  isPending: false,
  isPaused: false,
  isError: false,
  isOffline: false,
  error: null,
};

describe('getWatchViewState', () => {
  it('shows a loading state while the first request is in flight', () => {
    expect(getWatchViewState({ ...base, isPending: true }).status).toBe('loading');
  });

  it('does not spin forever when the device is offline and nothing is saved', () => {
    expect(
      getWatchViewState({ ...base, isPending: true, isPaused: true, isOffline: true }),
    ).toEqual({ status: 'empty', message: WATCH_COPY.emptyOffline });
  });

  it('explains a missing TMDB key instead of a raw client error', () => {
    expect(
      getWatchViewState({
        ...base,
        isError: true,
        error: new Error('TMDB credentials are missing.'),
      }),
    ).toEqual({ status: 'error', message: WATCH_COPY.missingKey });
  });

  it('keeps saved movies on screen when a refresh fails offline', () => {
    expect(
      getWatchViewState({
        ...base,
        movies: [movie],
        isError: true,
        isOffline: true,
      }),
    ).toEqual({
      status: 'ready',
      movies: [movie],
      notice: WATCH_COPY.offline,
    });
  });

  it('tells the user the list is stale when a refresh fails online', () => {
    const state = getWatchViewState({
      ...base,
      movies: [movie],
      isError: true,
    });

    expect(state.status).toBe('ready');
    if (state.status === 'ready') {
      expect(state.notice).toBe(WATCH_COPY.staleError);
    }
  });

  it('shows 10 movies at a time and reveals the next 10 on the following page', () => {
    const movies = Array.from({ length: 25 }, (_, index) => ({
      ...movie,
      id: index + 1,
    }));

    expect(visibleMovies(movies, MOVIE_PAGE_SIZE)).toHaveLength(10);
    expect(visibleMovies(movies, MOVIE_PAGE_SIZE * 2)).toHaveLength(20);
    expect(visibleMovies(movies, MOVIE_PAGE_SIZE * 3)).toHaveLength(25);
  });

  it('asks for the next API page only after the loaded movies are used up', () => {
    expect(
      loadMoreMovies({
        visibleCount: 10,
        loadedCount: 20,
        hasNextPage: true,
        isFetching: false,
      }),
    ).toEqual({ visibleCount: 20, fetchNext: false });

    expect(
      loadMoreMovies({
        visibleCount: 20,
        loadedCount: 20,
        hasNextPage: true,
        isFetching: false,
      }),
    ).toEqual({ visibleCount: 30, fetchNext: true });

    expect(
      loadMoreMovies({
        visibleCount: 10,
        loadedCount: 20,
        hasNextPage: true,
        isFetching: true,
      }),
    ).toEqual({ visibleCount: 10, fetchNext: false });
  });

  it('shows an empty list without pretending the request failed', () => {
    expect(getWatchViewState(base)).toEqual({
      status: 'empty',
      message: WATCH_COPY.empty,
    });
  });
});
