import React, { useState, useEffect, useRef } from 'react';
import { getChatHistory, sendChatMessage } from '../services/api';
import { MessageSquare, Send, Sparkles, Heart, Compass, Smile } from 'lucide-react';

export default function AiCompanion() {
  const [activePersonality, setActivePersonality] = useState('compassionate'); // 'compassionate' | 'mindful' | 'cheerful'
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [detectedSentiment, setDetectedSentiment] = useState('');
  const chatEndRef = useRef(null);

  const personalities = [
    { id: 'compassionate', name: 'Compassionate Guide', icon: Heart, desc: 'Empathetic listening and validation', color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/20' },
    { id: 'mindful', name: 'Mindfulness Coach', icon: Compass, desc: 'Zen breathing and somatic grounding', color: 'text-sky-500 bg-sky-50 dark:bg-sky-950/20' },
    { id: 'cheerful', name: 'Joyful Catalyst', icon: Smile, desc: 'Positive psychology & small habits', color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20' }
  ];

  useEffect(() => {
    fetchHistory();
  }, [activePersonality]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Real-time sentiment predictor based on keystrokes
  useEffect(() => {
    if (!inputValue) {
      setDetectedSentiment('');
      return;
    }
    const val = inputValue.toLowerCase();
    if (val.includes('anxi') || val.includes('pan') || val.includes('worry') || val.includes('scared') || val.includes('nervous')) {
      setDetectedSentiment('Anxious');
    } else if (val.includes('sad') || val.includes('lonely') || val.includes('cry') || val.includes('hurt') || val.includes('grief')) {
      setDetectedSentiment('Sad');
    } else if (val.includes('stress') || val.includes('overwhelm') || val.includes('busy') || val.includes('tired') || val.includes('exhaust')) {
      setDetectedSentiment('Stressed / Tired');
    } else if (val.includes('angr') || val.includes('mad') || val.includes('annoy') || val.includes('hate') || val.includes('furi')) {
      setDetectedSentiment('Angry');
    } else if (val.includes('happy') || val.includes('glad') || val.includes('excited') || val.includes('great') || val.includes('joy')) {
      setDetectedSentiment('Happy');
    } else if (val.includes('calm') || val.includes('peace') || val.includes('relax') || val.includes('quiet')) {
      setDetectedSentiment('Calm');
    } else {
      setDetectedSentiment('');
    }
  }, [inputValue]);

  const fetchHistory = async () => {
    try {
      const history = await getChatHistory(activePersonality);
      // Format backend chat schema { message, response } to flat list of chat bubbles
      const flatMessages = [];
      history.forEach((h, index) => {
        flatMessages.push({
          id: `${h.id || index}-u`,
          sender: 'user',
          text: h.message,
          timestamp: h.timestamp
        });
        flatMessages.push({
          id: `${h.id || index}-a`,
          sender: 'ai',
          text: h.response,
          timestamp: h.timestamp
        });
      });
      setMessages(flatMessages);
    } catch (error) {
      console.error('Failed to load chat logs:', error);
    }
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || loading) return;

    const userText = inputValue;
    setInputValue('');
    clearSentiment();

    // Optimistically add user message
    const userMsgId = Math.random().toString();
    setMessages(prev => [...prev, {
      id: userMsgId,
      sender: 'user',
      text: userText,
      timestamp: new Date().toISOString()
    }]);

    setLoading(true);

    try {
      const data = await sendChatMessage(userText, activePersonality);
      setMessages(prev => [...prev, {
        id: data.id || Math.random().toString(),
        sender: 'ai',
        text: data.response,
        timestamp: data.timestamp
      }]);
    } catch (err) {
      console.error('Failed to send chat message:', err);
      // Add error notification directly into chat
      setMessages(prev => [...prev, {
        id: Math.random().toString(),
        sender: 'ai',
        text: 'Apologies, I encountered an issue connecting to my thoughts. Could you try checking in with me again in a moment?',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const clearSentiment = () => {
    setDetectedSentiment('');
  };

  const getActiveIcon = () => {
    const current = personalities.find(p => p.id === activePersonality);
    return current ? current.icon : MessageSquare;
  };

  const getActiveDesc = () => {
    const current = personalities.find(p => p.id === activePersonality);
    return current ? current.desc : '';
  };

  return (
    <div className="flex flex-col h-[82vh] bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm dark:bg-wellness-dark-900 dark:border-wellness-dark-800 text-left">
      
      {/* Companion Header */}
      <div className="px-6 py-4 border-b border-gray-100 dark:border-wellness-dark-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-wellness-lavender-100 text-wellness-lavender-600 rounded-2xl dark:bg-wellness-lavender-900/30 dark:text-wellness-lavender-400">
            {React.createElement(getActiveIcon(), { size: 22 })}
          </div>
          <div>
            <h2 className="font-semibold text-lg leading-tight dark:text-white">AI Companion</h2>
            <p className="text-xs text-gray-400 mt-0.5">{getActiveDesc()}</p>
          </div>
        </div>
      </div>

      {/* Personality Pill Bar */}
      <div className="px-6 py-3 border-b border-gray-50 dark:border-wellness-dark-800/40 bg-gray-50/30 dark:bg-wellness-dark-950/20 flex gap-2 overflow-x-auto scrollbar-none shrink-0">
        {personalities.map(p => {
          const Icon = p.icon;
          const isSelected = activePersonality === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setActivePersonality(p.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                isSelected
                  ? 'bg-wellness-lavender-600 text-white shadow-sm'
                  : 'bg-white hover:bg-gray-50 border border-gray-100 text-gray-600 dark:bg-wellness-dark-800 dark:border-wellness-dark-700 dark:text-gray-300 dark:hover:bg-wellness-dark-700'
              }`}
            >
              <Icon size={14} className={isSelected ? 'text-white' : 'text-gray-400'} />
              {p.name}
            </button>
          );
        })}
      </div>

      {/* Message Stream */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-gray-50/20 dark:bg-wellness-dark-950/10">
        
        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 max-w-sm mx-auto space-y-3">
            <div className="p-3 bg-wellness-lavender-50 rounded-2xl dark:bg-wellness-lavender-950/20 text-wellness-lavender-500">
              <Sparkles size={24} />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Start your self-care conversation</h3>
            <p className="text-xs leading-relaxed">
              How are you feeling right now? Share your thoughts, anxiety, or challenges. Select a companion personality above to guide the tone of the response.
            </p>
          </div>
        )}

        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div 
              key={msg.id}
              className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              <div 
                className={`max-w-[80%] rounded-2xl px-4.5 py-3 text-sm leading-relaxed shadow-sm ${
                  isUser 
                    ? 'bg-wellness-lavender-600 text-white rounded-br-none' 
                    : 'bg-white text-gray-800 dark:bg-wellness-dark-800 dark:text-gray-100 rounded-bl-none border border-gray-100 dark:border-wellness-dark-700'
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}

        {/* AI Typing Indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-wellness-dark-800 border border-gray-100 dark:border-wellness-dark-700 rounded-2xl rounded-bl-none px-4.5 py-3 flex.5 items-center gap-1">
              <span className="h-2 w-2 bg-gray-300 dark:bg-wellness-dark-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="h-2 w-2 bg-gray-300 dark:bg-wellness-dark-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="h-2 w-2 bg-gray-300 dark:bg-wellness-dark-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input area */}
      <div className="p-4 border-t border-gray-100 dark:border-wellness-dark-800 shrink-0">
        
        {/* Sentiment Helper indicator */}
        {detectedSentiment && (
          <div className="mb-2 px-3 py-1 bg-wellness-lavender-50 text-wellness-lavender-700 text-xs font-semibold rounded-lg w-fit flex items-center gap-1.5 dark:bg-wellness-lavender-950/20 dark:text-wellness-lavender-300 animate-pulse">
            <Sparkles size={11} />
            <span>Detected feeling: {detectedSentiment}</span>
          </div>
        )}

        <form onSubmit={handleSend} className="flex gap-2.5">
          <input
            type="text"
            placeholder={`Share your concerns with your ${personalities.find(p => p.id === activePersonality)?.name}...`}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={loading}
            className="glass-input focus:ring-wellness-lavender-500/20 focus:border-wellness-lavender-500 flex-1 py-3 text-sm"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || loading}
            className="btn-primary py-3 px-4 shrink-0 focus:ring-2 focus:ring-wellness-lavender-500/20"
          >
            <Send size={18} />
          </button>
        </form>
      </div>

    </div>
  );
}
