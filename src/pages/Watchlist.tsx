import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Star, Trash2, Calendar } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { MovieCard } from '../components/MovieCard';

export const Watchlist: React.FC = () => {
  const { watchlist, ratings, removeRating } = useUser();
  const [activeTab, setActiveTab] = useState<'watchlist' | 'ratings'>('watchlist');

  const ratedItems = Object.values(ratings).sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="space-y-8 text-left">
      <div className="space-y-2">
        <h1 className="text-3xl font-black text-white tracking-tight">Your Theater Lounge</h1>
        <p className="text-gray-400 text-sm">
          Keep track of movies you plan to watch and review your catalog ratings.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex bg-[#09090d] border border-[#1a1a24] p-1.5 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('watchlist')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'watchlist'
              ? 'bg-purple-600 text-white shadow-lg'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Watchlist ({watchlist.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('ratings')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'ratings'
              ? 'bg-purple-600 text-white shadow-lg'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Star className="w-4 h-4" />
          <span>Ratings History ({ratedItems.length})</span>
        </button>
      </div>

      {/* Watchlist Tab Content */}
      {activeTab === 'watchlist' && (
        <div className="space-y-6">
          {watchlist.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-20 px-4 glass-card rounded-3xl max-w-xl mx-auto space-y-4">
              <div className="p-4 bg-purple-600/10 rounded-full border border-purple-500/20 text-purple-400">
                <Bookmark className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">Your Watchlist is Empty</h3>
                <p className="text-gray-400 text-sm">
                  Add movies to your watchlist while exploring the Catalog or Home Page.
                </p>
              </div>
              <Link
                to="/"
                className="inline-flex items-center bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 py-3 rounded-xl text-sm transition-transform hover:scale-105"
              >
                Discover Movies
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {watchlist.map(movie => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Ratings Tab Content */}
      {activeTab === 'ratings' && (
        <div className="space-y-6">
          {ratedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-20 px-4 glass-card rounded-3xl max-w-xl mx-auto space-y-4">
              <div className="p-4 bg-purple-600/10 rounded-full border border-purple-500/20 text-purple-400">
                <Star className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">No Ratings Recorded</h3>
                <p className="text-gray-400 text-sm font-sans">
                  Help teach the AI algorithms by assigning star ratings to movies you've watched.
                </p>
              </div>
              <Link
                to="/search"
                className="inline-flex items-center bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 py-3 rounded-xl text-sm transition-transform hover:scale-105"
              >
                Find & Rate Movies
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ratedItems.map(item => {
                const releaseYear = item.movie.release_date
                  ? new Date(item.movie.release_date).getFullYear()
                  : 'N/A';
                const posterUrl = item.movie.poster_path
                  ? `https://image.tmdb.org/t/p/w185${item.movie.poster_path}`
                  : null;

                return (
                  <div
                    key={item.movie.id}
                    className="flex bg-[#0e0e15] border border-white/5 hover:border-purple-500/20 rounded-2xl p-4 gap-4 items-center justify-between transition-colors"
                  >
                    <div className="flex gap-4 items-center min-w-0">
                      {/* Mini poster */}
                      <Link to={`/movie/${item.movie.id}`} className="w-14 aspect-[2/3] rounded-xl overflow-hidden shrink-0 bg-white/5 block">
                        {posterUrl ? (
                          <img src={posterUrl} alt={item.movie.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-500 font-bold">
                            N/A
                          </div>
                        )}
                      </Link>

                      <div className="text-left min-w-0">
                        <Link
                          to={`/movie/${item.movie.id}`}
                          className="font-extrabold text-white text-sm hover:text-purple-400 transition-colors block truncate"
                        >
                          {item.movie.title}
                        </Link>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{releaseYear}</span>
                          </div>
                          <span>•</span>
                          <span className="text-[10px]">
                            Rated: {new Date(item.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Stars */}
                      <div className="flex items-center gap-0.5 bg-purple-950/20 border border-purple-500/10 px-3 py-1.5 rounded-xl text-purple-300 font-bold text-xs shrink-0">
                        <Star className="w-3.5 h-3.5 fill-purple-500 stroke-purple-500" />
                        <span>{item.rating} / 5</span>
                      </div>

                      {/* Delete rating button */}
                      <button
                        onClick={() => removeRating(item.movie.id)}
                        className="p-2 text-gray-500 hover:text-red-400 rounded-xl hover:bg-red-500/10 transition-colors cursor-pointer"
                        title="Remove rating"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
