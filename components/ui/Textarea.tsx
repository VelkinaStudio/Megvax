'use client';

import { TextareaHTMLAttributes, forwardRef } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = true,
      resize = 'vertical',
      className = '',
      required = false,
      disabled = false,
      rows = 4,
      ...props
    },
    ref
  ) => {
    const hasError = !!error;
    const showHelperText = helperText && !hasError;

    const textareaBaseStyles = `
      px-4 py-2.5
      border-2 rounded-md
      transition-all duration-200
      placeholder:text-gray-400
      focus:outline-none focus:ring-4
      disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50
    `;

    const textareaStateStyles = hasError
      ? 'border-accent-danger focus:border-accent-danger focus:ring-accent-danger/10'
      : 'border-gray-300 focus:border-accent-primary focus:ring-accent-primary/10';

    const resizeStyles = {
      none: 'resize-none',
      vertical: 'resize-y',
      horizontal: 'resize-x',
      both: 'resize',
    };

    const widthStyle = fullWidth ? 'w-full' : '';

    return (
      <div className={`${widthStyle}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
            {required && <span className="text-accent-danger ml-1">*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          disabled={disabled}
          required={required}
          rows={rows}
          className={`
            ${textareaBaseStyles}
            ${textareaStateStyles}
            ${resizeStyles[resize]}
            ${widthStyle}
            ${className}
          `}
          {...props}
        />

        {showHelperText && (
          <p className="mt-1.5 text-sm text-gray-600">{helperText}</p>
        )}

        {hasError && <p className="mt-1.5 text-sm text-accent-danger">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
