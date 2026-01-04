
import { Note, Theme, Language } from '../types';

const DB_NAME = 'NoteMasterDB';
const DB_VERSION = 1;
const NOTES_STORE = 'notes';
const SETTINGS_STORE = 'settings';

class DBService {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    if (this.db) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(NOTES_STORE)) {
          db.createObjectStore(NOTES_STORE, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
          db.createObjectStore(SETTINGS_STORE, { keyPath: 'key' });
        }
      };
    });
  }

  async getAllNotes(): Promise<Note[]> {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(NOTES_STORE, 'readonly');
      const store = transaction.objectStore(NOTES_STORE);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async saveNote(note: Note): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(NOTES_STORE, 'readwrite');
      const store = transaction.objectStore(NOTES_STORE);
      const request = store.put(note);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteNote(id: string): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(NOTES_STORE, 'readwrite');
      const store = transaction.objectStore(NOTES_STORE);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getSetting<T>(key: string, defaultValue: T): Promise<T> {
    await this.init();
    return new Promise((resolve) => {
      const transaction = this.db!.transaction(SETTINGS_STORE, 'readonly');
      const store = transaction.objectStore(SETTINGS_STORE);
      const request = store.get(key);
      request.onsuccess = () => {
        resolve(request.result ? request.result.value : defaultValue);
      };
      request.onerror = () => resolve(defaultValue);
    });
  }

  async saveSetting(key: string, value: any): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(SETTINGS_STORE, 'readwrite');
      const store = transaction.objectStore(SETTINGS_STORE);
      const request = store.put({ key, value });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Veri Göçü: LocalStorage'daki verileri IndexedDB'ye taşır
  async migrateFromLocalStorage(): Promise<void> {
    await this.init();
    const savedNotes = localStorage.getItem('notes');
    if (savedNotes) {
      const notes: Note[] = JSON.parse(savedNotes);
      for (const note of notes) {
        await this.saveNote(note);
      }
      localStorage.removeItem('notes');
    }

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      await this.saveSetting('theme', savedTheme);
      localStorage.removeItem('theme');
    }

    const savedLang = localStorage.getItem('language');
    if (savedLang) {
      await this.saveSetting('language', savedLang);
      localStorage.removeItem('language');
    }
  }
}

export const dbService = new DBService();
