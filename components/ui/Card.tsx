'use client';

import { HTMLAttributes, ReactNode } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'interactive' | 'flat';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: ReactNode;
}

export function Card({
  variant = 'default',
  padding = 'md',
  className = '',
  children,
  onClick,
  ...props
}: CardProps) {
  const baseStyles = 'bg-white rounded-lg transition-all duration-200';

  const variantStyles = {
    default: 'border border-gray-200 shadow-sm hover:shadow-md',
    elevated: 'border border-gray-200 shadow-lg',
    interactive: `
      border border-gray-200 shadow-sm
      hover:shadow-lg hover:-translate-y-1 hover:border-accent-primary
      cursor-pointer
      focus-within:ring-2 focus-within:ring-accent-primary focus-within:ring-offset-2
    `,
    flat: 'border border-gray-200',
  };

  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${paddingStyles[padding]}
        ${className}
      `}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}

export interface CardHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function CardHeader({ title, description, action, className = '' }: CardHeaderProps) {
  return (
    <div className={`flex items-start justify-between gap-4 ${className}`}>
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

export interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return <div className={`mt-4 ${className}`}>{children}</div>;
}

export interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return (
    <div className={`mt-6 pt-4 border-t border-gray-200 ${className}`}>
      {children}
    </div>
  );
}
