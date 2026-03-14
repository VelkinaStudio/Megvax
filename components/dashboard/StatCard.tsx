'use client';

import { Card } from '@/components/ui';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  icon?: LucideIcon;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  loading?: boolean;
}

export function StatCard({ label, value, icon: Icon, color = 'blue', loading = false }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-accent-info/10 text-accent-info',
    green: 'bg-accent-success/10 text-accent-success',
    yellow: 'bg-accent-warning/10 text-accent-warning',
    red: 'bg-accent-danger/10 text-accent-danger',
    purple: 'bg-accent-highlight/10 text-accent-highlight',
  };

  if (loading) {
    return (
      <Card padding="lg">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-24 mb-3" />
          <div className="h-8 bg-gray-200 rounded w-32" />
        </div>
      </Card>
    );
  }

  return (
    <Card padding="lg">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        {Icon && (
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </Card>
  );
}
