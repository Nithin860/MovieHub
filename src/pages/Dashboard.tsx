import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { User as UserIcon, Mail, Phone, Lock, Save, AlertCircle, CheckCircle, Shield, Loader, Eye, EyeOff } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user, updateProfile, loading } = useUser();

  const [username, setUsername] = useState(user?.username || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!username.trim() || username.trim().length < 3) {
      setError('Username must be at least 3 characters long.');
      return;
    }

    if (phone.trim()) {
      const cleanPhone = phone.trim().replace(/\D/g, '');
      if (cleanPhone.length !== 10) {
        setError('Phone number must be exactly 10 digits.');
        return;
      }
    }

    if (newPassword) {
      const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
      if (!strongPasswordRegex.test(newPassword)) {
        setError('Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character.');
        return;
      }

      if (newPassword !== confirmPassword) {
        setError('New passwords do not match.');
        return;
      }
    }

    try {
      await updateProfile({
        username: username.trim(),
        phone: phone.trim() ? phone.trim().replace(/\D/g, '') : undefined,
        password: newPassword ? newPassword : undefined
      });
      setSuccess('Profile updated successfully!');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile. Please try again.');
    }
  };

  const isAdmin = user && (
    user.username.toLowerCase() === 'kolluru nithiin' ||
    user.email?.toLowerCase() === 'nithinnani324@gmail.com' ||
    user.username.toLowerCase() === 'admin'
  );

  return (
    <div className="space-y-8 text-left max-w-3xl mx-auto py-4">
      {/* Header */}
      <div className="space-y-2 border-b border-white/10 pb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <UserIcon className="w-8 h-8 text-purple-400" />
            <span>User Dashboard</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Manage your personal profile, contact information, and security preferences.
          </p>
        </div>

        {isAdmin && (
          <div className="bg-purple-600/20 border border-purple-500/30 text-purple-300 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <Shield className="w-4 h-4" />
            <span>Admin Access Enabled</span>
          </div>
        )}
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 text-red-400 text-sm animate-fade-in">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Success alert */}
      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-start gap-3 text-emerald-400 text-sm animate-fade-in">
          <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {/* Edit Profile Form */}
      <form onSubmit={handleSubmit} className="glass-card rounded-3xl border border-white/5 p-8 space-y-6 shadow-2xl glow-card">
        <h3 className="text-xl font-bold text-white tracking-tight border-b border-white/5 pb-3">
          Account Details
        </h3>

        {/* Email Address (ReadOnly) */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Email Address (Non-changeable)
          </label>
          <div className="relative opacity-75">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500">
              <Mail className="w-5 h-5" />
            </span>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full pl-11 pr-4 py-3 bg-black/60 border border-white/5 rounded-2xl text-gray-400 cursor-not-allowed text-sm"
            />
          </div>
        </div>

        {/* Username */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Name / Username
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
              <UserIcon className="w-5 h-5" />
            </span>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Enter your name"
              disabled={loading}
              className="w-full pl-11 pr-4 py-3 bg-black/40 border border-white/5 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-all text-sm"
            />
          </div>
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
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
              placeholder="Enter 10-digit phone number"
              disabled={loading}
              className="w-full pl-11 pr-4 py-3 bg-black/40 border border-white/5 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-all text-sm"
            />
          </div>
        </div>

        {/* Password Security Section */}
        <div className="pt-4 border-t border-white/5 space-y-4">
          <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider">
            Change Password (Optional)
          </h4>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              New Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                <Lock className="w-5 h-5" />
              </span>
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Leave blank to keep current password"
                disabled={loading}
                className="w-full pl-11 pr-12 py-3 bg-black/40 border border-white/5 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-all text-sm"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(prev => !prev)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                <Lock className="w-5 h-5" />
              </span>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
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
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 mt-4 bg-purple-600 hover:bg-purple-700 active:scale-[0.98] text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-purple-500/25 border border-purple-500/30"
        >
          {loading ? (
            <Loader className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Save className="w-5 h-5" />
              <span>Save Dashboard Changes</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
