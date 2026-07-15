import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Movie } from '../types';
import { getGeminiKey, setGeminiKey as saveGeminiKey, removeGeminiKey } from '../services/ai';

interface RatedMovie {
  movie: Movie;
  rating: number;
  timestamp: number;
}

interface UserContextType {
  watchlist: Movie[];
  ratings: Record<number, RatedMovie>;
  geminiKey: string;
  toggleWatchlist: (movie: Movie) => void;
  isInWatchlist: (movieId: number) => boolean;
  rateMovie: (movie: Movie, rating: number) => void;
  getMovieRating: (movieId: number) => number;
  removeRating: (movieId: number) => void;
  updateGeminiKey: (key: string) => void;
  clearGeminiKey: () => void;
  clearProfile: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const WATCHLIST_STORAGE_KEY = 'movie_app_watchlist';
const RATINGS_STORAGE_KEY = 'movie_app_ratings';

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [watchlist, setWatchlist] = useState<Movie[]>([]);
  const [ratings, setRatings] = useState<Record<number, RatedMovie>>({});
  const [geminiKey, setGeminiKeyState] = useState<string>(getGeminiKey());

  // Load from local storage on mount
  useEffect(() => {
    try {
      const storedWatchlist = localStorage.getItem(WATCHLIST_STORAGE_KEY);
      if (storedWatchlist) {
        setWatchlist(JSON.parse(storedWatchlist));
      }

      const storedRatings = localStorage.getItem(RATINGS_STORAGE_KEY);
      if (storedRatings) {
        setRatings(JSON.parse(storedRatings));
      }
    } catch (e) {
      console.error('Failed to load user state from localStorage', e);
    }
  }, []);

  const toggleWatchlist = (movie: Movie) => {
    setWatchlist(prev => {
      let updated;
      const exists = prev.some(m => m.id === movie.id);
      if (exists) {
        updated = prev.filter(m => m.id !== movie.id);
      } else {
        updated = [...prev, movie];
      }
      localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const isInWatchlist = (movieId: number): boolean => {
    return watchlist.some(m => m.id === movieId);
  };

  const rateMovie = (movie: Movie, rating: number) => {
    setRatings(prev => {
      const updated = {
        ...prev,
        [movie.id]: {
          movie,
          rating,
          timestamp: Date.now()
        }
      };
      localStorage.setItem(RATINGS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const getMovieRating = (movieId: number): number => {
    return ratings[movieId]?.rating || 0;
  };

  const removeRating = (movieId: number) => {
    setRatings(prev => {
      const updated = { ...prev };
      delete updated[movieId];
      localStorage.setItem(RATINGS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const updateGeminiKey = (key: string) => {
    saveGeminiKey(key);
    setGeminiKeyState(key);
  };

  const clearGeminiKey = () => {
    removeGeminiKey();
    setGeminiKeyState('');
  };

  const clearProfile = () => {
    setWatchlist([]);
    setRatings({});
    localStorage.removeItem(WATCHLIST_STORAGE_KEY);
    localStorage.removeItem(RATINGS_STORAGE_KEY);
  };

  return (
    <UserContext.Provider
      value={{
        watchlist,
        ratings,
        geminiKey,
        toggleWatchlist,
        isInWatchlist,
        rateMovie,
        getMovieRating,
        removeRating,
        updateGeminiKey,
        clearGeminiKey,
        clearProfile
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
