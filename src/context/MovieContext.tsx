import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Movie, Genre } from '../types';
import {
  getTmdbKey,
  setTmdbKey as saveTmdbKey,
  removeTmdbKey,
  getPopularMovies,
  getTrendingMovies,
  getTopRatedMovies,
  getGenres,
  searchMovies,
  isDemoMode
} from '../services/tmdb';

interface MovieContextType {
  tmdbKey: string;
  demoMode: boolean;
  popularMovies: Movie[];
  trendingMovies: Movie[];
  topRatedMovies: Movie[];
  genres: Genre[];
  loading: boolean;
  error: string | null;
  updateKeys: (key: string) => void;
  clearKeys: () => void;
  search: (query: string, genreId?: number, year?: string, minRating?: number) => Promise<Movie[]>;
  refreshAllData: () => Promise<void>;
}

const MovieContext = createContext<MovieContextType | undefined>(undefined);

export const MovieProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tmdbKey, setTmdbKeyState] = useState<string>(getTmdbKey());
  const [demoMode, setDemoMode] = useState<boolean>(isDemoMode());
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [popular, trending, topRated, genreList] = await Promise.all([
        getPopularMovies(),
        getTrendingMovies(),
        getTopRatedMovies(),
        getGenres()
      ]);
      setPopularMovies(popular);
      setTrendingMovies(trending);
      setTopRatedMovies(topRated);
      setGenres(genreList);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch movie details. Using fallback mode.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData, tmdbKey]);

  const updateKeys = (key: string) => {
    saveTmdbKey(key);
    setTmdbKeyState(key);
    setDemoMode(!key);
  };

  const clearKeys = () => {
    removeTmdbKey();
    setTmdbKeyState('');
    setDemoMode(true);
  };

  const search = async (query: string, genreId?: number, year?: string, minRating?: number) => {
    return searchMovies(query, genreId, year, minRating);
  };

  const refreshAllData = async () => {
    await loadInitialData();
  };

  return (
    <MovieContext.Provider
      value={{
        tmdbKey,
        demoMode,
        popularMovies,
        trendingMovies,
        topRatedMovies,
        genres,
        loading,
        error,
        updateKeys,
        clearKeys,
        search,
        refreshAllData
      }}
    >
      {children}
    </MovieContext.Provider>
  );
};

export const useMovies = () => {
  const context = useContext(MovieContext);
  if (!context) {
    throw new Error('useMovies must be used within a MovieProvider');
  }
  return context;
};
