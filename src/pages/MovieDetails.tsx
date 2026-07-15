import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Clock, Calendar, Bookmark, BookmarkCheck, ArrowLeft, Loader2, DollarSign } from 'lucide-react';
import { getMovieDetails, getSimilarMovies } from '../services/tmdb';
import type { MovieDetail, Movie } from '../types';
import { useUser } from '../context/UserContext';
import { MovieCard } from '../components/MovieCard';

export const MovieDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const movieId = Number(id);

  const { toggleWatchlist, isInWatchlist, rateMovie, getMovieRating } = useUser();
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [similar, setSimilar] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  useEffect(() => {
    const fetchMovieData = async () => {
      setLoading(true);
      setError(null);
      try {
        const details = await getMovieDetails(movieId);
        const similarList = await getSimilarMovies(movieId);
        setMovie(details);
        setSimilar(similarList);
      } catch (err: any) {
        setError(err?.message || 'Failed to load movie details.');
      } finally {
        setLoading(false);
      }
    };

    if (movieId) {
      fetchMovieData();
    }
  }, [movieId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
        <p className="text-gray-400 text-sm font-medium">Opening film reel...</p>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="text-center py-20 space-y-4 max-w-md mx-auto">
        <p className="text-red-400 font-bold">Error loading details</p>
        <p className="text-gray-500 text-sm">{error || 'Movie not found.'}</p>
        <Link to="/" className="inline-flex items-center gap-2 text-purple-400 font-bold text-sm hover:underline">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>
    );
  }

  const saved = isInWatchlist(movie.id);
  const userRating = getMovieRating(movie.id);
  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';
  
  // Format numbers to USD
  const formatCurrency = (val: number) => {
    if (!val) return 'N/A';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  const trailer = movie.videos?.results?.find(
    (v: any) => v.type === 'Trailer' && (v.site === 'YouTube' || v.site === 'Youtube')
  );

  const handleStarClick = (ratingVal: number) => {
    if (userRating === ratingVal) {
      rateMovie(movie, 0); // resets rating
    } else {
      rateMovie(movie, ratingVal);
    }
  };

  return (
    <div className="space-y-12 text-left">
      {/* Back Button */}
      <Link
        to={-1 as any}
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-bold w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </Link>

      {/* Hero Movie Details Header Block */}
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
        {/* Poster */}
        <div className="w-full sm:w-80 shrink-0 aspect-[2/3] rounded-3xl overflow-hidden shadow-2xl border border-white/5 bg-[#09090d]">
          {movie.poster_path ? (
            <img
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-950 to-[#0e0e15] flex flex-col justify-center items-center p-6 text-center">
              <span className="text-gray-400 font-bold text-lg">{movie.title}</span>
            </div>
          )}
        </div>

        {/* Content details */}
        <div className="flex-1 space-y-6">
          <div className="space-y-3">
            <h1 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tight">
              {movie.title}
            </h1>
            {movie.tagline && (
              <p className="text-purple-300 font-medium italic text-base leading-relaxed">
                "{movie.tagline}"
              </p>
            )}
          </div>

          {/* Quick info tags */}
          <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-gray-400">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-purple-400" />
              <span>{releaseYear}</span>
            </div>
            {movie.runtime && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-purple-400" />
                <span>{movie.runtime} min</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-amber-400">
              <Star className="w-4 h-4 fill-amber-400 stroke-amber-400" />
              <span>{movie.vote_average ? movie.vote_average.toFixed(1) : '0.0'} ({movie.vote_count.toLocaleString()} votes)</span>
            </div>
          </div>

          {/* Genres */}
          <div className="flex flex-wrap gap-2.5">
            {movie.genres.map(g => (
              <span
                key={g.id}
                className="px-3.5 py-1.5 bg-[#0e0e15] border border-[#232333] rounded-full text-xs font-bold text-gray-300"
              >
                {g.name}
              </span>
            ))}
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white tracking-tight">Overview</h3>
            <p className="text-gray-300 leading-relaxed text-sm md:text-base">
              {movie.overview}
            </p>
          </div>

          {/* Financials / Budget Box */}
          <div className="grid grid-cols-2 gap-4 max-w-sm">
            <div className="bg-[#09090d] border border-white/5 rounded-2xl p-4">
              <div className="flex items-center gap-1 text-gray-500 font-semibold text-xs uppercase tracking-wider mb-1">
                <DollarSign className="w-3.5 h-3.5" />
                <span>Budget</span>
              </div>
              <span className="font-extrabold text-white text-sm">{formatCurrency(movie.budget)}</span>
            </div>
            <div className="bg-[#09090d] border border-white/5 rounded-2xl p-4">
              <div className="flex items-center gap-1 text-gray-500 font-semibold text-xs uppercase tracking-wider mb-1">
                <DollarSign className="w-3.5 h-3.5" />
                <span>Revenue</span>
              </div>
              <span className="font-extrabold text-white text-sm">{formatCurrency(movie.revenue)}</span>
            </div>
          </div>

          {/* User Interaction Controls */}
          <div className="pt-6 border-t border-white/5 flex flex-wrap gap-6 items-center justify-between">
            {/* Watchlist Toggle */}
            <button
              onClick={() => toggleWatchlist(movie)}
              className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm shadow-md transition-transform active:scale-95 duration-200 cursor-pointer ${
                saved
                  ? 'bg-purple-600 text-white border border-purple-500'
                  : 'bg-[#0e0e15] border border-white/5 hover:border-purple-500/30 text-gray-300 hover:text-white'
              }`}
            >
              {saved ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
              <span>{saved ? 'Watchlisted' : 'Add to Watchlist'}</span>
            </button>

            {/* Rate Widget */}
            <div className="space-y-1.5 text-right">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">
                Rate this movie
              </label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(starIdx => {
                  const active = (hoverRating !== null ? hoverRating : userRating) >= starIdx;
                  return (
                    <button
                      key={starIdx}
                      onClick={() => handleStarClick(starIdx)}
                      onMouseEnter={() => setHoverRating(starIdx)}
                      onMouseLeave={() => setHoverRating(null)}
                      className="p-1 rounded transition-transform duration-100 hover:scale-110 focus:outline-none cursor-pointer"
                    >
                      <Star
                        className={`w-6 h-6 transition-all ${
                          active
                            ? 'fill-purple-500 stroke-purple-500'
                            : 'text-gray-700 hover:text-purple-400'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Movie Video Trailer Section */}
      {trailer && (
        <section className="space-y-6">
          <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">Official Trailer</h2>
          <div className="w-full aspect-video rounded-3xl overflow-hidden shadow-2xl border border-white/5">
            <iframe
              src={`https://www.youtube.com/embed/${trailer.key}?autoplay=0&rel=0`}
              title={`${movie.title} Trailer`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </section>
      )}

      {/* Cast Section */}
      {movie.cast && movie.cast.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">Main Cast</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {movie.cast.map(c => (
              <div key={c.id} className="bg-[#09090d] border border-white/5 p-3 rounded-2xl flex items-center gap-3">
                <div className="w-12 h-12 bg-white/5 rounded-full overflow-hidden shrink-0">
                  {c.profile_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w185${c.profile_path}`}
                      alt={c.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-purple-950/40 flex items-center justify-center font-bold text-xs text-purple-400">
                      {c.name.split(' ').map(n => n[0]).join('')}
                    </div>
                  )}
                </div>
                <div className="text-left min-w-0">
                  <p className="font-bold text-white text-xs truncate leading-tight">{c.name}</p>
                  <p className="text-[10px] text-gray-500 truncate mt-0.5 leading-none">{c.character}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Similar Movies Section */}
      {similar.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">Similar Movies</h2>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
            {similar.map(m => (
              <MovieCard key={m.id} movie={m} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
