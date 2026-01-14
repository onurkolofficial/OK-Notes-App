
import React from 'react';
import { Note, Language, Category } from '../types';
import { translations } from '../translations';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  language: Language;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, onEdit, onDelete, language }) => {
  const t = translations[language];
  
  // Detaylı tarih formatı: Gün Ay Yıl, Saat:Dakika
  const formattedDate = new Intl.DateTimeFormat(language === 'tr' ? 'tr-TR' : 'en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(new Date(note.updatedAt));

  return (
    <div 
      onClick={() => onEdit(note)}
      className="group relative bg-white dark:bg-black sepia:bg-sepia-50 p-4 rounded-xl border border-slate-200 dark:border-white/10 sepia:border-sepia-300 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] sepia:shadow-[0_2px_8px_-4px_rgba(78,61,47,0.1)] hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col h-32 overflow-hidden"
    >
      {/* Üst Bilgi: Renk ve Kategori */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-900/50 sepia:bg-sepia-200/50 py-1 px-2 rounded-lg border border-slate-200/50 dark:border-white/5 sepia:border-sepia-300/30">
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: note.color }} />
          <span className="text-[7px] font-black text-slate-700 dark:text-slate-400 sepia:text-sepia-600 uppercase tracking-wider">
            {t.categoryNames[note.category as Category]}
          </span>
        </div>
        
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onDelete(note.id);
          }}
          className="p-1 text-slate-400 dark:text-slate-800 sepia:text-sepia-300 hover:text-red-500 sepia:hover:text-red-700 transition-all transform hover:scale-110"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
        </button>
      </div>

      {/* Başlık */}
      <div className="flex-1 flex items-center">
        <h3 className="text-[13px] font-bold text-slate-950 dark:text-slate-100 sepia:text-sepia-900 line-clamp-2 leading-tight tracking-tight">
          {note.title || (language === 'tr' ? 'Başlıksız' : 'Untitled')}
        </h3>
      </div>
      
      {/* Alt Bilgi: Tam Tarih ve Saat */}
      <div className="mt-2 pt-2 border-t border-slate-100 dark:border-white/5 sepia:border-sepia-200 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-800 sepia:text-sepia-500">
          <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <span className="text-[8px] font-bold uppercase tracking-tight">
            {formattedDate}
          </span>
        </div>
      </div>
    </div>
  );
};

export default NoteCard;
