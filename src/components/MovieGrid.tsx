import React from 'react';
import { Film, Loader2 } from 'lucide-react';
import type { Movie, Recommendation } from '../types';
import { MovieCard } from './MovieCard';

interface MovieGridProps {
  movies?: Movie[];
  recommendations?: Recommendation[];
  loading: boolean;
  emptyMessage?: string;
}

export const MovieGrid: React.FC<MovieGridProps> = ({
  movies,
  recommendations,
  loading,
  emptyMessage = 'No movies found.'
}) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
        <p className="text-gray-400 font-medium text-sm">Curating your theater...</p>
      </div>
    );
  }

  // Determine whether to use recommendations list or normal movies list
  const hasRecommendations = recommendations && recommendations.length > 0;
  const listItems = hasRecommendations 
    ? recommendations 
    : movies || [];

  if (listItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16 px-4 glass-card rounded-3xl border border-[#1a1a24] max-w-xl mx-auto space-y-4">
        <div className="p-4 bg-purple-600/10 rounded-full border border-purple-500/20 text-purple-400">
          <Film className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-white">Empty Catalog</h3>
          <p className="text-gray-400 text-sm">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-6">
      {hasRecommendations
        ? (recommendations as Recommendation[]).map((rec) => (
            <MovieCard
              key={rec.movie.id}
              movie={rec.movie}
              showScore={true}
              scoreReason={rec.reason}
            />
          ))
        : (movies as Movie[]).map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
    </div>
  );
};
