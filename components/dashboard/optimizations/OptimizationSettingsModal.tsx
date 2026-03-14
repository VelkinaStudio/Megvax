'use client';

import { useEffect, useMemo, useState } from 'react';
import { Save, Check, RotateCcw, Play } from 'lucide-react';
import { Modal, Button } from '@/components/ui';
import { useTranslations } from '@/lib/i18n';
import type { OptimizationStrategy, OptimizationStrategySettings, OptimizationTargetLevel } from '@/types/dashboard';

export type { OptimizationStrategySettings, OptimizationTargetLevel } from '@/types/dashboard';

export interface ExecutionHistoryEntry {
  id: string;
  strategyId: string;
  strategyTitle: string;
  targetLevel: OptimizationTargetLevel;
  targetMode: 'all' | 'selected';
  targetIds: string[];
  targetNames: string[];
  timestamp: string;
}

interface OptimizationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  strategy: OptimizationStrategy | null;
  campaigns: { id: string; name: string }[];
  adSets: { id: string; name: string }[];
  ads: { id: string; name: string }[];
  initialSettings: OptimizationStrategySettings;
  onSave: (strategyId: string, settings: OptimizationStrategySettings) => void;
  onRun: (strategyId: string, settings: OptimizationStrategySettings) => void;
}

export function OptimizationSettingsModal({
  isOpen,
  onClose,
  strategy,
  campaigns,
  adSets,
  ads,
  initialSettings,
  onSave,
  onRun,
}: OptimizationSettingsModalProps) {
  const t = useTranslations('optimizations');
  const tc = useTranslations('common');
  
  const [targetLevel, setTargetLevel] = useState<OptimizationTargetLevel>('campaign');
  const [targetMode, setTargetMode] = useState<'all' | 'selected'>('all');
  const [targetIds, setTargetIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTargetLevel(initialSettings.targetLevel);
      setTargetMode(initialSettings.targetMode);
      setTargetIds(initialSettings.targetIds);
      setSearchQuery('');
    }
  }, [isOpen, initialSettings.targetLevel, initialSettings.targetMode, initialSettings.targetIds]);

  const isValid = useMemo(() => {
    if (targetMode === 'selected' && targetIds.length === 0) return false;
    return true;
  }, [targetMode, targetIds.length]);

  const handleSave = () => {
    if (!isValid || !strategy) return;
    onSave(strategy.id, { targetLevel, targetMode, targetIds });
    onClose();
  };

  const handleRun = () => {
    if (!isValid || !strategy) return;
    onRun(strategy.id, { targetLevel, targetMode, targetIds });
    onClose();
  };

  const handleClearSelection = () => {
    setTargetIds([]);
  };

  const handleSelectAll = () => {
    setTargetIds(entityOptions.map(e => e.id));
  };

  const entityOptions = targetLevel === 'campaign' ? campaigns : targetLevel === 'adset' ? adSets : ads;
  
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return entityOptions;
    return entityOptions.filter(e => 
      e.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [entityOptions, searchQuery]);

  const levelLabel = (level: OptimizationTargetLevel) => {
    if (level === 'campaign') return tc('level_campaign');
    if (level === 'adset') return tc('level_adset');
    return tc('level_ad');
  };

  const currentLevelLabel = levelLabel(targetLevel);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('settings') || 'Strategy Settings'}
      size="lg"
    >
      <div className="space-y-6">
        {strategy && (
          <p className="text-sm text-gray-600">{strategy.title}</p>
        )}

        {/* Target Level Selection */}
        <div className="bg-gray-50 rounded-xl p-4">
          <label className="block text-sm font-semibold text-gray-700 mb-3">{t('scope') || 'Target Level'}</label>
          <div className="flex gap-2">
            {(['campaign', 'adset', 'ad'] as OptimizationTargetLevel[]).map((level) => (
              <button
                key={level}
                onClick={() => {
                  setTargetLevel(level);
                  setTargetMode('all');
                  setTargetIds([]);
                  setSearchQuery('');
                }}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
                  targetLevel === level
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-300 hover:text-blue-600'
                }`}
              >
                {levelLabel(level)}
              </button>
            ))}
          </div>
        </div>

        {/* Scope Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-700">{t('scope')}</label>
          
          <div className="space-y-2">
            <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
              <input
                type="radio"
                name="scope"
                checked={targetMode === 'all'}
                onChange={() => {
                  setTargetMode('all');
                  setTargetIds([]);
                }}
                className="w-4 h-4 text-blue-600 accent-blue-600"
              />
              <div>
                <p className="text-sm font-semibold text-gray-900">{tc('all')} {currentLevelLabel}</p>
                <p className="text-xs text-gray-500">{t('scope_all_desc') || 'All entities at this level will be included'}</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
              <input
                type="radio"
                name="scope"
                checked={targetMode === 'selected'}
                onChange={() => setTargetMode('selected')}
                className="w-4 h-4 text-blue-600 accent-blue-600"
              />
              <div>
                <p className="text-sm font-semibold text-gray-900">{tc('selected')} {currentLevelLabel}</p>
                <p className="text-xs text-gray-500">{t('scope_selected_desc') || 'Only selected entities will be affected'}</p>
              </div>
            </label>
          </div>

          {targetMode === 'selected' && (
            <div className="mt-4 bg-white border border-gray-200 rounded-xl p-4">
              {/* Search and Quick Actions */}
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-gray-500 uppercase">{tc('select')} {currentLevelLabel}</p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-xs font-medium text-blue-600 hover:text-blue-700"
                  >
                    {tc('select_all') || 'Select All'}
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    type="button"
                    onClick={handleClearSelection}
                    className="text-xs font-medium text-gray-500 hover:text-gray-700"
                  >
                    {tc('clear') || 'Clear'}
                  </button>
                </div>
              </div>
              
              {/* Search Input */}
              <input
                type="text"
                placeholder={`${tc('search')} ${currentLevelLabel}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              
              {/* Selection Count */}
              {targetIds.length > 0 && (
                <p className="text-xs text-blue-600 font-medium mb-2">
                  {targetIds.length} {tc('selected')}
                </p>
              )}
              
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {filteredOptions.length === 0 ? (
                  <p className="text-sm text-gray-500 py-4 text-center">
                    {searchQuery ? (tc('no_results') || 'No results found') : (t('no_entities') || 'No entities found')}
                  </p>
                ) : (
                  filteredOptions.map((item) => {
                    const checked = targetIds.includes(item.id);
                    return (
                      <label
                        key={item.id}
                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                          checked ? 'bg-blue-50' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                          checked ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                        }`}>
                          {checked && <Check className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            setTargetIds((prev) =>
                              checked ? prev.filter((x) => x !== item.id) : [...prev, item.id]
                            );
                          }}
                          className="sr-only"
                        />
                        <span className="text-sm text-gray-700 font-medium">{item.name}</span>
                      </label>
                    );
                  })
                )}
              </div>
              {!isValid && (
                <p className="text-xs text-red-600 mt-3 font-semibold">
                  {t('select_at_least_one') || 'Select at least 1 entity to continue'}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 mt-6 pt-4 border-t border-gray-100">
        <Button variant="ghost" onClick={onClose}>
          {tc('cancel')}
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={handleSave}
            disabled={!isValid}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {tc('save')}
          </Button>
          <Button
            variant="primary"
            onClick={handleRun}
            disabled={!isValid}
            className="flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            {t('save_and_rerun') || 'Save & Run'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
