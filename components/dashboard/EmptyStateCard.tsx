'use client';

import { LucideIcon } from 'lucide-react';
import { Card, Button } from '@/components/ui';

interface EmptyStateCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyStateCard({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateCardProps) {
  return (
    <Card padding="lg">
      <div className="flex flex-col items-center justify-center text-center py-12">
        <div className="p-4 bg-gray-100 rounded-full mb-4">
          <Icon className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-6 max-w-sm">{description}</p>
        {actionLabel && onAction && (
          <Button variant="primary" onClick={onAction}>
            {actionLabel}
          </Button>
        )}
      </div>
    </Card>
  );
}
