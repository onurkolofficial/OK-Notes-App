
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Note, Category, Language } from '../types';
import { translations } from '../translations';
import PopupWindow from './PopupWindow';

interface NoteEditorProps {
  note: Note | null;
  onSave: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => void;
  onClose: () => void;
  language: Language;
  showLineNumbers?: boolean;
}

const colors = ['#0f172a', '#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];
const categories: Category[] = ['Genel', 'İş', 'Kişisel', 'Fikirler', 'Önemli'];

const NoteEditor: React.FC<NoteEditorProps> = ({ note, onSave, onClose, language, showLineNumbers = false }) => {
  const t = translations[language];
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [category, setCategory] = useState<Category>(note?.category || 'Genel');
  const [color, setColor] = useState(note?.color || colors[0]);
  
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  // Değişiklik olup olmadığını kontrol et
  const hasChanges = useMemo(() => {
    const originalTitle = note?.title || '';
    const originalContent = note?.content || '';
    const originalCategory = note?.category || 'Genel';
    const originalColor = note?.color || colors[0];

    return (
      title !== originalTitle ||
      content !== originalContent ||
      category !== originalCategory ||
      color !== originalColor
    );
  }, [title, content, category, color, note]);

  const handleSave = () => {
    onSave({ title, content, category, color, id: note?.id });
  };

  const handleBack = () => {
    if (hasChanges) {
      setShowExitConfirmation(true);
    } else {
      onClose();
    }
  };

  // Scroll senkronizasyonu
  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  // Satır numaralarını hesapla
  const lines = useMemo(() => {
    if (!showLineNumbers) return [];
    const lineCount = content.split('\n').length;
    return Array.from({ length: Math.max(lineCount, 1) }, (_, i) => i + 1);
  }, [content, showLineNumbers]);

  return (
    <div className="h-screen bg-slate-50 dark:bg-zinc-950 sepia:bg-sepia-100 flex flex-col animate-in fade-in duration-300 transition-colors overflow-hidden">
      {/* Üst Bar - Sabit */}
      <nav className="shrink-0 bg-slate-50/90 dark:bg-zinc-950/90 sepia:bg-sepia-100/90 backdrop-blur-md px-6 md:px-12 py-4 flex justify-between items-center z-20 border-b border-slate-100 dark:border-white/5 sepia:border-sepia-300">
        <button 
          onClick={handleBack}
          className="group flex items-center gap-2 text-slate-500 dark:text-zinc-500 sepia:text-sepia-600 hover:text-slate-900 dark:hover:text-zinc-200 sepia:hover:text-sepia-900 transition-all font-bold text-xs"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="m15 18-6-6 6-6"/></svg>
          {t.back}
        </button>

        <button
          onClick={handleSave}
          disabled={!title.trim() && !content.trim()}
          className="bg-slate-900 dark:bg-zinc-100 dark:text-black sepia:bg-sepia-900 sepia:text-sepia-50 px-6 py-2 rounded-xl font-bold text-xs hover:opacity-90 transition-all active:scale-95 disabled:opacity-20 shadow-sm"
        >
          {t.save}
        </button>
      </nav>

      {/* Ana İçerik - Kaydırılabilir */}
      <div className="flex-1 flex flex-col w-full max-w-5xl mx-auto overflow-hidden">
        
        {/* Başlık ve Metadata Alanı - Doğal Akış */}
        <div className="shrink-0 px-6 md:px-12 pt-8 pb-6 space-y-6">
          <input
            type="text"
            placeholder={t.titlePlaceholder}
            className="w-full text-3xl md:text-4xl font-bold text-slate-900 dark:text-zinc-100 sepia:text-sepia-900 placeholder-slate-400 dark:placeholder-zinc-800 sepia:placeholder-sepia-500 outline-none border-none tracking-tight bg-transparent"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div className="flex flex-wrap items-center gap-8">
            <div className="flex flex-col gap-2">
              <span className="text-[8px] font-black text-slate-500 dark:text-zinc-600 sepia:text-sepia-600 uppercase tracking-widest">{t.categoryLabel}</span>
              <div className="flex gap-1.5">
                {categories.map(c => (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                      category === c 
                      ? 'bg-slate-900 dark:bg-zinc-100 sepia:bg-sepia-900 text-white dark:text-black sepia:text-sepia-50' 
                      : 'bg-white dark:bg-zinc-900 sepia:bg-sepia-200 text-slate-600 dark:text-zinc-500 sepia:text-sepia-700 hover:bg-slate-100 dark:hover:bg-zinc-800 sepia:hover:bg-sepia-300'
                    }`}
                  >
                    {t.categoryNames[c]}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <span className="text-[8px] font-black text-slate-500 dark:text-zinc-600 sepia:text-sepia-600 uppercase tracking-widest">{t.markerLabel}</span>
              <div className="flex gap-2">
                {colors.map(c => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-4 h-4 rounded-full transition-all ring-offset-2 dark:ring-offset-black sepia:ring-offset-sepia-100 ${color === c ? 'ring-2 ring-slate-900 dark:ring-zinc-100 sepia:ring-sepia-900 scale-110' : 'hover:scale-125'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Editör Alanı */}
        <div className="flex-1 flex relative border-t border-transparent overflow-hidden">
          
          {/* Satır Numaraları */}
          {showLineNumbers && (
            <div
              ref={lineNumbersRef}
              className="w-10 md:w-12 shrink-0 bg-slate-100/50 dark:bg-zinc-900/30 sepia:bg-sepia-200/30 border-r border-slate-100 dark:border-white/5 sepia:border-sepia-300 text-right pr-2 md:pr-3 pt-6 pb-20 select-none overflow-hidden text-slate-400 dark:text-zinc-700 sepia:text-sepia-600 font-mono text-sm md:text-base leading-6"
            >
              {lines.map(n => (
                <div key={n}>{n}</div>
              ))}
            </div>
          )}

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            placeholder={t.contentPlaceholder}
            onScroll={handleScroll}
            className={`
              flex-1 w-full h-full pt-6 pb-32 px-4 md:px-12 
              bg-transparent outline-none border-none resize-none 
              text-slate-800 dark:text-zinc-300 sepia:text-sepia-800 
              placeholder-slate-400 dark:placeholder-zinc-800 sepia:placeholder-sepia-500
              ${showLineNumbers 
                ? 'whitespace-pre overflow-x-auto font-mono text-sm md:text-base leading-6' 
                : 'text-base md:text-lg leading-relaxed'
              }
            `}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            spellCheck={false}
          />
        </div>
      </div>

      {/* Çıkış Onayı Modalı */}
      <PopupWindow 
        isOpen={showExitConfirmation} 
        onClose={() => setShowExitConfirmation(false)} 
        title={t.unsavedChangesTitle}
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-zinc-400 sepia:text-sepia-700 font-medium">
            {t.unsavedChangesDesc}
          </p>
          
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => {
                setShowExitConfirmation(false);
                onClose();
              }}
              className="px-4 py-3 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 sepia:hover:bg-red-900/10 transition-colors border border-red-100 dark:border-red-900/30 sepia:border-red-200"
            >
              {t.discardAndExit}
            </button>
            <button
              onClick={() => {
                setShowExitConfirmation(false);
                handleSave();
              }}
              className="px-4 py-3 rounded-xl text-xs font-bold text-white bg-slate-900 dark:bg-zinc-100 dark:text-black sepia:bg-sepia-900 shadow-lg hover:opacity-90 active:scale-95 transition-all"
            >
              {t.saveAndExit}
            </button>
          </div>
          
          <button 
            onClick={() => setShowExitConfirmation(false)}
            className="w-full py-2 text-[10px] font-bold text-slate-500 dark:text-zinc-600 sepia:text-sepia-600 hover:text-slate-700 dark:hover:text-zinc-400 transition-colors"
          >
            {t.cancel}
          </button>
        </div>
      </PopupWindow>
    </div>
  );
};

export default NoteEditor;
