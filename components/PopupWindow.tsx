
import React, { useEffect, useState } from 'react';

interface PopupWindowProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const PopupWindow: React.FC<PopupWindowProps> = ({ isOpen, onClose, title, children }) => {
  const [show, setShow] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setShow(true);
    } else {
      const timer = setTimeout(() => setShow(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Arka Plan (Backdrop) */}
      <div 
        className={`absolute inset-0 bg-black/40 dark:bg-black/70 sepia:bg-sepia-900/50 backdrop-blur-[2px] transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      {/* İçerik Kartı - Modal Popup */}
      <div 
        className={`
          relative w-full max-w-sm bg-white dark:bg-zinc-900 sepia:bg-sepia-100 
          rounded-3xl p-6 shadow-2xl shadow-black/20
          border border-slate-200 dark:border-white/10 sepia:border-sepia-300
          transform transition-all duration-200 ease-out origin-center
          ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
        `}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-950 dark:text-white sepia:text-sepia-900 tracking-tight">
            {title}
          </h3>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 text-slate-400 dark:text-slate-600 sepia:text-sepia-400 hover:text-slate-950 dark:hover:text-white sepia:hover:text-sepia-900 transition-colors bg-slate-50 dark:bg-white/5 sepia:bg-sepia-200 rounded-full"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

export default PopupWindow;
