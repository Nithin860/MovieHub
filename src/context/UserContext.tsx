import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Movie } from '../types';
import {
  apiSignup,
  apiLogin,
  apiLogout,
  apiGetMe,
  apiGetWatchlist,
  apiAddToWatchlist,
  apiRemoveFromWatchlist,
  apiGetRatings,
  apiSaveRating,
  apiDeleteRating,
  apiResetProfile,
  apiUpdateProfile,
  setAuthToken,
  removeAuthToken,
  isLoggedIn
} from '../services/api';
// Import the Gemini key utilities we set up in your ai.ts file
import { getGeminiKey, setGeminiKey, removeGeminiKey } from '../services/ai';

interface RatedMovie {
  movie: Movie;
  rating: number;
  timestamp: number;
}

export interface User {
  id: number;
  username: string;
  email?: string;
  phone?: string;
}

interface UserContextType {
  user: User | null;
  watchlist: Movie[];
  ratings: Record<number, RatedMovie>;
  loading: boolean;
  geminiKey: string;
  updateGeminiKey: (key: string) => void;
  clearGeminiKey: () => void;
  loginUser: (username: string, password: string) => Promise<void>;
  signupUser: (username: string, email: string, password: string, phone?: string) => Promise<void>;
  updateProfile: (data: { username: string; phone?: string; password?: string }) => Promise<void>;
  logoutUser: () => Promise<void>;
  toggleWatchlist: (movie: Movie) => Promise<void>;
  isInWatchlist: (movieId: number) => boolean;
  rateMovie: (movie: Movie, rating: number) => Promise<void>;
  getMovieRating: (movieId: number) => number;
  removeRating: (movieId: number) => Promise<void>;
  clearProfile: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ id: number; username: string; email?: string } | null>(null);

  // INITIALIZATION: Loads backup watchlists and ratings straight from local storage if available
  const [watchlist, setWatchlist] = useState<Movie[]>(() => {
    const backup = localStorage.getItem('movie_app_watchlist_backup');
    return backup ? JSON.parse(backup) : [];
  });

  const [ratings, setRatings] = useState<Record<number, RatedMovie>>(() => {
    const backup = localStorage.getItem('movie_app_ratings_backup');
    return backup ? JSON.parse(backup) : {};
  });

  const [loading, setLoading] = useState<boolean>(false);

  // FIXED: Type-casted function contract to completely resolve TS2345
  const [geminiKey, setGeminiKeyState] = useState<string>(() => (getGeminiKey() as string) || '');

  // Sync user profile collections from database
  const syncCollections = useCallback(async () => {
    try {
      const [watchlistData, ratingsData] = await Promise.all([
        apiGetWatchlist(),
        apiGetRatings()
      ]);
      setWatchlist(watchlistData);

      const ratingsMap: Record<number, RatedMovie> = {};
      ratingsData.forEach((item: any) => {
        ratingsMap[item.movie.id] = item;
      });
      setRatings(ratingsMap);

      localStorage.setItem('movie_app_watchlist_backup', JSON.stringify(watchlistData));
      localStorage.setItem('movie_app_ratings_backup', JSON.stringify(ratingsMap));
    } catch (error) {
      console.warn('Backend server offline. Relying strictly on local browser storage storage.');
    }
  }, []);

  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      setLoading(true);
      if (isLoggedIn()) {
        try {
          const profile = await apiGetMe();
          setUser(profile.user);
          await syncCollections();
        } catch (e) {
          console.warn('Session restore failed.');
          removeAuthToken();
          setUser(null);
        }
      }
      setLoading(false);
    };
    restoreSession();
  }, [syncCollections]);

  // Added key action updates
  const updateGeminiKey = (key: string) => {
    setGeminiKey(key);
    setGeminiKeyState(key);
  };

  const clearGeminiKey = () => {
    removeGeminiKey();
    setGeminiKeyState('');
  };

  const loginUser = async (username: string, password: string) => {
    setLoading(true);
    try {
      const data = await apiLogin(username, password);
      setAuthToken(data.token);
      setUser(data.user);

      const watchlistData = await apiGetWatchlist();
      const ratingsData = await apiGetRatings();

      setWatchlist(watchlistData);
      const ratingsMap: Record<number, RatedMovie> = {};
      ratingsData.forEach((item: any) => {
        ratingsMap[item.movie.id] = item;
      });
      setRatings(ratingsMap);

      localStorage.setItem('movie_app_watchlist_backup', JSON.stringify(watchlistData));
      localStorage.setItem('movie_app_ratings_backup', JSON.stringify(ratingsMap));
    } catch (error) {
      removeAuthToken();
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signupUser = async (username: string, email: string, password: string, phone?: string) => {
    setLoading(true);
    try {
      await apiSignup(username, email, password, phone);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: { username: string; phone?: string; password?: string }) => {
    setLoading(true);
    try {
      const res = await apiUpdateProfile(data);
      if (res.user) {
        setUser(res.user);
      }
    } finally {
      setLoading(false);
    }
  };

  const logoutUser = async () => {
    try {
      await apiLogout();
    } catch (e) {
      console.warn('Backend logout failed', e);
    } finally {
      removeAuthToken();
      setUser(null);
      setWatchlist([]);
      setRatings({});
      localStorage.removeItem('movie_app_gemini_recs_cache');
      localStorage.removeItem('movie_app_watchlist_backup');
      localStorage.removeItem('movie_app_ratings_backup');
    }
  };

  // UPDATED: Standard client-side fallback storage mechanism
  const toggleWatchlist = async (movie: Movie) => {
    const exists = watchlist.some(m => m.id === movie.id);
    const updatedWatchlist = exists
      ? watchlist.filter(m => m.id !== movie.id)
      : [...watchlist, movie];

    setWatchlist(updatedWatchlist);
    localStorage.setItem('movie_app_watchlist_backup', JSON.stringify(updatedWatchlist));

    try {
      if (exists) {
        await apiRemoveFromWatchlist(movie.id);
      } else {
        await apiAddToWatchlist(movie);
      }
    } catch (error) {
      // Fail silently since client memory backup is already preserved safely
    }
  };

  const isInWatchlist = (movieId: number): boolean => {
    return watchlist.some(m => m.id === movieId);
  };

  // UPDATED: Standard client-side fallback storage mechanism
  const rateMovie = async (movie: Movie, rating: number) => {
    setRatings(prev => {
      const updated = { ...prev };
      if (rating === 0) {
        delete updated[movie.id];
      } else {
        updated[movie.id] = {
          movie,
          rating,
          timestamp: Date.now()
        };
      }
      localStorage.setItem('movie_app_ratings_backup', JSON.stringify(updated));
      return updated;
    });

    try {
      if (rating === 0) {
        await apiDeleteRating(movie.id);
      } else {
        await apiSaveRating(movie, rating);
      }
    } catch (error) {
      // Fail silently since client memory backup is already preserved safely
    }
  };

  const getMovieRating = (movieId: number): number => {
    return ratings[movieId]?.rating || 0;
  };

  const removeRating = async (movieId: number) => {
    setRatings(prev => {
      const updated = { ...prev };
      delete updated[movieId];
      localStorage.setItem('movie_app_ratings_backup', JSON.stringify(updated));
      return updated;
    });

    try {
      await apiDeleteRating(movieId);
    } catch (error) {
      // Fail silently
    }
  };

  const clearProfile = async () => {
    setWatchlist([]);
    setRatings({});
    localStorage.removeItem('movie_app_watchlist_backup');
    localStorage.removeItem('movie_app_ratings_backup');
    try {
      await apiResetProfile();
    } catch (error) {
      // Fail silently
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        watchlist,
        ratings,
        loading,
        geminiKey,
        updateGeminiKey,
        clearGeminiKey,
        loginUser,
        signupUser,
        updateProfile,
        logoutUser,
        toggleWatchlist,
        isInWatchlist,
        rateMovie,
        getMovieRating,
        removeRating,
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