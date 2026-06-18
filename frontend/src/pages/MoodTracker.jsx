import React, { useState, useEffect } from 'react';
import { getMoods, logMood, deleteMood } from '../services/api';
import { Smile, Calendar, Trash2, AlertCircle, CheckCircle, Star } from 'lucide-react';

export default function MoodTracker() {
  const [moods, setMoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [selectedMood, setSelectedMood] = useState('Calm');
  const [note, setNote] = useState('');
  const [rating, setRating] = useState(7); // default intensity
  const [stars, setStars] = useState(4); // 1-5 overall wellness stars
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Static Mood library
  const MOOD_TYPES = [
    { name: 'Calm', emoji: '🧘', color: 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100/50 dark:bg-emerald-950/20 dark:text-emerald-300 dark:border-emerald-900/30' },
    { name: 'Happy', emoji: '😊', color: 'bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100/50 dark:bg-amber-950/20 dark:text-amber-300 dark:border-amber-900/30' },
    { name: 'Sad', emoji: '😢', color: 'bg-sky-50 text-sky-700 border-sky-100 hover:bg-sky-100/50 dark:bg-sky-950/20 dark:text-sky-300 dark:border-sky-900/30' },
    { name: 'Anxious', emoji: '😰', color: 'bg-purple-50 text-purple-700 border-purple-100 hover:bg-purple-100/50 dark:bg-purple-950/20 dark:text-purple-300 dark:border-purple-900/30' },
    { name: 'Stressed', emoji: '😫', color: 'bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-100/50 dark:bg-rose-950/20 dark:text-rose-300 dark:border-rose-900/30' },
    { name: 'Angry', emoji: '😠', color: 'bg-red-50 text-red-700 border-red-100 hover:bg-red-100/50 dark:bg-red-950/20 dark:text-red-300 dark:border-red-900/30' },
    { name: 'Tired', emoji: '😴', color: 'bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100/50 dark:bg-indigo-950/20 dark:text-indigo-300 dark:border-indigo-900/30' }
  ];

  useEffect(() => {
    fetchMoodHistory();
  }, []);

  const fetchMoodHistory = async () => {
    setLoadingHistory(true);
    try {
      const history = await getMoods();
      setMoods(history);
    } catch (err) {
      console.error('Failed to load mood history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const data = await logMood(selectedMood, note, rating);
      setSuccessMsg('Mood logged successfully!');
      
      // Reset inputs
      setNote('');
      setRating(7);
      setStars(4);

      // Prepend entry locally to avoid refetching
      setMoods(prev => [data, ...prev]);

      // Clear success feedback toast after 3s
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to save mood log.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this mood log?')) return;
    try {
      await deleteMood(id);
      setMoods(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      console.error('Failed to delete mood log:', err);
      alert('Failed to delete mood log entry');
    }
  };

  const getMoodConfig = (name) => {
    return MOOD_TYPES.find(m => m.name === name) || { emoji: '😐', color: 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-wellness-dark-800' };
  };

  return (
    <div className="space-y-6 text-left pb-10">
      
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-display font-bold tracking-tight">Mood Tracker</h1>
        <p className="text-gray-400 text-sm">Monitor how you feel over time to optimize your self-care routines.</p>
      </div>

      <div className="grid md:grid-cols-5 gap-6 items-start">
        
        {/* Log Mood Column */}
        <div className="glass-card p-6 md:col-span-2 space-y-6 border-gray-100 dark:border-wellness-dark-800 bg-white dark:bg-wellness-dark-900">
          <h2 className="font-semibold text-lg border-b border-gray-50 dark:border-wellness-dark-800 pb-3">
            How are you feeling?
          </h2>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold flex items-center gap-2 border border-rose-100 dark:bg-rose-950/20 dark:text-rose-300 dark:border-rose-900/30">
              <AlertCircle size={14} />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold flex items-center gap-2 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-300 dark:border-emerald-900/30">
              <CheckCircle size={14} />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Mood selector grid */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Select Mood</span>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {MOOD_TYPES.map(m => {
                  const isSelected = selectedMood === m.name;
                  return (
                    <button
                      key={m.name}
                      type="button"
                      onClick={() => setSelectedMood(m.name)}
                      className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-2xl border text-xs font-semibold gap-1.5 transition-all duration-200 ${
                        isSelected 
                          ? 'bg-wellness-lavender-600 border-wellness-lavender-600 text-white shadow-md scale-105' 
                          : `${m.color}`
                      }`}
                    >
                      <span className="text-2xl select-none">{m.emoji}</span>
                      <span>{m.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Intensity slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Mood Intensity</span>
                <span className="text-sm font-bold text-wellness-lavender-600 dark:text-wellness-lavender-400">
                  {rating}/10
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={rating}
                onChange={(e) => setRating(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-wellness-lavender-500 dark:bg-wellness-dark-800"
              />
              <div className="flex justify-between text-[10px] text-gray-400 px-0.5">
                <span>Very Mild</span>
                <span>Moderate</span>
                <span>Very Intense</span>
              </div>
            </div>

            {/* Stars rating selection */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Daily Wellness rating</span>
              <div className="flex items-center gap-1.5 pt-1">
                {[1, 2, 3, 4, 5].map(index => {
                  const isFilled = index <= stars;
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setStars(index)}
                      className="text-gray-300 hover:text-amber-400 transition-colors"
                    >
                      <Star 
                        size={24} 
                        className={isFilled ? 'text-amber-400 fill-amber-400' : 'text-gray-200 dark:text-wellness-dark-800'} 
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mood note */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Add Context notes</span>
              <textarea
                rows="3"
                placeholder="What triggered this feeling? Work, family, exercise, weather, sleep..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="glass-input text-sm resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 mt-2 font-semibold"
            >
              {loading ? 'Logging Entry...' : 'Save Mood Log'}
            </button>

          </form>
        </div>

        {/* Mood History Timeline Column */}
        <div className="glass-card p-6 md:col-span-3 space-y-4 border-gray-100 dark:border-wellness-dark-800">
          <h2 className="font-semibold text-lg border-b border-gray-50 dark:border-wellness-dark-800 pb-3">
            Mood Check-in History
          </h2>

          {loadingHistory ? (
            <div className="flex justify-center py-12">
              <div className="h-6 w-6 border-2 border-wellness-lavender-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : moods.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400 gap-2">
              <Smile size={32} strokeWidth={1.5} />
              <p className="text-sm">No logged moods yet. Complete your first check-in!</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[64vh] overflow-y-auto pr-1">
              {moods.map((log) => {
                const conf = getMoodConfig(log.mood);
                return (
                  <div 
                    key={log.id} 
                    className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 flex justify-between items-start dark:bg-wellness-dark-900 dark:border-wellness-dark-800/80 group"
                  >
                    <div className="space-y-2 flex-1 pr-4">
                      
                      {/* Header tags */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${conf.color}`}>
                          <span>{conf.emoji}</span>
                          <span>{log.mood}</span>
                        </span>
                        
                        <span className="text-[10px] font-bold text-wellness-lavender-500 dark:text-wellness-lavender-400 bg-wellness-lavender-50/50 dark:bg-wellness-lavender-950/20 px-2 py-0.5 rounded-lg">
                          Intensity: {log.rating}/10
                        </span>

                        <span className="text-xs text-gray-400 flex items-center gap-1 ml-auto">
                          <Calendar size={12} />
                          {new Date(log.timestamp).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>

                      {/* Content Notes */}
                      {log.note ? (
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                          {log.note}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-400 italic">No notes written for this log.</p>
                      )}
                    </div>

                    <button 
                      onClick={() => handleDelete(log.id)}
                      title="Delete log"
                      className="p-2 text-gray-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-all duration-200 shrink-0"
                    >
                      <Trash2 size={16} />
                    </button>

                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
