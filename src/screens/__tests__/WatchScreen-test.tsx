import { act, fireEvent, render } from '@testing-library/react-native';

import { useGenreBrowse, useGenreMovies, useMovieSearch, useUpcomingMovies } from '../../api/movieQueries';
import { GENRE_COPY, SEARCH_PLACEHOLDER, TOP_RESULTS_LABEL } from '../genreBrowse';
import { WATCH_COPY } from '../watchState';
import { WatchScreen } from '../WatchScreen';

jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));

jest.mock('expo-linear-gradient', () => {
  const { View } = require('react-native');
  return { LinearGradient: View };
});

jest.mock('@react-navigation/bottom-tabs', () => ({
  useBottomTabBarHeight: () => 68,
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn() }),
}));

jest.mock('@react-native-community/netinfo', () => ({
  useNetInfo: () => ({ isConnected: true }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

jest.mock('../../api/movieQueries', () => ({
  useUpcomingMovies: jest.fn(),
  useGenreBrowse: jest.fn(),
  useGenreMovies: jest.fn(),
  useMovieSearch: jest.fn(),
}));

const useUpcomingMoviesMock = jest.mocked(useUpcomingMovies);
const useGenreBrowseMock = jest.mocked(useGenreBrowse);
const useGenreMoviesMock = jest.mocked(useGenreMovies);
const useMovieSearchMock = jest.mocked(useMovieSearch);

const idleQuery = {
  data: undefined,
  isPending: false,
  isError: false,
  fetchStatus: 'idle',
  error: null,
  refetch: jest.fn(),
};

function renderWatch() {
  return render(<WatchScreen />);
}

describe('WatchScreen', () => {
  beforeEach(() => {
    useGenreBrowseMock.mockReturnValue({
      ...idleQuery,
      data: [
        { id: 35, name: 'Comedies', backdropPath: '/comedy.jpg' },
        { id: 80, name: 'Crime', backdropPath: '/crime.jpg' },
      ],
    } as unknown as ReturnType<typeof useGenreBrowse>);
    useGenreMoviesMock.mockReturnValue({
      ...idleQuery,
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: jest.fn(),
      data: {
        pages: [
          {
            page: 1,
            total_pages: 1,
            total_results: 1,
            results: [
              {
                id: 99,
                title: 'Superbad',
                overview: '',
                poster_path: null,
                backdrop_path: '/super.jpg',
                release_date: '2007-08-17',
                vote_average: 7,
              },
            ],
          },
        ],
        pageParams: [1],
      },
    } as unknown as ReturnType<typeof useGenreMovies>);
    useMovieSearchMock.mockReturnValue(idleQuery as unknown as ReturnType<typeof useMovieSearch>);
  });

  it('shows a loading message instead of a blank screen', async () => {
    useUpcomingMoviesMock.mockReturnValue({
      data: undefined,
      isPending: true,
      isError: false,
      isPaused: false,
      fetchStatus: 'fetching',
      error: null,
      isRefetching: false,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useUpcomingMovies>);

    const { getByText } = await renderWatch();

    expect(getByText(WATCH_COPY.loading)).toBeTruthy();
    expect(getByText('Watch')).toBeTruthy();
  });

  it('renders a saved movie title when the query has data', async () => {
    useUpcomingMoviesMock.mockReturnValue({
      data: {
        pages: [
          {
            page: 1,
            total_pages: 1,
            total_results: 1,
            results: [
              {
                id: 11,
                title: 'Free Guy',
                overview: '',
                poster_path: null,
                backdrop_path: '/free.jpg',
                release_date: '2021-08-13',
                vote_average: 7,
              },
            ],
          },
        ],
        pageParams: [1],
      },
      isPending: false,
      isError: false,
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchStatus: 'idle',
      error: null,
      isRefetching: false,
      refetch: jest.fn(),
      fetchNextPage: jest.fn(),
    } as unknown as ReturnType<typeof useUpcomingMovies>);

    const { getByText } = await renderWatch();

    expect(getByText('Free Guy')).toBeTruthy();
  });

  it('replaces the movie list with a search field and a two-column genre grid', async () => {
    useUpcomingMoviesMock.mockReturnValue({
      data: {
        pages: [
          {
            page: 1,
            total_pages: 1,
            total_results: 1,
            results: [
              {
                id: 11,
                title: 'Free Guy',
                overview: '',
                poster_path: null,
                backdrop_path: '/free.jpg',
                release_date: '2021-08-13',
                vote_average: 7,
              },
            ],
          },
        ],
        pageParams: [1],
      },
      isPending: false,
      isError: false,
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchStatus: 'idle',
      error: null,
      isRefetching: false,
      refetch: jest.fn(),
      fetchNextPage: jest.fn(),
    } as unknown as ReturnType<typeof useUpcomingMovies>);

    const screen = await renderWatch();

    await fireEvent.press(screen.getByLabelText('Search'));

    expect(screen.getByPlaceholderText(SEARCH_PLACEHOLDER)).toBeTruthy();
    expect(screen.getByText('Comedies')).toBeTruthy();
    expect(screen.getByText('Crime')).toBeTruthy();
    expect(screen.queryByText('Free Guy')).toBeNull();

    await fireEvent.press(screen.getByLabelText('Comedies'));

    expect(screen.getByText('Superbad')).toBeTruthy();
    expect(screen.queryByText('Crime')).toBeNull();

    await fireEvent.press(screen.getByLabelText('Close search'));

    expect(screen.getByText('Free Guy')).toBeTruthy();
    expect(screen.queryByPlaceholderText(SEARCH_PLACEHOLDER)).toBeNull();
  });

  it('shows a genre loading message instead of a blank search', async () => {
    useUpcomingMoviesMock.mockReturnValue({
      data: undefined,
      isPending: true,
      isError: false,
      isPaused: false,
      fetchStatus: 'fetching',
      error: null,
      isRefetching: false,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useUpcomingMovies>);
    useGenreBrowseMock.mockReturnValue({
      ...idleQuery,
      isPending: true,
      fetchStatus: 'fetching',
    } as unknown as ReturnType<typeof useGenreBrowse>);

    const screen = await renderWatch();

    await fireEvent.press(screen.getByLabelText('Search'));

    expect(screen.getByText(GENRE_COPY.loading)).toBeTruthy();
  });

  it('shows top results while typing and a counted list after Go', async () => {
    jest.useFakeTimers();
    useUpcomingMoviesMock.mockReturnValue({
      data: undefined,
      isPending: false,
      isError: false,
      fetchStatus: 'idle',
      error: null,
      isRefetching: false,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useUpcomingMovies>);
    useGenreBrowseMock.mockReturnValue({
      ...idleQuery,
      data: [{ id: 14, name: 'Fantasy', backdropPath: '/fantasy.jpg' }],
    } as unknown as ReturnType<typeof useGenreBrowse>);
    useMovieSearchMock.mockReturnValue({
      ...idleQuery,
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: jest.fn(),
      data: {
        pages: [
          {
            page: 1,
            total_pages: 1,
            total_results: 1,
            results: [
              {
                id: 21,
                title: 'Timeless',
                overview: '',
                poster_path: '/timeless.jpg',
                backdrop_path: null,
                release_date: '2016-10-03',
                vote_average: 7,
                genre_ids: [14],
              },
            ],
          },
        ],
        pageParams: [1],
      },
    } as unknown as ReturnType<typeof useMovieSearch>);

    const screen = await renderWatch();

    await fireEvent.press(screen.getByLabelText('Search'));
    await fireEvent.changeText(screen.getByLabelText('Search movies'), 'Tim');
    await act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(screen.getByText(TOP_RESULTS_LABEL)).toBeTruthy();
    expect(screen.getByText('Timeless')).toBeTruthy();
    expect(screen.getByText('Fantasy')).toBeTruthy();

    await fireEvent(screen.getByLabelText('Search movies'), 'submitEditing');

    expect(screen.getByText('1 Result Found')).toBeTruthy();
    expect(screen.queryByPlaceholderText(SEARCH_PLACEHOLDER)).toBeNull();
    expect(screen.queryByText(TOP_RESULTS_LABEL)).toBeNull();

    await fireEvent.press(screen.getByLabelText('Go back'));

    expect(screen.getByDisplayValue('Tim')).toBeTruthy();
    expect(screen.getByText(TOP_RESULTS_LABEL)).toBeTruthy();
    jest.useRealTimers();
  });

  it('shows the full result count but only the first 10 movies', async () => {
    jest.useFakeTimers();
    useUpcomingMoviesMock.mockReturnValue({
      data: undefined,
      isPending: false,
      isError: false,
      fetchStatus: 'idle',
      error: null,
      isRefetching: false,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useUpcomingMovies>);
    useMovieSearchMock.mockReturnValue({
      ...idleQuery,
      hasNextPage: true,
      isFetchingNextPage: false,
      fetchNextPage: jest.fn(),
      data: {
        pages: [
          {
            page: 1,
            total_pages: 356,
            total_results: 7119,
            results: Array.from({ length: 15 }, (_, index) => ({
              id: index + 1,
              title: `Movie ${index + 1}`,
              overview: '',
              poster_path: null,
              backdrop_path: null,
              release_date: '2024-01-01',
              vote_average: 1,
            })),
          },
        ],
        pageParams: [1],
      },
    } as unknown as ReturnType<typeof useMovieSearch>);

    const screen = await renderWatch();

    await fireEvent.press(screen.getByLabelText('Search'));
    await fireEvent.changeText(screen.getByLabelText('Search movies'), 'shi');
    await act(() => {
      jest.advanceTimersByTime(300);
    });
    await fireEvent(screen.getByLabelText('Search movies'), 'submitEditing');

    expect(screen.getByText('7119 Results Found')).toBeTruthy();
    expect(screen.getByText('Movie 10')).toBeTruthy();
    expect(screen.queryByText('Movie 11')).toBeNull();
    jest.useRealTimers();
  });
});
