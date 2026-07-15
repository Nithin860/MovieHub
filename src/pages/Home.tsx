import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Play, Bookmark, BookmarkCheck } from 'lucide-react';
import { useMovies } from '../context/MovieContext';
import { useUser } from '../context/UserContext';
import { MovieGrid } from '../components/MovieGrid';

export const Home: React.FC = () => {
  const { popularMovies, trendingMovies, topRatedMovies, loading, error } = useMovies();
  const { toggleWatchlist, isInWatchlist } = useUser();

  // Pick the top trending movie as the Hero Banner
  const heroMovie = trendingMovies[0];
  const heroInWatchlist = heroMovie ? isInWatchlist(heroMovie.id) : false;

  if (loading && trendingMovies.length === 0) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="h-[400px] bg-white/5 rounded-3xl" />
        <div className="space-y-4">
          <div className="h-6 w-48 bg-white/5 rounded" />
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-white/5 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error && trendingMovies.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-red-400 font-semibold mb-2">Error loading movies</p>
        <p className="text-gray-500 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Hero Movie Banner */}
      {heroMovie && (
        <div className="relative h-[480px] w-full rounded-3xl overflow-hidden group shadow-2xl border border-white/5">
          {/* Backdrop Image */}
          {heroMovie.backdrop_path ? (
            <img
              src={`https://image.tmdb.org/t/p/original${heroMovie.backdrop_path}`}
              alt={heroMovie.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-700 ease-out"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-950 via-slate-900 to-[#050507]" />
          )}

          {/* Gradients to darken background */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050507] via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent" />

          {/* Banner Contents */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 space-y-4 max-w-2xl text-left">
            <div className="flex items-center gap-3">
              <span className="bg-purple-600 text-white text-[10px] uppercase font-extrabold tracking-widest px-2.5 py-1 rounded-full">
                Featured
              </span>
              <div className="flex items-center gap-1 text-amber-400 font-bold text-sm">
                <Star className="w-4 h-4 fill-amber-400 stroke-amber-400" />
                <span>{heroMovie.vote_average.toFixed(1)}</span>
              </div>
              <span className="text-gray-300 text-sm font-medium">
                {new Date(heroMovie.release_date).getFullYear()}
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black text-white leading-tight">
              {heroMovie.title}
            </h1>

            <p className="text-gray-300 text-sm md:text-base leading-relaxed line-clamp-3">
              {heroMovie.overview}
            </p>

            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                to={`/movie/${heroMovie.id}`}
                className="flex items-center gap-2 bg-white text-black hover:bg-purple-400 hover:text-white transition-all font-bold px-6 py-3 rounded-xl text-sm shadow-lg hover:scale-105 active:scale-95 duration-200"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>View Details</span>
              </Link>
              <button
                onClick={() => toggleWatchlist(heroMovie)}
                className={`flex items-center gap-2 border px-5 py-3 rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95 duration-200 ${
                  heroInWatchlist
                    ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                    : 'bg-black/30 border-white/10 text-white hover:bg-black/50'
                }`}
              >
                {heroInWatchlist ? (
                  <>
                    <BookmarkCheck className="w-4 h-4" />
                    <span>Watchlisted</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4" />
                    <span>Add Watchlist</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Discover / Popular Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">Popular Movies</h2>
          <Link to="/search" className="text-purple-400 hover:text-purple-300 text-sm font-bold transition-colors">
            See All
          </Link>
        </div>
        <MovieGrid movies={popularMovies.slice(0, 10)} loading={loading} />
      </section>

      {/* Trending Movies Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">Trending Today</h2>
          <Link to="/search" className="text-purple-400 hover:text-purple-300 text-sm font-bold transition-colors">
            See All
          </Link>
        </div>
        {/* Skip the first movie since it's on the banner */}
        <MovieGrid movies={trendingMovies.slice(1, 11)} loading={loading} />
      </section>

      {/* Top Rated Grid */}
      <section className="space-y-6 font-sans">
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">Critics' Top Rated</h2>
          <Link to="/search" className="text-purple-400 hover:text-purple-300 text-sm font-bold transition-colors">
            See All
          </Link>
        </div>
        <MovieGrid movies={topRatedMovies.slice(0, 10)} loading={loading} />
      </section>
    </div>
  );
};
