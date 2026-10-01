import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import {
  getGenreCards,
  getMovieDetails,
  getMovieImages,
  getMoviesByGenre,
  getMovieVideos,
  getUpcomingMovies,
  searchMovies,
} from './movies';

export function useUpcomingMovies() {
  return useInfiniteQuery({
    queryKey: ['movies', 'upcoming'],
    queryFn: ({ pageParam }) => getUpcomingMovies(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
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

export function useGenreBrowse(enabled: boolean) {
  return useQuery({
    queryKey: ['movies', 'genres'],
    queryFn: getGenreCards,
    enabled,
  });
}

export function useGenreMovies(genreId: number) {
  return useInfiniteQuery({
    queryKey: ['movies', 'by-genre', genreId],
    queryFn: ({ pageParam }) => getMoviesByGenre(genreId, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
    enabled: genreId > 0,
  });
}

export function useMovieSearch(query: string) {
  const trimmed = query.trim();

  return useInfiniteQuery({
    queryKey: ['movies', 'search-pages', trimmed],
    queryFn: ({ pageParam }) => searchMovies(trimmed, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
    enabled: trimmed.length > 0,
  });
}
