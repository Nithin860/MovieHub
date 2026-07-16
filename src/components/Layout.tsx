import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Home, Search, Sparkles, Bookmark, Settings, Menu, X, Film, LogOut } from 'lucide-react';
import { useMovies } from '../context/MovieContext';
import { useUser } from '../context/UserContext';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { demoMode } = useMovies();
  const { user, logoutUser } = useUser();

  const navItems = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/search', label: 'Search', icon: Search },
    { to: '/recommendations', label: 'AI Recommend', icon: Sparkles },
    { to: '/watchlist', label: 'Watchlist', icon: Bookmark },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-[#050507] text-[#f3f4f6] flex flex-col justify-center">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050507] text-[#f3f4f6] flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden glass-panel fixed top-0 left-0 right-0 z-50 px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-purple-400 font-bold text-lg">
          <Film className="w-5 h-5" />
          <span>CineMatch</span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(prev => !prev)}
          className="p-1 text-gray-400 hover:text-white focus:outline-none"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 fixed top-0 bottom-0 left-0 z-40 bg-[#09090d] border-r border-[#1a1a24] p-6 justify-between">
        <div className="space-y-8 w-full">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 text-purple-400 font-extrabold text-2xl tracking-tight px-2">
            <Film className="w-7 h-7 animate-pulse" />
            <span>CineMatch</span>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-sm font-medium ${
                    isActive
                      ? 'bg-purple-600/15 text-purple-400 border border-purple-500/20'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'
                  }`
                }
              >
                <item.icon className="w-5 h-5 group-hover:scale-105 transition-transform" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer (Logout + Badge) */}
        <div className="space-y-4 w-full">
          <button
            onClick={logoutUser}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 text-gray-400 hover:bg-red-500/10 hover:text-red-400 border border-transparent text-sm font-medium cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>

          {/* Demo Mode Badge */}
          <div className="px-2">
            {demoMode ? (
              <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl p-3 text-xs text-amber-400/90 text-center">
                <p className="font-semibold mb-1">Demo Mode Active</p>
                <p className="opacity-75">Connect API keys in settings to unlock real TMDB & Gemini AI features.</p>
              </div>
            ) : (
              <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-xl p-3 text-xs text-emerald-400/90 text-center">
                <span className="font-semibold">Live Mode Connected</span>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          {/* Backdrop overlay */}
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />

          {/* Navigation panel */}
          <nav className="relative flex flex-col w-4/5 max-w-xs h-full bg-[#09090d] p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#1a1a24]">
              <Link to="/" className="flex items-center gap-2 text-purple-400 font-bold text-lg" onClick={() => setMobileMenuOpen(false)}>
                <Film className="w-5 h-5" />
                <span>CineMatch</span>
              </Link>
              <button onClick={() => setMobileMenuOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 space-y-2">
              {navItems.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-semibold transition-all ${
                      isActive
                        ? 'bg-purple-600/15 text-purple-400 border border-purple-500/20'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </NavLink>
              ))}

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logoutUser();
                }}
                className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-base font-semibold transition-all text-gray-400 hover:bg-red-500/10 hover:text-red-400 border border-transparent cursor-pointer"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>

            {/* Mobile Badge */}
            <div className="pt-4 border-t border-[#1a1a24]">
              {demoMode ? (
                <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl p-3 text-xs text-amber-400 text-center">
                  Demo Mode Active
                </div>
              ) : (
                <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-xl p-3 text-xs text-emerald-400 text-center">
                  Live Mode Connected
                </div>
              )}
            </div>
          </nav>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 px-4 py-20 md:py-10 md:px-10 max-w-7xl mx-auto w-full transition-all duration-300">
        {children}
      </main>
    </div>
  );
};
