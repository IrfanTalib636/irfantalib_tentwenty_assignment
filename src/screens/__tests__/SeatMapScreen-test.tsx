import { fireEvent, render } from '@testing-library/react-native';

import { useMovieDetails } from '../../api/movieQueries';
import { DETAIL_COPY } from '../detailContent';
import { SEAT_COPY } from '../seatSession';
import { SeatMapScreen } from '../SeatMapScreen';

jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));

jest.mock('expo-status-bar', () => ({
  StatusBar: () => null,
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ goBack: jest.fn() }),
  useRoute: () => ({
    params: { movieId: 11, date: '2021-03-05', time: '12:30', hall: 'Cinetech + Hall 1' },
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

jest.mock('../../api/movieQueries', () => ({
  useMovieDetails: jest.fn(),
}));

const useMovieDetailsMock = jest.mocked(useMovieDetails);

const movie = {
  data: {
    id: 11,
    title: "The King's Man",
    overview: '',
    poster_path: null,
    backdrop_path: null,
    release_date: '2021-12-22',
    vote_average: 7,
    runtime: 131,
    status: 'Released',
    tagline: '',
    genres: [],
  },
  isPending: false,
  isError: false,
  error: null,
  refetch: jest.fn(),
};

describe('SeatMapScreen', () => {
  it('shows the seat map, row numbers, and the selected-seat summary', async () => {
    useMovieDetailsMock.mockReturnValue(movie as unknown as ReturnType<typeof useMovieDetails>);

    const screen = await render(<SeatMapScreen />);

    expect(screen.getByText("The King's Man")).toBeTruthy();
    expect(screen.getByText('March 5, 2021 | 12:30 Hall 1')).toBeTruthy();
    expect(screen.getByLabelText('Seat map')).toBeTruthy();
    expect(screen.getByText('1', { exact: true })).toBeTruthy();
    expect(screen.getByText('10', { exact: true })).toBeTruthy();
    expect(screen.getByText(SEAT_COPY.selected)).toBeTruthy();
    expect(screen.getByText(SEAT_COPY.unavailable)).toBeTruthy();
    expect(screen.getByText(SEAT_COPY.vip)).toBeTruthy();
    expect(screen.getByText(SEAT_COPY.regular)).toBeTruthy();
    expect(screen.getByText(SEAT_COPY.seat)).toBeTruthy();
    expect(screen.getByText(SEAT_COPY.price)).toBeTruthy();
    expect(screen.getByText(SEAT_COPY.pay)).toBeTruthy();

    await fireEvent.press(screen.getByLabelText(SEAT_COPY.removeSeat));

    expect(screen.queryByText(SEAT_COPY.seat)).toBeNull();
    expect(screen.getByText(SEAT_COPY.emptyPrice)).toBeTruthy();
  });

  it('shows an error instead of a blank screen when the movie cannot be loaded', async () => {
    useMovieDetailsMock.mockReturnValue({
      data: undefined,
      isPending: false,
      isError: true,
      error: new Error('Network request failed'),
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useMovieDetails>);

    const { getByText } = await render(<SeatMapScreen />);

    expect(getByText(DETAIL_COPY.error)).toBeTruthy();
    expect(getByText(DETAIL_COPY.retry)).toBeTruthy();
  });
});
