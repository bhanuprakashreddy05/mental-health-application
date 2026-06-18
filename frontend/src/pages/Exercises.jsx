import React, { useEffect, useState, useEffect as useIntervalEffect } from 'react';
import { 
  getExercises, 
  getExerciseRecommendations, 
  logExerciseProgress, 
  getExerciseProgress 
} from '../services/api';
import { Dumbbell, Clock, Compass, Activity, Check, Play, Pause, X, Sparkles, Volume2, VolumeX } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Exercises() {
  const [exercises, setExercises] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [moodChecked, setMoodChecked] = useState('Calm');
  const [activeCategory, setActiveCategory] = useState('All');
  const [progressStats, setProgressStats] = useState(null);
  
  const [loading, setLoading] = useState(true);
  
  // Player state
  const [activeExercise, setActiveExercise] = useState(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const [totalDuration, setTotalDuration] = useState(0); // in seconds
  
  // Breathing animation states (for breathing category only)
  const [breathState, setBreathState] = useState('Inhale'); // 'Inhale' | 'Hold' | 'Exhale' | 'Hold Empty'
  const [breathSeconds, setBreathSeconds] = useState(0); // ticks from 0 to 15 (16s cycle for Box Breathing)

  const categories = ['All', 'Breathing', 'Meditation', 'Physical', 'Sleep'];

  useEffect(() => {
    fetchExerciseData();
  }, []);

  // Interval timer for player countdown
  useEffect(() => {
    let interval = null;
    if (timerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
        
        // If breathing exercise, run breathing cycle timer
        if (activeExercise?.category === 'Breathing') {
          setBreathSeconds(sec => {
            const nextSec = (sec + 1) % 16; // 16 second box breathing cycle
            
            if (nextSec < 4) {
              setBreathState('Inhale');
            } else if (nextSec < 8) {
              setBreathState('Hold (Full)');
            } else if (nextSec < 12) {
              setBreathState('Exhale');
            } else {
              setBreathState('Hold (Empty)');
            }
            return nextSec;
          });
        }
      }, 1000);
    } else if (timeLeft === 0 && activeExercise) {
      handleCompleteExercise();
    }
    return () => clearInterval(interval);
  }, [timerRunning, timeLeft, activeExercise]);

  const fetchExerciseData = async () => {
    setLoading(true);
    try {
      const [list, recsData, stats] = await Promise.all([
        getExercises(),
        getExerciseRecommendations(),
        getExerciseProgress()
      ]);
      setExercises(list);
      setRecommendations(recsData.recommendations || []);
      setMoodChecked(recsData.moodChecked || 'Calm');
      setProgressStats(stats);
    } catch (err) {
      console.error('Failed to load self-care exercise resources:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartExercise = (ex) => {
    setActiveExercise(ex);
    setTimeLeft(ex.duration * 60);
    setTotalDuration(ex.duration * 60);
    setTimerRunning(true);
    
    // reset breathing cycle
    setBreathSeconds(0);
    setBreathState('Inhale');
  };

  const handleCompleteExercise = async () => {
    setTimerRunning(false);
    
    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    try {
      // Log progress to database
      await logExerciseProgress(activeExercise.id, totalDuration);
      
      // Refresh statistics
      const stats = await getExerciseProgress();
      setProgressStats(stats);
      
      alert(`Well done! You successfully completed "${activeExercise.name}"!`);
      setActiveExercise(null);
    } catch (err) {
      console.error('Failed to log exercise progress:', err);
      setActiveExercise(null);
    }
  };

  const handleClosePlayer = () => {
    if (window.confirm('Do you want to exit this exercise? Progress will not be saved.')) {
      setTimerRunning(false);
      setActiveExercise(null);
    }
  };

  const formatTime = (secs) => {
    const min = Math.floor(secs / 60);
    const sec = secs % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const getFilteredExercises = () => {
    if (activeCategory === 'All') return exercises;
    return exercises.filter(ex => ex.category === activeCategory);
  };

  const getBreathCircleClass = () => {
    if (!timerRunning) return 'scale-100 opacity-60';
    
    switch (breathState) {
      case 'Inhale': return 'scale-[1.5] transition-all duration-[4000ms] ease-in-out bg-emerald-300/40';
      case 'Hold (Full)': return 'scale-[1.5] bg-emerald-400/50';
      case 'Exhale': return 'scale-100 transition-all duration-[4000ms] ease-in-out bg-emerald-200/40';
      case 'Hold (Empty)': return 'scale-100 bg-emerald-200/30';
      default: return 'scale-100';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="h-8 w-8 border-3 border-wellness-lavender-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-gray-400">Loading your wellness routines...</p>
      </div>
    );
  }

  const filtered = getFilteredExercises();

  return (
    <div className="space-y-6 text-left pb-10 relative">
      
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-display font-bold tracking-tight">Self-Care Gym</h1>
        <p className="text-gray-400 text-sm">Choose from targeted, clinically inspired techniques to ease stress, anxiety, or fatigue.</p>
      </div>

      {/* Mood Recommendations card */}
      {recommendations.length > 0 && (
        <div className="glass-card p-6 bg-gradient-to-r from-wellness-lavender-50/50 via-white to-emerald-50/20 border-purple-100/50 dark:from-wellness-lavender-950/10 dark:via-wellness-dark-900 dark:to-emerald-950/10 dark:border-wellness-dark-800">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex gap-3">
              <div className="p-2.5 bg-wellness-lavender-100 text-wellness-lavender-600 rounded-2xl dark:bg-wellness-lavender-900/30 dark:text-wellness-lavender-400 shrink-0">
                <Sparkles size={18} />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                  Tailored for your current mood: <span className="font-bold text-wellness-lavender-600 dark:text-wellness-lavender-400">{moodChecked}</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5 max-w-xl">
                  Based on your latest mood check-in, we recommend starting with these specific techniques:
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-5">
            {recommendations.map(ex => (
              <div key={ex.id} className="p-4 bg-white border border-gray-100 rounded-2xl flex justify-between items-center dark:bg-wellness-dark-900 dark:border-wellness-dark-800">
                <div>
                  <h4 className="font-semibold text-sm dark:text-white">{ex.name}</h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">{ex.category} • {ex.duration} mins • {ex.difficulty}</p>
                </div>
                <button
                  onClick={() => handleStartExercise(ex)}
                  className="btn-secondary py-1.5 px-3 text-xs shrink-0"
                >
                  Start
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category selector pills */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all duration-200 border ${
              activeCategory === cat
                ? 'bg-wellness-lavender-600 border-wellness-lavender-600 text-white shadow-sm'
                : 'bg-white hover:bg-gray-50 border-gray-100 text-gray-500 dark:bg-wellness-dark-900 dark:border-wellness-dark-800 dark:text-gray-400 dark:hover:bg-wellness-dark-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Exercises Library Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(ex => (
          <div 
            key={ex.id} 
            className="glass-card p-6 bg-white dark:bg-wellness-dark-900 border-gray-100 dark:border-wellness-dark-800 flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-wellness-lavender-500 bg-wellness-lavender-50 px-2 py-0.5 rounded-lg dark:bg-wellness-lavender-950/20 dark:text-wellness-lavender-400">
                  {ex.category}
                </span>
                
                <span className="text-[10px] font-semibold text-gray-400">
                  {ex.difficulty}
                </span>
              </div>

              <h3 className="font-semibold text-base text-gray-900 dark:text-white mb-2 leading-tight">
                {ex.name}
              </h3>
              
              <p className="text-xs text-gray-400 leading-relaxed line-clamp-3 mb-5">
                {ex.description}
              </p>
            </div>

            <div className="flex items-center justify-between border-t border-gray-50 dark:border-wellness-dark-800 pt-4 mt-2">
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Clock size={13} />
                {ex.duration} mins
              </span>
              
              <button
                onClick={() => handleStartExercise(ex)}
                className="btn-secondary py-1.5 px-3.5 text-xs"
              >
                Begin
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Exercise Player HUD Modal Overlay */}
      {activeExercise && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-5 select-none">
          <div className="bg-white dark:bg-wellness-dark-900 rounded-3xl w-full max-w-2xl p-6 md:p-8 shadow-2xl relative flex flex-col max-h-[90vh] overflow-y-auto">
            
            <button 
              onClick={handleClosePlayer}
              className="absolute top-5 right-5 p-2 rounded-xl bg-gray-50 hover:bg-gray-100 dark:bg-wellness-dark-800 dark:hover:bg-wellness-dark-700 text-gray-500 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="text-center space-y-6 flex-1 flex flex-col justify-center">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-wellness-lavender-500 bg-wellness-lavender-50 px-2 py-0.5 rounded-lg dark:bg-wellness-lavender-950/20 dark:text-wellness-lavender-400">
                  {activeExercise.category} session
                </span>
                <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white mt-2">
                  {activeExercise.name}
                </h2>
              </div>

              {/* Breathing Guide Area */}
              {activeExercise.category === 'Breathing' && (
                <div className="h-64 flex flex-col items-center justify-center relative">
                  
                  {/* Expanding circles */}
                  <div className={`w-32 h-32 rounded-full absolute flex items-center justify-center ${getBreathCircleClass()}`}></div>
                  
                  {/* Outer breathing ring */}
                  <div className="w-36 h-36 border border-emerald-300/20 rounded-full absolute"></div>
                  
                  {/* Label */}
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-lg font-bold text-emerald-800 dark:text-emerald-300">
                      {timerRunning ? breathState : 'Paused'}
                    </span>
                    {timerRunning && (
                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400/70 mt-1 uppercase tracking-widest">
                        {4 - (breathSeconds % 4)}s remaining
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* General Timer Screen (e.g. for Meditation/Sleep) */}
              {activeExercise.category !== 'Breathing' && (
                <div className="h-56 flex flex-col items-center justify-center relative">
                  <div className="h-32 w-32 rounded-full border-4 border-wellness-lavender-100 dark:border-wellness-dark-800 flex items-center justify-center shadow-inner relative animate-pulse-slow">
                    <Clock size={32} className="text-wellness-lavender-300 dark:text-wellness-lavender-500" />
                  </div>
                </div>
              )}

              {/* Digital Countdown Timer */}
              <div className="text-5xl font-mono font-bold tracking-tight text-gray-900 dark:text-white">
                {formatTime(timeLeft)}
              </div>

              {/* Controls */}
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setTimerRunning(!timerRunning)}
                  className={`btn-primary py-3 px-6 text-sm font-semibold rounded-2xl ${
                    timerRunning 
                      ? 'bg-amber-600 hover:bg-amber-700' 
                      : 'bg-wellness-lavender-600 hover:bg-wellness-lavender-700'
                  }`}
                >
                  {timerRunning ? (
                    <>
                      <Pause size={16} /> Pause session
                    </>
                  ) : (
                    <>
                      <Play size={16} /> Resume session
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleCompleteExercise}
                  className="btn-secondary py-3 px-6 text-sm font-semibold border rounded-2xl"
                >
                  Skip to Finish
                </button>
              </div>

              {/* Instructions Panel */}
              <div className="text-left bg-gray-50 border border-gray-100/50 dark:bg-wellness-dark-800 dark:border-transparent p-5 rounded-2xl">
                <h4 className="font-semibold text-sm text-gray-800 dark:text-white mb-2.5">Instructions:</h4>
                <ul className="space-y-2 text-xs text-gray-500 leading-relaxed list-decimal list-inside pl-1">
                  {activeExercise.instructions.map((inst, index) => (
                    <li key={index} className="pl-1">
                      <span className="font-medium text-gray-600 dark:text-gray-300">{inst}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
