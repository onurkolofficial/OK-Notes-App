
import React from 'react';
import { Note, Language, Category } from '../types';
import { translations } from '../translations';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onLock: (note: Note) => void;
  language: Language;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, onEdit, onDelete, onLock, language }) => {
  const t = translations[language];
  
  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat(language === 'tr' ? 'tr-TR' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(new Date(timestamp));
  };

  const formattedCreated = formatDate(note.createdAt);
  const formattedUpdated = formatDate(note.updatedAt);

  return (
    <div 
      onClick={() => onEdit(note)}
      className="group relative bg-white dark:bg-zinc-900 sepia:bg-sepia-50 p-4 rounded-xl border border-slate-100 dark:border-white/5 sepia:border-sepia-200/50 shadow-sm hover:shadow-md dark:shadow-none transition-all duration-300 cursor-pointer flex flex-col h-32 overflow-hidden hover:-translate-y-1"
    >
      {/* Üst Bilgi: Renk, Kategori ve Aksiyonlar */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-black/30 sepia:bg-sepia-200/40 py-1 px-2 rounded-lg border border-slate-100 dark:border-white/5 sepia:border-sepia-300/20">
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: note.color }} />
          <span className="text-[7px] font-black text-slate-600 dark:text-zinc-400 sepia:text-sepia-700 uppercase tracking-wider">
            {t.categoryNames[note.category as Category]}
          </span>
        </div>
        
        <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          {/* Kilit Butonu */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onLock(note);
            }}
            className={`p-1.5 rounded-lg transition-all transform hover:scale-110 ${
              note.isLocked 
              ? 'text-amber-500 hover:text-amber-600 bg-amber-50 dark:bg-amber-900/20 sepia:bg-amber-100' 
              : 'text-slate-400 dark:text-zinc-600 sepia:text-sepia-500 hover:text-slate-900 dark:hover:text-zinc-200 sepia:hover:text-sepia-900'
            }`}
            title={note.isLocked ? t.unlockNote : t.lockNote}
          >
            {note.isLocked ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>
            )}
          </button>

          {/* Sil Butonu */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete(note.id);
            }}
            className="p-1.5 text-slate-400 dark:text-zinc-600 sepia:text-sepia-500 hover:text-red-500 dark:hover:text-red-400 sepia:hover:text-red-700 transition-all transform hover:scale-110"
            title={t.deleteAction}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
          </button>
        </div>
      </div>

      {/* Başlık */}
      <div className="flex-1 flex flex-col justify-start">
        <h3 className="text-[13px] font-bold text-slate-900 dark:text-zinc-100 sepia:text-sepia-900 line-clamp-3 leading-tight tracking-tight">
          {note.title || (language === 'tr' ? 'Başlıksız' : 'Untitled')}
        </h3>
        
        {/* Kilit İkonu (Sadece kilitliyse görünür, içerik yerine geçer) */}
        {note.isLocked && (
          <div className="mt-2 flex items-center gap-2 text-slate-500 dark:text-zinc-600 sepia:text-sepia-500 italic">
             <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
             <p className="text-[10px] font-medium">{t.lockedContent}</p>
          </div>
        )}
      </div>
      
      {/* Alt Bilgi: Tarihler */}
      <div className="mt-2 pt-2 border-t border-slate-50 dark:border-white/5 sepia:border-sepia-200/50 flex items-center justify-between shrink-0">
        
        {/* Oluşturulma Tarihi */}
        <div className="flex items-center gap-1 text-slate-500 dark:text-zinc-500 sepia:text-sepia-500 opacity-80" title={t.createdDate}>
          <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          <span className="text-[8px] font-medium tracking-tight">
            {formattedCreated}
          </span>
        </div>

        {/* Güncellenme Tarihi */}
        <div className="flex items-center gap-1 text-slate-600 dark:text-zinc-400 sepia:text-sepia-600" title={t.updatedDate}>
          <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
          <span className="text-[8px] font-bold tracking-tight">
            {formattedUpdated}
          </span>
        </div>
      </div>
    </div>
  );
};

export default NoteCard;
