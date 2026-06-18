import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sun, Moon, Bell, Shield, LogOut, Code, AlertTriangle } from 'lucide-react';

export default function Settings({ theme, toggleTheme }) {
  const { logout, isMockMode, isFirebaseConfigured, toggleMockMode } = useAuth();
  
  // Settings switches
  const [reminders, setReminders] = useState(true);
  const [remindersTime, setRemindersTime] = useState('20:00');

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      await logout();
    }
  };

  const handleRemindersToggle = () => {
    setReminders(!reminders);
    if (!reminders) {
      console.log('WorkManager reminder alarm scheduled for ' + remindersTime);
    } else {
      console.log('WorkManager reminder alarm cancelled');
    }
  };

  return (
    <div className="space-y-6 text-left pb-10">
      
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-display font-bold tracking-tight">Settings</h1>
        <p className="text-gray-400 text-sm">Configure application behavior, appearance, and connectivity.</p>
      </div>

      <div className="max-w-2xl space-y-6">
        
        {/* Appearance Settings */}
        <div className="glass-card p-6 border-gray-100 dark:border-wellness-dark-800 bg-white dark:bg-wellness-dark-900 space-y-4">
          <h3 className="font-semibold text-base border-b border-gray-50 dark:border-wellness-dark-800 pb-3 flex items-center gap-2">
            <Sun className="text-wellness-lavender-500" size={18} />
            Appearance
          </h3>

          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-white">Dark Mode Theme</p>
              <p className="text-xs text-gray-400 mt-0.5">Toggle light or dark styling parameters across the entire app.</p>
            </div>
            
            <button
              onClick={toggleTheme}
              className={`w-12 h-6.5 rounded-full p-1 transition-colors duration-200 focus:outline-none ${
                theme === 'dark' ? 'bg-wellness-lavender-600' : 'bg-gray-200'
              }`}
            >
              <div
                className={`h-4.5 w-4.5 rounded-full bg-white transition-transform duration-200 flex items-center justify-center text-[10px] ${
                  theme === 'dark' ? 'translate-x-5.5' : 'translate-x-0'
                }`}
              >
                {theme === 'dark' ? '🌙' : '☀️'}
              </div>
            </button>
          </div>
        </div>

        {/* Notifications Settings */}
        <div className="glass-card p-6 border-gray-100 dark:border-wellness-dark-800 bg-white dark:bg-wellness-dark-900 space-y-4">
          <h3 className="font-semibold text-base border-b border-gray-50 dark:border-wellness-dark-800 pb-3 flex items-center gap-2">
            <Bell className="text-wellness-blue-500" size={18} />
            Reminders & Notifications
          </h3>

          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-white">Daily Self-Care Alarms</p>
              <p className="text-xs text-gray-400 mt-0.5">Receive a gentle reminder notification to check in your mood daily.</p>
            </div>

            <button
              onClick={handleRemindersToggle}
              className={`w-12 h-6.5 rounded-full p-1 transition-colors duration-200 focus:outline-none ${
                reminders ? 'bg-wellness-lavender-600' : 'bg-gray-200'
              }`}
            >
              <div
                className={`h-4.5 w-4.5 rounded-full bg-white transition-transform duration-200 ${
                  reminders ? 'translate-x-5.5' : 'translate-x-0'
                }`}
              ></div>
            </button>
          </div>

          {reminders && (
            <div className="flex items-center justify-between py-2 border-t border-gray-50 dark:border-wellness-dark-800/40 pt-4 animate-fade-in">
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-white">Reminder Time</p>
                <p className="text-xs text-gray-400 mt-0.5">Select your preferred check-in time.</p>
              </div>
              <input
                type="time"
                value={remindersTime}
                onChange={(e) => setRemindersTime(e.target.value)}
                className="glass-input text-sm py-1.5 px-3 w-32 border border-gray-200 rounded-xl"
              />
            </div>
          )}
        </div>

        {/* Developer / Connectivity Settings */}
        <div className="glass-card p-6 border-gray-100 dark:border-wellness-dark-800 bg-white dark:bg-wellness-dark-900 space-y-4">
          <h3 className="font-semibold text-base border-b border-gray-50 dark:border-wellness-dark-800 pb-3 flex items-center gap-2">
            <Code className="text-emerald-500" size={18} />
            Developer Options
          </h3>

          <div className="space-y-4">
            
            {/* Status overview */}
            <div className="p-3 bg-gray-50 dark:bg-wellness-dark-850 rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500">Firebase Keys Configured</p>
                <p className="text-sm font-bold text-gray-800 dark:text-white mt-0.5">
                  {isFirebaseConfigured ? '🟢 Connected (Valid Keys)' : '🟡 Not Found (Vite placeholders)'}
                </p>
              </div>
              
              <div>
                <p className="text-xs font-semibold text-gray-500 text-right">Active Sandbox Mode</p>
                <p className="text-sm font-bold text-wellness-lavender-600 dark:text-wellness-lavender-400 mt-0.5 text-right">
                  {isMockMode ? 'LocalStorage Mock' : 'Firebase Auth & Firestore'}
                </p>
              </div>
            </div>

            {/* Toggle logic */}
            <div className="flex items-center justify-between py-1">
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-white">Force Sandbox Mock Mode</p>
                <p className="text-xs text-gray-400 mt-0.5">Runs application in offline demo mode using local browser storage.</p>
              </div>

              <button
                onClick={() => toggleMockMode(!isMockMode)}
                disabled={!isFirebaseConfigured}
                title={!isFirebaseConfigured ? 'Mock mode cannot be disabled as no Firebase credentials exist.' : ''}
                className={`w-12 h-6.5 rounded-full p-1 transition-colors duration-200 focus:outline-none ${
                  isMockMode ? 'bg-wellness-lavender-600' : 'bg-gray-200'
                } ${!isFirebaseConfigured ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div
                  className={`h-4.5 w-4.5 rounded-full bg-white transition-transform duration-200 ${
                    isMockMode ? 'translate-x-5.5' : 'translate-x-0'
                  }`}
                ></div>
              </button>
            </div>

            {!isFirebaseConfigured && (
              <div className="p-3 rounded-xl bg-amber-50 text-amber-800 text-[11px] leading-relaxed flex gap-2 border border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30">
                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                <span>
                  No Firebase API Keys were injected into the Web client variables. The application has safely default-selected Mock Sandbox mode. Data will persist in your current browser tab. To connect to a live Firebase, populate the `VITE_FIREBASE_` variables.
                </span>
              </div>
            )}

          </div>
        </div>

        {/* Security & Logout */}
        <div className="glass-card p-6 border-gray-100 dark:border-wellness-dark-800 bg-white dark:bg-wellness-dark-900 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl dark:bg-rose-950/20 dark:text-rose-400">
              <Shield size={18} />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-850 dark:text-white">Account Control</p>
              <p className="text-xs text-gray-400 mt-0.5">End your current session safely.</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="btn-flat text-rose-600 hover:bg-rose-50 border border-gray-100 dark:border-wellness-dark-800 dark:hover:bg-rose-950/20 py-2.5"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>

      </div>

    </div>
  );
}
