import { apiClient } from './apiClient';

export type Movie = {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
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
