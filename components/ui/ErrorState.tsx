'use client';

import { ReactNode } from 'react';
import { AlertCircle, RefreshCw, AlertTriangle, Info } from 'lucide-react';
import { useTranslations } from '@/lib/i18n';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  icon?: ReactNode;
}

export function ErrorState({ 
  title, 
  message, 
  onRetry,
  icon = <AlertCircle className="w-10 h-10 text-red-500" />
}: ErrorStateProps) {
  const t = useTranslations('common');
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title || t('error')}</h3>
      <p className="text-gray-600 max-w-md mb-6">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          {t('retry')}
        </button>
      )}
    </div>
  );
}

interface AlertProps {
  variant?: 'info' | 'warning' | 'error' | 'success';
  title?: string;
  children: ReactNode;
  onClose?: () => void;
}

const variantStyles = {
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
};

const variantIcons = {
  info: <Info className="w-5 h-5 text-blue-600" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-600" />,
  error: <AlertCircle className="w-5 h-5 text-red-600" />,
  success: <Info className="w-5 h-5 text-emerald-600" />,
};

export function Alert({ variant = 'info', title, children, onClose }: AlertProps) {
  return (
    <div className={`rounded-xl border p-4 ${variantStyles[variant]}`}>
      <div className="flex gap-3">
        <div className="flex-shrink-0 mt-0.5">{variantIcons[variant]}</div>
        <div className="flex-1">
          {title && <h4 className="font-semibold mb-1">{title}</h4>}
          <div className="text-sm opacity-90">{children}</div>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="flex-shrink-0 opacity-60 hover:opacity-100"
            aria-label="Kapat"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}

interface FormErrorProps {
  message: string;
}

export function FormError({ message }: FormErrorProps) {
  return (
    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
      <AlertCircle className="w-3.5 h-3.5" />
      {message}
    </p>
  );
}

interface NetworkErrorProps {
  onRetry: () => void;
}

export function NetworkError({ onRetry }: NetworkErrorProps) {
  const t = useTranslations('common');
  return (
    <ErrorState
      title={t('connection_error')}
      message={t('connection_error_message')}
      onRetry={onRetry}
      icon={<AlertTriangle className="w-10 h-10 text-amber-500" />}
    />
  );
}
