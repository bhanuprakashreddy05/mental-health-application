import React, { useEffect, useState } from 'react';
import { getMoods, getWellnessInsights } from '../services/api';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Heart, TrendingUp, BarChart2, PieChart as PieIcon, Sparkles } from 'lucide-react';

export default function MoodAnalytics() {
  const [moods, setMoods] = useState([]);
  const [insight, setInsight] = useState('');
  const [loading, setLoading] = useState(true);

  const MOOD_COLORS = {
    Calm: '#10b981', // emerald
    Happy: '#f59e0b', // amber
    Sad: '#0ea5e9', // sky
    Anxious: '#a855f7', // purple
    Stressed: '#f43f5e', // rose
    Angry: '#ef4444', // red
    Tired: '#6366f1' // indigo
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const [moodList, insightsData] = await Promise.all([
        getMoods(),
        getWellnessInsights()
      ]);
      setMoods(moodList);
      setInsight(insightsData.insight);
    } catch (err) {
      console.error('Failed to load analytics resources:', err);
    } finally {
      setLoading(false);
    }
  };

  // 1. Calculate mood distribution for Pie Chart
  const getPieData = () => {
    if (moods.length === 0) return [];
    
    const counts = {};
    moods.forEach(m => {
      counts[m.mood] = (counts[m.mood] || 0) + 1;
    });

    return Object.keys(counts).map(name => ({
      name,
      value: counts[name]
    }));
  };

  // 2. Format Line Chart Data (recent 10 logs)
  const getLineData = () => {
    return [...moods]
      .slice(0, 10)
      .reverse()
      .map(m => {
        const date = new Date(m.timestamp);
        return {
          date: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
          intensity: m.rating,
          mood: m.mood
        };
      });
  };

  // 3. Compute statistics metrics
  const getStats = () => {
    if (moods.length === 0) {
      return { avgRating: 0, commonMood: 'None', totalLogs: 0 };
    }

    const totalLogs = moods.length;
    const avgRating = (moods.reduce((sum, m) => sum + m.rating, 0) / totalLogs).toFixed(1);

    const counts = {};
    let commonMood = 'Calm';
    let maxCount = 0;
    moods.forEach(m => {
      counts[m.mood] = (counts[m.mood] || 0) + 1;
      if (counts[m.mood] > maxCount) {
        maxCount = counts[m.mood];
        commonMood = m.mood;
      }
    });

    return { avgRating, commonMood, totalLogs };
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="h-8 w-8 border-3 border-wellness-lavender-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-gray-400">Aggregating emotional reports...</p>
      </div>
    );
  }

  const pieData = getPieData();
  const lineData = getLineData();
  const stats = getStats();

  return (
    <div className="space-y-6 text-left pb-10">
      
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-display font-bold tracking-tight">Mood Analytics</h1>
        <p className="text-gray-400 text-sm">Review mental trends, stability graphs, and emotional correlations.</p>
      </div>

      {moods.length === 0 ? (
        <div className="glass-card p-12 text-center text-gray-400 flex flex-col items-center justify-center gap-3 border-gray-100 dark:border-wellness-dark-800">
          <BarChart2 size={36} strokeWidth={1.5} />
          <h3 className="font-semibold text-gray-900 dark:text-white">No analytics compiled</h3>
          <p className="text-xs max-w-sm">
            We require logged mood logs to build your distribution charts and line graphs. Check back here after your first entries.
          </p>
        </div>
      ) : (
        <>
          {/* Key metrics grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            <div className="glass-card p-5 border-gray-100 dark:border-wellness-dark-800">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Check-ins</span>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalLogs}</p>
            </div>

            <div className="glass-card p-5 border-gray-100 dark:border-wellness-dark-800">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Average Intensity</span>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.avgRating}/10</p>
            </div>

            <div className="glass-card p-5 border-gray-100 dark:border-wellness-dark-800">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Dominant Mood</span>
              <p className="text-2xl font-bold text-wellness-lavender-600 dark:text-wellness-lavender-400 mt-1">{stats.commonMood}</p>
            </div>

            <div className="glass-card p-5 border-gray-100 dark:border-wellness-dark-800">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Mindful Streak</span>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">4 Days</p>
            </div>

          </div>

          {/* AI Insights Card */}
          <div className="glass-card p-6 bg-gradient-to-r from-wellness-lavender-50/50 via-white to-emerald-50/20 border-purple-100/50 dark:from-wellness-lavender-950/10 dark:via-wellness-dark-900 dark:to-emerald-950/10 dark:border-wellness-dark-800">
            <div className="flex gap-3">
              <div className="p-2 bg-wellness-lavender-100 text-wellness-lavender-600 rounded-xl dark:bg-wellness-lavender-900/30 dark:text-wellness-lavender-400 shrink-0">
                <Sparkles size={16} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">AI Emotion Correlation Analysis</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">{insight}</p>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Pie Chart: Mood distribution */}
            <div className="glass-card p-6 border-gray-100 dark:border-wellness-dark-800 flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-1.5 mb-4">
                  <PieIcon size={18} className="text-wellness-blue-500" />
                  Emotional Breakdown
                </h3>
                
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={MOOD_COLORS[entry.name] || '#9ca3af'} 
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1f2937', 
                          border: 'none', 
                          borderRadius: '12px',
                          color: '#fff',
                          fontSize: '12px'
                        }} 
                      />
                      <Legend 
                        layout="horizontal" 
                        verticalAlign="bottom" 
                        align="center"
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Line Chart: Intensity History */}
            <div className="glass-card p-6 border-gray-100 dark:border-wellness-dark-800 flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-1.5 mb-4">
                  <TrendingUp size={18} className="text-wellness-lavender-500" />
                  Emotion Stability timeline
                </h3>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lineData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#88888820" />
                      <XAxis dataKey="date" stroke="#9ca3af" fontSize={11} tickLine={false} />
                      <YAxis domain={[1, 10]} ticks={[1, 3, 5, 7, 9, 10]} stroke="#9ca3af" fontSize={11} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1f2937',
                          border: 'none',
                          borderRadius: '12px',
                          color: '#fff',
                          fontSize: '12px'
                        }}
                        formatter={(value, name, props) => [`Rating: ${value} (${props.payload.mood})`, 'Intensity']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="intensity" 
                        stroke="#8b5cf6" 
                        strokeWidth={2.5}
                        activeDot={{ r: 6 }}
                        dot={{ stroke: '#8b5cf6', strokeWidth: 2, r: 4, fill: '#fff' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

          </div>
        </>
      )}

    </div>
  );
}
