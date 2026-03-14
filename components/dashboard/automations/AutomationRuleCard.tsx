'use client';

import { AutomationRule } from '@/types/dashboard';
import { Settings, Clock, Activity, Eye, Play, History } from 'lucide-react';
import type { AutomationRuleSettings } from '@/types/dashboard';

interface AutomationRuleCardProps {
  rule: AutomationRule;
  settings?: AutomationRuleSettings;
  onToggle: (id: string, newState: boolean) => void;
  onEdit: (id: string) => void;
  onPreview: (id: string) => void;
  onExecute: (id: string) => void;
  onHistory: (id: string) => void;
}

export function AutomationRuleCard({ rule, settings, onToggle, onEdit, onPreview, onExecute, onHistory }: AutomationRuleCardProps) {
  const isActive = rule.status === 'active';

  const scopeLevelLabel = (level: AutomationRuleSettings['targetLevel']) => {
    if (level === 'campaign') return 'Campaign';
    if (level === 'adset') return 'Ad Set';
    return 'Ad';
  };

  const scopeSummary = () => {
    if (!settings) return '-';
    const level = scopeLevelLabel(settings.targetLevel);
    if (settings.targetMode === 'all') return `${level} / All`;
    return `${level} / Selected (${settings.targetIds.length})`;
  };

  const handleToggle = () => {
    const newState = !isActive;
    onToggle(rule.id, newState);
  };

  return (
    <div className="minimal-card">
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {/* Toggle */}
          <button 
            onClick={handleToggle}
            className={
              `
              relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-[2px] border-2 border-brand-black transition-colors duration-200 ease-in-out focus:outline-none
              ${isActive ? 'bg-brand-black' : 'bg-paper-white'}
            `
            }
          >
            <span
              className={
                `
                pointer-events-none inline-block h-5 w-5 transform rounded-[2px] bg-brand-white border-2 border-brand-black ring-0 transition duration-200 ease-in-out
                ${isActive ? 'translate-x-5' : 'translate-x-0'}
              `
              }
            />
          </button>
          <h3 className="text-lg font-bold text-brand-black">{rule.title}</h3>
        </div>

        <span className={
          `
          text-xs font-bold px-3 py-1 rounded-[2px] uppercase border-2 border-brand-black
          ${isActive 
            ? 'bg-brand-black text-brand-white' 
            : rule.status === 'scheduled' ? 'bg-action-blue text-brand-white' : 'bg-paper-white text-brand-black/70'}
        `}
        >
          {isActive ? 'Active' : rule.status === 'scheduled' ? 'Scheduled' : 'Inactive'}
        </span>
      </div>

      <div className="space-y-3 mb-6 pl-14">
        <div className="flex gap-8">
          <div className="w-24 text-sm font-bold text-brand-black/70">Condition:</div>
          <div className="text-sm font-medium text-brand-black">{rule.condition}</div>
        </div>
        <div className="flex gap-8">
          <div className="w-24 text-sm font-bold text-brand-black/70">Action:</div>
          <div className="text-sm font-medium text-brand-black">{rule.action}</div>
        </div>
        <div className="flex gap-8">
          <div className="w-24 text-sm font-bold text-brand-black/70">Scope:</div>
          <div className="text-sm font-medium text-brand-black">{scopeSummary()}</div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t-2 border-brand-black pl-14">
        <div className="flex items-center gap-6 text-xs text-brand-black/70 font-medium">
           <div className="flex items-center gap-1.5">
             <Clock size={14} />
             {rule.frequency}
           </div>
           <div className="flex items-center gap-1.5">
             <Activity size={14} />
             {rule.executionCount} executions
           </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onPreview(rule.id)}
            className="text-action-blue hover:text-brand-black text-sm font-bold flex items-center gap-1 transition-colors"
          >
            <Eye size={14} />
            Preview
          </button>
          <button
            onClick={() => onExecute(rule.id)}
            className="text-action-blue hover:text-brand-black text-sm font-bold flex items-center gap-1 transition-colors"
          >
            <Play size={14} />
            Run
          </button>
          <button
            onClick={() => onHistory(rule.id)}
            className="text-action-blue hover:text-brand-black text-sm font-bold flex items-center gap-1 transition-colors"
          >
            <History size={14} />
            History
          </button>
          <button
            onClick={() => onEdit(rule.id)}
            className="text-action-blue hover:text-brand-black text-sm font-bold flex items-center gap-1 transition-colors"
          >
            <Settings size={14} />
            Edit
          </button>
        </div>
      </div>

    </div>
  );
}
