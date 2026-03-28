import { Suggestion, SuggestionActionType } from '@/types/dashboard';
import { Lightbulb, ArrowRight, Target, AlertCircle, CheckCircle, Pause, Play, TrendingUp, TrendingDown, Eye } from 'lucide-react';
import { Card } from '@/components/ui';
import { useTranslations } from '@/lib/i18n';

interface SuggestionCardProps {
  suggestion: Suggestion;
  onApply?: (suggestion: Suggestion) => void;
  onOpenTarget?: (suggestion: Suggestion) => void;
}

function renderActionIcon(type: SuggestionActionType | undefined, className: string) {
  switch (type) {
    case 'pause': return <Pause className={className} />;
    case 'resume': return <Play className={className} />;
    case 'increase_budget': return <TrendingUp className={className} />;
    case 'decrease_budget': return <TrendingDown className={className} />;
    case 'review': return <Eye className={className} />;
    default: return <AlertCircle className={className} />;
  }
}

function getActionColor(type?: SuggestionActionType) {
  switch (type) {
    case 'pause': return 'text-red-600 bg-red-50';
    case 'resume': return 'text-green-600 bg-green-50';
    case 'increase_budget': return 'text-emerald-600 bg-emerald-50';
    case 'decrease_budget': return 'text-orange-600 bg-orange-50';
    case 'review': return 'text-blue-600 bg-blue-50';
    default: return 'text-blue-600 bg-blue-50';
  }
}

export function SuggestionCard({ suggestion, onApply, onOpenTarget }: SuggestionCardProps) {
  const t = useTranslations('smart_suggestions');
  const tc = useTranslations('common');
  
  const targetLabel = (level: NonNullable<Suggestion['target']>['level']) => {
    if (level === 'campaign') return tc('level_campaign');
    if (level === 'adset') return tc('level_adset');
    return tc('level_ad');
  };

  const impactColors = {
    'High': 'text-white bg-red-500',
    'Medium': 'text-gray-900 bg-yellow-400',
    'Low': 'text-gray-700 bg-gray-100',
    'high': 'text-white bg-red-500',
    'medium': 'text-gray-900 bg-yellow-400',
    'low': 'text-gray-700 bg-gray-100',
  };

  const impactLabel = {
    'High': t('impact_high'),
    'Medium': t('impact_medium'),
    'Low': t('impact_low'),
    'high': t('impact_high'),
    'medium': t('impact_medium'),
    'low': t('impact_low'),
  };

  const actionIconType = suggestion.action?.type;
  const actionColorClass = getActionColor(actionIconType);

  return (
    <Card variant="interactive" padding="lg" className="flex flex-col h-full group">
      <div className="flex items-start justify-between mb-4">
        <div className="p-2 bg-gray-50 rounded-md group-hover:bg-blue-50 transition-colors">
           <Lightbulb size={20} className="text-blue-600" />
        </div>
        <span className={`text-xs font-semibold px-2 py-1 rounded-md uppercase tracking-wide ${impactColors[suggestion.impactLevel] || 'text-gray-700 bg-gray-100'}`}>
          {impactLabel[suggestion.impactLevel] || suggestion.impactLevel}
        </span>
      </div>

      <h3 className="text-lg font-semibold leading-tight mb-2 text-gray-900">
        {suggestion.title}
      </h3>

      <p className="text-sm text-gray-600 mb-4 leading-relaxed">
        {suggestion.description}
      </p>

      {/* Clear Action Details Box */}
      {suggestion.action && (
        <div className={`mb-4 rounded-lg p-3 border ${actionColorClass.replace('text-', 'border-').replace('bg-', '')}`}>
          <div className="flex items-start gap-2">
            {renderActionIcon(actionIconType, `w-4 h-4 mt-0.5 flex-shrink-0 ${actionColorClass.split(' ')[0]}`)}
            <div className="flex-1">
              <p className={`text-sm font-semibold ${actionColorClass.split(' ')[0]}`}>
                {suggestion.action.label}
              </p>
              <p className="text-sm text-gray-700 mt-1">
                {suggestion.action.details}
              </p>
              {(suggestion.action.currentValue || suggestion.action.newValue) && (
                <div className="flex items-center gap-2 mt-2 text-xs">
                  {suggestion.action.currentValue && (
                    <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-600">
                      {suggestion.action.currentValue}
                    </span>
                  )}
                  {suggestion.action.currentValue && suggestion.action.newValue && (
                    <ArrowRight className="w-3 h-3 text-gray-400" />
                  )}
                  {suggestion.action.newValue && (
                    <span className={`px-2 py-0.5 rounded ${actionColorClass}`}>
                      {suggestion.action.newValue}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {suggestion.target && (
        <div className="mb-4 bg-gray-50 rounded-md p-3">
          <p className="text-xs font-semibold text-gray-500 uppercase">{tc('affected')}</p>
          <p className="text-sm font-medium text-gray-900 mt-1 truncate">
            {targetLabel(suggestion.target.level)}: {suggestion.target.name}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-auto">
        <span className="text-sm font-semibold text-blue-600 tabular-nums">
          {suggestion.impactMetric}
        </span>
        
        <div className="flex items-center gap-3">
          {suggestion.target && onOpenTarget && (
            <button
              onClick={() => onOpenTarget(suggestion)}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1 cursor-pointer"
              aria-label={`${targetLabel(suggestion.target.level)}`}
            >
              <Target className="w-4 h-4" />
              {t('view_details')}
            </button>
          )}
          <button
            onClick={() => onApply?.(suggestion)}
            className="text-sm font-semibold text-gray-900 flex items-center gap-1 hover:gap-2 transition-all hover:text-blue-600 cursor-pointer"
            aria-label={t('apply')}
          >
            <CheckCircle className="w-4 h-4" />
            {t('apply')} <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </Card>
  );
}
