'use client';

import { ReactNode } from 'react';
import { Badge } from '@/components/ui';

interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: {
    label: string;
    variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  };
  actions?: ReactNode;
}

export function PageHeader({ title, description, badge, actions }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 mb-8">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          {badge && (
            <Badge variant={badge.variant || 'info'} size="sm">
              {badge.label}
            </Badge>
          )}
        </div>
        {description && <p className="text-gray-600">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}
