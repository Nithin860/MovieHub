import React from 'react';
import { SlidersHorizontal, RotateCcw } from 'lucide-react';
import { useMovies } from '../context/MovieContext';

interface FilterBarProps {
  selectedGenre: number | '';
  setSelectedGenre: (genre: number | '') => void;
  selectedRating: number | '';
  setSelectedRating: (rating: number | '') => void;
  selectedYear: string;
  setSelectedYear: (year: string) => void;
  onReset: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  selectedGenre,
  setSelectedGenre,
  selectedRating,
  setSelectedRating,
  selectedYear,
  setSelectedYear,
  onReset
}) => {
  const { genres } = useMovies();

  // Generate a list of years for selection (from current year down to 1970)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => (currentYear - i).toString());

  const ratings = [
    { value: 8, label: '★ 8.0+ Superb' },
    { value: 7, label: '★ 7.0+ High' },
    { value: 6, label: '★ 6.0+ Good' },
    { value: 5, label: '★ 5.0+ Average' }
  ];

  return (
    <div className="glass-card rounded-2xl border border-[#1a1a24] p-5 w-full flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
          <SlidersHorizontal className="w-4 h-4" />
          <span>Refine Discovery</span>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-purple-400 transition-colors py-1 px-2.5 rounded-lg hover:bg-white/5 font-medium"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Filters</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Genre Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Genre</label>
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value ? Number(e.target.value) : '')}
            className="w-full bg-[#0a0a0f] border border-[#2e2e3f] rounded-xl px-4 py-2.5 text-sm font-medium text-gray-200 focus:outline-none focus:border-purple-500 transition-colors cursor-pointer"
          >
            <option value="">All Genres</option>
            {genres.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>

        {/* Rating Threshold Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Min TMDB Rating</label>
          <select
            value={selectedRating}
            onChange={(e) => setSelectedRating(e.target.value ? Number(e.target.value) : '')}
            className="w-full bg-[#0a0a0f] border border-[#2e2e3f] rounded-xl px-4 py-2.5 text-sm font-medium text-gray-200 focus:outline-none focus:border-purple-500 transition-colors cursor-pointer"
          >
            <option value="">Any Rating</option>
            {ratings.map(r => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>

        {/* Year Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Release Year</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="w-full bg-[#0a0a0f] border border-[#2e2e3f] rounded-xl px-4 py-2.5 text-sm font-medium text-gray-200 focus:outline-none focus:border-purple-500 transition-colors cursor-pointer"
          >
            <option value="">Any Year</option>
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
