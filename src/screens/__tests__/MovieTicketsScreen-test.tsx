import { fireEvent, render } from '@testing-library/react-native';

import { useMovieDetails } from '../../api/movieQueries';
import { DETAIL_COPY } from '../detailContent';
import { MovieTicketsScreen } from '../MovieTicketsScreen';
import { formatDateChip, ticketDates } from '../showtimes';

jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));

jest.mock('expo-status-bar', () => ({
  StatusBar: () => null,
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ goBack: jest.fn() }),
  useRoute: () => ({ params: { movieId: 11 } }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

jest.mock('../../api/movieQueries', () => ({
  useMovieDetails: jest.fn(),
}));

const useMovieDetailsMock = jest.mocked(useMovieDetails);

describe('MovieTicketsScreen', () => {
  it('shows the movie, a date slider, and horizontal showtimes', async () => {
    useMovieDetailsMock.mockReturnValue({
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
    } as unknown as ReturnType<typeof useMovieDetails>);

    const { getAllByText, getByLabelText, getByText } = await render(<MovieTicketsScreen />);
    const dates = ticketDates(new Date());

    expect(getByText("The King's Man")).toBeTruthy();
    expect(getByText('In Theaters December 22, 2021')).toBeTruthy();
    expect(getByText('Date')).toBeTruthy();
    expect(getByLabelText(formatDateChip(dates[0])).props.accessibilityState).toEqual({
      selected: true,
    });
    expect(getByLabelText(formatDateChip(dates[1]))).toBeTruthy();
    expect(getAllByText(/Cinetech \+ Hall/).length).toBeGreaterThanOrEqual(4);
    expect(getAllByText(/Cinetech \+ Hall/).length).toBeLessThanOrEqual(5);
    expect(getByText('Select Seats')).toBeTruthy();

    await fireEvent.press(getByLabelText(formatDateChip(dates[1])));

    expect(getByLabelText(formatDateChip(dates[1])).props.accessibilityState).toEqual({
      selected: true,
    });
  });

  it('shows an error instead of a blank screen when the movie cannot be loaded', async () => {
    useMovieDetailsMock.mockReturnValue({
      data: undefined,
      isPending: false,
      isError: true,
      error: new Error('Network request failed'),
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useMovieDetails>);

    const { getByText } = await render(<MovieTicketsScreen />);

    expect(getByText(DETAIL_COPY.error)).toBeTruthy();
    expect(getByText(DETAIL_COPY.retry)).toBeTruthy();
  });
});
