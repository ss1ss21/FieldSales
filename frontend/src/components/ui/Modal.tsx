import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;

  onConfirm?: () => void;       
  confirmText?: string;
  closeText?: string;          
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  onConfirm,
  confirmText = "Onayla",
  closeText
}: ModalProps) {
  if (!isOpen) return null;

  const hasFooter = Boolean(onConfirm || closeText);

  return (
    <div 
      onClick={onClose} 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm"
    >
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 flex flex-col overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-2xl font-bold leading-none"
          >
            &times;
          </button>
        </div>

        {/* İçerik Gövdesi */}
        <div className="p-6 flex-1 overflow-y-auto">
          {children}
        </div>

        {hasFooter && (
          <div className="px-6 py-4 border-t border-slate-200 flex justify-end items-center gap-3 bg-slate-50">
            {closeText && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-white bg-rose-500 rounded-lg hover:bg-rose-600 transition shadow-sm"
              >
                {closeText}
              </button>
            )}

            {onConfirm && (
              <button
                type="button"
                onClick={onConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition shadow-sm"
              >
                {confirmText}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}