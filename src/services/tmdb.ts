// Fixed: Added 'type' keyword for type-only imports
import type { Movie, MovieDetail, Genre, CastMember } from '../types'; import {
  mockGetPopularMovies,
  mockGetTrendingMovies,
  mockGetTopRatedMovies,
  mockSearchMovies,
  mockGetMovieDetails,
  mockGetSimilarMovies
} from './mockData';

const LOCAL_STORAGE_KEY = 'movie_app_tmdb_key';

export const getTmdbKey = (): string => {
  return localStorage.getItem(LOCAL_STORAGE_KEY) || '';
};

export const setTmdbKey = (key: string): void => {
  localStorage.setItem(LOCAL_STORAGE_KEY, key);
};

export const removeTmdbKey = (): void => {
  localStorage.removeItem(LOCAL_STORAGE_KEY);
};

export const isDemoMode = (): boolean => {
  return !getTmdbKey();
};

const tmdbFetch = async (endpoint: string, params: Record<string, string> = {}) => {
  const key = getTmdbKey();
  if (!key) {
    throw new Error('TMDB API Key is not configured. Switching to Demo Mode.');
  }

  const isToken = key.length > 40; // Read Access Token (JWT) is very long; API key is 32 characters
  const url = new URL(`https://api.themoviedb.org/3${endpoint}`);

  if (!isToken) {
    url.searchParams.append('api_key', key);
  }

  Object.entries(params).forEach(([k, v]) => {
    url.searchParams.append(k, v);
  });

  const headers: Record<string, string> = {
    'Content-Type': 'application/json;charset=utf-8'
  };

  if (isToken) {
    headers['Authorization'] = `Bearer ${key}`;
  }

  const response = await fetch(url.toString(), { headers });
  if (!response.ok) {
    throw new Error(`TMDB error: ${response.status} ${response.statusText}`);
  }
  return response.json();
};

// API calls with fallback to mock data if in demo mode
export const getPopularMovies = async (): Promise<Movie[]> => {
  if (isDemoMode()) return mockGetPopularMovies();
  try {
    const data = await tmdbFetch('/movie/popular');
    return data.results;
  } catch (error) {
    console.error('TMDB API failed, falling back to mock data', error);
    return mockGetPopularMovies();
  }
};

export const getTrendingMovies = async (): Promise<Movie[]> => {
  if (isDemoMode()) return mockGetTrendingMovies();
  try {
    const data = await tmdbFetch('/trending/movie/day');
    return data.results;
  } catch (error) {
    console.error('TMDB API failed, falling back to mock data', error);
    return mockGetTrendingMovies();
  }
};

export const getTopRatedMovies = async (): Promise<Movie[]> => {
  if (isDemoMode()) return mockGetTopRatedMovies();
  try {
    const data = await tmdbFetch('/movie/top_rated');
    return data.results;
  } catch (error) {
    console.error('TMDB API failed, falling back to mock data', error);
    return mockGetTopRatedMovies();
  }
};

export const searchMovies = async (
  query: string,
  genreId?: number,
  year?: string,
  minRating?: number
): Promise<Movie[]> => {
  if (isDemoMode()) {
    return mockSearchMovies(query, genreId, year, minRating);
  }

  try {
    const params: Record<string, string> = {};

    // If there is a text query, we must use /search/movie
    if (query.trim()) {
      params.query = query;
      if (year) params.primary_release_year = year;

      const data = await tmdbFetch('/search/movie', params);
      let results: Movie[] = data.results;

      // Perform client-side filtering for search results since TMDB search endpoint doesn't support multiple filters directly
      if (genreId) {
        results = results.filter(m => m.genre_ids.includes(genreId));
      }
      if (minRating) {
        results = results.filter(m => m.vote_average >= minRating);
      }
      return results;
    } else {
      // If query is empty, we use /discover/movie for filters
      if (genreId) params.with_genres = genreId.toString();
      if (year) params.primary_release_year = year;
      if (minRating) params['vote_average.gte'] = minRating.toString();
      params.sort_by = 'popularity.desc';

      const data = await tmdbFetch('/discover/movie', params);
      return data.results;
    }
  } catch (error) {
    console.error('TMDB search failed, falling back to mock data', error);
    return mockSearchMovies(query, genreId, year, minRating);
  }
};

export const getMovieDetails = async (id: number): Promise<MovieDetail> => {
  if (isDemoMode()) return mockGetMovieDetails(id);
  try {
    const details = await tmdbFetch(`/movie/${id}`);
    const credits = await tmdbFetch(`/movie/${id}/credits`);
    const videos = await tmdbFetch(`/movie/${id}/videos`);

    const cast: CastMember[] = credits.cast.slice(0, 10).map((c: any) => ({
      id: c.id,
      name: c.name,
      character: c.character,
      profile_path: c.profile_path
    }));

    return {
      ...details,
      cast,
      videos: {
        results: videos.results || []
      }
    };
  } catch (error) {
    console.error('TMDB getDetails failed, falling back to mock data', error);
    return mockGetMovieDetails(id);
  }
};

export const getSimilarMovies = async (id: number): Promise<Movie[]> => {
  if (isDemoMode()) return mockGetSimilarMovies(id);
  try {
    const data = await tmdbFetch(`/movie/${id}/similar`);
    return data.results.slice(0, 6);
  } catch (error) {
    console.error('TMDB getSimilar failed, falling back to mock data', error);
    return mockGetSimilarMovies(id);
  }
};

export const getGenres = async (): Promise<Genre[]> => {
  if (isDemoMode()) {
    // Return standard genre list
    return [
      { id: 28, name: 'Action' },
      { id: 12, name: 'Adventure' },
      { id: 16, name: 'Animation' },
      { id: 35, name: 'Comedy' },
      { id: 80, name: 'Crime' },
      { id: 99, name: 'Documentary' },
      { id: 18, name: 'Drama' },
      { id: 10751, name: 'Family' },
      { id: 14, name: 'Fantasy' },
      { id: 36, name: 'History' },
      { id: 27, name: 'Horror' },
      { id: 10402, name: 'Music' },
      { id: 9648, name: 'Mystery' },
      { id: 10749, name: 'Romance' },
      { id: 878, name: 'Science Fiction' },
      { id: 53, name: 'Thriller' },
      { id: 10752, name: 'War' },
      { id: 37, name: 'Western' }
    ];
  }
  try {
    const data = await tmdbFetch('/genre/movie/list');
    return data.genres;
  } catch (error) {
    console.error('TMDB genres failed, using static genres');
    return [
      { id: 28, name: 'Action' },
      { id: 12, name: 'Adventure' },
      { id: 16, name: 'Animation' },
      { id: 35, name: 'Comedy' },
      { id: 80, name: 'Crime' },
      { id: 18, name: 'Drama' },
      { id: 14, name: 'Fantasy' },
      { id: 27, name: 'Horror' },
      { id: 10749, name: 'Romance' },
      { id: 878, name: 'Science Fiction' },
      { id: 53, name: 'Thriller' }
    ];
  }
};
