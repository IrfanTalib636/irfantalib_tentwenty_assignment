import type { MovieVideo } from '../api/movies';
import { COLORS } from '../enums/AppEnum';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const GENRE_COLORS = [
  COLORS.TEAL,
  COLORS.PINK,
  COLORS.BLUE,
  COLORS.YELLOW,
] as const;

export const DETAIL_COPY = {
  loading: 'Loading movie',
  error: 'This movie could not be loaded. Check your connection and try again.',
  missingKey: 'This app needs a TMDB API key before it can load movies.',
  retry: 'Try again',
  noOverview: 'No overview is available for this movie.',
  releaseUnknown: 'Release date unavailable',
  tickets: 'Get Tickets',
  trailer: 'Watch Trailer',
  genres: 'Genres',
  overview: 'Overview',
  header: 'Watch',
} as const;

export function formatInTheaters(releaseDate: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(releaseDate);
  if (!match) {
    return DETAIL_COPY.releaseUnknown;
  }

  const month = MONTHS[Number(match[2]) - 1];
  if (!month) {
    return DETAIL_COPY.releaseUnknown;
  }

  return `In Theaters ${month} ${Number(match[3])}, ${match[1]}`;
}

export function pickTrailer(videos: MovieVideo[]) {
  const youtube = videos.filter((video) => video.site === 'YouTube' && video.key);

  return (
    youtube.find((video) => video.type === 'Trailer' && video.official) ??
    youtube.find((video) => video.type === 'Trailer') ??
    youtube[0] ??
    null
  );
}

export function trailerUrl(videoKey: string) {
  return `https://www.youtube.com/watch?v=${videoKey}`;
}

export function detailErrorMessage(error: unknown) {
  if (error instanceof Error && error.message.includes('TMDB credentials')) {
    return DETAIL_COPY.missingKey;
  }

  return DETAIL_COPY.error;
}
