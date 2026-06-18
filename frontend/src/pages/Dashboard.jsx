import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  getMoods, 
  getDiary, 
  getExerciseProgress, 
  getWellnessInsights, 
  refreshWellnessInsights 
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  Sparkles, 
  Plus, 
  Smile, 
  BookOpen, 
  MessageCircle, 
  Dumbbell, 
  TrendingUp, 
  Activity, 
  RotateCw 
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [moods, setMoods] = useState([]);
  const [diaryCount, setDiaryCount] = useState(0);
  const [exerciseMin, setExerciseMin] = useState(0);
  const [insight, setInsight] = useState('');
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [wellnessScore, setWellnessScore] = useState(70);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [moodList, diaryList, exerciseStats, insightsData] = await Promise.all([
        getMoods(),
        getDiary(),
        getExerciseProgress(),
        getWellnessInsights()
      ]);

      setMoods(moodList);
      setDiaryCount(diaryList.length);
      setExerciseMin(exerciseStats.totalMinutesCompleted || 0);
      setInsight(insightsData.insight);

      // Dynamically calculate Wellness Score out of 100
      // Formula: Base 50 + (Average Mood rating * 3) + (Journal entries count * 5) + (Meditation minutes * 0.5)
      let score = 50;
      if (moodList.length > 0) {
        const avgMoodRating = moodList.reduce((sum, item) => sum + (item.rating || 5), 0) / moodList.length;
        score += (avgMoodRating - 5) * 5; // offset -5, scales rating 1-10 to -25 to +25
      }
      score += diaryList.length * 4;
      score += (exerciseStats.totalMinutesCompleted || 0) * 0.4;
      
      // Clamp between 20 and 100
      setWellnessScore(Math.min(Math.max(Math.round(score), 20), 100));

    } catch (error) {
      console.error('Failed to load dashboard statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshInsight = async () => {
    setLoadingInsight(true);
    try {
      const data = await refreshWellnessInsights();
      setInsight(data.insight);
    } catch (err) {
      console.error('Failed to refresh wellness insights:', err);
    } finally {
      setLoadingInsight(false);
    }
  };

  const getLatestMoodEmoji = () => {
    if (moods.length === 0) return '❓';
    const m = moods[0].mood;
    switch (m) {
      case 'Happy': return '😊';
      case 'Sad': return '😢';
      case 'Angry': return '😠';
      case 'Anxious': return '😰';
      case 'Stressed': return '😫';
      case 'Calm': return '🧘';
      case 'Tired': return '😴';
      default: return '😐';
    }
  };

  const getWellnessMessage = () => {
    if (wellnessScore >= 85) return 'Your mental state is thriving! Keep up the outstanding self-care.';
    if (wellnessScore >= 70) return 'You are maintaining a balanced mind. Good progress on checking in.';
    if (wellnessScore >= 50) return 'A bit of mental fatigue detected. Consider a breathing or meditation break.';
    return 'Take some gentle time for yourself. Your mental battery needs recharging.';
  };

  // Format Recharts data (last 7 days of mood logs)
  const getChartData = () => {
    if (moods.length === 0) return [];
    
    // Sort and map the last 7 entries chronologically
    return [...moods]
      .slice(0, 7)
      .reverse()
      .map(m => {
        const date = new Date(m.timestamp);
        return {
          day: date.toLocaleDateString(undefined, { weekday: 'short' }),
          rating: m.rating,
          mood: m.mood
        };
      });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="h-8 w-8 border-3 border-wellness-lavender-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-gray-400">Restoring your peaceful sanctuary...</p>
      </div>
    );
  }

  const chartData = getChartData();

  return (
    <div className="space-y-6 text-left pb-10">
      
      {/* Welcome & Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">
            Hello, {user?.displayName || 'Mindful User'}
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">Let's check in with your mind and body today.</p>
        </div>
        <Link to="/mood" className="btn-primary">
          <Plus size={16} /> Log Current Mood
        </Link>
      </div>

      {/* Wellness Meter & Latest Status */}
      <div className="grid md:grid-cols-3 gap-6">
        
        {/* Wellness Score Card */}
        <div className="glass-card p-6 flex flex-col justify-between md:col-span-2 relative overflow-hidden bg-gradient-to-br from-wellness-blue-50/50 via-white to-white dark:from-wellness-dark-900 dark:to-wellness-dark-900 border-gray-100 dark:border-wellness-dark-800">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Daily Wellness score</span>
                <h3 className="text-4xl font-display font-bold text-gray-900 dark:text-white mt-1">
                  {wellnessScore}%
                </h3>
              </div>
              <div className="p-2 bg-wellness-blue-100 text-wellness-blue-600 rounded-xl dark:bg-wellness-blue-900/30 dark:text-wellness-blue-400">
                <Activity size={20} />
              </div>
            </div>
            
            {/* Custom wellness bar progress */}
            <div className="w-full bg-gray-100 dark:bg-wellness-dark-800 h-2.5 rounded-full mt-4 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-wellness-blue-400 to-wellness-lavender-500 h-full rounded-full transition-all duration-1000" 
                style={{ width: `${wellnessScore}%` }}
              ></div>
            </div>
          </div>
          
          <p className="text-xs text-gray-400 font-medium leading-relaxed mt-4">
            {getWellnessMessage()}
          </p>
        </div>

        {/* Latest Mood Card */}
        <div className="glass-card p-6 flex flex-col justify-between border-gray-100 dark:border-wellness-dark-800">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Latest Mood Status</span>
            <div className="flex items-center gap-3 mt-3">
              <span className="text-4xl select-none">{getLatestMoodEmoji()}</span>
              <div>
                <h4 className="font-semibold text-lg leading-tight">
                  {moods.length > 0 ? moods[0].mood : 'No Check-ins'}
                </h4>
                <p className="text-xs text-gray-400">
                  {moods.length > 0 ? `Logged ${new Date(moods[0].timestamp).toLocaleDateString()}` : 'Log your mood to start'}
                </p>
              </div>
            </div>
          </div>
          {moods.length > 0 && moods[0].note && (
            <p className="text-xs text-gray-500 italic truncate max-w-full border-t border-gray-100 dark:border-wellness-dark-800 pt-3.5 mt-4">
              "{moods[0].note}"
            </p>
          )}
        </div>

      </div>

      {/* AI Recommendations Banner */}
      <div className="glass-card p-6 bg-gradient-to-r from-wellness-lavender-50/50 via-white to-emerald-50/20 border-purple-100/50 dark:from-wellness-lavender-950/10 dark:via-wellness-dark-900 dark:to-emerald-950/10 dark:border-wellness-dark-800">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3.5">
            <div className="p-2.5 bg-wellness-lavender-100 text-wellness-lavender-600 rounded-2xl shrink-0 dark:bg-wellness-lavender-900/30 dark:text-wellness-lavender-400">
              <Sparkles size={20} className="animate-pulse" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                AI Companion Insights
              </h3>
              <div className="mt-1 text-sm text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl">
                {loadingInsight ? (
                  <div className="space-y-2 py-1">
                    <div className="h-3 bg-gray-100 dark:bg-wellness-dark-800 rounded w-80 animate-pulse"></div>
                    <div className="h-3 bg-gray-100 dark:bg-wellness-dark-800 rounded w-64 animate-pulse"></div>
                  </div>
                ) : (
                  insight
                )}
              </div>
            </div>
          </div>
          <button 
            onClick={handleRefreshInsight}
            disabled={loadingInsight}
            title="Refresh Insights"
            className="p-2 rounded-xl text-gray-400 hover:text-wellness-lavender-600 hover:bg-wellness-lavender-100/30 dark:hover:text-wellness-lavender-400 dark:hover:bg-wellness-lavender-900/20 transition-all duration-200"
          >
            <RotateCw size={16} className={loadingInsight ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Chart Section */}
      <div className="grid md:grid-cols-3 gap-6">
        
        {/* Mood Trend Graph */}
        <div className="glass-card p-6 md:col-span-2 border-gray-100 dark:border-wellness-dark-800 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                <TrendingUp size={18} className="text-wellness-lavender-500" />
                Mood History Trend
              </h3>
              <span className="text-xs text-gray-400 font-medium">Last 7 Entries</span>
            </div>

            {chartData.length > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#88888820" />
                    <XAxis dataKey="day" stroke="#9ca3af" fontSize={11} tickLine={false} />
                    <YAxis domain={[1, 10]} ticks={[1, 3, 5, 7, 9, 10]} stroke="#9ca3af" fontSize={11} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937', 
                        border: 'none', 
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '12px'
                      }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="rating" 
                      stroke="#8b5cf6" 
                      strokeWidth={2.5} 
                      activeDot={{ r: 6 }} 
                      dot={{ stroke: '#8b5cf6', strokeWidth: 2, r: 4, fill: '#fff' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-gray-400 gap-2">
                <Smile size={32} strokeWidth={1.5} />
                <p className="text-sm">No mood trends recorded yet. Log your mood to see graphs.</p>
              </div>
            )}
          </div>
        </div>

        {/* Dashboard quick activity stats */}
        <div className="glass-card p-6 border-gray-100 dark:border-wellness-dark-800 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Weekly Engagement</h3>
            
            <div className="space-y-4">
              
              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-wellness-blue-50/50 dark:bg-wellness-dark-800/40">
                <div className="p-2 bg-wellness-blue-100 text-wellness-blue-600 rounded-xl dark:bg-wellness-blue-900/30 dark:text-wellness-blue-400">
                  <BookOpen size={16} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Journal Entries</p>
                  <p className="text-base font-bold text-gray-900 dark:text-white mt-0.5">{diaryCount} Entries</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-wellness-lavender-50/50 dark:bg-wellness-dark-800/40">
                <div className="p-2 bg-wellness-lavender-100 text-wellness-lavender-600 rounded-xl dark:bg-wellness-lavender-900/30 dark:text-wellness-lavender-400">
                  <Dumbbell size={16} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Self-Care Gym</p>
                  <p className="text-base font-bold text-gray-900 dark:text-white mt-0.5">{exerciseMin} mins</p>
                </div>
              </div>

            </div>
          </div>

          <div className="text-xs text-gray-400 border-t border-gray-100 dark:border-wellness-dark-800 pt-4 mt-6">
            Tip: Complete a daily breathing exercise to boost your score!
          </div>
        </div>

      </div>

      {/* Quick Access Menu Cards */}
      <h3 className="font-semibold text-gray-900 dark:text-white text-lg pt-4">Quick Modules</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <Link 
          to="/chat" 
          className="glass-card p-5 border border-gray-100 hover:border-wellness-lavender-200 hover:shadow-md transition-all duration-200 group text-left"
        >
          <div className="p-2.5 bg-wellness-lavender-50 text-wellness-lavender-500 rounded-2xl w-fit group-hover:scale-110 transition-transform duration-200 dark:bg-wellness-lavender-950/20">
            <MessageCircle size={20} />
          </div>
          <h4 className="font-semibold text-sm text-gray-900 dark:text-white mt-4">AI Companion</h4>
          <p className="text-xs text-gray-400 mt-1">Chat and receive emotional advice.</p>
        </Link>

        <Link 
          to="/mood" 
          className="glass-card p-5 border border-gray-100 hover:border-wellness-blue-200 hover:shadow-md transition-all duration-200 group text-left"
        >
          <div className="p-2.5 bg-wellness-blue-50 text-wellness-blue-500 rounded-2xl w-fit group-hover:scale-110 transition-transform duration-200 dark:bg-wellness-blue-950/20">
            <Smile size={20} />
          </div>
          <h4 className="font-semibold text-sm text-gray-900 dark:text-white mt-4">Mood Tracker</h4>
          <p className="text-xs text-gray-400 mt-1">Log notes and track feelings.</p>
        </Link>

        <Link 
          to="/diary" 
          className="glass-card p-5 border border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all duration-200 group text-left"
        >
          <div className="p-2.5 bg-emerald-50 text-emerald-500 rounded-2xl w-fit group-hover:scale-110 transition-transform duration-200 dark:bg-emerald-950/20">
            <BookOpen size={20} />
          </div>
          <h4 className="font-semibold text-sm text-gray-900 dark:text-white mt-4">Diary Journal</h4>
          <p className="text-xs text-gray-400 mt-1">Write private daily entries.</p>
        </Link>

        <Link 
          to="/exercises" 
          className="glass-card p-5 border border-gray-100 hover:border-amber-200 hover:shadow-md transition-all duration-200 group text-left"
        >
          <div className="p-2.5 bg-amber-50 text-amber-500 rounded-2xl w-fit group-hover:scale-110 transition-transform duration-200 dark:bg-amber-950/20">
            <Dumbbell size={20} />
          </div>
          <h4 className="font-semibold text-sm text-gray-900 dark:text-white mt-4">Self-Care Gym</h4>
          <p className="text-xs text-gray-400 mt-1">Breathing and meditation timers.</p>
        </Link>

      </div>

    </div>
  );
}
