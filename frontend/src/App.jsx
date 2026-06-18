import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import AuthPages from './pages/AuthPages';
import Dashboard from './pages/Dashboard';
import AiCompanion from './pages/AiCompanion';
import MoodTracker from './pages/MoodTracker';
import MoodAnalytics from './pages/MoodAnalytics';
import Diary from './pages/Diary';
import Exercises from './pages/Exercises';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import { 
  Heart, 
  Home, 
  Smile, 
  BookOpen, 
  MessageCircle, 
  Dumbbell, 
  User, 
  Settings as SettingsIcon, 
  LogOut,
  Sun,
  Moon,
  Menu,
  X
} from 'lucide-react';

// Protected Route Guard
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// Layout wrapper for authenticated pages
function Layout({ children, theme, toggleTheme }) {
  const { user, logout, isMockMode } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Mood Tracker', path: '/mood', icon: Smile },
    { name: 'Mood Analytics', path: '/analytics', icon: Heart },
    { name: 'Diary Journal', path: '/diary', icon: BookOpen },
    { name: 'AI Companion', path: '/chat', icon: MessageCircle },
    { name: 'Self-Care Gym', path: '/exercises', icon: Dumbbell },
    { name: 'My Profile', path: '/profile', icon: User },
    { name: 'Settings', path: '/settings', icon: SettingsIcon },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout error:', err.message);
    }
  };

  const getAvatarLetter = () => {
    if (user?.displayName) return user.displayName.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return 'U';
  };

  const getAvatarColor = () => {
    switch (user?.photoURL) {
      case 'avatar2': return 'bg-emerald-500';
      case 'avatar3': return 'bg-sky-500';
      case 'avatar4': return 'bg-amber-500';
      case 'avatar5': return 'bg-rose-500';
      case 'avatar1':
      default: return 'bg-wellness-lavender-500';
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row transition-colors duration-300 dark:bg-wellness-dark-950 dark:text-gray-100">
      
      {/* Developer banner for Mock Mode */}
      {isMockMode && (
        <div className="bg-amber-500 text-white text-xs py-1 px-4 text-center font-medium absolute top-0 left-0 right-0 z-50 flex items-center justify-center gap-1.5 shadow-sm">
          <span>⚠️ Offline Mock Mode active (running locally without Firebase keys). Data is stored in LocalStorage.</span>
        </div>
      )}

      {/* Mobile Header */}
      <header className={`md:hidden flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-white/90 backdrop-blur-md dark:bg-wellness-dark-900/90 dark:border-wellness-dark-800/60 sticky top-0 z-40 ${isMockMode ? 'mt-6' : ''}`}>
        <div className="flex items-center gap-2">
          <Heart className="h-6 w-6 text-wellness-lavender-500 fill-wellness-lavender-200" />
          <span className="font-display font-bold text-lg text-gray-800 dark:text-white">Peaceful Mind</span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleTheme} 
            className="p-2 rounded-xl bg-gray-50 text-gray-500 hover:text-gray-700 dark:bg-wellness-dark-800 dark:text-gray-300 dark:hover:text-white transition-all duration-200"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-wellness-dark-800 text-gray-600 dark:text-gray-300"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}>
          <nav 
            className="w-64 max-w-xs h-full bg-white dark:bg-wellness-dark-900 p-5 flex flex-col justify-between shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center gap-2 mb-8">
                <Heart className="h-6 w-6 text-wellness-lavender-500 fill-wellness-lavender-200" />
                <span className="font-display font-bold text-lg text-gray-800 dark:text-white">Peaceful Mind</span>
              </div>
              <div className="space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive(item.path)
                          ? 'bg-wellness-lavender-100 text-wellness-lavender-800 dark:bg-wellness-lavender-900/30 dark:text-wellness-lavender-200'
                          : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-wellness-dark-800'
                      }`}
                    >
                      <Icon size={18} />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-100 dark:border-wellness-dark-800 flex flex-col gap-3">
              <div className="flex items-center gap-3 px-3 py-1">
                <div className={`h-9 w-9 rounded-full ${getAvatarColor()} flex items-center justify-center text-white font-bold text-sm shadow-inner`}>
                  {getAvatarLetter()}
                </div>
                <div className="truncate">
                  <p className="text-sm font-semibold truncate max-w-[130px]">{user?.displayName || 'Mindful User'}</p>
                  <p className="text-xs text-gray-400 truncate max-w-[130px]">{user?.email}</p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all duration-200"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </div>
          </nav>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col justify-between w-68 bg-white border-r border-gray-100 dark:bg-wellness-dark-900 dark:border-wellness-dark-800/60 p-6 sticky top-0 h-screen ${isMockMode ? 'pt-12' : ''}`}>
        <div>
          <div className="flex items-center gap-2.5 mb-8">
            <Heart className="h-7 w-7 text-wellness-lavender-500 fill-wellness-lavender-200" />
            <span className="font-display font-bold text-xl text-gray-800 dark:text-white">Peaceful Mind</span>
          </div>

          <nav className="space-y-1.5">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-wellness-lavender-100 text-wellness-lavender-700 dark:bg-wellness-lavender-900/30 dark:text-wellness-lavender-200 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-wellness-dark-800'
                  }`}
                >
                  <Icon size={18} className={isActive(item.path) ? 'text-wellness-lavender-600 dark:text-wellness-lavender-400' : ''} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between px-3 py-1">
            <span className="text-xs text-gray-400 font-medium">Dark Mode</span>
            <button 
              onClick={toggleTheme} 
              className="p-2 rounded-xl bg-gray-50 text-gray-500 hover:text-gray-700 dark:bg-wellness-dark-800 dark:text-gray-300 dark:hover:text-white transition-all duration-200 shadow-inner"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-wellness-dark-800 flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 truncate">
              <div className={`h-10 w-10 rounded-full ${getAvatarColor()} flex items-center justify-center text-white font-bold text-base shadow-sm`}>
                {getAvatarLetter()}
              </div>
              <div className="truncate text-left">
                <p className="text-sm font-semibold truncate max-w-[110px]">{user?.displayName || 'Mindful User'}</p>
                <p className="text-xs text-gray-400 truncate max-w-[110px]">{user?.email}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              title="Sign Out"
              className="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all duration-200"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className={`flex-1 p-5 md:p-8 overflow-y-auto max-h-screen ${isMockMode ? 'md:pt-16 pt-12' : ''}`}>
        <div className="max-w-6xl mx-auto w-full">
          {children}
        </div>
      </main>

    </div>
  );
}

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('pm_theme') || 'light');

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
  };

  useEffect(() => {
    localStorage.setItem('pm_theme', theme);
    const body = document.body;
    if (theme === 'dark') {
      body.classList.add('dark');
      body.style.backgroundColor = '#0b0f19';
    } else {
      body.classList.remove('dark');
      body.style.backgroundColor = '#f0f9ff40';
    }
  }, [theme]);

  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Landing Route */}
          <Route path="/" element={<LandingPage />} />

          {/* Public Auth Routes */}
          <Route path="/login" element={<AuthPages defaultTab="login" />} />
          <Route path="/register" element={<AuthPages defaultTab="register" />} />

          {/* Protected Main Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Layout theme={theme} toggleTheme={toggleTheme}><Dashboard /></Layout></ProtectedRoute>} />
          <Route path="/mood" element={<ProtectedRoute><Layout theme={theme} toggleTheme={toggleTheme}><MoodTracker /></Layout></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><Layout theme={theme} toggleTheme={toggleTheme}><MoodAnalytics /></Layout></ProtectedRoute>} />
          <Route path="/diary" element={<ProtectedRoute><Layout theme={theme} toggleTheme={toggleTheme}><Diary /></Layout></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><Layout theme={theme} toggleTheme={toggleTheme}><AiCompanion /></Layout></ProtectedRoute>} />
          <Route path="/exercises" element={<ProtectedRoute><Layout theme={theme} toggleTheme={toggleTheme}><Exercises /></Layout></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Layout theme={theme} toggleTheme={toggleTheme}><Profile /></Layout></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Layout theme={theme} toggleTheme={toggleTheme}><Settings theme={theme} toggleTheme={toggleTheme} /></Layout></ProtectedRoute>} />

          {/* Fallback Catch-All */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
