'use client';

import { InputHTMLAttributes, ReactNode, forwardRef } from 'react';

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  label?: ReactNode;
  description?: string;
  onChange?: (checked: boolean) => void;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  (
    {
      label,
      description,
      className = '',
      disabled = false,
      checked,
      onChange,
      ...props
    },
    ref
  ) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.checked);
    };

    return (
      <label className={`flex items-start gap-3 cursor-pointer group ${disabled ? 'cursor-not-allowed opacity-50' : ''} ${className}`}>
        <div className="relative flex items-center flex-shrink-0">
          <input
            ref={ref}
            type="checkbox"
            disabled={disabled}
            checked={checked}
            onChange={handleChange}
            className="peer sr-only"
            {...props}
          />
          <div
            className={`
              w-11 h-6 rounded-full
              transition-all duration-200
              peer-focus:ring-4 peer-focus:ring-blue-500/20
              peer-checked:bg-blue-600
              peer-disabled:opacity-50 peer-disabled:cursor-not-allowed
              bg-gray-300
            `}
          />
          <div
            className={`
              absolute top-[3px] left-[3px]
              w-[18px] h-[18px] rounded-full bg-white
              transition-transform duration-200
              shadow-sm
            `}
            style={{
              transform: checked ? 'translateX(20px)' : 'translateX(0)',
            }}
          />
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
    );
  }
);

Switch.displayName = 'Switch';
