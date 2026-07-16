import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Film, Mail, User, Lock, AlertCircle, Loader } from 'lucide-react';

export const Login: React.FC = () => {
  const { user, loginUser, signupUser, loading } = useUser();
  const navigate = useNavigate();

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim()) {
      setError(isLoginMode ? 'Username or Email is required.' : 'Username is required.');
      return;
    }

    if (!isLoginMode) {
      if (!email.trim()) {
        setError('Email is required.');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError('Please enter a valid email address.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      if (isLoginMode) {
        await loginUser(username, password);
      } else {
        await signupUser(username.trim(), email.trim(), password);
      }
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="w-full max-w-md glass-card rounded-3xl p-8 shadow-2xl relative border border-white/5 glow-card">
        {/* Logo / Header */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="p-4 bg-purple-600/15 text-purple-400 rounded-2xl border border-purple-500/20">
            <Film className="w-8 h-8 animate-pulse" />
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">
            {isLoginMode ? 'Welcome back' : 'Create account'}
          </h2>
          <p className="text-gray-400 text-sm text-center">
            {isLoginMode
              ? 'Sign in to access your CineMatch dashboard'
              : 'Sign up to unlock personalized AI recommendations'}
          </p>
        </div>

        {/* Error alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 text-red-400 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              {isLoginMode ? 'Username or Email' : 'Username'}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                {isLoginMode ? <Mail className="w-5 h-5" /> : <User className="w-5 h-5" />}
              </span>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder={isLoginMode ? 'Enter username or email' : 'Choose a username'}
                disabled={loading}
                className="w-full pl-11 pr-4 py-3 bg-black/40 border border-white/5 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-all text-sm"
              />
            </div>
          </div>

          {!isLoginMode && (
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                  <Mail className="w-5 h-5" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  disabled={loading}
                  className="w-full pl-11 pr-4 py-3 bg-black/40 border border-white/5 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-all text-sm"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                <Lock className="w-5 h-5" />
              </span>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter password"
                disabled={loading}
                className="w-full pl-11 pr-4 py-3 bg-black/40 border border-white/5 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-all text-sm"
              />
            </div>
          </div>

          {!isLoginMode && (
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  disabled={loading}
                  className="w-full pl-11 pr-4 py-3 bg-black/40 border border-white/5 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-all text-sm"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-2 bg-purple-600 hover:bg-purple-700 active:scale-[0.98] text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-purple-500/25 border border-purple-500/30"
          >
            {loading ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : isLoginMode ? (
              'Sign In'
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm">
            {isLoginMode ? "Don't have an account?" : 'Already have an account?'}
            <button
              onClick={() => {
                setIsLoginMode(prev => !prev);
                setError(null);
              }}
              disabled={loading}
              className="ml-2 text-purple-400 hover:text-purple-300 font-semibold focus:outline-none cursor-pointer"
            >
              {isLoginMode ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
