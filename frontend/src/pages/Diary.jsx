import React, { useEffect, useState } from 'react';
import { getDiary, addDiary, updateDiary, deleteDiary } from '../services/api';
import { Search, Plus, Calendar, Save, Trash2, BookOpen, Sparkles, AlertCircle, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Diary() {
  const [entries, setEntries] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntry, setSelectedEntry] = useState(null); // null means "creating new"
  const [loadingList, setLoadingList] = useState(true);
  const [loadingSave, setLoadingSave] = useState(false);

  // Editor State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    fetchDiaryEntries();
  }, [searchQuery]);

  const fetchDiaryEntries = async () => {
    setLoadingList(true);
    try {
      const data = await getDiary(searchQuery);
      setEntries(data);
      if (data.length > 0 && selectedEntry === null && title === '' && content === '') {
        // Automatically open the first entry if it's initial load
        handleSelectEntry(data[0]);
      }
    } catch (err) {
      console.error('Failed to load journal logs:', err);
    } finally {
      setLoadingList(false);
    }
  };

  const handleSelectEntry = (entry) => {
    setSelectedEntry(entry);
    if (entry) {
      setTitle(entry.title);
      setContent(entry.content);
    } else {
      // Clear for new entry
      setTitle('');
      setContent('');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!content.trim() || loadingSave) return;

    setLoadingSave(true);
    const saveTitle = title.trim() || 'Untitled Reflections';

    try {
      if (selectedEntry) {
        // Update
        const updated = await updateDiary(selectedEntry.id, saveTitle, content);
        setEntries(prev => prev.map(e => e.id === selectedEntry.id ? updated : e));
        setSelectedEntry(updated);
      } else {
        // Create
        const created = await addDiary(saveTitle, content);
        setEntries(prev => [created, ...prev]);
        setSelectedEntry(created);
        
        // Trigger celebratory confetti for journaling milestone
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#a855f7', '#60a5fa', '#34d399']
        });
      }
    } catch (err) {
      console.error('Failed to save journal entry:', err);
      alert('Failed to save diary entry');
    } finally {
      setLoadingSave(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedEntry) return;
    if (!window.confirm('Are you sure you want to delete this journal entry?')) return;

    try {
      await deleteDiary(selectedEntry.id);
      setEntries(prev => prev.filter(e => e.id !== selectedEntry.id));
      
      // Select next entry or reset editor
      const remaining = entries.filter(e => e.id !== selectedEntry.id);
      if (remaining.length > 0) {
        handleSelectEntry(remaining[0]);
      } else {
        handleSelectEntry(null);
      }
    } catch (err) {
      console.error('Failed to delete journal entry:', err);
      alert('Failed to delete entry');
    }
  };

  return (
    <div className="space-y-6 text-left pb-10">
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Diary Journal</h1>
          <p className="text-gray-400 text-sm">Write down your private feelings. Your entries are secured.</p>
        </div>
        <button
          onClick={() => handleSelectEntry(null)}
          className="btn-primary"
        >
          <Plus size={16} /> New Entry
        </button>
      </div>

      <div className="grid md:grid-cols-12 gap-6 items-start">
        
        {/* Left column: Entry List */}
        <div className="glass-card p-4 md:col-span-4 space-y-4 h-[72vh] flex flex-col justify-between border-gray-100 dark:border-wellness-dark-800 bg-white dark:bg-wellness-dark-900">
          
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4.5 w-4.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by keywords or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass-input pl-9.5 text-sm py-2"
            />
          </div>

          {/* List items */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {loadingList ? (
              <div className="flex justify-center py-10">
                <div className="h-6 w-6 border-2 border-wellness-lavender-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : entries.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-xs">
                No entries found. Click "New Entry" to write down your thoughts.
              </div>
            ) : (
              entries.map(e => {
                const isSelected = selectedEntry?.id === e.id;
                return (
                  <button
                    key={e.id}
                    onClick={() => handleSelectEntry(e)}
                    className={`w-full text-left p-3 rounded-xl transition-all duration-200 border text-ellipsis overflow-hidden ${
                      isSelected
                        ? 'bg-wellness-lavender-50 border-wellness-lavender-200 dark:bg-wellness-lavender-950/20 dark:border-wellness-lavender-800'
                        : 'border-transparent hover:bg-gray-50 dark:hover:bg-wellness-dark-800'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-semibold text-sm truncate pr-2 dark:text-white">
                        {e.title}
                      </h4>
                      <span className="text-[10px] text-gray-400 shrink-0">
                        {new Date(e.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                      {e.content}
                    </p>
                    
                    {/* Tags */}
                    {e.emotionsTags && e.emotionsTags.length > 0 && (
                      <div className="flex gap-1 mt-2.5 flex-wrap">
                        {e.emotionsTags.map(tag => (
                          <span 
                            key={tag} 
                            className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-wellness-blue-50 text-wellness-blue-600 dark:bg-wellness-blue-950/30 dark:text-wellness-blue-400"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Center column: Editor */}
        <form onSubmit={handleSave} className="md:col-span-5 glass-card p-6 space-y-4 border-gray-100 dark:border-wellness-dark-800 bg-white dark:bg-wellness-dark-900 h-[72vh] flex flex-col justify-between">
          <div className="space-y-4 flex-1 flex flex-col justify-start">
            <input
              type="text"
              placeholder="Title of your entry..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xl font-display font-bold bg-transparent border-b border-gray-100 dark:border-wellness-dark-800 focus:border-wellness-lavender-500 focus:outline-none pb-2 dark:text-white"
            />

            <textarea
              placeholder="How are you really doing? Type your private reflections here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              className="w-full bg-transparent resize-none focus:outline-none text-sm leading-relaxed flex-1 dark:text-gray-100"
            ></textarea>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 border-t border-gray-50 dark:border-wellness-dark-800 pt-4 shrink-0">
            <button
              type="submit"
              disabled={loadingSave || !content.trim()}
              className="btn-primary flex-1 py-2.5 text-sm"
            >
              {loadingSave ? (
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <Save size={16} /> Save Entry
                </>
              )}
            </button>

            {selectedEntry && (
              <button
                type="button"
                onClick={handleDelete}
                className="btn-flat text-rose-600 hover:bg-rose-50 border border-gray-100 dark:border-wellness-dark-800 dark:hover:bg-rose-950/20 py-2.5 px-3"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </form>

        {/* Right column: AI Reflection Sidebar */}
        <div className="glass-card p-6 md:col-span-3 border-gray-100 dark:border-wellness-dark-800 bg-gradient-to-b from-wellness-lavender-50/20 via-white to-white dark:from-wellness-dark-900 dark:to-wellness-dark-900 h-[72vh] flex flex-col justify-between overflow-y-auto">
          <div className="space-y-5">
            <div className="flex items-center gap-2 pb-3.5 border-b border-gray-50 dark:border-wellness-dark-800">
              <Sparkles className="text-wellness-lavender-500" size={18} />
              <h3 className="font-semibold text-sm text-gray-900 dark:text-white">AI Diary Reflection</h3>
            </div>

            {loadingSave ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400 gap-2">
                <div className="h-6 w-6 border-2 border-wellness-lavender-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs">Analyzing diary patterns...</p>
              </div>
            ) : selectedEntry ? (
              <div className="space-y-4">
                
                {/* Summary */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">AI Summary</span>
                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed bg-white p-3 rounded-xl border border-gray-100 dark:bg-wellness-dark-800 dark:border-transparent font-medium">
                    {selectedEntry.summary || 'AI Summary could not be loaded.'}
                  </p>
                </div>

                {/* Detected Feelings tags */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Detected feelings</span>
                  <div className="flex gap-1.5 flex-wrap">
                    {selectedEntry.emotionsTags && selectedEntry.emotionsTags.length > 0 ? (
                      selectedEntry.emotionsTags.map(tag => (
                        <span 
                          key={tag}
                          className="text-[10px] font-bold px-2 py-0.5 bg-wellness-blue-50 text-wellness-blue-600 rounded-lg dark:bg-wellness-blue-950/20 dark:text-wellness-blue-400 border border-wellness-blue-100/30"
                        >
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400">Neutral</span>
                    )}
                  </div>
                </div>

                {/* Coping Recommendations */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Coping suggestions</span>
                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed bg-white p-3 rounded-xl border border-gray-100 dark:bg-wellness-dark-800 dark:border-transparent font-medium">
                    {selectedEntry.recommendations || 'Log entries to see customized self-care recommendations.'}
                  </p>
                </div>

              </div>
            ) : (
              <div className="text-center py-12 text-gray-400 text-xs flex flex-col items-center gap-2">
                <BookOpen size={20} strokeWidth={1.5} />
                <p>Save or select an entry to trigger AI cognitive summaries and wellness tips.</p>
              </div>
            )}
          </div>

          <div className="text-[10px] text-gray-400 border-t border-gray-50 dark:border-wellness-dark-800 pt-3 mt-4">
            AI reflection helps you monitor long-term emotional progress.
          </div>
        </div>

      </div>

    </div>
  );
}
