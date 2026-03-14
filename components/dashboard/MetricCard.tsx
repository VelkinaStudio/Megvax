'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card } from '@/components/ui';

interface MetricCardProps {
  title: string;
  value: string;
  change?: {
    value: number;
    period: string;
  };
  icon?: React.ReactNode;
  loading?: boolean;
  format?: 'currency' | 'percentage' | 'number';
}

export function MetricCard({
  title,
  value,
  change,
  icon,
  loading = false,
  format = 'number',
}: MetricCardProps) {
  if (loading) {
    return (
      <Card variant="elevated" padding="lg">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-24 mb-4" />
          <div className="h-8 bg-gray-200 rounded w-32 mb-3" />
          <div className="h-3 bg-gray-200 rounded w-20" />
        </div>
      </Card>
    );
  }

  const getTrendColor = () => {
    if (!change) return 'text-gray-500';
    if (change.value > 0) return 'text-accent-success';
    if (change.value < 0) return 'text-accent-danger';
    return 'text-gray-500';
  };

  const getTrendIcon = () => {
    if (!change) return null;
    if (change.value > 0) return <TrendingUp className="w-4 h-4" />;
    if (change.value < 0) return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const formatValue = (val: string) => {
    if (format === 'currency') return `₺${val}`;
    if (format === 'percentage') return `${val}%`;
    return val;
  };

  return (
    <Card variant="elevated" padding="lg">
      <div className="flex items-start justify-between mb-4">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        {icon && (
          <div className="p-2 bg-accent-primary/10 rounded-lg text-accent-primary">
            {icon}
          </div>
        )}
      </div>

      <div className="mb-3">
        <p className="text-3xl font-bold text-gray-900">
          {formatValue(value)}
        </p>
      </div>

      {change && (
        <div className={`flex items-center gap-1.5 text-sm font-medium ${getTrendColor()}`}>
          {getTrendIcon()}
          <span>
            {change.value > 0 && '+'}
            {change.value}%
          </span>
          <span className="text-gray-600 font-normal">vs {change.period}</span>
        </div>
      )}
    </Card>
  );
}

interface MetricGridProps {
  metrics: Array<{
    id: string;
    title: string;
    value: string;
    change?: {
      value: number;
      period: string;
    };
    icon?: React.ReactNode;
    format?: 'currency' | 'percentage' | 'number';
  }>;
  loading?: boolean;
}

export function MetricGrid({ metrics, loading = false }: MetricGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, idx) => (
          <MetricCard key={idx} title="" value="" loading />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric) => (
        <MetricCard
          key={metric.id}
          title={metric.title}
          value={metric.value}
          change={metric.change}
          icon={metric.icon}
          format={metric.format}
        />
      ))}
    </div>
  );
}
