
import React, { useState } from 'react';
import { Note, Category, Language } from '../types';
import { translations } from '../translations';

interface NoteEditorProps {
  note: Note | null;
  onSave: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => void;
  onClose: () => void;
  language: Language;
}

const colors = ['#0f172a', '#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];
const categories: Category[] = ['Genel', 'İş', 'Kişisel', 'Fikirler', 'Önemli'];

const NoteEditor: React.FC<NoteEditorProps> = ({ note, onSave, onClose, language }) => {
  const t = translations[language];
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [category, setCategory] = useState<Category>(note?.category || 'Genel');
  const [color, setColor] = useState(note?.color || colors[0]);

  const handleSave = () => {
    onSave({ title, content, category, color, id: note?.id });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black sepia:bg-[#f4ecd8] flex flex-col animate-in fade-in duration-300 overflow-y-auto custom-scrollbar transition-colors">
      <nav className="sticky top-0 bg-white/90 dark:bg-black/80 backdrop-blur-sm px-6 md:px-12 py-4 flex justify-between items-center z-10 border-b border-slate-100 dark:border-white/5">
        <button 
          onClick={onClose}
          className="group flex items-center gap-2 text-slate-500 dark:text-slate-600 hover:text-slate-950 dark:hover:text-white transition-all font-bold text-xs"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="m15 18-6-6 6-6"/></svg>
          {t.back}
        </button>

        <button
          onClick={handleSave}
          disabled={!title.trim() && !content.trim()}
          className="bg-slate-900 dark:bg-white dark:text-black px-6 py-2 rounded-xl font-bold text-xs hover:opacity-90 transition-all active:scale-95 disabled:opacity-20 shadow-sm"
        >
          {t.save}
        </button>
      </nav>

      <div className="flex-1 w-full max-w-3xl mx-auto px-6 py-12">
        <div className="space-y-10">
          <div className="space-y-6">
            <input
              type="text"
              placeholder={t.titlePlaceholder}
              className="w-full text-3xl md:text-4xl font-bold text-slate-950 dark:text-white sepia:text-amber-950 placeholder-slate-200 dark:placeholder-zinc-900 outline-none border-none tracking-tight bg-transparent"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />

            <div className="flex flex-wrap items-center gap-8">
              <div className="flex flex-col gap-2">
                <span className="text-[8px] font-black text-slate-500 dark:text-slate-700 uppercase tracking-widest">{t.categoryLabel}</span>
                <div className="flex gap-1.5">
                  {categories.map(c => (
                    <button
                      key={c}
                      onClick={() => setCategory(c)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                        category === c ? 'bg-slate-900 dark:bg-white text-white dark:text-black' : 'bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-zinc-800'
                      }`}
                    >
                      {t.categoryNames[c]}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <span className="text-[8px] font-black text-slate-500 dark:text-slate-700 uppercase tracking-widest">{t.markerLabel}</span>
                <div className="flex gap-2">
                  {colors.map(c => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={`w-4 h-4 rounded-full transition-all ring-offset-2 dark:ring-offset-black ${color === c ? 'ring-2 ring-slate-900 dark:ring-white scale-110' : 'hover:scale-125'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
            
          <textarea
            placeholder={t.contentPlaceholder}
            className="w-full min-h-[400px] text-base md:text-lg text-slate-800 dark:text-slate-400 sepia:text-amber-950 placeholder-slate-200 dark:placeholder-zinc-900 outline-none border-none resize-none leading-relaxed bg-transparent"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default NoteEditor;