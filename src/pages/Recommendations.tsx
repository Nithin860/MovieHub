import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Brain, AlertTriangle, Key, ArrowRight, RefreshCw } from 'lucide-react';
import { useMovies } from '../context/MovieContext';
import { useUser } from '../context/UserContext';
import { getClientRecommendations, getGeminiRecommendations } from '../services/ai';
import type { Recommendation } from '../types';
import { MovieGrid } from '../components/MovieGrid';

const GEMINI_RECS_STORAGE_KEY = 'movie_app_gemini_recs_cache';

export const Recommendations: React.FC = () => {
  const { popularMovies, trendingMovies, topRatedMovies, genres, loading: moviesLoading } = useMovies();
  const { watchlist, ratings, geminiKey } = useUser();

  const [activeTab, setActiveTab] = useState<'client' | 'gemini'>('client');
  const [clientRecs, setClientRecs] = useState<Recommendation[]>([]);

  // Gemini AI recommendation states
  const [geminiRecs, setGeminiRecs] = useState<Recommendation[]>([]);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Combine all movies for local recommendation calculations
  const allAvailableMovies = React.useMemo(() => {
    const map = new Map();
    [...popularMovies, ...trendingMovies, ...topRatedMovies].forEach(m => {
      map.set(m.id, m);
    });
    return Array.from(map.values());
  }, [popularMovies, trendingMovies, topRatedMovies]);

  // Compute client recommendations when watch history, watchlist, or catalog updates
  useEffect(() => {
    if (allAvailableMovies.length === 0 || genres.length === 0) return;

    const userProfile = {
      watchlist: watchlist.map(m => m.id),
      ratings: Object.fromEntries(
        Object.entries(ratings).map(([id, item]) => [id, item.rating])
      ),
      preferredGenres: [],
      tmdbApiKey: '',
      geminiApiKey: ''
    };

    // Recalculates matching scores immediately whenever watchlist or ratings array changes
    const recs = getClientRecommendations(userProfile, allAvailableMovies, genres);
    setClientRecs(recs);
  }, [allAvailableMovies, watchlist, ratings, genres]); // <-- Watchlist dependency ensures structural real-time binding

  // Load cached Gemini recommendations on mount
  useEffect(() => {
    const cached = localStorage.getItem(GEMINI_RECS_STORAGE_KEY);
    if (cached) {
      try {
        setGeminiRecs(JSON.parse(cached));
      } catch (e) {
        console.error('Failed to parse cached Gemini recommendations', e);
      }
    }
  }, []);

  const handleGenerateAiRecommendations = async () => {
    if (!geminiKey) return;
    setAiLoading(true);
    setAiError(null);

    // 1. Compile history strings dynamically out of active user ratings
    const historyData = Object.entries(ratings).map(([idStr, item]) => {
      const movie = allAvailableMovies.find(m => m.id === Number(idStr)) || item.movie;
      return {
        title: movie?.title || '',
        rating: item.rating,
        year: movie?.release_date ? movie.release_date.substring(0, 4) : '2026'
      };
    }).filter(m => m.title !== '');

    // 2. Map watchlist directly to title strings for semantic analysis inside the AI prompt context
    const watchlistTitles = watchlist.map(m => m.title).filter(t => t !== '');

    const userProfile = {
      watchlist: watchlist.map(m => m.id),
      ratings: Object.fromEntries(
        Object.entries(ratings).map(([id, item]) => [id, item.rating])
      ),
      preferredGenres: [],
      tmdbApiKey: '',
      geminiApiKey: ''
    };

    try {
      // 3. Make the service call passing structural dependencies dynamically!
      const recs = await getGeminiRecommendations(
        userProfile,
        historyData,
        watchlistTitles,
        allAvailableMovies // Allows prompt filters to cleanly rank match configurations
      );

      if (recs.length === 0) {
        throw new Error('Gemini could not find matching titles in TMDB. Try generating again.');
      }
      setGeminiRecs(recs);
      localStorage.setItem(GEMINI_RECS_STORAGE_KEY, JSON.stringify(recs));
    } catch (err: any) {
      setAiError(err?.message || 'Failed to generate recommendations from Gemini.');
    } finally {
      setAiLoading(false);
    }
  };

  const totalInteractions = watchlist.length + Object.keys(ratings).length;
  const showOnboarding = totalInteractions < 2;

  return (
    <div className="space-y-8 text-left">
      <div className="space-y-2">
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
          <Sparkles className="w-8 h-8 text-purple-400" />
          <span>Personalized Recommendations</span>
        </h1>
        <p className="text-gray-400 text-sm">
          Discover films hand-picked to fit your viewing preferences and ratings.
        </p>
      </div>

      {/* Onboarding Guide if history is too small */}
      {showOnboarding ? (
        <div className="glass-card rounded-3xl border border-purple-500/10 p-8 text-center max-w-2xl mx-auto space-y-6">
          <div className="p-4 bg-purple-600/15 text-purple-400 rounded-full w-fit mx-auto border border-purple-500/25">
            <Brain className="w-10 h-10 animate-bounce" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">Help Us Understand Your Taste</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Our recommendation engines analyze your watch history. To get started, add some films to your
              watchlist or give a few star ratings on the search and homepage.
            </p>
          </div>
          <div className="bg-purple-600/5 border border-purple-500/10 rounded-2xl p-4 text-xs text-purple-300 flex items-center justify-between max-w-md mx-auto">
            <span>Minimum requirements: 2 ratings/watchlist items</span>
            <span className="font-extrabold bg-purple-500/20 px-2 py-1 rounded-md">
              {totalInteractions} / 2 Added
            </span>
          </div>
          <Link
            to="/search"
            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 py-3 rounded-xl text-sm transition-transform hover:scale-105 active:scale-95 duration-200"
          >
            <span>Rate Movies Now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Recommendation Mode Tabs */}
          <div className="flex bg-[#09090d] border border-[#1a1a24] p-1.5 rounded-2xl w-fit">
            <button
              onClick={() => setActiveTab('client')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'client'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white'
                }`}
            >
              <Brain className="w-4 h-4" />
              <span>Smart Match (Local)</span>
            </button>
            <button
              onClick={() => setActiveTab('gemini')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'gemini'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white'
                }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Gemini AI Critic</span>
            </button>
          </div>

          {/* TAB 1: LOCAL RECOMMENDATIONS */}
          {activeTab === 'client' && (
            <div className="space-y-6">
              <div className="bg-purple-950/10 border border-purple-500/10 rounded-2xl p-4 text-sm text-purple-300">
                <p>
                  <strong>How it works:</strong> Our client-side algorithm calculates genre Affinity coefficients
                  by evaluating weights across your watchlisted and rated movies (positive points for high ratings,
                  negative points for low ratings), overlaying TMDB popularity to rank discovery suggestions.
                </p>
              </div>

              <MovieGrid
                recommendations={clientRecs}
                loading={moviesLoading}
                emptyMessage="Not enough watch history to build affinity models. Rate movies across different genres to train the generator."
              />
            </div>
          )}

          {/* TAB 2: GEMINI AI RECOMMENDATIONS */}
          {activeTab === 'gemini' && (
            <div className="space-y-6">
              {/* If Gemini API key is missing */}
              {!geminiKey ? (
                <div className="glass-card rounded-3xl border border-amber-500/10 p-8 text-center max-w-xl mx-auto space-y-5">
                  <div className="p-4 bg-amber-500/10 text-amber-500 rounded-full w-fit mx-auto border border-amber-500/20">
                    <Key className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-white">Gemini API Key Required</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      To get deep AI recommendations with tailored reasons explaining why you will enjoy each
                      film, configure your Google Gemini API Key in Settings.
                    </p>
                  </div>
                  <Link
                    to="/settings"
                    className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-[#09090d] font-bold px-6 py-3 rounded-xl text-sm transition-transform hover:scale-105 active:scale-95 duration-200"
                  >
                    <span>Go to Settings</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Generate Button / Header */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-purple-950/10 border border-purple-500/15 p-5 rounded-2xl">
                    <div className="space-y-1">
                      <h3 className="font-bold text-white text-sm">Gemini AI Engine</h3>
                      <p className="text-gray-400 text-xs leading-relaxed max-w-xl">
                        Sends your watch ratings, likes, dislikes, and watchlist to Gemini's 1.5 Flash model. It
                        returns highly customized selections and custom review notes.
                      </p>
                    </div>

                    <button
                      onClick={handleGenerateAiRecommendations}
                      disabled={aiLoading}
                      className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 disabled:opacity-50 text-white font-bold px-5 py-3 rounded-xl text-sm transition-transform active:scale-95 hover:scale-102 duration-150 shadow-md cursor-pointer shrink-0"
                    >
                      <RefreshCw className={`w-4 h-4 ${aiLoading ? 'animate-spin' : ''}`} />
                      <span>{aiLoading ? 'Analyzing...' : geminiRecs.length > 0 ? 'Regenerate Feed' : 'Generate Recommendations'}</span>
                    </button>
                  </div>

                  {/* AI Error display */}
                  {aiError && (
                    <div className="bg-red-500/15 border border-red-500/25 text-red-400 p-4 rounded-xl text-sm flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">AI generation error</p>
                        <p className="opacity-80 text-xs">{aiError}</p>
                      </div>
                    </div>
                  )}

                  {/* Recommendations Display Grid */}
                  {aiLoading ? (
                    <div className="flex flex-col items-center justify-center py-24 space-y-4">
                      <RefreshCw className="w-10 h-10 text-purple-400 animate-spin" />
                      <div className="text-center space-y-1">
                        <p className="text-white font-bold text-sm">Consulting AI Film Critic...</p>
                        <p className="text-gray-500 text-xs">Analyzing your profile & mapping candidates...</p>
                      </div>
                    </div>
                  ) : (
                    <MovieGrid
                      recommendations={geminiRecs}
                      loading={false}
                      emptyMessage="You haven't generated AI recommendations yet. Click the button above to begin!"
                    />
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};