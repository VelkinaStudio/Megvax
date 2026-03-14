'use client';

import { ReactNode } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export interface AlertProps {
  type?: 'success' | 'warning' | 'error' | 'info';
  title?: string;
  message: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: ReactNode;
}

export function Alert({
  type = 'info',
  title,
  message,
  dismissible = false,
  onDismiss,
  action,
  icon,
}: AlertProps) {
  const styles = {
    success: {
      container: 'bg-emerald-50 border-emerald-200 text-emerald-700',
      icon: <CheckCircle className="w-5 h-5 text-emerald-600" />,
      title: 'text-emerald-900',
      message: 'text-emerald-800',
    },
    warning: {
      container: 'bg-amber-50 border-amber-200 text-amber-700',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
      title: 'text-amber-900',
      message: 'text-amber-800',
    },
    error: {
      container: 'bg-red-50 border-red-200 text-red-700',
      icon: <AlertCircle className="w-5 h-5 text-red-600" />,
      title: 'text-red-900',
      message: 'text-red-800',
    },
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-700',
      icon: <Info className="w-5 h-5 text-blue-600" />,
      title: 'text-blue-900',
      message: 'text-blue-800',
    },
  };

  const currentStyle = styles[type];
  const displayIcon = icon || currentStyle.icon;

  return (
    <div
      className={`
        flex items-start gap-3 p-4 rounded-lg border
        ${currentStyle.container}
      `}
      role="alert"
    >
      <div className="flex-shrink-0 mt-0.5">{displayIcon}</div>

      <div className="flex-1 min-w-0">
        {title && (
          <h4 className={`font-semibold text-sm mb-1 ${currentStyle.title}`}>{title}</h4>
        )}
        <p className={`text-sm ${currentStyle.message}`}>{message}</p>
        {action && (
          <button
            onClick={action.onClick}
            className="mt-2 text-sm font-medium underline hover:no-underline transition-all"
          >
            {action.label}
          </button>
        )}
      </div>

      {dismissible && onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 p-1 rounded-md hover:bg-black/5 transition-colors"
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>
      )}
    </div>
  );
}

export interface BannerProps {
  type?: 'success' | 'warning' | 'error' | 'info';
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible?: boolean;
  onDismiss?: () => void;
}

export function Banner({
  type = 'info',
  message,
  action,
  dismissible = false,
  onDismiss,
}: BannerProps) {
  const styles = {
    success: 'bg-accent-success text-white',
    warning: 'bg-accent-warning text-white',
    error: 'bg-accent-danger text-white',
    info: 'bg-accent-info text-white',
  };

  return (
    <div
      className={`
        flex items-center justify-between gap-4
        px-6 py-3
        ${styles[type]}
      `}
      role="alert"
    >
      <p className="text-sm font-medium flex-1">{message}</p>

      <div className="flex items-center gap-4">
        {action && (
          <button
            onClick={action.onClick}
            className="text-sm font-semibold underline hover:no-underline transition-all"
          >
            {action.label}
          </button>
        )}

        {dismissible && onDismiss && (
          <button
            onClick={onDismiss}
            className="p-1 rounded-md hover:bg-white/20 transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
