import type { Movie } from '../api/movies';

export const MOVIE_PAGE_SIZE = 10;

export function visibleMovies<T>(movies: T[], count: number) {
  return movies.slice(0, count);
}

export function loadMoreMovies({
  visibleCount,
  loadedCount,
  hasNextPage,
  isFetching,
}: {
  visibleCount: number;
  loadedCount: number;
  hasNextPage: boolean;
  isFetching: boolean;
}) {
  if (isFetching) {
    return { visibleCount, fetchNext: false };
  }

  const nextCount = visibleCount + MOVIE_PAGE_SIZE;

  return {
    visibleCount: nextCount,
    fetchNext: nextCount > loadedCount && hasNextPage,
  };
}

export const WATCH_COPY = {
  loading: 'Loading movies',
  empty: 'No upcoming movies right now.',
  emptyOffline: 'No saved movies yet. Connect to load them.',
  offline: "You're offline. Showing movies saved on this device.",
  staleError: "Couldn't refresh. Showing the last saved movies.",
  error: 'Movies could not be loaded. Check your connection and try again.',
  missingKey: 'This app needs a TMDB API key before it can load movies.',
  retry: 'Try again',
} as const;

export type WatchViewState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'empty'; message: string }
  | {
      status: 'ready';
      movies: Movie[];
      notice: string | null;
    };

export function watchErrorMessage(error: unknown) {
  if (error instanceof Error && error.message.includes('TMDB credentials')) {
    return WATCH_COPY.missingKey;
  }

  return WATCH_COPY.error;
}

export function getWatchViewState({
  movies,
  isPending,
  isPaused,
  isError,
  isOffline,
  error,
}: {
  movies: Movie[];
  isPending: boolean;
  isPaused: boolean;
  isError: boolean;
  isOffline: boolean;
  error: unknown;
}): WatchViewState {
  if (movies.length === 0 && isPending && !isPaused) {
    return { status: 'loading' };
  }

  if (movies.length === 0) {
    if (isOffline || isPaused) {
      return { status: 'empty', message: WATCH_COPY.emptyOffline };
    }

    if (isError) {
      return { status: 'error', message: watchErrorMessage(error) };
    }

    return { status: 'empty', message: WATCH_COPY.empty };
  }

  let notice: string | null = null;

  if (isOffline) {
    notice = WATCH_COPY.offline;
  } else if (isError) {
    notice = WATCH_COPY.staleError;
  }

  return { status: 'ready', movies, notice };
}
