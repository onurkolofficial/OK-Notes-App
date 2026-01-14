
import React, { useState } from 'react';
import { Theme, Language } from '../types';
import { translations } from '../translations';
import { version } from '../version';
import PopupWindow from './PopupWindow';

interface SettingsProps {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  showLineNumbers: boolean;
  onShowLineNumbersChange: (show: boolean) => void;
  onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({ theme, onThemeChange, language, onLanguageChange, showLineNumbers, onShowLineNumbersChange, onClose }) => {
  const t = translations[language];
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);

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
      bg: 'bg-[#f5efdc]', 
      border: 'border-[#d6c4a6]',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[#857055]">
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M8 7h6"/>
        </svg>
      )
    }
  ];

  const activeThemeObj = themes.find(item => item.id === theme) || themes[0];

  const langs = [
    { id: 'tr', name: 'Türkçe', flag: '🇹🇷' },
    { id: 'en', name: 'English', flag: '🇺🇸' }
  ];

  const activeLangObj = langs.find(l => l.id === language) || langs[0];

  return (
    <div className="min-h-screen bg-white dark:bg-black sepia:bg-sepia-100 flex flex-col animate-in fade-in slide-in-from-right-4 duration-300 overflow-y-auto custom-scrollbar transition-colors">
      <nav className="sticky top-0 bg-white/90 dark:bg-black/80 sepia:bg-sepia-100/90 backdrop-blur-md px-4 py-4 flex items-center justify-between z-10 border-b border-slate-100 dark:border-white/5 sepia:border-sepia-300">
        <button 
          onClick={onClose}
          className="p-2 -ml-2 text-slate-500 dark:text-slate-600 sepia:text-sepia-600 hover:text-slate-950 dark:hover:text-white sepia:hover:text-sepia-900 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <h2 className="text-[11px] font-black text-slate-950 dark:text-white sepia:text-sepia-900 tracking-[0.2em] uppercase">{t.appSettings}</h2>
        <div className="w-10" />
      </nav>

      <div className="flex-1 w-full max-lg mx-auto px-4 py-8">
        <div className="space-y-10">
          {/* Görünüm Bölümü */}
          <section>
            <header className="mb-4">
              <h3 className="text-[9px] font-black text-slate-600 dark:text-slate-700 sepia:text-sepia-500 uppercase tracking-widest pl-1">{t.appearance}</h3>
            </header>
            
            <div className="space-y-4">
              {/* Tema Seçici Butonu */}
              <button
                onClick={() => setIsThemeModalOpen(true)}
                className="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-white/5 sepia:border-sepia-300 bg-slate-50/50 dark:bg-zinc-900/20 sepia:bg-sepia-200/30 active:scale-[0.99] transition-all text-left group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl ${activeThemeObj.bg} ${activeThemeObj.border} border flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110`}>
                    {activeThemeObj.icon}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-950 dark:text-white sepia:text-sepia-900 mb-0.5">
                      {activeThemeObj.name}
                    </p>
                    <p className="text-[10px] font-medium text-slate-500 dark:text-slate-500 sepia:text-sepia-500">
                      {activeThemeObj.description}
                    </p>
                  </div>
                </div>
                
                <div className="text-slate-400 dark:text-slate-600 sepia:text-sepia-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg>
                </div>
              </button>

              {/* Satır Numaraları Toggle */}
              <button
                onClick={() => onShowLineNumbersChange(!showLineNumbers)}
                className="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-white/5 sepia:border-sepia-300 bg-slate-50/50 dark:bg-zinc-900/20 sepia:bg-sepia-200/30 active:scale-[0.99] transition-all text-left group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-200/50 dark:bg-white/5 sepia:bg-sepia-300/50 border border-slate-300/50 dark:border-white/10 sepia:border-sepia-400/50 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-500 dark:text-slate-400 sepia:text-sepia-600">
                      <line x1="10" x2="21" y1="6" y2="6"/><line x1="10" x2="21" y1="12" y2="12"/><line x1="10" x2="21" y1="18" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/>
                    </svg>
                  </div>

                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-950 dark:text-white sepia:text-sepia-900 mb-0.5">
                      {t.showLineNumbers}
                    </p>
                    <p className="text-[10px] font-medium text-slate-500 dark:text-slate-500 sepia:text-sepia-500">
                      {t.showLineNumbersDesc || "Editörde sol tarafta satır numaralarını görüntüler."}
                    </p>
                  </div>
                </div>

                <div
                  className={`w-11 h-6 rounded-full transition-colors duration-200 ease-in-out relative shrink-0 ${
                    showLineNumbers 
                    ? 'bg-slate-900 dark:bg-white sepia:bg-sepia-900' 
                    : 'bg-slate-200 dark:bg-zinc-800 sepia:bg-sepia-300'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 bg-white dark:bg-black sepia:bg-sepia-100 w-4 h-4 rounded-full shadow-sm transition-transform duration-200 ease-in-out ${
                      showLineNumbers ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </div>
              </button>
            </div>
          </section>

          {/* Dil Bölümü */}
          <section>
            <header className="mb-4">
              <h3 className="text-[9px] font-black text-slate-600 dark:text-slate-700 sepia:text-sepia-500 uppercase tracking-widest pl-1">{t.language}</h3>
            </header>
            
            {/* Dil Seçici Butonu (Tek Satır) */}
            <button
              onClick={() => setIsLangModalOpen(true)}
              className="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-white/5 sepia:border-sepia-300 bg-slate-50/50 dark:bg-zinc-900/20 sepia:bg-sepia-200/30 active:scale-[0.99] transition-all text-left group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-black sepia:bg-sepia-100 border border-slate-200 dark:border-white/10 sepia:border-sepia-300 flex items-center justify-center shrink-0 shadow-sm text-lg group-hover:scale-110 transition-transform">
                  {activeLangObj.flag}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-950 dark:text-white sepia:text-sepia-900 mb-0.5">
                    {activeLangObj.name}
                  </p>
                  <p className="text-[10px] font-medium text-slate-500 dark:text-slate-500 sepia:text-sepia-500">
                    {t.language}
                  </p>
                </div>
              </div>
              
              <div className="text-slate-400 dark:text-slate-600 sepia:text-sepia-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg>
              </div>
            </button>
          </section>

          {/* Bilgi Bölümü */}
          <section className="space-y-4">
            <h3 className="text-[9px] font-black text-slate-600 dark:text-slate-700 sepia:text-sepia-500 uppercase tracking-widest pl-1">{t.generalInfo}</h3>
            
            <div className="bg-slate-100 dark:bg-zinc-900/30 sepia:bg-sepia-200/50 rounded-2xl p-4 border border-slate-200 dark:border-white/5 sepia:border-sepia-300">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-400 sepia:text-sepia-600">{t.version}</span>
                <span className="text-[10px] font-medium text-slate-600 dark:text-slate-600 sepia:text-sepia-500">{version.app}.{version.code}</span>
              </div>
            </div>
          </section>
        </div>
      </div>

      <footer className="p-8 mt-auto">
        <div className="text-center">
          <p className="text-[8px] font-black text-slate-500 dark:text-zinc-800 sepia:text-sepia-400 tracking-[0.1em]">
            {t.madeWith}
          </p>
        </div>
      </footer>

      {/* Tema Seçim Modalı */}
      <PopupWindow 
        isOpen={isThemeModalOpen} 
        onClose={() => setIsThemeModalOpen(false)}
        title={t.appearance}
      >
        <div className="space-y-2">
          {themes.map((t_item) => (
            <button
              key={t_item.id}
              onClick={() => {
                onThemeChange(t_item.id as Theme);
                setIsThemeModalOpen(false);
              }}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 active:scale-95 ${
                theme === t_item.id 
                ? 'bg-slate-100 dark:bg-zinc-900/50 sepia:bg-sepia-200/50 border-slate-300 dark:border-white/10 sepia:border-sepia-400' 
                : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-zinc-900/20 sepia:hover:bg-sepia-200'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl ${t_item.bg} ${t_item.border} border flex items-center justify-center shrink-0 shadow-sm`}>
                {t_item.icon}
              </div>
              
              <div className="flex-1 text-left">
                <p className={`text-xs font-bold ${theme === t_item.id ? 'text-slate-950 dark:text-white sepia:text-sepia-900' : 'text-slate-700 dark:text-slate-400 sepia:text-sepia-600'}`}>
                  {t_item.name}
                </p>
                <p className={`text-[10px] font-medium ${theme === t_item.id ? 'text-slate-600 dark:text-slate-500 sepia:text-sepia-500' : 'text-slate-500 dark:text-slate-600 sepia:text-sepia-400'}`}>
                  {t_item.description}
                </p>
              </div>

              {theme === t_item.id && (
                <div className="text-slate-950 dark:text-white sepia:text-sepia-900">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </PopupWindow>

      {/* Dil Seçim Modalı */}
      <PopupWindow 
        isOpen={isLangModalOpen} 
        onClose={() => setIsLangModalOpen(false)}
        title={t.language}
      >
        <div className="space-y-2">
          {langs.map((l) => (
            <button
              key={l.id}
              onClick={() => {
                onLanguageChange(l.id as Language);
                setIsLangModalOpen(false);
              }}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 active:scale-95 ${
                language === l.id
                ? 'bg-slate-100 dark:bg-zinc-900/50 sepia:bg-sepia-200/50 border-slate-300 dark:border-white/10 sepia:border-sepia-400'
                : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-zinc-900/20 sepia:hover:bg-sepia-200'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-black sepia:bg-sepia-100 border border-slate-200 dark:border-white/10 sepia:border-sepia-300 flex items-center justify-center shrink-0 shadow-sm text-lg">
                {l.flag}
              </div>
              
              <div className="flex-1 text-left">
                <p className={`text-xs font-bold ${language === l.id ? 'text-slate-950 dark:text-white sepia:text-sepia-900' : 'text-slate-700 dark:text-slate-400 sepia:text-sepia-600'}`}>
                  {l.name}
                </p>
              </div>

              {language === l.id && (
                <div className="text-slate-950 dark:text-white sepia:text-sepia-900">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </PopupWindow>
    </div>
  );
};

export default Settings;
