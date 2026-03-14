'use client';

import { InputHTMLAttributes, ReactNode, forwardRef } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  success?: string;
  helperText?: string;
  icon?: ReactNode;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      success,
      helperText,
      icon,
      fullWidth = true,
      className = '',
      required = false,
      disabled = false,
      ...props
    },
    ref
  ) => {
    const hasError = !!error;
    const hasSuccess = !!success;
    const showHelperText = helperText && !hasError && !hasSuccess;

    const inputBaseStyles = `
      px-4 py-2.5
      border-2 rounded-md
      transition-all duration-200
      placeholder:text-gray-400
      focus:outline-none focus:ring-4
      disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50
    `;

    const inputStateStyles = hasError
      ? 'border-accent-danger focus:border-accent-danger focus:ring-accent-danger/10'
      : hasSuccess
      ? 'border-accent-success focus:border-accent-success focus:ring-accent-success/10'
      : 'border-gray-300 focus:border-accent-primary focus:ring-accent-primary/10';

    const widthStyle = fullWidth ? 'w-full' : '';

    return (
      <div className={`${widthStyle}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
            {required && <span className="text-accent-danger ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            disabled={disabled}
            required={required}
            className={`
              ${inputBaseStyles}
              ${inputStateStyles}
              ${icon ? 'pl-10' : ''}
              ${widthStyle}
              ${className}
            `}
            {...props}
          />

          {hasError && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-accent-danger">
              <AlertCircle className="w-5 h-5" />
            </div>
          )}

          {hasSuccess && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-accent-success">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          )}
        </div>

        {showHelperText && (
          <p className="mt-1.5 text-sm text-gray-600">{helperText}</p>
        )}

        {hasError && <p className="mt-1.5 text-sm text-accent-danger">{error}</p>}

        {hasSuccess && <p className="mt-1.5 text-sm text-accent-success">{success}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
