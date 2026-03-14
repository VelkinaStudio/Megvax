'use client';

import { InputHTMLAttributes, ReactNode, forwardRef } from 'react';
import { Check } from 'lucide-react';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode;
  description?: string;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      description,
      error,
      className = '',
      disabled = false,
      ...props
    },
    ref
  ) => {
    const hasError = !!error;

    return (
      <div className={className}>
        <label className="flex items-start gap-3 cursor-pointer group">
          <div className="relative flex items-center justify-center flex-shrink-0">
            <input
              ref={ref}
              type="checkbox"
              disabled={disabled}
              className="peer sr-only"
              {...props}
            />
            <div
              className={`
                w-5 h-5 border-2 rounded
                transition-all duration-150
                peer-focus:ring-4 peer-focus:ring-accent-primary/10
                peer-checked:bg-accent-primary peer-checked:border-accent-primary
                peer-disabled:opacity-50 peer-disabled:cursor-not-allowed
                ${hasError ? 'border-accent-danger' : 'border-gray-300'}
              `}
            >
              <Check className="w-full h-full text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
            </div>
          </div>

          {(label || description) && (
            <div className="flex-1 pt-0.5">
              {label && (
                <span className="text-sm font-medium text-gray-900 group-hover:text-gray-700">
                  {label}
                </span>
              )}
              {description && (
                <p className="text-sm text-gray-600 mt-0.5">{description}</p>
              )}
            </div>
          )}
        </label>

        {hasError && <p className="mt-1.5 text-sm text-accent-danger ml-8">{error}</p>}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
