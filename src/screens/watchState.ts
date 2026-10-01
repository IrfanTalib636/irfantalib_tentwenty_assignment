import { useRef, useState } from 'react';

import type { Movie } from '../api/movies';

export const MOVIE_PAGE_SIZE = 10;

export function uniqueMovies<T extends { id: number }>(movies: T[]) {
  const seen = new Set<number>();
  const unique: T[] = [];

  for (const movie of movies) {
    if (seen.has(movie.id)) {
      continue;
    }

    seen.add(movie.id);
    unique.push(movie);
  }

  return unique;
}

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
  if (isFetching || (visibleCount >= loadedCount && !hasNextPage)) {
    return { visibleCount, fetchNext: false };
  }

  const nextCount = hasNextPage
    ? visibleCount + MOVIE_PAGE_SIZE
    : Math.min(visibleCount + MOVIE_PAGE_SIZE, loadedCount);

  return {
    visibleCount: nextCount,
    fetchNext: nextCount > loadedCount && hasNextPage,
  };
}

export function useMoviePage(resetKey: string | number) {
  const [count, setCount] = useState(MOVIE_PAGE_SIZE);
  const [appliedKey, setAppliedKey] = useState(resetKey);
  const countRef = useRef(MOVIE_PAGE_SIZE);
  const paging = useRef(false);
  const keyRef = useRef(resetKey);

  if (appliedKey !== resetKey) {
    setAppliedKey(resetKey);
    setCount(MOVIE_PAGE_SIZE);
  }

  const visibleCount = appliedKey === resetKey ? count : MOVIE_PAGE_SIZE;

  function syncKey() {
    if (keyRef.current === resetKey) {
      return;
    }

    keyRef.current = resetKey;
    countRef.current = MOVIE_PAGE_SIZE;
    paging.current = false;
  }

  function revealMore({
    loadedCount,
    hasNextPage,
    isFetching,
    fetchNext,
  }: {
    loadedCount: number;
    hasNextPage: boolean;
    isFetching: boolean;
    fetchNext: () => Promise<unknown>;
  }) {
    syncKey();

    if (paging.current || isFetching) {
      return;
    }

    const next = loadMoreMovies({
      visibleCount: countRef.current,
      loadedCount,
      hasNextPage,
      isFetching: false,
    });

    if (next.visibleCount === countRef.current) {
      return;
    }

    paging.current = true;
    countRef.current = next.visibleCount;
    setCount(next.visibleCount);

    if (next.fetchNext) {
      void Promise.resolve()
        .then(fetchNext)
        .finally(() => {
          paging.current = false;
        });
      return;
    }

    requestAnimationFrame(() => {
      paging.current = false;
    });
  }

  function reset() {
    keyRef.current = resetKey;
    countRef.current = MOVIE_PAGE_SIZE;
    paging.current = false;
    setCount(MOVIE_PAGE_SIZE);
  }

  return { visibleCount, revealMore, reset };
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
