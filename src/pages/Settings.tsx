import React, { useState } from 'react';
import { Key, Eye, EyeOff, Save, Trash2, ShieldCheck, HelpCircle } from 'lucide-react';
import { useMovies } from '../context/MovieContext';
import { useUser } from '../context/UserContext';

export const Settings: React.FC = () => {
  const { updateKeys, clearKeys, tmdbKey } = useMovies();
  const { updateGeminiKey, clearGeminiKey, geminiKey, clearProfile, watchlist, ratings } = useUser();

  // Form states
  const [localTmdbKey, setLocalTmdbKey] = useState<string>(tmdbKey);
  const [localGeminiKey, setLocalGeminiKey] = useState<string>(geminiKey);

  // Field visibility states
  const [showTmdb, setShowTmdb] = useState<boolean>(false);
  const [showGemini, setShowGemini] = useState<boolean>(false);

  // Success messaging
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateKeys(localTmdbKey.trim());
    updateGeminiKey(localGeminiKey.trim());

    setSavedMessage('Credentials updated successfully!');
    setTimeout(() => setSavedMessage(null), 3000);
  };

  const handleClearAllKeys = () => {
    clearKeys();
    clearGeminiKey();
    setLocalTmdbKey('');
    setLocalGeminiKey('');

    setSavedMessage('All credentials cleared.');
    setTimeout(() => setSavedMessage(null), 3000);
  };

  const handleResetUserData = () => {
    if (window.confirm('Are you sure you want to delete all watchlist items and rating history? This cannot be undone.')) {
      clearProfile();
      localStorage.removeItem('movie_app_gemini_recs_cache'); // clear cached ai suggestions
      alert('Watchlist and rating history cleared.');
    }
  };

  return (
    <div className="space-y-8 text-left max-w-4xl">
      <div className="space-y-2">
        <h1 className="text-3xl font-black text-white tracking-tight">Configuration Settings</h1>
        <p className="text-gray-400 text-sm">
          Manage your API integrations and customize your profile preferences.
        </p>
      </div>

      {savedMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-sm font-semibold flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 shrink-0" />
          <span>{savedMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: API Keys Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="glass-card rounded-3xl border border-[#1a1a24] p-6 space-y-6">
            <h3 className="text-lg font-bold text-white tracking-tight">API Integrations</h3>

            {/* TMDB Key Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5" />
                  <span>TMDB Read Access Token / API Key</span>
                </label>
              </div>
              <div className="relative">
                <input
                  type={showTmdb ? 'text' : 'password'}
                  value={localTmdbKey}
                  onChange={(e) => setLocalTmdbKey(e.target.value)}
                  placeholder="Enter TMDB API Key or Read Access Token (v4)"
                  className="w-full bg-[#050507] border border-[#2e2e3f] rounded-xl pl-4 pr-10 py-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowTmdb(prev => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  {showTmdb ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Gemini Key Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5" />
                  <span>Google Gemini API Key</span>
                </label>
              </div>
              <div className="relative">
                <input
                  type={showGemini ? 'text' : 'password'}
                  value={localGeminiKey}
                  onChange={(e) => setLocalGeminiKey(e.target.value)}
                  placeholder="Enter Gemini AI API Key"
                  className="w-full bg-[#050507] border border-[#2e2e3f] rounded-xl pl-4 pr-10 py-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowGemini(prev => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  {showGemini ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Form actions */}
            <div className="flex gap-4 pt-2">
              <button
                type="submit"
                className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 py-3 rounded-xl text-sm transition-transform active:scale-95 duration-100 cursor-pointer w-fit"
              >
                <Save className="w-4 h-4" />
                <span>Save Keys</span>
              </button>
              <button
                type="button"
                onClick={handleClearAllKeys}
                className="flex items-center justify-center gap-2 bg-[#0a0a0f] border border-white/5 hover:border-red-500/35 hover:text-red-400 text-gray-500 font-bold px-5 py-3 rounded-xl text-sm transition-colors duration-150 cursor-pointer"
              >
                Clear Keys
              </button>
            </div>
          </form>

          {/* Profile Reset Box */}
          <div className="glass-card rounded-3xl border border-red-500/10 p-6 space-y-4">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Danger Zone</h3>
              <p className="text-gray-400 text-xs leading-relaxed">
                Purge your locally saved watchlist and ratings profile. This resets the local recommendation engine's profile weights.
              </p>
            </div>
            <button
              onClick={handleResetUserData}
              className="flex items-center justify-center gap-2 bg-red-600/10 border border-red-500/20 hover:bg-red-600 text-red-400 hover:text-white font-bold px-5 py-3 rounded-xl text-sm transition-all duration-150 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Reset Recommendations Profile</span>
            </button>
          </div>
        </div>

        {/* Right Column: Key Instructions */}
        <div className="space-y-6">
          <div className="glass-card rounded-3xl border border-[#1a1a24] p-6 space-y-6">
            <h3 className="text-base font-bold text-white flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-purple-400" />
              <span>Help Center</span>
            </h3>

            {/* Instruction 1: TMDB */}
            <div className="space-y-2 text-xs leading-relaxed">
              <h4 className="font-bold text-white text-xs">How to get a TMDB API Key:</h4>
              <ol className="list-decimal pl-4 text-gray-400 space-y-1.5">
                <li>Create an account at <a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">themoviedb.org</a>.</li>
                <li>Go to your Profile settings &rarr; API.</li>
                <li>Request an API key (select "Developer" type).</li>
                <li>Generate and copy your <strong>API Key (v3)</strong> or <strong>Read Access Token (v4)</strong>.</li>
              </ol>
            </div>

            {/* Instruction 2: Gemini */}
            <div className="space-y-2 text-xs leading-relaxed">
              <h4 className="font-bold text-white text-xs">How to get a Gemini API Key:</h4>
              <ol className="list-decimal pl-4 text-gray-400 space-y-1.5">
                <li>Navigate to <a href="https://aistudio.google.com" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">Google AI Studio</a>.</li>
                <li>Sign in with your Google account.</li>
                <li>Click <strong>"Get API Key"</strong> in the top-left sidebar.</li>
                <li>Create a key in a new project and copy it.</li>
              </ol>
            </div>

            {/* Local Stats Box */}
            <div className="pt-4 border-t border-[#1a1a24] space-y-2 text-xs">
              <h4 className="font-bold text-white text-xs">Local Database Metrics</h4>
              <div className="flex justify-between text-gray-400">
                <span>Watchlist Items:</span>
                <span className="font-bold text-white">{watchlist.length}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Rated Movies:</span>
                <span className="font-bold text-white">{Object.keys(ratings).length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
