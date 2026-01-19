
import React, { useState, useEffect, useRef } from 'react';
import { Language } from '../types';
import { translations } from '../translations';
import PopupWindow from './PopupWindow';

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (password: string) => void;
  mode: 'set' | 'enter';
  language: Language;
  isError?: boolean;
}

const PasswordModal: React.FC<PasswordModalProps> = ({ isOpen, onClose, onSubmit, mode, language, isError }) => {
  const [password, setPassword] = useState('');
  const t = translations[language];
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim()) {
      onSubmit(password);
    }
  };

  return (
    <PopupWindow
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'set' ? t.setPassword : t.enterPassword}
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div className="space-y-2">
          {mode === 'enter' && (
            <p className="text-xs text-slate-600 dark:text-zinc-400 sepia:text-sepia-700 font-medium">
              {t.passwordRequired}
            </p>
          )}
          
          <div className="relative">
            <input
              ref={inputRef}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t.passwordPlaceholder}
              className={`w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/20 sepia:bg-sepia-200/50 border outline-none text-sm transition-all
                ${isError 
                  ? 'border-red-500 text-red-500 placeholder-red-300 focus:ring-2 focus:ring-red-500/20' 
                  : 'border-slate-200 dark:border-white/10 sepia:border-sepia-300 focus:border-slate-900 dark:focus:border-zinc-400 sepia:focus:border-sepia-900 text-slate-900 dark:text-white sepia:text-sepia-900 placeholder-slate-400 dark:placeholder-zinc-700 sepia:placeholder-sepia-500'
                }
              `}
            />
          </div>
          
          {isError && (
            <p className="text-[10px] font-bold text-red-500 animate-pulse">
              {t.wrongPassword}
            </p>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-zinc-400 sepia:text-sepia-700 hover:bg-slate-50 dark:hover:bg-zinc-800 sepia:hover:bg-sepia-200 transition-colors"
          >
            {t.cancel}
          </button>
          <button
            type="submit"
            disabled={!password.trim()}
            className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 dark:bg-zinc-100 dark:text-black sepia:bg-sepia-900 shadow-lg hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all"
          >
            {mode === 'set' ? t.save : t.unlockNote}
          </button>
        </div>
      </form>
    </PopupWindow>
  );
};

export default PasswordModal;
