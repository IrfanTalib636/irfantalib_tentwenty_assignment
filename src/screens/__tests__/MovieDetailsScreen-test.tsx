import { fireEvent, render } from '@testing-library/react-native';

import { useMovieDetails, useMovieVideos } from '../../api/movieQueries';
import { DETAIL_COPY } from '../detailContent';
import { MovieDetailsScreen } from '../MovieDetailsScreen';

jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));

jest.mock('expo-status-bar', () => ({
  StatusBar: () => null,
}));

jest.mock('expo-linear-gradient', () => {
  const { View } = require('react-native');
  return { LinearGradient: View };
});

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ goBack: jest.fn(), navigate: mockNavigate }),
  useRoute: () => ({ params: { movieId: 11 } }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

jest.mock('../../api/movieQueries', () => ({
  useMovieDetails: jest.fn(),
  useMovieVideos: jest.fn(),
}));

const useMovieDetailsMock = jest.mocked(useMovieDetails);
const useMovieVideosMock = jest.mocked(useMovieVideos);

describe('MovieDetailsScreen', () => {
  it('shows the movie release date, genres, and overview from the API', async () => {
    useMovieDetailsMock.mockReturnValue({
      data: {
        id: 11,
        title: 'The King\'s Man',
        overview: 'A secret agency is formed.',
        poster_path: null,
        backdrop_path: '/king.jpg',
        release_date: '2021-12-22',
        vote_average: 7,
        runtime: 131,
        status: 'Released',
        tagline: '',
        genres: [
          { id: 1, name: 'Action' },
          { id: 2, name: 'Thriller' },
        ],
      },
      isPending: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useMovieDetails>);
    useMovieVideosMock.mockReturnValue({
      data: [],
      isPending: false,
      isError: false,
    } as unknown as ReturnType<typeof useMovieVideos>);

    const { getByLabelText, getByText } = await render(<MovieDetailsScreen />);

    expect(getByLabelText('Go back')).toBeTruthy();
    expect(getByText(DETAIL_COPY.header)).toBeTruthy();
    expect(getByText("The King's Man")).toBeTruthy();
    expect(getByText('In Theaters December 22, 2021')).toBeTruthy();
    expect(getByText('Action')).toBeTruthy();
    expect(getByText('Thriller')).toBeTruthy();
    expect(getByText('A secret agency is formed.')).toBeTruthy();
    expect(getByText(DETAIL_COPY.trailer)).toBeTruthy();

    await fireEvent.press(getByLabelText(DETAIL_COPY.tickets));

    expect(mockNavigate).toHaveBeenCalledWith('MovieTickets', { movieId: 11 });
  });

  it('shows an error instead of a blank screen when the movie cannot be loaded', async () => {
    useMovieDetailsMock.mockReturnValue({
      data: undefined,
      isPending: false,
      isError: true,
      error: new Error('Network request failed'),
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useMovieDetails>);
    useMovieVideosMock.mockReturnValue({
      data: [],
      isPending: false,
      isError: false,
    } as unknown as ReturnType<typeof useMovieVideos>);

    const { getByText } = await render(<MovieDetailsScreen />);

    expect(getByText(DETAIL_COPY.error)).toBeTruthy();
    expect(getByText(DETAIL_COPY.retry)).toBeTruthy();
  });
});