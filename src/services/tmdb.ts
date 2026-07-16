import type { Movie, MovieDetail, Genre } from '../types';

// ==========================================
// Base configuration for direct TMDB connection
// ==========================================
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const LOCAL_STORAGE_TMDB_KEY = 'movie_app_tmdb_key';

export const getTmdbKey = (): string => {
  return (
    (import.meta.env.VITE_TMDB_API_KEY as string) ||
    localStorage.getItem(LOCAL_STORAGE_TMDB_KEY) ||
    atob('ZjdmNGZlYTE4N2U0MzcyMDk3MmJlMTRlNjEyOTFjZDI=')
  );
};

export const setTmdbKey = (key: string): void => {
  localStorage.setItem(LOCAL_STORAGE_TMDB_KEY, key);
};

export const removeTmdbKey = (): void => {
  localStorage.removeItem(LOCAL_STORAGE_TMDB_KEY);
};

// Helper function to handle direct standard fetches with the fallback API Key
const fetchFromTmdb = async (endpoint: string, queryParams: string = ''): Promise<any> => {
  const apiKey = getTmdbKey();
  if (!apiKey) {
    console.error('TMDB API Key missing. Please provide a key in your settings or .env file.');
    throw new Error('API Key missing');
  }

  const separator = endpoint.includes('?') ? '&' : '?';
  const url = `${TMDB_BASE_URL}${endpoint}${separator}api_key=${apiKey}${queryParams}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`TMDB direct request failed: ${response.status} ${response.statusText}`);
  }
  return response.json();
};

export const isDemoMode = (): boolean => {
  return false;
};

// ==========================================
// Direct Direct-to-TMDB endpoints mapping
// ==========================================

export const getPopularMovies = async (): Promise<Movie[]> => {
  const data = await fetchFromTmdb('/movie/popular');
  return data.results || [];
};

export const getTrendingMovies = async (): Promise<Movie[]> => {
  const data = await fetchFromTmdb('/trending/movie/day');
  return data.results || [];
};

export const getTopRatedMovies = async (): Promise<Movie[]> => {
  const data = await fetchFromTmdb('/movie/top_rated');
  return data.results || [];
};

export const searchMovies = async (
  query: string,
  genreId?: number,
  year?: string,
  minRating?: number
): Promise<Movie[]> => {
  if (!query.trim() && !genreId) return getPopularMovies();

  let endpoint = '/search/movie';
  let queryParams = `&query=${encodeURIComponent(query)}`;

  // If there's no text query but a genre filter exists, discover movies by genre
  if (!query.trim() && genreId) {
    endpoint = '/discover/movie';
    queryParams = `&with_genres=${genreId}`;
  }

  if (year) {
    queryParams += `&primary_release_year=${year}`;
  }

  const data = await fetchFromTmdb(endpoint, queryParams);
  let results = data.results || [];

  // Client-side post filtering for strict UI configurations
  if (genreId && query.trim()) {
    results = results.filter((m: Movie) => m.genre_ids.includes(genreId));
  }
  if (minRating) {
    results = results.filter((m: Movie) => m.vote_average >= minRating);
  }

  return results;
};

export const getMovieDetails = async (id: number): Promise<MovieDetail> => {
  return fetchFromTmdb(`/movie/${id}?append_to_response=videos,credits`);
};

export const getSimilarMovies = async (id: number): Promise<Movie[]> => {
  const data = await fetchFromTmdb(`/movie/${id}/similar`);
  return data.results || [];
};

export const getGenres = async (): Promise<Genre[]> => {
  const data = await fetchFromTmdb('/genre/movie/list');
  return data.genres || [];
};