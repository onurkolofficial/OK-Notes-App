
import React from 'react';
import { Theme, Language } from '../types';
import { translations } from '../translations';
import { version } from '../version';

interface SettingsProps {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({ theme, onThemeChange, language, onLanguageChange, onClose }) => {
  const t = translations[language];

  const themes = [
    { 
      id: 'light', 
      name: t.themes.light, 
      description: t.themes.lightDesc,
      bg: 'bg-white', 
      border: 'border-slate-200',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-orange-400">
          <circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>
        </svg>
      )
    },
    { 
      id: 'dark', 
      name: t.themes.dark, 
      description: t.themes.darkDesc,
      bg: 'bg-black', 
      border: 'border-zinc-800',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-indigo-400">
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
        </svg>
      )
    },
    { 
      id: 'sepia', 
      name: t.themes.sepia, 
      description: t.themes.sepiaDesc,
      bg: 'bg-[#f4ecd8]', 
      border: 'border-amber-200',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-amber-700">
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M8 7h6"/>
        </svg>
      )
    }
  ];

  const langs = [
    { id: 'tr', name: 'Türkçe', flag: '🇹🇷' },
    { id: 'en', name: 'English', flag: '🇺🇸' }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black sepia:bg-[#f4ecd8] flex flex-col animate-in fade-in slide-in-from-right-4 duration-300 overflow-y-auto custom-scrollbar transition-colors">
      <nav className="sticky top-0 bg-white/90 dark:bg-black/80 backdrop-blur-md px-4 py-4 flex items-center justify-between z-10 border-b border-slate-100 dark:border-white/5">
        <button 
          onClick={onClose}
          className="p-2 -ml-2 text-slate-500 dark:text-slate-600 hover:text-slate-950 dark:hover:text-white transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <h2 className="text-[11px] font-black text-slate-950 dark:text-white tracking-[0.2em] uppercase">{t.appSettings}</h2>
        <div className="w-10" />
      </nav>

      <div className="flex-1 w-full max-lg mx-auto px-4 py-8">
        <div className="space-y-10">
          {/* Tema Bölümü */}
          <section>
            <header className="mb-4">
              <h3 className="text-[9px] font-black text-slate-600 dark:text-slate-700 uppercase tracking-widest pl-1">{t.appearance}</h3>
            </header>
            
            <div className="space-y-2">
              {themes.map((t_item) => (
                <button
                  key={t_item.id}
                  onClick={() => onThemeChange(t_item.id as Theme)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 group relative ${
                    theme === t_item.id 
                    ? 'bg-slate-100 dark:bg-zinc-900/50 border-slate-300 dark:border-white/10' 
                    : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-zinc-900/20'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl ${t_item.bg} ${t_item.border} border flex items-center justify-center shrink-0 shadow-sm`}>
                    {t_item.icon}
                  </div>
                  
                  <div className="flex-1 text-left">
                    <p className={`text-xs font-bold ${theme === t_item.id ? 'text-slate-950 dark:text-white' : 'text-slate-700 dark:text-slate-400'}`}>
                      {t_item.name}
                    </p>
                    <p className={`text-[10px] font-medium ${theme === t_item.id ? 'text-slate-600 dark:text-slate-500' : 'text-slate-500 dark:text-slate-600'}`}>
                      {t_item.description}
                    </p>
                  </div>

                  {theme === t_item.id && (
                    <div className="text-slate-950 dark:text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* Dil Bölümü */}
          <section>
            <header className="mb-4">
              <h3 className="text-[9px] font-black text-slate-600 dark:text-slate-700 uppercase tracking-widest pl-1">{t.language}</h3>
            </header>
            <div className="grid grid-cols-2 gap-2">
              {langs.map((l) => (
                <button
                  key={l.id}
                  onClick={() => onLanguageChange(l.id as Language)}
                  className={`flex items-center justify-center gap-3 p-4 rounded-2xl border transition-all duration-200 ${
                    language === l.id
                    ? 'bg-slate-100 dark:bg-zinc-900/50 border-slate-300 dark:border-white/10 text-slate-950 dark:text-white'
                    : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-zinc-900/20 text-slate-600 dark:text-slate-600'
                  }`}
                >
                  <span className="text-base">{l.flag}</span>
                  <span className="text-xs font-bold">{l.name}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Bilgi Bölümü */}
          <section className="space-y-4">
            <h3 className="text-[9px] font-black text-slate-600 dark:text-slate-700 uppercase tracking-widest pl-1">{t.generalInfo}</h3>
            
            <div className="bg-slate-100 dark:bg-zinc-900/30 rounded-2xl p-4 border border-slate-200 dark:border-white/5">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-400">{t.version}</span>
                <span className="text-[10px] font-medium text-slate-600 dark:text-slate-600">{version.app} ({version.code})</span>
              </div>
            </div>
          </section>
        </div>
      </div>

      <footer className="p-8 mt-auto">
        <div className="text-center">
          <p className="text-[8px] font-black text-slate-500 dark:text-zinc-800 tracking-[0.1em]">
            {t.madeWith}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Settings;