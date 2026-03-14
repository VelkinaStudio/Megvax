'use client';

import { SelectHTMLAttributes, forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
  fullWidth?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      options,
      placeholder,
      fullWidth = true,
      className = '',
      required = false,
      disabled = false,
      ...props
    },
    ref
  ) => {
    const hasError = !!error;
    const showHelperText = helperText && !hasError;

    const selectBaseStyles = `
      px-4 py-2.5 pr-10
      border-2 rounded-md
      transition-all duration-200
      appearance-none
      bg-white
      focus:outline-none focus:ring-4
      disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50
      cursor-pointer
    `;

    const selectStateStyles = hasError
      ? 'border-accent-danger focus:border-accent-danger focus:ring-accent-danger/10'
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
          <select
            ref={ref}
            disabled={disabled}
            required={required}
            className={`
              ${selectBaseStyles}
              ${selectStateStyles}
              ${widthStyle}
              ${className}
            `}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>

          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
            <ChevronDown className="w-5 h-5" />
          </div>
        </div>

        {showHelperText && (
          <p className="mt-1.5 text-sm text-gray-600">{helperText}</p>
        )}

        {hasError && <p className="mt-1.5 text-sm text-accent-danger">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
