import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Bookmark, BookmarkCheck } from 'lucide-react';
import type { Movie } from '../types';
import { useUser } from '../context/UserContext';

interface MovieCardProps {
  movie: Movie;
  showScore?: boolean;
  scoreReason?: string;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie, showScore = false, scoreReason }) => {
  const { toggleWatchlist, isInWatchlist, rateMovie, getMovieRating } = useUser();
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const saved = isInWatchlist(movie.id);
  const userRating = getMovieRating(movie.id);

  const releaseYear = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : 'N/A';

  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : null;

  const handleStarClick = (e: React.MouseEvent, ratingVal: number) => {
    e.preventDefault();
    e.stopPropagation();
    // Toggle rating if clicking the same rating
    if (userRating === ratingVal) {
      rateMovie(movie, 0); // resets rating
    } else {
      rateMovie(movie, ratingVal);
    }
  };

  const handleWatchlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWatchlist(movie);
  };

  return (
    <div className="group relative flex flex-col rounded-2xl glass-card overflow-hidden transition-all duration-300 hover:-translate-y-1.5 glow-card">
      {/* Watchlist Bookmark Button */}
      <button
        onClick={handleWatchlistClick}
        className={`absolute top-3 right-3 z-10 p-2 rounded-xl backdrop-blur-md transition-all duration-200 ${
          saved
            ? 'bg-purple-600 text-white border border-purple-500'
            : 'bg-black/40 text-gray-300 hover:text-white border border-white/10 hover:bg-black/60'
        }`}
        title={saved ? 'Remove from Watchlist' : 'Add to Watchlist'}
      >
        {saved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
      </button>

      {/* Poster Image / Fallback Gradient */}
      <Link to={`/movie/${movie.id}`} className="aspect-[2/3] w-full relative overflow-hidden block">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={movie.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-900/60 to-[#0e0e15] flex flex-col justify-end p-4 text-left border-b border-[#1a1a24]">
            <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">No Poster</span>
            <span className="font-bold text-gray-200 text-lg leading-tight line-clamp-3">{movie.title}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
          <p className="text-xs text-gray-300 line-clamp-3 mb-2">{movie.overview}</p>
        </div>
      </Link>

      {/* Rationale for recommendations */}
      {showScore && scoreReason && (
        <div className="bg-purple-950/40 border-y border-purple-900/20 px-3 py-1.5 text-xs text-purple-300 font-medium">
          {scoreReason}
        </div>
      )}

      {/* Details Footer */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>{releaseYear}</span>
            <div className="flex items-center gap-1 text-amber-400 font-semibold">
              <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
              <span>{movie.vote_average ? movie.vote_average.toFixed(1) : '0.0'}</span>
            </div>
          </div>
          <Link to={`/movie/${movie.id}`} className="block font-bold text-white hover:text-purple-400 transition-colors text-sm line-clamp-1">
            {movie.title}
          </Link>
        </div>

        {/* Rating interaction row */}
        <div className="pt-2 border-t border-white/5 flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Your Rating</span>
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map(starIdx => {
              const active = (hoverRating !== null ? hoverRating : userRating) >= starIdx;
              return (
                <button
                  key={starIdx}
                  onClick={(e) => handleStarClick(e, starIdx)}
                  onMouseEnter={() => setHoverRating(starIdx)}
                  onMouseLeave={() => setHoverRating(null)}
                  className="p-0.5 rounded focus:outline-none transition-colors"
                  title={`Rate ${starIdx} Star${starIdx > 1 ? 's' : ''}`}
                >
                  <Star
                    className={`w-3.5 h-3.5 transition-all duration-150 ${
                      active
                        ? 'fill-purple-500 stroke-purple-500 scale-110'
                        : 'text-gray-600 hover:text-purple-400'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
