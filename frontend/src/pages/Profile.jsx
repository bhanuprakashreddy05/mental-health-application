import React, { useEffect, useState } from 'react';
import { getProfile, updateProfile } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Edit3, Check, Award, Calendar, BarChart, BookOpen, Star, Activity, Dumbbell } from 'lucide-react';

export default function Profile() {
  const { user, updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  
  // Editor states
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.photoURL || 'avatar1');
  const [saving, setSaving] = useState(false);

  const avatars = [
    { id: 'avatar1', label: 'Lover of Quiet', emoji: '🧘', color: 'bg-wellness-lavender-500' },
    { id: 'avatar2', label: 'Nature Dreamer', emoji: '🌱', color: 'bg-emerald-500' },
    { id: 'avatar3', label: 'Ocean Navigator', emoji: '⛵', color: 'bg-sky-500' },
    { id: 'avatar4', label: 'Sun Seeker', emoji: '☀️', color: 'bg-amber-500' },
    { id: 'avatar5', label: 'Cozy Rest', emoji: '☕', color: 'bg-rose-500' }
  ];

  useEffect(() => {
    fetchProfileDetails();
  }, []);

  const fetchProfileDetails = async () => {
    setLoading(true);
    try {
      const data = await getProfile();
      setStats(data.stats);
      setDisplayName(data.profile.displayName);
      setSelectedAvatar(data.profile.photoURL || 'avatar1');
    } catch (err) {
      console.error('Failed to load profile details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!displayName.trim() || saving) return;

    setSaving(true);
    try {
      // 1. Save to backend database
      await updateProfile(displayName, selectedAvatar);
      
      // 2. Sync local Auth State
      await updateUserProfile(displayName, selectedAvatar);
      
      setIsEditing(false);
      alert('Profile details updated successfully!');
    } catch (err) {
      console.error('Failed to save profile modifications:', err);
      alert('Failed to update profile details');
    } finally {
      setSaving(false);
    }
  };

  const getAvatarLetter = () => {
    return displayName ? displayName.charAt(0).toUpperCase() : 'U';
  };

  const getActiveAvatarConfig = () => {
    return avatars.find(av => av.id === selectedAvatar) || avatars[0];
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="h-8 w-8 border-3 border-wellness-lavender-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-gray-400">Loading your profile statistics...</p>
      </div>
    );
  }

  const activeAvatar = getActiveAvatarConfig();

  return (
    <div className="space-y-6 text-left pb-10">
      
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-display font-bold tracking-tight">My Profile</h1>
        <p className="text-gray-400 text-sm">Review your achievements and modify your account details.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 items-start">
        
        {/* Profile Card & Details Form */}
        <div className="glass-card p-6 border-gray-100 dark:border-wellness-dark-800 bg-white dark:bg-wellness-dark-900 space-y-6">
          
          <div className="text-center relative">
            
            {/* Display Avatar */}
            <div className={`h-24 w-24 rounded-full ${activeAvatar.color} text-white font-bold text-3xl shadow-md flex items-center justify-center mx-auto mb-4 border-4 border-white dark:border-wellness-dark-800`}>
              {getAvatarLetter()}
            </div>
            
            <span className="text-2xl absolute bottom-3 right-[38%] bg-white dark:bg-wellness-dark-800 p-1 rounded-full shadow-md select-none border border-gray-50 dark:border-wellness-dark-800">
              {activeAvatar.emoji}
            </span>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            
            {/* Display Name Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Display Name</label>
              {isEditing ? (
                <input
                  type="text"
                  required
                  placeholder="Enter your name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="glass-input text-sm py-2"
                />
              ) : (
                <div className="text-base font-bold text-gray-900 dark:text-white px-3 py-1.5 bg-gray-50/50 dark:bg-wellness-dark-800/40 rounded-xl">
                  {displayName || 'Mindful User'}
                </div>
              )}
            </div>

            {/* Email (Read only) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Email Address</label>
              <div className="text-sm text-gray-400 px-3 py-1.5 bg-gray-50/20 dark:bg-wellness-dark-800/20 rounded-xl truncate">
                {user?.email}
              </div>
            </div>

            {/* Avatar Selector Grid (Only in Edit Mode) */}
            {isEditing && (
              <div className="space-y-2">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Select Character avatar</span>
                <div className="grid grid-cols-5 gap-2">
                  {avatars.map(av => {
                    const isSelected = selectedAvatar === av.id;
                    return (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => setSelectedAvatar(av.id)}
                        title={av.label}
                        className={`h-10 w-10 rounded-full ${av.color} text-white text-base font-semibold flex items-center justify-center transition-all duration-200 ${
                          isSelected ? 'ring-4 ring-wellness-lavender-300 dark:ring-wellness-lavender-900 border border-white' : 'opacity-70 hover:opacity-100'
                        }`}
                      >
                        {av.emoji}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Edit / Save controls */}
            {isEditing ? (
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary flex-1 py-2 text-xs font-semibold"
                >
                  <Check size={14} /> Save Details
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setDisplayName(user?.displayName || '');
                    setSelectedAvatar(user?.photoURL || 'avatar1');
                  }}
                  className="btn-flat border border-gray-100 dark:border-wellness-dark-800 py-2 text-xs font-semibold"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="btn-secondary w-full py-2.5 text-xs font-semibold"
              >
                <Edit3 size={14} /> Modify Profile
              </button>
            )}

          </form>
        </div>

        {/* Stats Grid Dashboard */}
        <div className="md:col-span-2 space-y-6">
          
          <h2 className="font-semibold text-lg border-b border-gray-50 dark:border-wellness-dark-800 pb-3">
            Mindful Milestones
          </h2>

          <div className="grid grid-cols-2 gap-4">
            
            {/* Stat 1 */}
            <div className="glass-card p-5 border-gray-100 dark:border-wellness-dark-800 bg-white dark:bg-wellness-dark-900 flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl dark:bg-emerald-950/20 dark:text-emerald-400">
                <Activity size={24} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Mood Check-ins</span>
                <span className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{stats?.totalMoodsLogged || 0} Logs</span>
              </div>
            </div>

            {/* Stat 2 */}
            <div className="glass-card p-5 border-gray-100 dark:border-wellness-dark-800 bg-white dark:bg-wellness-dark-900 flex items-center gap-4">
              <div className="p-3 bg-wellness-blue-50 text-wellness-blue-600 rounded-2xl dark:bg-wellness-blue-950/20 dark:text-wellness-blue-400">
                <BookOpen size={24} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Journal Diary</span>
                <span className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{stats?.totalJournalsWritten || 0} Entries</span>
              </div>
            </div>

            {/* Stat 3 */}
            <div className="glass-card p-5 border-gray-100 dark:border-wellness-dark-800 bg-white dark:bg-wellness-dark-900 flex items-center gap-4">
              <div className="p-3 bg-wellness-lavender-50 text-wellness-lavender-600 rounded-2xl dark:bg-wellness-lavender-950/20 dark:text-wellness-lavender-400">
                <Dumbbell size={24} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Exercises Done</span>
                <span className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{stats?.totalExercisesCompleted || 0} Sessions</span>
              </div>
            </div>

            {/* Stat 4 */}
            <div className="glass-card p-5 border-gray-100 dark:border-wellness-dark-800 bg-white dark:bg-wellness-dark-900 flex items-center gap-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl dark:bg-amber-950/20 dark:text-amber-400">
                <Award size={24} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Self-Care Time</span>
                <span className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{stats?.totalMeditationMinutes || 0} Minutes</span>
              </div>
            </div>

          </div>

          {/* Achievement badge summary */}
          <div className="glass-card p-6 border-gray-100 dark:border-wellness-dark-800 bg-white dark:bg-wellness-dark-900">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-4">Earned Badges</h3>
            <div className="flex gap-4 flex-wrap">
              
              <div className="flex flex-col items-center gap-2 max-w-[80px]">
                <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center text-xl shadow-sm select-none" title="Logged mood 3 days consecutively">
                  🌱
                </div>
                <span className="text-[10px] font-semibold text-center leading-tight">First Sprout</span>
              </div>

              {(stats?.totalJournalsWritten || 0) >= 1 && (
                <div className="flex flex-col items-center gap-2 max-w-[80px] animate-fade-in">
                  <div className="h-12 w-12 rounded-full bg-wellness-blue-50 text-wellness-blue-600 border border-wellness-blue-100 flex items-center justify-center text-xl shadow-sm select-none" title="Wrote first diary log">
                    ✍️
                  </div>
                  <span className="text-[10px] font-semibold text-center leading-tight">Scribe</span>
                </div>
              )}

              {(stats?.totalMeditationMinutes || 0) >= 1 && (
                <div className="flex flex-col items-center gap-2 max-w-[80px] animate-fade-in">
                  <div className="h-12 w-12 rounded-full bg-wellness-lavender-50 text-wellness-lavender-600 border border-wellness-lavender-100 flex items-center justify-center text-xl shadow-sm select-none" title="Completed first exercise">
                    🌀
                  </div>
                  <span className="text-[10px] font-semibold text-center leading-tight">Breather</span>
                </div>
              )}

            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
