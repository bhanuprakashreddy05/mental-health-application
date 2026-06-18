import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Heart, Mail, Lock, User, Eye, EyeOff, AlertCircle, ArrowLeft } from 'lucide-react';

export default function AuthPages({ defaultTab = 'login' }) {
  const navigate = useNavigate();
  const { login, register, resetPassword } = useAuth();
  
  const [activeTab, setActiveTab] = useState(defaultTab); // 'login' | 'register' | 'forgot'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const clearMessages = () => {
    setError('');
    setSuccessMsg('');
  };

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    clearMessages();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);

    try {
      if (activeTab === 'login') {
        await login(email, password);
        navigate('/dashboard');
      } else if (activeTab === 'register') {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
        await register(name, email, password);
        navigate('/dashboard');
      } else if (activeTab === 'forgot') {
        if (!email) {
          throw new Error('Email is required');
        }
        await resetPassword(email);
        setSuccessMsg('Recovery email sent. Check your inbox to reset your password.');
      }
    } catch (err) {
      setError(err.message || 'An authentication error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    clearMessages();
    setLoading(true);
    try {
      await login('demo@peacemind.com', 'password123');
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to log in as Guest.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-sky-100/50 via-purple-50 to-emerald-50/30 flex items-center justify-center p-6 select-none">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-lg border border-white p-8 rounded-3xl shadow-xl flex flex-col justify-between dark:bg-wellness-dark-900/90 dark:border-wellness-dark-800">
        
        {/* Header Logo */}
        <div className="text-center mb-8">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-wellness-lavender-400 to-wellness-blue-400 text-white flex items-center justify-center mx-auto mb-3 shadow-md">
            <Heart className="h-6 w-6 fill-white/10" />
          </div>
          <h2 className="font-display font-bold text-2xl text-gray-900 dark:text-white">
            {activeTab === 'login' && 'Welcome Back'}
            {activeTab === 'register' && 'Create Account'}
            {activeTab === 'forgot' && 'Reset Password'}
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            {activeTab === 'login' && 'Your peaceful journey continues'}
            {activeTab === 'register' && 'Begin your path to mindful healing'}
            {activeTab === 'forgot' && 'Retrieve access to your self-care vault'}
          </p>
        </div>

        {/* Error / Success Banners */}
        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 text-rose-700 text-xs font-medium flex items-center gap-2 border border-rose-100 dark:bg-rose-950/20 dark:text-rose-300 dark:border-rose-900/30">
            <AlertCircle size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-medium flex items-center gap-2 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-300 dark:border-emerald-900/30">
            <AlertCircle size={14} className="shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Forms */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Display Name Input (Register Only) */}
          {activeTab === 'register' && (
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-gray-400" />
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="glass-input pl-10"
                />
              </div>
            </div>
          )}

          {/* Email Input */}
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-gray-400" />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="glass-input pl-10"
              />
            </div>
          </div>

          {/* Password Input (Login/Register Only) */}
          {activeTab !== 'forgot' && (
            <div className="space-y-1.5 text-left">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Password</label>
                {activeTab === 'login' && (
                  <button
                    type="button"
                    onClick={() => handleTabSwitch('forgot')}
                    className="text-xs font-medium text-wellness-lavender-500 hover:text-wellness-lavender-600 transition-colors"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="glass-input pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          )}

          {/* Confirm Password Input (Register Only) */}
          {activeTab === 'register' && (
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="glass-input pl-10"
                />
              </div>
            </div>
          )}

          {/* Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary mt-6 py-3 font-semibold"
          >
            {loading ? (
              <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                {activeTab === 'login' && 'Sign In'}
                {activeTab === 'register' && 'Sign Up'}
                {activeTab === 'forgot' && 'Send Recovery Link'}
              </>
            )}
          </button>
        </form>

        {/* Guest Session Button */}
        {activeTab === 'login' && (
          <div className="mt-4">
            <button
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full border border-gray-200 bg-white hover:bg-gray-50 dark:bg-wellness-dark-800 dark:border-wellness-dark-700 dark:hover:bg-wellness-dark-700 text-gray-600 dark:text-gray-300 font-semibold py-2.5 rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-1.5"
            >
              🚀 Try Demo Guest Session
            </button>
          </div>
        )}

        {/* Bottom Toggle links */}
        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-wellness-dark-800 text-center text-xs text-gray-400">
          {activeTab === 'login' && (
            <p>
              New to Peaceful Mind?{' '}
              <button
                onClick={() => handleTabSwitch('register')}
                className="font-semibold text-wellness-lavender-500 hover:underline"
              >
                Sign Up Now
              </button>
            </p>
          )}
          {activeTab === 'register' && (
            <p>
              Already have an account?{' '}
              <button
                onClick={() => handleTabSwitch('login')}
                className="font-semibold text-wellness-lavender-500 hover:underline"
              >
                Sign In
              </button>
            </p>
          )}
          {activeTab === 'forgot' && (
            <button
              onClick={() => handleTabSwitch('login')}
              className="inline-flex items-center gap-1 font-semibold text-wellness-lavender-500 hover:underline"
            >
              <ArrowLeft size={12} /> Back to Sign In
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
