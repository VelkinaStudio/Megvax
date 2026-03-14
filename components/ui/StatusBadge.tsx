'use client';

import React from 'react';

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export type StatusType = 'active' | 'paused' | 'archived' | 'learning' | 'error' | 'pending';

export interface StatusBadgeProps {
  status: StatusType;
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const statusConfig: Record<StatusType, {
  label: string;
  bgColor: string;
  textColor: string;
  dotColor: string;
}> = {
  active: {
    label: 'Active',
    bgColor: 'bg-emerald-100',
    textColor: 'text-emerald-800',
    dotColor: 'bg-emerald-500',
  },
  paused: {
    label: 'Paused',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-800',
    dotColor: 'bg-amber-500',
  },
  archived: {
    label: 'Archived',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-700',
    dotColor: 'bg-gray-500',
  },
  learning: {
    label: 'Learning',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    dotColor: 'bg-blue-500',
  },
  error: {
    label: 'Error',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    dotColor: 'bg-red-500',
  },
  pending: {
    label: 'Pending',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    dotColor: 'bg-blue-500',
  },
};

const sizeConfig = {
  sm: {
    padding: 'px-2 py-0.5',
    text: 'text-xs',
    dot: 'w-1.5 h-1.5',
    gap: 'gap-1',
  },
  md: {
    padding: 'px-2.5 py-1',
    text: 'text-sm',
    dot: 'w-2 h-2',
    gap: 'gap-1.5',
  },
  lg: {
    padding: 'px-3 py-1.5',
    text: 'text-sm',
    dot: 'w-2.5 h-2.5',
    gap: 'gap-2',
  },
};

export function StatusBadge({
  status,
  size = 'md',
  pulse = false,
  className,
  children,
}: StatusBadgeProps) {
  const config = statusConfig[status];
  const sizeStyles = sizeConfig[size];

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full transition-colors',
        sizeStyles.padding,
        sizeStyles.text,
        sizeStyles.gap,
        config.bgColor,
        config.textColor,
        className
      )}
    >
      <span
        className={cn(
          'rounded-full',
          sizeStyles.dot,
          config.dotColor,
          pulse && status === 'active' && 'animate-pulse'
        )}
      />
      {children || config.label}
    </span>
  );
}

// Compound component for quick status switching
export interface StatusToggleProps {
  status: StatusType;
  onChange: (status: StatusType) => void;
  allowedStatuses?: StatusType[];
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StatusToggle({
  status,
  onChange,
  allowedStatuses = ['active', 'paused'],
  size = 'md',
  className,
}: StatusToggleProps) {
  return (
    <div className={cn('inline-flex items-center gap-1 p-1 bg-gray-100 rounded-lg', className)}>
      {allowedStatuses.map((s) => (
        <button
          key={s}
          onClick={() => onChange(s)}
          className={cn(
            'px-3 py-1 rounded-md text-sm font-medium transition-all duration-200',
            status === s
              ? 'bg-white shadow-sm text-gray-900'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          )}
        >
          {statusConfig[s].label}
        </button>
      ))}
    </div>
  );
}
