import { useQuery } from '@tanstack/react-query';

import {
  getMovieDetails,
  getMovieImages,
  getMovieVideos,
  getUpcomingMovies,
  searchMovies,
} from './movies';

export function useUpcomingMovies(page = 1) {
  return useQuery({
    queryKey: ['movies', 'upcoming', page],
    queryFn: () => getUpcomingMovies(page),
  });
}

export function useMovieDetails(movieId: number) {
  return useQuery({
    queryKey: ['movies', 'detail', movieId],
    queryFn: () => getMovieDetails(movieId),
    enabled: movieId > 0,
  });
}

export function useMovieVideos(movieId: number) {
  return useQuery({
    queryKey: ['movies', 'videos', movieId],
    queryFn: () => getMovieVideos(movieId),
    enabled: movieId > 0,
  });
}

export function useMovieImages(movieId: number) {
  return useQuery({
    queryKey: ['movies', 'images', movieId],
    queryFn: () => getMovieImages(movieId),
    enabled: movieId > 0,
  });
}

export function useMovieSearch(query: string, page = 1) {
  const trimmed = query.trim();

  return useQuery({
    queryKey: ['movies', 'search', trimmed, page],
    queryFn: () => searchMovies(trimmed, page),
    enabled: trimmed.length > 0,
  });
}
