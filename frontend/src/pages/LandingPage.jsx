import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Compass, CheckCircle2, ShieldCheck, Sparkles, Smile } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-purple-50/20 to-white text-gray-800 flex flex-col justify-between selection:bg-wellness-lavender-200">
      
      {/* Header */}
      <header className="max-w-6xl mx-auto w-full px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="h-6 w-6 text-wellness-lavender-500 fill-wellness-lavender-200" />
          <span className="font-display font-bold text-xl text-gray-900 tracking-tight">Peaceful Mind</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-semibold text-gray-600 hover:text-wellness-lavender-600 transition-colors">Sign In</Link>
          <Link to="/register" className="text-sm font-semibold px-4 py-2 rounded-xl text-white bg-wellness-lavender-600 hover:bg-wellness-lavender-700 transition-colors shadow-sm">Get Started</Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto w-full px-6 py-12 md:py-24 grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6 text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
            <Sparkles size={12} />
            AI-Powered Personal Mental Wellness Space
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-gray-900 leading-tight">
            Your gentle space for <span className="text-transparent bg-clip-text bg-gradient-to-r from-wellness-lavender-500 to-wellness-blue-500">mindful healing</span>.
          </h1>
          <p className="text-gray-600 md:text-lg leading-relaxed max-w-lg">
            Track your moods, maintain an AI-summarized private journal, chat with supportive companions, and unlock calm with custom breathing exercises.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/register" className="btn-primary text-center px-8 py-3 text-base">
              Begin Your Journey
            </Link>
            <Link to="/login" className="btn-secondary text-center px-8 py-3 text-base">
              Try Demo Session
            </Link>
          </div>
        </div>
        
        {/* Calming visual art element */}
        <div className="flex justify-center">
          <div className="relative w-72 h-72 md:w-96 md:h-96 flex items-center justify-center">
            {/* Animated breathing rings */}
            <div className="absolute w-full h-full rounded-full bg-wellness-lavender-100/40 animate-pulse-slow"></div>
            <div className="absolute w-5/6 h-5/6 rounded-full bg-wellness-blue-100/30 animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
            <div className="absolute w-2/3 h-2/3 rounded-full bg-emerald-50/50 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
            
            {/* Centered illustration card */}
            <div className="absolute z-10 glass-card p-6 shadow-xl w-64 text-center border border-white/50">
              <div className="h-12 w-12 rounded-2xl bg-wellness-lavender-100 text-wellness-lavender-600 flex items-center justify-center mx-auto mb-4">
                <Smile size={24} />
              </div>
              <p className="font-display font-semibold text-gray-800">Mindful Check-in</p>
              <p className="text-xs text-gray-400 mt-1">"You feel 12% calmer after breathing exercises today."</p>
              <div className="mt-4 flex gap-1 justify-center">
                {[1, 2, 3, 4, 5].map(i => (
                  <span key={i} className="h-1.5 w-1.5 rounded-full bg-wellness-lavender-400"></span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-gray-50/50 py-16 md:py-24 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl font-display font-bold text-gray-900">Designed for your peace of mind</h2>
            <p className="text-gray-500">A professional suite of self-care tools powered by private, supportive AI insights.</p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Feature 1 */}
            <div className="glass-card p-6 bg-white border border-gray-100/60 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-10 w-10 rounded-xl bg-wellness-blue-100 text-wellness-blue-600 flex items-center justify-center mb-5">
                <Compass size={20} />
              </div>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">AI Companion Chat</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Connect with compassionate AI personas tailored to coach, comfort, or listen to your worries.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass-card p-6 bg-white border border-gray-100/60 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-5">
                <CheckCircle2 size={20} />
              </div>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">Mood Trends</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Track daily emotions and visualize wellness metrics using interactive, sleek charts.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass-card p-6 bg-white border border-gray-100/60 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-10 w-10 rounded-xl bg-wellness-lavender-100 text-wellness-lavender-600 flex items-center justify-center mb-5">
                <Heart size={20} />
              </div>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">Smart Diary</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Write private journal logs and let the AI summarize mental patterns and recommend adjustments.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="glass-card p-6 bg-white border border-gray-100/60 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-5">
                <ShieldCheck size={20} />
              </div>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">Private & Secure</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Your credentials are secure, and your logs are fully isolated. Perfect safety for your thoughts.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white py-8 px-6 text-center text-xs text-gray-400">
        <p>© 2026 Peaceful Mind Web App. All rights reserved. Designed for positive mental well-being.</p>
        <p className="mt-1">Disclaimer: Peaceful Mind is a self-reflection wellness tracker and AI companion. It does not replace medical diagnostics or professional clinical therapy.</p>
      </footer>

    </div>
  );
}
