'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

 interface ToastAction {
  label: string;
  onClick: () => void;
 }

 interface AddToastOptions {
  durationMs?: number;
  action?: ToastAction;
 }

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  action?: ToastAction;
}

interface ToastContextType {
  addToast: (message: string, type?: ToastType, options?: AddToastOptions) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'info', options?: AddToastOptions) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev: Toast[]) => [...prev, { id, message, type, action: options?.action }]);

    const durationMs = options?.durationMs ?? 3000;
    if (durationMs > 0) {
      setTimeout(() => {
        setToasts((prev: Toast[]) => prev.filter((t: Toast) => t.id !== id));
      }, durationMs);
    }
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev: Toast[]) => prev.filter((t: Toast) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast: Toast) => (
          <div
            key={toast.id}
            className={
              `
              flex items-center gap-3 px-4 py-3 rounded-[2px] border-2 border-brand-black min-w-[300px] animate-in slide-in-from-right-full duration-300
              ${toast.type === 'success' ? 'bg-brand-white text-brand-black' : ''}
              ${toast.type === 'error' ? 'bg-brand-white text-brand-black' : ''}
              ${toast.type === 'info' ? 'bg-brand-white text-brand-black' : ''}
            `
            }
          >
            {toast.type === 'success' && <CheckCircle size={20} className="text-vivid-yellow" />}
            {toast.type === 'error' && <AlertCircle size={20} className="text-alert-red" />}
            {toast.type === 'info' && <Info size={20} className="text-action-blue" />}
            
            <p className="text-sm font-medium flex-1">{toast.message}</p>

            {toast.action && (
              <button
                onClick={() => {
                  toast.action?.onClick();
                  removeToast(toast.id);
                }}
                className="text-sm font-bold text-action-blue hover:underline underline-offset-2 transition-colors"
              >
                {toast.action.label}
              </button>
            )}
            
            <button 
              onClick={() => removeToast(toast.id)}
              className="text-brand-black/60 hover:text-brand-black transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
