'use client';

import { ButtonHTMLAttributes, ReactNode, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  children: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      icon,
      iconPosition = 'left',
      fullWidth = false,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      inline-flex items-center justify-center gap-2
      font-medium rounded-md
      transition-all duration-[150ms] ease-[cubic-bezier(0.4,0.0,0.2,1)]
      focus:outline-none focus:ring-2 focus:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none
    `;

    const variantStyles = {
      primary: `
        bg-accent-primary text-white
        shadow-sm hover:shadow-md
        hover:-translate-y-0.5 active:translate-y-0
        focus:ring-accent-primary
      `,
      secondary: `
        bg-white text-gray-700
        border-2 border-gray-300
        hover:border-gray-400 hover:bg-gray-50
        hover:-translate-y-0.5 active:translate-y-0
        focus:ring-gray-300
      `,
      ghost: `
        text-gray-700
        hover:bg-gray-100 active:bg-gray-200
        focus:ring-gray-300
      `,
      danger: `
        bg-accent-danger text-white
        shadow-sm hover:shadow-md
        hover:-translate-y-0.5 active:translate-y-0
        focus:ring-accent-danger
      `,
    };

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-5 py-2.5 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    const widthStyle = fullWidth ? 'w-full' : '';

    const showIcon = icon && !loading;
    const showLoader = loading;

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
          ${baseStyles}
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${widthStyle}
          ${className}
        `}
        {...props}
      >
        {showLoader && <Loader2 className="w-4 h-4 animate-spin" />}
        {showIcon && iconPosition === 'left' && icon}
        <span>{children}</span>
        {showIcon && iconPosition === 'right' && icon}
      </button>
    );
  }
);

Button.displayName = 'Button';
