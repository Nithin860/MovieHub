import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, X } from 'lucide-react';
import { useMovies } from '../context/MovieContext';
import type { Movie } from '../types';
import { FilterBar } from '../components/FilterBar';
import { MovieGrid } from '../components/MovieGrid';

export const Search: React.FC = () => {
  const { search } = useMovies();
  const [searchParams, setSearchParams] = useSearchParams();

  // Get initial values from URL search params
  const urlQuery = searchParams.get('q') || '';
  const urlGenre = searchParams.get('genre') ? Number(searchParams.get('genre')) : '';
  const urlRating = searchParams.get('rating') ? Number(searchParams.get('rating')) : '';
  const urlYear = searchParams.get('year') || '';

  // Local Filter States
  const [query, setQuery] = useState<string>(urlQuery);
  const [selectedGenre, setSelectedGenre] = useState<number | ''>(urlGenre);
  const [selectedRating, setSelectedRating] = useState<number | ''>(urlRating);
  const [selectedYear, setSelectedYear] = useState<string>(urlYear);

  // Results State
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Sync state to URL parameters
  const syncParamsToUrl = useCallback(() => {
    const params: Record<string, string> = {};
    if (query.trim()) params.q = query;
    if (selectedGenre) params.genre = selectedGenre.toString();
    if (selectedRating) params.rating = selectedRating.toString();
    if (selectedYear) params.year = selectedYear;
    
    setSearchParams(params, { replace: true });
  }, [query, selectedGenre, selectedRating, selectedYear, setSearchParams]);

  // Perform search
  const performSearch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await search(query, selectedGenre || undefined, selectedYear || undefined, selectedRating || undefined);
      setResults(data);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong during search.');
    } finally {
      setLoading(false);
    }
  }, [query, selectedGenre, selectedRating, selectedYear, search]);

  // Debounce search text input changes (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch();
      syncParamsToUrl();
    }, 300);

    return () => clearTimeout(timer);
  }, [query, selectedGenre, selectedRating, selectedYear, performSearch, syncParamsToUrl]);

  const handleResetFilters = () => {
    setQuery('');
    setSelectedGenre('');
    setSelectedRating('');
    setSelectedYear('');
    setSearchParams({});
  };

  const handleClearQuery = () => {
    setQuery('');
  };

  return (
    <div className="space-y-8 text-left">
      <div className="space-y-2">
        <h1 className="text-3xl font-black text-white tracking-tight">Explore & Discover</h1>
        <p className="text-gray-400 text-sm">
          Browse through the catalog or use our advanced filters to find the perfect film.
        </p>
      </div>

      {/* Advanced Search Inputs */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, overview, tags..."
            className="w-full bg-[#09090d] border border-[#1a1a24] rounded-2xl pl-12 pr-10 py-4 text-base text-gray-100 placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors focus:ring-1 focus:ring-purple-500/20"
          />
          {query && (
            <button
              onClick={handleClearQuery}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Filter Selection Panel */}
        <FilterBar
          selectedGenre={selectedGenre}
          setSelectedGenre={setSelectedGenre}
          selectedRating={selectedRating}
          setSelectedRating={setSelectedRating}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          onReset={handleResetFilters}
        />
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Search Catalog Results */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white tracking-tight">
            {loading ? 'Searching Library...' : `Search Results (${results.length})`}
          </h2>
        </div>

        <MovieGrid
          movies={results}
          loading={loading}
          emptyMessage="We couldn't find any movies matching your query and filters. Try refining your parameters."
        />
      </div>
    </div>
  );
};
