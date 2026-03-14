'use client';

import { HTMLAttributes, ReactNode } from 'react';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  dot?: boolean;
  children: ReactNode;
}

export function Badge({
  variant = 'neutral',
  size = 'md',
  dot = false,
  className = '',
  children,
  ...props
}: BadgeProps) {
  const baseStyles = `
    inline-flex items-center gap-1.5
    font-medium rounded-full
    transition-colors duration-150
  `;

  const variantStyles = {
    success: 'bg-accent-success/10 text-accent-success',
    warning: 'bg-accent-warning/10 text-accent-warning',
    danger: 'bg-accent-danger/10 text-accent-danger',
    info: 'bg-accent-info/10 text-accent-info',
    neutral: 'bg-gray-100 text-gray-700',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };

  const dotStyles = {
    success: 'bg-accent-success',
    warning: 'bg-accent-warning',
    danger: 'bg-accent-danger',
    info: 'bg-accent-info',
    neutral: 'bg-gray-500',
  };

  return (
    <span
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      {...props}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${dotStyles[variant]}`}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}
