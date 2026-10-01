import { genreLabel } from '../../api/movies';
import {
  firstGenreName,
  GENRE_COPY,
  getBrowseViewState,
  resultsFoundLabel,
  SEARCH_COPY,
} from '../genreBrowse';
import { WATCH_COPY } from '../watchState';

describe('genre browse', () => {
  it('uses the on-screen names for genres that differ from the API', () => {
    expect(genreLabel('Comedy')).toBe('Comedies');
    expect(genreLabel('Documentary')).toBe('Documentaries');
    expect(genreLabel('Drama')).toBe('Dramas');
    expect(genreLabel('Science Fiction')).toBe('Sci-Fi');
    expect(genreLabel('Crime')).toBe('Crime');
  });

  it('keeps a saved genre grid when the device is offline', () => {
    const genres = [{ id: 35, name: 'Comedies' }];

    expect(
      getBrowseViewState({
        items: genres,
        isPending: false,
        isPaused: false,
        isError: false,
        isOffline: true,
        error: null,
        copy: GENRE_COPY,
      }),
    ).toEqual({
      status: 'ready',
      items: genres,
      notice: GENRE_COPY.offline,
    });
  });

  it('labels a submitted search with the number of results', () => {
    expect(resultsFoundLabel(1)).toBe('1 Result Found');
    expect(resultsFoundLabel(3)).toBe('3 Results Found');
  });

  it('uses the first genre name for a search result', () => {
    expect(firstGenreName([14, 878], [{ id: 14, name: 'Fantasy' }])).toBe('Fantasy');
    expect(firstGenreName(undefined, [])).toBe('');
  });

  it('explains a missing key instead of leaving search blank', () => {
    expect(
      getBrowseViewState({
        items: [],
        isPending: false,
        isPaused: false,
        isError: true,
        isOffline: false,
        error: new Error('TMDB credentials are missing.'),
        copy: SEARCH_COPY,
      }),
    ).toEqual({ status: 'error', message: WATCH_COPY.missingKey });
  });
});
