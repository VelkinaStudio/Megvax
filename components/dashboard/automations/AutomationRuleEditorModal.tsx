'use client';

import { useMemo, useState } from 'react';
import { Save, Check, AlertTriangle } from 'lucide-react';
import { Modal, Button } from '@/components/ui';
import type {
  AutomationRule,
  AutomationRuleSettings,
  AutomationTargetLevel,
  AutomationTargetMode,
} from '@/types/dashboard';
import { automationRuleTemplates } from '@/components/dashboard/automations/ruleTemplates';

export type { AutomationRuleSettings, AutomationTargetLevel, AutomationTargetMode } from '@/types/dashboard';

export type AutomationRuleDraft = Omit<AutomationRule, 'id' | 'executionCount'> & {
  executionCount?: number;
  source?: 'template';
  templateId: string;
};

interface AutomationRuleEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  rule: AutomationRule | null;
  adSets: { id: string; name: string }[];
  ads: { id: string; name: string }[];
  initialSettings: AutomationRuleSettings;
  onSave: (draft: AutomationRuleDraft, settings: AutomationRuleSettings, existingId?: string) => void;
}

export function AutomationRuleEditorModal({
  isOpen,
  onClose,
  rule,
  adSets,
  ads,
  initialSettings,
  onSave,
}: AutomationRuleEditorModalProps) {
  const inferredTemplateId = (rule as unknown as Record<string, unknown>)?.templateId;
  const fallbackTemplateId = automationRuleTemplates[0]?.id ?? '';
  const templateId = typeof inferredTemplateId === 'string' ? inferredTemplateId : fallbackTemplateId;

  const fixedTargetLevel: AutomationTargetLevel = templateId === 'tpl_spend_cap_pause_adset' ? 'adset' : 'ad';

  const [targetMode, setTargetMode] = useState<AutomationTargetMode>(initialSettings.targetMode);
  const [targetIds, setTargetIds] = useState<string[]>(initialSettings.targetIds);

  const selectedTemplate = useMemo(
    () => automationRuleTemplates.find((t) => t.id === templateId) ?? null,
    [templateId]
  );

  const iconCategory = selectedTemplate?.iconCategory ?? rule?.iconCategory ?? 'alert';
  const title = selectedTemplate?.title ?? rule?.title ?? '';
  const condition = selectedTemplate?.condition ?? rule?.condition ?? '';
  const action = selectedTemplate?.action ?? rule?.action ?? '';

  const isValid = useMemo(() => {
    if (!templateId) return false;
    if (targetMode === 'selected' && targetIds.length === 0) return false;
    return true;
  }, [templateId, targetMode, targetIds.length]);

  const handleSave = () => {
    if (!isValid) return;
    onSave(
      {
        title: title.trim(),
        condition: condition.trim(),
        action: action.trim(),
        frequency: (rule?.frequency ?? '').trim(),
        status: rule?.status ?? 'paused',
        iconCategory,
        executionCount: rule?.executionCount ?? 0,
        source: 'template',
        templateId,
      },
      {
        targetLevel: fixedTargetLevel,
        targetMode,
        targetIds: targetMode === 'all' ? [] : targetIds,
      },
      rule?.id
    );
    onClose();
  };

  const entityOptions = fixedTargetLevel === 'adset' ? adSets : ads;
  const levelLabel = fixedTargetLevel === 'adset' ? 'Ad Set' : 'Ad';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Rule Settings"
      size="lg"
    >
      <div className="space-y-6">
        {/* Rule Info (Read-only) */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <p className="text-xs font-medium text-gray-500 uppercase">Rule Definition (Read-Only)</p>
          </div>
          <p className="text-sm font-medium text-gray-900 mb-2">{title || 'No template selected'}</p>
          {selectedTemplate?.description && (
            <p className="text-sm text-gray-600 mb-3">{selectedTemplate.description}</p>
          )}

          <div className="space-y-2 text-sm">
            <div className="flex items-start justify-between gap-4">
              <span className="text-gray-500">Condition</span>
              <span className="text-gray-900 text-right">{condition || '-'}</span>
            </div>
            <div className="flex items-start justify-between gap-4">
              <span className="text-gray-500">Action</span>
              <span className="text-gray-900 text-right">{action || '-'}</span>
            </div>
          </div>
        </div>

        {/* Scope Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Scope</label>
          <p className="text-xs text-gray-500">
            This rule will run on {targetMode === 'all' ? 'all' : 'only selected'} {levelLabel.toLowerCase()}s
          </p>

          <div className="space-y-2">
            <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
              <input
                type="radio"
                name="automation_scope"
                checked={targetMode === 'all'}
                onChange={() => {
                  setTargetMode('all');
                  setTargetIds([]);
                }}
                className="w-4 h-4 text-blue-600"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">All {levelLabel.toLowerCase()}s</p>
                <p className="text-xs text-gray-500">All entities at this level will be included</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
              <input
                type="radio"
                name="automation_scope"
                checked={targetMode === 'selected'}
                onChange={() => setTargetMode('selected')}
                className="w-4 h-4 text-blue-600"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">Selected {levelLabel.toLowerCase()}s</p>
                <p className="text-xs text-gray-500">Runs only on your selections</p>
              </div>
            </label>
          </div>

          {targetMode === 'selected' && (
            <div className="mt-4 bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-xs font-medium text-gray-500 uppercase mb-3">Select {levelLabel}</p>
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {entityOptions.length === 0 ? (
                  <p className="text-sm text-gray-500 py-4 text-center">
                    No {levelLabel.toLowerCase()}s found yet
                  </p>
                ) : (
                  entityOptions.map((item) => {
                    const checked = targetIds.includes(item.id);
                    return (
                      <label
                        key={item.id}
                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                          checked ? 'bg-blue-50' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded border flex items-center justify-center ${
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
                <p className="text-xs text-red-600 mt-3 font-medium">
                  Select at least 1 entity to continue
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={!isValid}
          className="flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          Save
        </Button>
      </div>
    </Modal>
  );
}
