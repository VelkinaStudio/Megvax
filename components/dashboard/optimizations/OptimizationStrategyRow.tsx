'use client';

import { OptimizationStrategy } from '@/types/dashboard';
import { Settings, BarChart2, DollarSign, Eye, HeartPulse } from 'lucide-react';
import type { OptimizationStrategySettings } from '@/types/dashboard';
import { Card, Switch } from '@/components/ui';
import { useTranslations } from '@/lib/i18n';

interface OptimizationStrategyRowProps {
  strategy: OptimizationStrategy;
  settings?: OptimizationStrategySettings;
  onToggle: (id: string, newState: boolean) => void;
  onSettings: (id: string) => void;
}

export function OptimizationStrategyRow({ strategy, settings, onToggle, onSettings }: OptimizationStrategyRowProps) {
  const t = useTranslations('optimizations');
  const tc = useTranslations('common');
  const isActive = strategy.status !== 'paused';

  const scopeLevelLabel = (level: OptimizationStrategySettings['targetLevel']) => {
    if (level === 'campaign') return tc('level_campaign');
    if (level === 'adset') return tc('level_adset');
    return tc('level_ad');
  };

  const scopeSummary = () => {
    if (!settings) return '-';

    const level = scopeLevelLabel(settings.targetLevel);
    if (settings.targetMode === 'all') return `${level} / ${tc('all')}`;
    return `${level} / ${tc('selected')} (${settings.targetIds.length})`;
  };

  const handleToggle = (checked: boolean) => {
    onToggle(strategy.id, checked);
  };

  const getIcon = () => {
    switch (strategy.iconCategory) {
      case 'performance': return <BarChart2 size={24} className="text-blue-600" />;
      case 'budget': return <DollarSign size={24} className="text-blue-700" />;
      case 'creative': return <Eye size={24} className="text-blue-600" />;
      case 'health': return <HeartPulse size={24} className="text-red-500" />;
      default: return <BarChart2 size={24} className="text-blue-600" />;
    }
  };

  const getStatusBadge = () => {
    if (!isActive) return <span className="text-xs font-medium text-gray-400">-</span>;
    if (strategy.status === 'waiting') return <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-md">{t('status_waiting')}</span>;
    if (strategy.status === 'active') return <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-md">{t('status_active')}</span>;
    return null;
  };

  return (
    <Card padding="md" className="flex items-center gap-4">
      
      {/* Toggle Switch */}
      <Switch 
        checked={isActive}
        onChange={handleToggle}
      />

      {/* Icon */}
      <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center shrink-0">
        {getIcon()}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-semibold text-gray-900">{strategy.title}</h3>
        <p className="text-sm text-gray-600 mt-0.5 line-clamp-1">{strategy.description}</p>
        <p className="text-xs text-gray-500 mt-1 line-clamp-1">Kapsam: {scopeSummary()}</p>
      </div>

      {/* Status */}
      <div className="hidden sm:block shrink-0">
        {getStatusBadge()}
      </div>

      {/* Settings */}
      <button 
        onClick={() => onSettings(strategy.id)}
        className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
      >
        <Settings size={20} />
      </button>

    </Card>
  );
}
