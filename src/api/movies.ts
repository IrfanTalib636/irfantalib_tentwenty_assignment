import { apiClient } from './apiClient';

export type Movie = {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  genre_ids?: number[];
};

export type MovieListResponse = {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
};

export type MovieDetails = Movie & {
  runtime: number | null;
  status: string;
  tagline: string;
  genres: { id: number; name: string }[];
};

export type MovieVideo = {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
};

export type MovieImage = {
  file_path: string;
  width: number;
  height: number;
};

export type MovieImages = {
  id: number;
  backdrops: MovieImage[];
  posters: MovieImage[];
};

export type MovieGenre = {
  id: number;
  name: string;
};

export type GenreCard = {
  id: number;
  name: string;
  backdropPath: string | null;
};

const language = 'en-US';

export async function getUpcomingMovies(page = 1) {
  const response = await apiClient.get<MovieListResponse>('/movie/upcoming', {
    params: { page, language },
  });
  return response.data;
}

export async function getMovieDetails(movieId: number) {
  const response = await apiClient.get<MovieDetails>(`/movie/${movieId}`, {
    params: { language },
  });
  return response.data;
}

export async function getMovieVideos(movieId: number) {
  const response = await apiClient.get<{ id: number; results: MovieVideo[] }>(
    `/movie/${movieId}/videos`,
    { params: { language } },
  );
  return response.data.results;
}

export async function getMovieImages(movieId: number) {
  const response = await apiClient.get<MovieImages>(`/movie/${movieId}/images`);
  return response.data;
}

const featuredGenreNames = [
  'Comedy',
  'Crime',
  'Family',
  'Documentary',
  'Drama',
  'Fantasy',
  'Horror',
  'Science Fiction',
  'Thriller',
] as const;

const genreLabels: Record<string, string> = {
  Comedy: 'Comedies',
  Documentary: 'Documentaries',
  Drama: 'Dramas',
  'Science Fiction': 'Sci-Fi',
};

export function genreLabel(name: string) {
  return genreLabels[name] ?? name;
}

export async function getMovieGenres() {
  const response = await apiClient.get<{ genres: MovieGenre[] }>('/genre/movie/list', {
    params: { language },
  });
  return response.data.genres;
}

export async function getMoviesByGenre(genreId: number, page = 1) {
  const response = await apiClient.get<MovieListResponse>('/discover/movie', {
    params: {
      with_genres: genreId,
      sort_by: 'popularity.desc',
      page,
      language,
      include_adult: false,
    },
  });
  return response.data;
}

export async function getGenreCards() {
  const genres = await getMovieGenres();
  const featured = featuredGenreNames.flatMap((name) => {
    const genre = genres.find((item) => item.name === name);
    return genre ? [genre] : [];
  });

  return Promise.all(
    featured.map(async (genre) => {
      try {
        const page = await getMoviesByGenre(genre.id);
        const sample = page.results.find((movie) => movie.backdrop_path) ?? page.results[0];
        return {
          id: genre.id,
          name: genreLabel(genre.name),
          backdropPath: sample?.backdrop_path ?? sample?.poster_path ?? null,
        };
      } catch {
        return {
          id: genre.id,
          name: genreLabel(genre.name),
          backdropPath: null,
        };
      }
    }),
  );
}

export async function searchMovies(query: string, page = 1) {
  const response = await apiClient.get<MovieListResponse>('/search/movie', {
    params: {
      query,
      page,
      language,
      include_adult: false,
    },
  });
  return response.data;
}
