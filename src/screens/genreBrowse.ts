import { WATCH_COPY, watchErrorMessage } from './watchState';

export const SEARCH_PLACEHOLDER = 'TV shows, movies and more';
export const TOP_RESULTS_LABEL = 'Top Results';

export function resultsFoundLabel(count: number) {
  return `${count} ${count === 1 ? 'Result' : 'Results'} Found`;
}

export function firstGenreName(
  genreIds: number[] | undefined,
  genres: { id: number; name: string }[],
) {
  const genreId = genreIds?.[0];
  if (!genreId) {
    return '';
  }

  return genres.find((genre) => genre.id === genreId)?.name ?? '';
}

export const GENRE_COPY = {
  loading: 'Loading genres',
  empty: 'No genres are available right now.',
  emptyOffline: 'No saved genres yet. Connect to load them.',
  error: 'Genres could not be loaded. Check your connection and try again.',
  offline: "You're offline. Showing genres saved on this device.",
  staleError: "Couldn't refresh genres. Showing the last saved genres.",
} as const;

export const SEARCH_COPY = {
  loading: 'Searching movies',
  empty: 'No movies match that search.',
  emptyOffline: 'Connect to search for movies.',
  error: 'Search could not be completed. Check your connection and try again.',
  offline: "You're offline. Showing saved search results.",
  staleError: "Couldn't refresh this search. Showing the last saved results.",
} as const;

export const GENRE_MOVIE_COPY = {
  loading: 'Loading movies',
  empty: 'No movies are listed for this genre.',
  emptyOffline: 'No saved movies for this genre yet. Connect to load them.',
  error: 'These movies could not be loaded. Check your connection and try again.',
  offline: "You're offline. Showing movies saved on this device.",
  staleError: "Couldn't refresh. Showing the last saved movies.",
} as const;

type BrowseCopy = {
  empty: string;
  emptyOffline: string;
  error: string;
  offline: string;
  staleError: string;
};

export type BrowseViewState<T> =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'empty'; message: string }
  | { status: 'ready'; items: T[]; notice: string | null };

export function getBrowseViewState<T>({
  items,
  isPending,
  isPaused,
  isError,
  isOffline,
  error,
  copy,
}: {
  items: T[];
  isPending: boolean;
  isPaused: boolean;
  isError: boolean;
  isOffline: boolean;
  error: unknown;
  copy: BrowseCopy;
}): BrowseViewState<T> {
  if (items.length === 0 && isPending && !isPaused) {
    return { status: 'loading' };
  }

  if (items.length === 0) {
    if (isOffline || isPaused) {
      return { status: 'empty', message: copy.emptyOffline };
    }

    if (isError) {
      const message = watchErrorMessage(error);
      return {
        status: 'error',
        message: message === WATCH_COPY.missingKey ? message : copy.error,
      };
    }

    return { status: 'empty', message: copy.empty };
  }

  let notice: string | null = null;

  if (isOffline) {
    notice = copy.offline;
  } else if (isError) {
    notice = copy.staleError;
  }

  return { status: 'ready', items, notice };
}
