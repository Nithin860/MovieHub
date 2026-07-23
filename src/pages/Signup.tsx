import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Film, Mail, User, Lock, Phone, AlertCircle, Loader, CheckCircle, Eye, EyeOff } from 'lucide-react';

export const Signup: React.FC = () => {
  const { user, signupUser, loading } = useUser();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // 1. Username validation
    if (!username.trim() || username.trim().length < 3) {
      setError('Username must be at least 3 characters long.');
      return;
    }

    // 2. Email validation
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    // 3. Phone validation
    const cleanPhone = phone.trim().replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length !== 10) {
      setError('Phone number must be exactly 10 digits.');
      return;
    }

    // 4. Password validation (min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char)
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!strongPasswordRegex.test(password)) {
      setError('Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      await signupUser(username.trim(), email.trim(), password, cleanPhone);
      setSuccess('Account created successfully! Redirecting to login page...');
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] px-4 py-8">
      <div className="w-full max-w-md glass-card rounded-3xl p-8 shadow-2xl relative border border-white/5 glow-card">
        {/* Logo / Header */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="p-4 bg-purple-600/15 text-purple-400 rounded-2xl border border-purple-500/20">
            <Film className="w-8 h-8 animate-pulse" />
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">Create account</h2>
          <p className="text-gray-400 text-sm text-center">
            Sign up to unlock personalized AI recommendations
          </p>
        </div>

        {/* Error alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 text-red-400 text-sm animate-fade-in">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Success alert */}
        {success && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-start gap-3 text-emerald-400 text-sm animate-fade-in">
            <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              Username / Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                <User className="w-5 h-5" />
              </span>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="At least 3 characters"
                disabled={loading}
                className="w-full pl-11 pr-4 py-3 bg-black/40 border border-white/5 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-all text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
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
                placeholder="name@example.com"
                disabled={loading}
                className="w-full pl-11 pr-4 py-3 bg-black/40 border border-white/5 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-all text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              Phone Number
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                <Phone className="w-5 h-5" />
              </span>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="10-digit phone number"
                disabled={loading}
                className="w-full pl-11 pr-4 py-3 bg-black/40 border border-white/5 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-all text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                <Lock className="w-5 h-5" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Min 8 chars, Uppercase, Number & Special symbol"
                disabled={loading}
                className="w-full pl-11 pr-12 py-3 bg-black/40 border border-white/5 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-all text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                <Lock className="w-5 h-5" />
              </span>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                disabled={loading}
                className="w-full pl-11 pr-12 py-3 bg-black/40 border border-white/5 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-all text-sm"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(prev => !prev)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-2 bg-purple-600 hover:bg-purple-700 active:scale-[0.98] text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-purple-500/25 border border-purple-500/30"
          >
            {loading ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Toggle Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            Already have an account?
            <Link
              to="/login"
              className="ml-2 text-purple-400 hover:text-purple-300 font-semibold focus:outline-none cursor-pointer"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
