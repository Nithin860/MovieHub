import type { Movie, Recommendation } from '../types';

const API_BASE = (import.meta.env.VITE_API_URL as string) || '/api';

const getAuthToken = (): string => {
  return localStorage.getItem('movie_app_auth_token') || '';
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem('movie_app_auth_token', token);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem('movie_app_auth_token');
};

export const isLoggedIn = (): boolean => {
  return !!getAuthToken();
};

const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  } as Record<string, string>;

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

// ================= AUTH API =================

export const apiSignup = async (username: string, email: string, password: string) => {
  return apiFetch('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ username, email, password })
  });
};

export const apiLogin = async (username: string, password: string) => {
  return apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
};

export const apiLogout = async () => {
  return apiFetch('/auth/logout', {
    method: 'POST'
  });
};

export const apiGetMe = async () => {
  return apiFetch('/auth/me');
};

// ================= MOVIES PROXY API =================

export const apiGetPopularMovies = async (): Promise<Movie[]> => {
  return apiFetch('/movies/popular');
};

export const apiGetTrendingMovies = async (): Promise<Movie[]> => {
  return apiFetch('/movies/trending');
};

export const apiGetTopRatedMovies = async (): Promise<Movie[]> => {
  return apiFetch('/movies/top_rated');
};

export const apiSearchMovies = async (
  query: string,
  genreId?: number,
  year?: string,
  minRating?: number
): Promise<Movie[]> => {
  const params = new URLSearchParams();
  if (query) params.append('query', query);
  if (genreId) params.append('genreId', genreId.toString());
  if (year) params.append('year', year);
  if (minRating) params.append('minRating', minRating.toString());

  return apiFetch(`/movies/search?${params.toString()}`);
};

export const apiGetMovieDetails = async (id: number) => {
  return apiFetch(`/movies/detail/${id}`);
};

export const apiGetSimilarMovies = async (id: number): Promise<Movie[]> => {
  return apiFetch(`/movies/similar/${id}`);
};

export const apiGetGenres = async () => {
  return apiFetch('/movies/genres');
};

// ================= PROFILE WATCHLIST API =================

export const apiGetWatchlist = async (): Promise<Movie[]> => {
  return apiFetch('/profile/watchlist');
};

export const apiAddToWatchlist = async (movie: Movie) => {
  return apiFetch('/profile/watchlist', {
    method: 'POST',
    body: JSON.stringify(movie)
  });
};

export const apiRemoveFromWatchlist = async (movieId: number) => {
  return apiFetch(`/profile/watchlist/${movieId}`, {
    method: 'DELETE'
  });
};

// ================= PROFILE RATINGS API =================

export const apiGetRatings = async () => {
  return apiFetch('/profile/ratings');
};

export const apiSaveRating = async (movie: Movie, rating: number) => {
  return apiFetch('/profile/ratings', {
    method: 'POST',
    body: JSON.stringify({ movie, rating })
  });
};

export const apiDeleteRating = async (movieId: number) => {
  return apiFetch(`/profile/ratings/${movieId}`, {
    method: 'DELETE'
  });
};

export const apiResetProfile = async () => {
  return apiFetch('/profile/reset', {
    method: 'DELETE'
  });
};

// ================= PROFILE RECOMMENDATIONS API =================

export const apiGetCollaborativeRecommendations = async (): Promise<Recommendation[]> => {
  return apiFetch('/profile/recommendations');
};

export const apiGetAIRecommendations = async (
  ratedDetails: Array<{ title: string; rating: number; year: string }>,
  watchlistDetails: string[]
): Promise<Recommendation[]> => {
  return apiFetch('/profile/ai-recommendations', {
    method: 'POST',
    body: JSON.stringify({ ratedDetails, watchlistDetails })
  });
};
