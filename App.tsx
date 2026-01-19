
import React, { useState, useEffect, useMemo } from 'react';
import { Note, Category, Theme, Language } from './types';
import { translations } from './translations';
import { dbService } from './services/dbService';
import Sidebar from './components/Sidebar';
import NoteCard from './components/NoteCard';
import NoteEditor from './components/NoteEditor';
import Settings from './components/Settings';
import PasswordModal from './components/PasswordModal';
import { hashPassword } from './utils/security';
import { App as CapApp } from '@capacitor/app';

type View = 'list' | 'editor' | 'settings';

const App: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [theme, setTheme] = useState<Theme>('light');
  const [language, setLanguage] = useState<Language>('tr');
  const [showLineNumbers, setShowLineNumbers] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [activeCategory, setActiveCategory] = useState<Category | 'Tümü'>('Tümü');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [currentView, setCurrentView] = useState<View>('list');

  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);

  // Kilit/Şifre Durumları
  const [lockingNoteId, setLockingNoteId] = useState<string | null>(null);
  const [unlockingNoteId, setUnlockingNoteId] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState(false);
  const [targetAction, setTargetAction] = useState<'open' | 'removeLock' | null>(null);

  const t = translations[language];

  // Android Geri Tuşu Yönetimi
  useEffect(() => {
    const setupBackButton = async () => {
      const listener = await CapApp.addListener('backButton', () => {
        if (currentView !== 'list') {
          setCurrentView('list');
        } else {
          CapApp.exitApp();
        }
      });
      return listener;
    };

    const backListenerPromise = setupBackButton();

    return () => {
      backListenerPromise.then(l => l.remove());
    };
  }, [currentView]);

  useEffect(() => {
    const loadData = async () => {
      try {
        await dbService.migrateFromLocalStorage();

        const systemLang: Language = navigator.language.startsWith('tr') ? 'tr' : 'en';
        const systemTheme: Theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

        const [loadedNotes, loadedTheme, loadedLang, loadedLineNumbers] = await Promise.all([
          dbService.getAllNotes(),
          dbService.getSetting<Theme>('theme', systemTheme),
          dbService.getSetting<Language>('language', systemLang),
          dbService.getSetting<boolean>('showLineNumbers', false)
        ]);
        
        setNotes(loadedNotes);
        setTheme(loadedTheme);
        setLanguage(loadedLang);
        setShowLineNumbers(loadedLineNumbers);
      } catch (error) {
        console.error("Veriler yüklenirken bir hata oluştu:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      dbService.saveSetting('theme', theme);
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark', 'sepia');
      root.classList.add(theme);
    }
  }, [theme, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      dbService.saveSetting('language', language);
    }
  }, [language, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      dbService.saveSetting('showLineNumbers', showLineNumbers);
    }
  }, [showLineNumbers, isLoading]);

  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      const matchesCategory = activeCategory === 'Tümü' || note.category === activeCategory;
      const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           (!note.isLocked && note.content.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    }).sort((a, b) => b.updatedAt - a.updatedAt);
  }, [notes, activeCategory, searchQuery]);

  const noteCountByCat = useMemo(() => {
    const counts: Record<string, number> = { 'Tümü': notes.length };
    notes.forEach(n => {
      counts[n.category] = (counts[n.category] || 0) + 1;
    });
    return counts;
  }, [notes]);

  const handleAddNote = () => {
    setEditingNote(null);
    setCurrentView('editor');
  };

  const handleNoteClick = (note: Note) => {
    if (note.isLocked) {
      setUnlockingNoteId(note.id);
      setTargetAction('open');
      setPasswordError(false);
    } else {
      setEditingNote(note);
      setCurrentView('editor');
    }
  };

  const handleLockAction = (note: Note) => {
    if (note.isLocked) {
      setUnlockingNoteId(note.id);
      setTargetAction('removeLock');
      setPasswordError(false);
    } else {
      setLockingNoteId(note.id);
      setPasswordError(false);
    }
  };

  const handleSetPassword = async (password: string) => {
    if (lockingNoteId) {
      const hashedPassword = await hashPassword(password);
      const updatedNotes = notes.map(n => {
        if (n.id === lockingNoteId) {
          return { ...n, isLocked: true, password: hashedPassword };
        }
        return n;
      });
      
      const noteToUpdate = updatedNotes.find(n => n.id === lockingNoteId);
      if (noteToUpdate) {
        await dbService.saveNote(noteToUpdate);
        setNotes(updatedNotes);
      }
      setLockingNoteId(null);
    }
  };

  const handleUnlockSubmit = async (password: string) => {
    if (unlockingNoteId) {
      const note = notes.find(n => n.id === unlockingNoteId);
      if (!note || !note.password) return;

      const inputHash = await hashPassword(password);
      
      if (inputHash === note.password) {
        if (targetAction === 'open') {
          setEditingNote(note);
          setCurrentView('editor');
        } else if (targetAction === 'removeLock') {
          const updatedNotes = notes.map(n => {
            if (n.id === unlockingNoteId) {
              const { isLocked, password, ...rest } = n;
              return { ...rest, isLocked: false } as Note;
            }
            return n;
          });
          const noteToUpdate = updatedNotes.find(n => n.id === unlockingNoteId);
          if (noteToUpdate) {
            await dbService.saveNote(noteToUpdate);
            setNotes(updatedNotes);
          }
        }
        setUnlockingNoteId(null);
        setTargetAction(null);
      } else {
        setPasswordError(true);
      }
    }
  };

  const handleSaveNote = async (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
    const now = Date.now();
    let updatedNote: Note;

    if (noteData.id) {
      const existingNote = notes.find(n => n.id === noteData.id);
      updatedNote = {
        ...existingNote!,
        ...noteData,
        updatedAt: now,
      } as Note;
      setNotes(prev => prev.map(n => n.id === noteData.id ? updatedNote : n));
    } else {
      updatedNote = {
        ...noteData,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      } as Note;
      setNotes(prev => [updatedNote, ...prev]);
    }

    await dbService.saveNote(updatedNote);
    setCurrentView('list');
  };

  const triggerDelete = (id: string) => {
    setNoteToDelete(id);
  };

  const confirmDelete = async () => {
    if (noteToDelete) {
      await dbService.deleteNote(noteToDelete);
      setNotes(prev => prev.filter(n => n.id !== noteToDelete));
      setNoteToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-900 dark:border-zinc-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (currentView === 'editor') {
    return (
      <div className="h-full safe-top safe-bottom">
        <NoteEditor 
          note={editingNote} 
          onSave={handleSaveNote} 
          onClose={() => setCurrentView('list')}
          language={language}
          showLineNumbers={showLineNumbers}
        />
      </div>
    );
  }

  if (currentView === 'settings') {
    return (
      <div className="h-full safe-top safe-bottom">
        <Settings 
          theme={theme}
          onThemeChange={setTheme}
          language={language}
          onLanguageChange={setLanguage}
          showLineNumbers={showLineNumbers}
          onShowLineNumbersChange={setShowLineNumbers}
          onClose={() => setCurrentView('list')}
        />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-zinc-950 sepia:bg-sepia-100 transition-colors duration-300 animate-in fade-in relative overflow-hidden">
      <Sidebar 
        activeCategory={activeCategory} 
        setActiveCategory={setActiveCategory}
        noteCount={noteCountByCat}
        onSettingsClick={() => setCurrentView('settings')}
        language={language}
      />

      {/* Main Container */}
      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        
        {/* Sabit Header */}
        <div className="shrink-0 z-20 px-6 md:px-12 pt-10 pb-4 safe-top bg-slate-50/90 dark:bg-zinc-950/90 sepia:bg-sepia-100/90 backdrop-blur-md transition-colors duration-300 border-b border-transparent dark:border-white/5">
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 max-w-[1200px] mx-auto">
            <div className="flex justify-between items-start w-full md:w-auto">
              <div>
                <p className="text-[9px] font-black text-slate-600 dark:text-zinc-500 sepia:text-sepia-600 uppercase tracking-[0.3em] mb-2">{t.workspace}</p>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-zinc-100 sepia:text-sepia-900 tracking-tight">
                  {activeCategory === 'Tümü' ? t.allNotes : t.categoryNames[activeCategory as Category]}
                </h1>
              </div>
              
              <button 
                onClick={() => setCurrentView('settings')}
                className="md:hidden p-2 text-slate-600 dark:text-zinc-400 sepia:text-sepia-800 transition-all bg-white dark:bg-zinc-900 sepia:bg-sepia-200 rounded-xl border border-slate-200 dark:border-white/5 sepia:border-sepia-300 shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative group flex-1 md:flex-none">
                <svg className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-500 dark:text-zinc-600 sepia:text-sepia-600 transition-colors group-focus-within:text-slate-900 dark:group-focus-within:text-zinc-300 sepia:group-focus-within:text-sepia-900" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                <input 
                  type="text" 
                  placeholder={t.search}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-6 pr-4 py-1.5 bg-transparent border-b border-slate-200 dark:border-white/10 sepia:border-sepia-400/50 w-full md:w-48 outline-none focus:border-slate-900 dark:focus:border-white/30 sepia:focus:border-sepia-800 transition-all text-xs font-bold text-slate-900 dark:text-zinc-200 sepia:text-sepia-900 placeholder-slate-400 sepia:placeholder-sepia-600 dark:placeholder-zinc-700"
                />
              </div>
              
              <button 
                onClick={handleAddNote}
                className="bg-slate-900 dark:bg-zinc-100 dark:text-black sepia:bg-sepia-900 sepia:text-sepia-50 hover:opacity-90 text-white px-5 py-2.5 rounded-xl transition-all active:scale-95 flex items-center gap-2 font-bold text-xs shadow-lg shadow-slate-900/10 dark:shadow-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                <span>{t.newNote}</span>
              </button>
            </div>
          </header>
        </div>

        {/* Liste Alanı */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 md:px-12 pb-10 safe-bottom">
          <div className="max-w-[1200px] mx-auto pb-20 pt-4">
            {filteredNotes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
                {filteredNotes.map(note => (
                  <NoteCard 
                    key={note.id} 
                    note={note} 
                    onEdit={handleNoteClick}
                    onDelete={triggerDelete}
                    onLock={handleLockAction}
                    language={language}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-32">
                <div className="w-16 h-16 bg-slate-100 dark:bg-zinc-900 sepia:bg-sepia-200 rounded-full flex items-center justify-center mb-4 text-slate-400 dark:text-zinc-700 sepia:text-sepia-500">
                   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
                </div>
                <h3 className="text-sm font-black text-slate-500 dark:text-zinc-600 sepia:text-sepia-600 tracking-tight">{t.noNotes}</h3>
                <button onClick={handleAddNote} className="mt-2 text-xs text-slate-900 dark:text-zinc-400 sepia:text-sepia-800 font-bold hover:underline underline-offset-4">{t.createOne}</button>
              </div>
            )}
          </div>
        </div>
      </main>

      <PasswordModal 
        isOpen={!!lockingNoteId}
        onClose={() => setLockingNoteId(null)}
        onSubmit={handleSetPassword}
        mode="set"
        language={language}
      />

      <PasswordModal 
        isOpen={!!unlockingNoteId}
        onClose={() => {
          setUnlockingNoteId(null);
          setTargetAction(null);
        }}
        onSubmit={handleUnlockSubmit}
        mode="enter"
        language={language}
        isError={passwordError}
      />

      {/* Silme Onayı - Modern */}
      {noteToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/20 dark:bg-black/80 sepia:bg-sepia-900/40 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setNoteToDelete(null)}
          />
          <div className="bg-white dark:bg-zinc-900 sepia:bg-sepia-100 border border-slate-100 dark:border-white/10 sepia:border-sepia-300 rounded-3xl p-8 max-w-sm w-full shadow-2xl relative z-10 animate-in zoom-in-95 duration-200 text-center">
            <div className="w-14 h-14 bg-red-50 dark:bg-red-500/10 sepia:bg-red-900/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
            </div>
            
            <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100 sepia:text-sepia-900 mb-2 tracking-tight">
              {t.confirmDelete}
            </h3>
            
            <p className="text-xs text-slate-600 dark:text-zinc-400 sepia:text-sepia-700 mb-8 leading-relaxed font-medium">
              Bu işlem geri alınamaz.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setNoteToDelete(null)}
                className="px-4 py-3 rounded-xl text-xs font-bold text-slate-600 dark:text-zinc-400 sepia:text-sepia-700 hover:bg-slate-50 dark:hover:bg-zinc-800 sepia:hover:bg-sepia-200 transition-colors"
              >
                {t.cancel}
              </button>
              <button 
                onClick={confirmDelete}
                className="px-4 py-3 rounded-xl text-xs font-bold text-white bg-red-500 hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20 active:scale-95"
              >
                {t.deleteAction}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
