
import React, { useState, useEffect, useMemo } from 'react';
import { Note, Category, Theme, Language } from './types';
import { translations } from './translations';
import { dbService } from './services/dbService';
import Sidebar from './components/Sidebar';
import NoteCard from './components/NoteCard';
import NoteEditor from './components/NoteEditor';
import Settings from './components/Settings';
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

        // Sistem varsayılanlarını algıla
        const systemLang: Language = navigator.language.startsWith('tr') ? 'tr' : 'en';
        const systemTheme: Theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

        // Eğer DB'de ayar varsa onu al, yoksa sistem varsayılanını kullan
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
                           note.content.toLowerCase().includes(searchQuery.toLowerCase());
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

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setCurrentView('editor');
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
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-900 dark:border-white border-t-transparent rounded-full animate-spin"></div>
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
    <div className="flex h-screen bg-white dark:bg-black sepia:bg-sepia-100 transition-colors duration-300 animate-in fade-in relative overflow-hidden">
      <Sidebar 
        activeCategory={activeCategory} 
        setActiveCategory={setActiveCategory}
        noteCount={noteCountByCat}
        onSettingsClick={() => setCurrentView('settings')}
        language={language}
      />

      <main className="flex-1 px-6 md:px-12 py-10 overflow-y-auto custom-scrollbar safe-top safe-bottom">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 max-w-[1200px] mx-auto">
          <div className="flex justify-between items-start w-full md:w-auto">
            <div>
              <p className="text-[9px] font-black text-slate-500 dark:text-slate-600 sepia:text-sepia-500 uppercase tracking-[0.3em] mb-2">{t.workspace}</p>
              <h1 className="text-3xl font-bold text-slate-950 dark:text-white sepia:text-sepia-900 tracking-tight">
                {activeCategory === 'Tümü' ? t.allNotes : t.categoryNames[activeCategory as Category]}
              </h1>
            </div>
            
            <button 
              onClick={() => setCurrentView('settings')}
              className="md:hidden p-2 text-slate-500 dark:text-slate-700 sepia:text-sepia-600 transition-all bg-slate-100 dark:bg-zinc-900 sepia:bg-sepia-200 rounded-xl border border-slate-200 dark:border-white/5 sepia:border-sepia-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group flex-1 md:flex-none">
              <svg className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-800 sepia:text-sepia-400 transition-colors group-focus-within:text-slate-950 dark:group-focus-within:text-slate-400 sepia:group-focus-within:text-sepia-800" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              <input 
                type="text" 
                placeholder={t.search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-6 pr-4 py-1.5 bg-transparent border-b border-slate-200 dark:border-white/5 sepia:border-sepia-300 w-full md:w-48 outline-none focus:border-slate-950 dark:focus:border-white/40 sepia:focus:border-sepia-600 transition-all text-xs font-bold text-slate-950 dark:text-white sepia:text-sepia-900 sepia:placeholder-sepia-400"
              />
            </div>
            
            <button 
              onClick={handleAddNote}
              className="bg-slate-900 dark:bg-white dark:text-black sepia:bg-sepia-900 sepia:text-sepia-50 hover:opacity-90 text-white px-5 py-2.5 rounded-xl transition-all active:scale-95 flex items-center gap-2 font-bold text-xs shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              <span>{t.newNote}</span>
            </button>
          </div>
        </header>

        <div className="max-w-[1200px] mx-auto pb-20">
          {filteredNotes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
              {filteredNotes.map(note => (
                <NoteCard 
                  key={note.id} 
                  note={note} 
                  onEdit={handleEditNote}
                  onDelete={triggerDelete}
                  language={language}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32">
              <h3 className="text-sm font-black text-slate-500 dark:text-slate-800 sepia:text-sepia-400 tracking-tight">{t.noNotes}</h3>
              <button onClick={handleAddNote} className="mt-2 text-xs text-slate-950 dark:text-slate-500 sepia:text-sepia-600 font-black hover:underline underline-offset-4">{t.createOne}</button>
            </div>
          )}
        </div>
      </main>

      {noteToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/40 dark:bg-black/60 sepia:bg-sepia-900/40 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setNoteToDelete(null)}
          />
          <div className="bg-white dark:bg-zinc-900 sepia:bg-sepia-100 border border-slate-200 dark:border-white/10 sepia:border-sepia-300 rounded-3xl p-8 max-w-sm w-full shadow-2xl relative z-10 animate-in zoom-in-95 duration-200 text-center">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 sepia:bg-red-900/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
            </div>
            
            <h3 className="text-lg font-bold text-slate-950 dark:text-white sepia:text-sepia-900 mb-3 tracking-tight">
              {t.confirmDelete}
            </h3>
            
            <p className="text-xs text-slate-600 dark:text-slate-400 sepia:text-sepia-600 mb-8 leading-relaxed font-bold">
              Bu işlem geri alınamaz. Notunuz kalıcı olarak veritabanından silinecektir.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setNoteToDelete(null)}
                className="px-4 py-3 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 sepia:text-sepia-600 hover:bg-slate-100 dark:hover:bg-zinc-800 sepia:hover:bg-sepia-200 transition-colors border border-slate-200 dark:border-white/5 sepia:border-sepia-300"
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
