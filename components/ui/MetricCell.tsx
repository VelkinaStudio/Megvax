'use client';

import React from 'react';

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export type MetricFormat = 'currency' | 'percentage' | 'number' | 'decimal';

export interface MetricCellProps {
  value: number;
  format: MetricFormat;
  trend?: number;
  trendLabel?: string;
  className?: string;
  align?: 'left' | 'right' | 'center';
  size?: 'sm' | 'md' | 'lg';
}

// Currency formatter for TRY
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// Percentage formatter
function formatPercentage(value: number): string {
  return `%${value.toFixed(2)}`;
}

// Number formatter
function formatNumber(value: number): string {
  return new Intl.NumberFormat('tr-TR').format(value);
}

// Decimal formatter
function formatDecimal(value: number): string {
  return value.toFixed(2);
}

export function formatMetric(value: number, format: MetricFormat): string {
  switch (format) {
    case 'currency':
      return formatCurrency(value);
    case 'percentage':
      return formatPercentage(value);
    case 'number':
      return formatNumber(value);
    case 'decimal':
      return formatDecimal(value);
    default:
      return String(value);
  }
}

export function MetricCell({
  value,
  format,
  trend,
  trendLabel,
  className,
  align = 'right',
  size = 'md',
}: MetricCellProps) {
  const formattedValue = formatMetric(value, format);
  
  const trendDirection = trend && trend > 0 ? 'up' : trend && trend < 0 ? 'down' : 'neutral';
  const trendColor = trendDirection === 'up' ? 'text-emerald-600' : trendDirection === 'down' ? 'text-red-600' : 'text-gray-500';
  const trendIcon = trendDirection === 'up' ? '↑' : trendDirection === 'down' ? '↓' : '→';

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base font-semibold',
  };

  return (
    <div className={cn('flex flex-col', align === 'right' && 'items-end', align === 'center' && 'items-center', className)}>
      <span className={cn('text-gray-900 tabular-nums', sizeClasses[size])}>
        {formattedValue}
      </span>
      {trend !== undefined && (
        <span className={cn('text-xs flex items-center gap-0.5 mt-0.5', trendColor)}>
          <span>{trendIcon}</span>
          <span>{Math.abs(trend).toFixed(1)}%</span>
          {trendLabel && <span className="text-gray-400 ml-1">{trendLabel}</span>}
        </span>
      )}
    </div>
  );
}

// Compact version for dense tables
export interface MetricValueProps {
  value: number;
  format: MetricFormat;
  trend?: number;
  className?: string;
}

export function MetricValue({ value, format, trend, className }: MetricValueProps) {
  const formattedValue = formatMetric(value, format);
  const trendDirection = trend && trend > 0 ? 'up' : trend && trend < 0 ? 'down' : 'neutral';
  const trendColor = trendDirection === 'up' ? 'text-emerald-600' : trendDirection === 'down' ? 'text-red-600' : 'text-gray-500';

  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span className="text-gray-900 tabular-nums text-sm">{formattedValue}</span>
      {trend !== undefined && (
        <span className={cn('text-xs font-medium', trendColor)}>
          {trendDirection === 'up' ? '+' : ''}{trend.toFixed(1)}%
        </span>
      )}
    </span>
  );
}
