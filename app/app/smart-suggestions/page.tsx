import { redirect } from 'next/navigation';

export default function SmartSuggestionsPage() {
  redirect('/app/optimizations');
}

// Legacy code below - keeping for reference during transition
/*
'use client';

import { useEffect, useState } from 'react';
import { 
  ChevronRight, 
  Play, 
  Check, 
  Loader2, 
  X,
  Bug,
  LifeBuoy,
  ArrowLeft,
  Lightbulb,
  AlertTriangle,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { Button, Card, Skeleton, Badge, ConfirmModal } from '@/components/ui';
import { PageHeader, EmptyStateCard } from '@/components/dashboard';
import { SlideOver } from '@/components/ui/SplitPane';
import { useDashboardQuery } from '@/components/dashboard/useDashboardQuery';
import Link from 'next/link';
import { 
  SMART_SUGGESTION_RULES, 
  generateMockActions,
  type SmartSuggestionRule,
  type SmartSuggestionAction,
} from '@/lib/data/smart-suggestions';

type RuleState = {
  ruleKey: string;
  status: 'idle' | 'running' | 'ready' | 'applied' | 'error';
  lastRunAt?: string;
  pendingActions?: SmartSuggestionAction[];
};

function LegacySmartSuggestionsPage() {
  const toast = useToast();
  const { withQuery } = useDashboardQuery();
  const [isLoading, setIsLoading] = useState(true);
  const [rules] = useState<SmartSuggestionRule[]>(SMART_SUGGESTION_RULES);
  const [ruleStates, setRuleStates] = useState<RuleState[]>([]);
  
  const [detailRule, setDetailRule] = useState<SmartSuggestionRule | null>(null);
  const [selectedRuleState, setSelectedRuleState] = useState<RuleState | null>(null);
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [isApplyConfirmOpen, setIsApplyConfirmOpen] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  const supportLink = (category: string) => {
    const base = withQuery('/app/support');
    const join = base.includes('?') ? '&' : '?';
    return `${base}${join}category=${encodeURIComponent(category)}`;
  };

  useEffect(() => {
    const initialStates = rules.map((rule) => ({
      ruleKey: rule.key,
      status: 'idle' as const,
    }));
    setRuleStates(initialStates);
    setIsLoading(false);
  }, [rules]);

  const handleRunAnalysis = async (ruleKey: string) => {
    setRuleStates((prev) =>
      prev.map((r) => (r.ruleKey === ruleKey ? { ...r, status: 'running' } : r))
    );

    await new Promise((resolve) => setTimeout(resolve, 1500));

    const actions = generateMockActions(ruleKey);
    
    setRuleStates((prev) =>
      prev.map((r) =>
        r.ruleKey === ruleKey
          ? {
              ...r,
              status: 'ready',
              lastRunAt: new Date().toISOString(),
              pendingActions: actions,
            }
          : r
      )
    );

    const state = ruleStates.find((r) => r.ruleKey === ruleKey);
    setSelectedRuleState({
      ruleKey,
      status: 'ready',
      lastRunAt: new Date().toISOString(),
      pendingActions: actions,
    });
    setIsActionsOpen(true);
    setDetailRule(null);
  };

  const handleApplyActions = async () => {
    if (!selectedRuleState?.pendingActions) return;
    
    setIsApplying(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    setRuleStates((prev) =>
      prev.map((r) =>
        r.ruleKey === selectedRuleState.ruleKey ? { ...r, status: 'applied' } : r
      )
    );
    
    toast.success('Suggestions applied successfully.');
    setIsApplying(false);
    setIsApplyConfirmOpen(false);
    setIsActionsOpen(false);
  };

  const getStatusBadge = (status: RuleState['status']) => {
    switch (status) {
      case 'idle':
        return <Badge variant="neutral">Waiting to Start</Badge>;
      case 'running':
        return <Badge variant="info" className="animate-pulse">Analyzing...</Badge>;
      case 'ready':
        return <Badge variant="success">Suggestion Ready</Badge>;
      case 'applied':
        return <Badge variant="info">Active & Running</Badge>;
      case 'error':
        return <Badge variant="danger">Error</Badge>;
      default:
        return null;
    }
  };

  const getCategoryLabel = (category: SmartSuggestionRule['category']) => {
    switch (category) {
      case 'performance':
        return 'Performance';
      case 'budget':
        return 'Budget';
      case 'creative':
        return 'Creative';
      case 'health':
        return 'Health';
      default:
        return category;
    }
  };

  if (detailRule) {
    const state = ruleStates.find((r) => r.ruleKey === detailRule.key);
    const Icon = detailRule.icon;

    return (
      <div className="space-y-8 max-w-4xl mx-auto">
        <button
          onClick={() => setDetailRule(null)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </button>

        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl border border-gray-200 flex items-center justify-center bg-white text-blue-600 shadow-sm">
            <Icon className="w-7 h-7" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{detailRule.title}</h1>
            <p className="text-gray-500 mt-1">{detailRule.shortDescription}</p>
          </div>
          {state && getStatusBadge(state.status)}
        </div>

        <div className="border-t border-gray-200 pt-8 space-y-8">
          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              What is it?
            </h3>
            <p className="text-gray-600 leading-relaxed">{detailRule.whatIs}</p>
          </section>

          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Play className="w-5 h-5 text-green-500" />
              What does it do?
            </h3>
            <p className="text-gray-600 leading-relaxed">{detailRule.whatDoes}</p>
          </section>

          <section className="bg-slate-50 rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-blue-600" />
              {detailRule.algorithm.title}
            </h3>
            <div className="space-y-3">
              {detailRule.algorithm.steps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div
                    className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      step.color === 'blue'
                        ? 'bg-blue-500'
                        : step.color === 'red'
                        ? 'bg-red-500'
                        : step.color === 'green'
                        ? 'bg-green-500'
                        : step.color === 'orange'
                        ? 'bg-orange-500'
                        : step.color === 'purple'
                        ? 'bg-purple-500'
                        : 'bg-gray-500'
                    }`}
                  />
                  <div>
                    <span
                      className={`font-semibold ${
                        step.color === 'blue'
                          ? 'text-blue-700'
                          : step.color === 'red'
                          ? 'text-red-700'
                          : step.color === 'green'
                          ? 'text-green-700'
                          : step.color === 'orange'
                          ? 'text-orange-700'
                          : step.color === 'purple'
                          ? 'text-purple-700'
                          : 'text-gray-700'
                      }`}
                    >
                      {step.label}:
                    </span>{' '}
                    <span className="text-gray-600">{step.description}</span>
                  </div>
                </div>
              ))}
            </div>
            {detailRule.algorithm.example && (
              <div className="mt-4 p-4 bg-white rounded-lg border border-slate-200 text-slate-700 italic text-sm">
                {detailRule.algorithm.example}
              </div>
            )}
          </section>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => setDetailRule(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => handleRunAnalysis(detailRule.key)}
              disabled={state?.status === 'running'}
              icon={state?.status === 'running' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            >
              {state?.status === 'running' ? 'Analyzing...' : 'Start Analysis'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Smart Suggestions"
        description="Improve your ad performance with AI-powered optimization rules."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link href={supportLink('bug')}>
              <Button variant="ghost" size="sm" icon={<Bug className="w-4 h-4" />}>
                Report Bug
              </Button>
            </Link>
            <Link href={supportLink('other')}>
              <Button variant="ghost" size="sm" icon={<LifeBuoy className="w-4 h-4" />}>
                Support
              </Button>
            </Link>
          </div>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, idx) => (
            <Card key={idx} padding="lg">
              <Skeleton className="h-6 w-1/3 mb-4" />
              <Skeleton className="h-4 w-2/3 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </Card>
          ))}
        </div>
      ) : rules.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {rules.map((rule) => {
            const state = ruleStates.find((r) => r.ruleKey === rule.key);
            const Icon = rule.icon;

            return (
              <Card
                key={rule.key}
                variant="interactive"
                padding="lg"
                className="cursor-pointer group"
                onClick={() => setDetailRule(rule)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {rule.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {rule.shortDescription}
                      </p>
                      <div className="flex items-center gap-2 mt-3">
                        <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                          {getCategoryLabel(rule.category)}
                        </span>
                        {state && state.status !== 'idle' && getStatusBadge(state.status)}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0" />
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyStateCard
          icon={Lightbulb}
          title="No suggestions yet"
          description="Smart suggestions will appear here soon."
        />
      )}

      <SlideOver
        isOpen={isActionsOpen}
        onClose={() => setIsActionsOpen(false)}
        title="Suggestion Results"
        size="lg"
      >
        {selectedRuleState?.pendingActions && selectedRuleState.pendingActions.length > 0 ? (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-green-800">
                {selectedRuleState.pendingActions.length} suggestions ready
              </p>
              <p className="text-sm text-green-700 mt-1">
                The following changes can be applied.
              </p>
            </div>

            <div className="space-y-3">
              {selectedRuleState.pendingActions.map((action) => (
                <div
                  key={action.id}
                  className="bg-white rounded-lg border border-gray-200 p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{action.metaObjectName}</p>
                      {action.campaignName && (
                        <p className="text-xs text-gray-500 mt-1">
                          Campaign: {action.campaignName}
                        </p>
                      )}
                    </div>
                    <Badge
                      variant={
                        action.type === 'PAUSE_AD' || action.type === 'PAUSE_ADSET'
                          ? 'warning'
                          : action.type === 'INCREASE_BUDGET'
                          ? 'success'
                          : action.type === 'DECREASE_BUDGET'
                          ? 'danger'
                          : 'neutral'
                      }
                    >
                      {action.type === 'PAUSE_AD'
                        ? 'Pause Ad'
                        : action.type === 'PAUSE_ADSET'
                        ? 'Pause Set'
                        : action.type === 'INCREASE_BUDGET'
                        ? 'Increase Budget'
                        : action.type === 'DECREASE_BUDGET'
                        ? 'Decrease Budget'
                        : 'Notification'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{action.reason}</p>
                  {action.fromValue !== undefined && action.toValue !== undefined && (
                    <div className="mt-2 flex items-center gap-2 text-sm">
                      <span className="text-gray-500">₺{action.fromValue}</span>
                      <span className="text-gray-400">→</span>
                      <span className="font-medium text-gray-900">₺{action.toValue}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button variant="ghost" className="flex-1" onClick={() => setIsActionsOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => setIsApplyConfirmOpen(true)}
                icon={<Check className="w-4 h-4" />}
              >
                Apply All
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <Lightbulb className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No suggestions found for this analysis.</p>
          </div>
        )}
      </SlideOver>

      <ConfirmModal
        isOpen={isApplyConfirmOpen}
        onClose={() => setIsApplyConfirmOpen(false)}
        title="Apply Suggestions"
        message={`${selectedRuleState?.pendingActions?.length ?? 0} suggestions will be applied to your Meta Business account. Do you want to continue?`}
        confirmText="Yes, Apply"
        cancelText="Cancel"
        variant="primary"
        loading={isApplying}
        onConfirm={handleApplyActions}
      />
    </div>
  );
}
*/
