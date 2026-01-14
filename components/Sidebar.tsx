
import React from 'react';
import { Category, Language } from '../types';
import { translations } from '../translations';

interface SidebarProps {
  activeCategory: Category | 'Tümü';
  setActiveCategory: (category: Category | 'Tümü') => void;
  noteCount: Record<string, number>;
  onSettingsClick: () => void;
  language: Language;
}

const categories: (Category | 'Tümü')[] = ['Tümü', 'Genel', 'İş', 'Kişisel', 'Fikirler', 'Önemli'];

const Sidebar: React.FC<SidebarProps> = ({ activeCategory, setActiveCategory, noteCount, onSettingsClick, language }) => {
  const t = translations[language];

  return (
    <aside className="w-56 bg-white dark:bg-black sepia:bg-sepia-200 border-r border-slate-100 dark:border-white/5 sepia:border-sepia-300 h-screen sticky top-0 hidden md:flex flex-col p-6 select-none transition-colors duration-300">
      <div className="flex items-center gap-3 mb-6 group cursor-default shrink-0">
        {/* Yeni Logo Tasarımı */}
        <div className="w-8 h-8 bg-[#1e1b26] sepia:bg-sepia-900 rounded-lg flex items-center justify-center shadow-lg shadow-black/10 sepia:shadow-sepia-900/10 group-hover:scale-105 transition-transform duration-300">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="5" y="4" width="14" height="16" rx="2" stroke="white" strokeWidth="2"/>
            <path d="M8 8H16" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M8 11H16" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M8 14H16" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M8 17H12" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <h1 className="text-sm font-bold text-slate-950 dark:text-white sepia:text-sepia-900 tracking-tight uppercase">{t.appName}</h1>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto custom-scrollbar -mx-2 px-2">
        <div className="sticky top-0 bg-white dark:bg-black sepia:bg-sepia-200 z-10 py-2 mb-2">
          <p className="text-[9px] font-black text-slate-500 dark:text-slate-700 sepia:text-sepia-500 uppercase tracking-widest pl-2">{t.categories}</p>
        </div>
        
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 group ${
              activeCategory === cat
                ? 'bg-slate-100 dark:bg-zinc-900 sepia:bg-sepia-300 text-slate-950 dark:text-white sepia:text-sepia-900 font-bold'
                : 'text-slate-600 dark:text-slate-600 sepia:text-sepia-600 hover:text-slate-950 dark:hover:text-slate-300 sepia:hover:text-sepia-900 hover:bg-slate-50 dark:hover:bg-zinc-900/40 sepia:hover:bg-sepia-300/50'
            }`}
          >
            <span className="text-xs">{t.categoryNames[cat as Category] || cat}</span>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded transition-colors ${
              activeCategory === cat 
              ? 'bg-white dark:bg-black sepia:bg-sepia-100 text-slate-950 dark:text-white sepia:text-sepia-900 border border-slate-200 dark:border-white/10 sepia:border-sepia-300/50' 
              : 'text-slate-500 dark:text-slate-800 sepia:text-sepia-500 group-hover:text-slate-700 sepia:group-hover:text-sepia-800'
            }`}>
              {noteCount[cat] || 0}
            </span>
          </button>
        ))}
      </nav>

      <div className="mt-4 shrink-0 pt-4 border-t border-slate-100 dark:border-white/5 sepia:border-sepia-300">
        <button
          onClick={onSettingsClick}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-700 sepia:text-sepia-600 hover:text-slate-950 dark:hover:text-slate-300 sepia:hover:text-sepia-900 transition-all group border border-transparent hover:border-slate-100 dark:hover:border-white/5 sepia:hover:border-sepia-300"
        >
          <svg className="group-hover:rotate-45 transition-transform" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
          <span className="text-xs font-bold">{t.settings}</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
