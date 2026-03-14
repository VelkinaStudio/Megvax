'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  action?: ToastAction;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (message: string, type?: ToastType, options?: { action?: ToastAction; duration?: number }) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    (
      message: string,
      type: ToastType = 'info',
      options?: { action?: ToastAction; duration?: number }
    ) => {
      const id = Math.random().toString(36).substr(2, 9);
      const duration = options?.duration ?? 5000;

      setToasts((prev) => [...prev, { id, message, type, action: options?.action, duration }]);

      if (duration > 0) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, duration);
      }
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }

  return {
    success: (message: string, options?: { action?: ToastAction; duration?: number }) =>
      context.addToast(message, 'success', options),
    error: (message: string, options?: { action?: ToastAction; duration?: number }) =>
      context.addToast(message, 'error', options),
    info: (message: string, options?: { action?: ToastAction; duration?: number }) =>
      context.addToast(message, 'info', options),
  };
}

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-accent-success" />,
    error: <AlertCircle className="w-5 h-5 text-accent-danger" />,
    info: <Info className="w-5 h-5 text-accent-info" />,
  };

  const borderColors = {
    success: 'border-l-accent-success',
    error: 'border-l-accent-danger',
    info: 'border-l-accent-info',
  };

  return (
    <div
      className={`
        bg-white rounded-lg shadow-xl border-l-4
        ${borderColors[toast.type]}
        p-4 flex items-start gap-3
        animate-in slide-in-from-right duration-200
        min-w-[320px]
      `}
    >
      <div className="flex-shrink-0 mt-0.5">{icons[toast.type]}</div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{toast.message}</p>
        {toast.action && (
          <button
            onClick={() => {
              toast.action?.onClick();
              onRemove(toast.id);
            }}
            className="mt-2 text-sm font-semibold text-accent-primary hover:underline"
          >
            {toast.action.label}
          </button>
        )}
      </div>

      <button
        onClick={() => onRemove(toast.id)}
        className="flex-shrink-0 p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        aria-label="Close toast"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
