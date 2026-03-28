'use client';

import { useState, useEffect } from 'react';
import { X, Check, ChevronDown, Search } from 'lucide-react';
import { Button, Checkbox } from '@/components/ui';

export type ScopeLevel = 'campaign' | 'adset' | 'ad';
export type DurationOption = '7d' | '14d' | '30d' | 'unlimited';

export type AutomationRuleSettings = {
  scopeLevel: ScopeLevel;
  scopeMode: 'all' | 'selected';
  selectedIds: string[];
  duration: DurationOption;
};

type SelectableItem = {
  id: string;
  name: string;
  parentId?: string;
  parentName?: string;
};

interface AutomationRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  ruleName: string;
  ruleDescription: string;
  campaigns: SelectableItem[];
  adSets: SelectableItem[];
  ads: SelectableItem[];
  initialSettings?: AutomationRuleSettings;
  onRun: (settings: AutomationRuleSettings) => void;
  isRunning?: boolean;
}

const SCOPE_LEVELS: { value: ScopeLevel; label: string }[] = [
  { value: 'campaign', label: 'Campaign' },
  { value: 'adset', label: 'Ad Set' },
  { value: 'ad', label: 'Ad' },
];

const DURATION_OPTIONS: { value: DurationOption; label: string; description: string }[] = [
  { value: '7d', label: '7 Days', description: 'Rule stays active for 7 days' },
  { value: '14d', label: '14 Days', description: 'Rule stays active for 14 days' },
  { value: '30d', label: '30 Days', description: 'Rule stays active for 30 days' },
  { value: 'unlimited', label: 'Unlimited', description: 'Active until manually stopped' },
];

export function AutomationRuleModal({
  isOpen,
  onClose,
  ruleName,
  ruleDescription,
  campaigns,
  adSets,
  ads,
  initialSettings,
  onRun,
  isRunning = false,
}: AutomationRuleModalProps) {
  const [scopeLevel, setScopeLevel] = useState<ScopeLevel>(initialSettings?.scopeLevel ?? 'campaign');
  const [scopeMode, setScopeMode] = useState<'all' | 'selected'>(initialSettings?.scopeMode ?? 'all');
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSettings?.selectedIds ?? []);
  const [duration, setDuration] = useState<DurationOption>(initialSettings?.duration ?? '7d');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLevelDropdownOpen, setIsLevelDropdownOpen] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect -- syncing local state from props is intentional */
  useEffect(() => {
    if (initialSettings) {
      setScopeLevel(initialSettings.scopeLevel);
      setScopeMode(initialSettings.scopeMode);
      setSelectedIds(initialSettings.selectedIds);
      setDuration(initialSettings.duration);
    }
  }, [initialSettings]);

  useEffect(() => {
    setSelectedIds([]);
    setSearchQuery('');
  }, [scopeLevel]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const getItemsForLevel = (): SelectableItem[] => {
    switch (scopeLevel) {
      case 'campaign':
        return campaigns;
      case 'adset':
        return adSets;
      case 'ad':
        return ads;
      default:
        return [];
    }
  };

  const items = getItemsForLevel();
  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleItem = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map((i) => i.id));
    }
  };

  const handleRun = () => {
    onRun({
      scopeLevel,
      scopeMode,
      selectedIds: scopeMode === 'all' ? [] : selectedIds,
      duration,
    });
  };

  const getLevelLabel = (level: ScopeLevel) => {
    return SCOPE_LEVELS.find((l) => l.value === level)?.label ?? level;
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-lg pointer-events-auto flex flex-col max-h-[90vh] border border-gray-200">
          <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex items-center justify-between rounded-t-xl">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{ruleName}</h3>
              <p className="text-sm text-gray-600 mt-1">{ruleDescription}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
              aria-label="Kapat"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6 space-y-6 overflow-y-auto">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kapsam Seviyesi
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsLevelDropdownOpen(!isLevelDropdownOpen)}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-left flex items-center justify-between hover:border-gray-400 transition-colors"
                >
                  <span>{getLevelLabel(scopeLevel)}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isLevelDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {isLevelDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                    {SCOPE_LEVELS.map((level) => (
                      <button
                        key={level.value}
                        type="button"
                        onClick={() => {
                          setScopeLevel(level.value);
                          setIsLevelDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                          scopeLevel === level.value ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                        }`}
                      >
                        {level.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kapsam Modu
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setScopeMode('all')}
                  className={`px-4 py-3 rounded-lg border-2 transition-all ${
                    scopeMode === 'all'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <div className="font-medium">All</div>
                  <div className="text-xs mt-1 opacity-75">
                    All {getLevelLabel(scopeLevel).toLowerCase()}s
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setScopeMode('selected')}
                  className={`px-4 py-3 rounded-lg border-2 transition-all ${
                    scopeMode === 'selected'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <div className="font-medium">Selected</div>
                  <div className="text-xs mt-1 opacity-75">
                    Specific {getLevelLabel(scopeLevel).toLowerCase()}s
                  </div>
                </button>
              </div>
            </div>

            {scopeMode === 'selected' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {getLevelLabel(scopeLevel)} Selection
                  </label>
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    {selectedIds.length === items.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
                  {filteredItems.length > 0 ? (
                    filteredItems.map((item) => (
                      <label
                        key={item.id}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <Checkbox
                          checked={selectedIds.includes(item.id)}
                          onChange={() => handleToggleItem(item.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {item.name}
                          </div>
                          {item.parentName && (
                            <div className="text-xs text-gray-500 truncate">
                              {item.parentName}
                            </div>
                          )}
                        </div>
                      </label>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center text-sm text-gray-500">
                      {searchQuery ? 'No results found' : 'No data yet'}
                    </div>
                  )}
                </div>
                
                {selectedIds.length > 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    {selectedIds.length} {getLevelLabel(scopeLevel).toLowerCase()}(s) selected
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration
              </label>
              <div className="grid grid-cols-2 gap-3">
                {DURATION_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setDuration(opt.value)}
                    className={`px-4 py-3 rounded-lg border-2 transition-all text-left ${
                      duration === opt.value
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <div className="font-medium">{opt.label}</div>
                    <div className="text-xs mt-1 opacity-75">{opt.description}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between gap-3 rounded-b-xl">
            <Button variant="ghost" onClick={onClose} disabled={isRunning}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleRun}
              disabled={isRunning || (scopeMode === 'selected' && selectedIds.length === 0)}
              icon={isRunning ? undefined : <Check className="w-4 h-4" />}
            >
              {isRunning ? 'Running...' : 'Run'}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
