'use client';

import { useTranslations } from '@/lib/i18n';
import { useEffect, useState } from 'react';
import { OptimizationStrategyRow } from '@/components/dashboard/optimizations/OptimizationStrategyRow';
import { OptimizationStrategy, Suggestion, type OptimizationStrategySettings } from '@/types/dashboard';
import { Eye, Lightbulb, X, Bug, LifeBuoy, Zap, Shield, Clock, Activity, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Button, Card, Skeleton, ConfirmModal } from '@/components/ui';
import { EmptyStateCard, PageHeader } from '@/components/dashboard';
import {
  mockMetaAdSets,
  mockMetaAds,
  mockMetaCampaigns,
  mockOptimizationStrategies,
  mockSuggestions,
} from '@/components/dashboard/mockData';
import { useDashboardQuery } from '@/components/dashboard/useDashboardQuery';
import {
  OptimizationSettingsModal,
} from '@/components/dashboard/optimizations/OptimizationSettingsModal';
import type { ExecutionHistoryEntry } from '@/components/dashboard/optimizations/OptimizationSettingsModal';

// Mock Data based on Image 1
const defaultStrategies: OptimizationStrategy[] = mockOptimizationStrategies;

export default function OptimizationsPage() {
  const t = useTranslations('optimizations');
  const tc = useTranslations('common');
  const toast = useToast();
  const router = useRouter();
  const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' || !process.env.NEXT_PUBLIC_API_URL;
  const { account, range, from, to, withQuery } = useDashboardQuery();
  const [strategies, setStrategies] = useState<OptimizationStrategy[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsStrategy, setSettingsStrategy] = useState<OptimizationStrategy | null>(null);
  const [strategySettings, setStrategySettings] = useState<Record<string, OptimizationStrategySettings>>({});
  const [executionHistory, setExecutionHistory] = useState<ExecutionHistoryEntry[]>([]);

  // Autopilot config & recent actions
  interface AutopilotConfig {
    enabled: boolean;
    mode: string;
    maxActionsPerDay: number;
    requireApproval: boolean;
    [key: string]: unknown;
  }
  interface AutopilotAction {
    id: string;
    type: string;
    entityType: string;
    entityId: string;
    entityName: string;
    description: string;
    status: string;
    createdAt: string;
    [key: string]: unknown;
  }

  const [autopilotConfig, setAutopilotConfig] = useState<AutopilotConfig | null>(null);
  const [isAutopilotConfigLoading, setIsAutopilotConfigLoading] = useState(false);
  const [recentActions, setRecentActions] = useState<AutopilotAction[]>([]);
  const [isActionsLoading, setIsActionsLoading] = useState(false);

  type SuggestionQueueState = 'pending' | 'dismissed' | 'snoozed' | 'applied';
  type SuggestionQueueItem = Suggestion & { state: SuggestionQueueState; snoozeUntil?: string };

  const [suggestions, setSuggestions] = useState<SuggestionQueueItem[]>([]);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState<string | null>(null);
  const [reviewSuggestion, setReviewSuggestion] = useState<SuggestionQueueItem | null>(null);
  const [reviewDetails, setReviewDetails] = useState<SuggestionQueueItem | null>(null);
  const [isReviewLoading, setIsReviewLoading] = useState(false);
  const [isApplyConfirmOpen, setIsApplyConfirmOpen] = useState(false);
  const [isApplyLoading, setIsApplyLoading] = useState(false);

  const targetLabel = (level: NonNullable<Suggestion['target']>['level']) => {
    if (level === 'campaign') return t('campaign_label');
    if (level === 'adset') return t('adset_label');
    return t('ad_label');
  };

  const handleOpenSuggestionTarget = (s: Suggestion) => {
    if (!s.target) return;
    const base = withQuery('/app/campaigns');
    const join = base.includes('?') ? '&' : '?';
    router.push(`${base}${join}focusLevel=${encodeURIComponent(s.target.level)}&focusId=${encodeURIComponent(s.target.id)}`);
  };

  const supportLink = (category: string) => {
    const base = withQuery('/app/support');
    const join = base.includes('?') ? '&' : '?';
    return `${base}${join}category=${encodeURIComponent(category)}`;
  };

  const handleToggle = (id: string, newState: boolean) => {
    const prev = strategies;
    const nextStatus: OptimizationStrategy['status'] = newState ? 'active' : 'paused';

    setStrategies((current) => current.map((s) => (s.id === id ? { ...s, status: nextStatus } : s)));

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

    if (useMockData) {
      toast.success(`${t('strategy_updated')}: ${newState ? t('active_status') : t('paused_status')}`, {
        duration: 6000,
        action: {
          label: t('undo'),
          onClick: async () => {
            const revertStatus: OptimizationStrategy['status'] = newState ? 'paused' : 'active';
            setStrategies((current) => current.map((s) => (s.id === id ? { ...s, status: revertStatus } : s)));
          },
        },
      });
      return;
    }

    void (async () => {
      try {
        const res = await fetch(`${baseUrl}/api/optimizations/strategies/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: nextStatus }),
        });

        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }

        toast.success(`${t('strategy_updated')}: ${newState ? t('active_status') : t('paused_status')}`, {
          duration: 6000,
          action: {
            label: t('undo'),
            onClick: async () => {
              const revertStatus: OptimizationStrategy['status'] = newState ? 'paused' : 'active';
              setStrategies((current) => current.map((s) => (s.id === id ? { ...s, status: revertStatus } : s)));
              try {
                await fetch(`${baseUrl}/api/optimizations/strategies/${id}`, {
                  method: 'PATCH',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ status: revertStatus }),
                });
              } catch {
                toast.error(`${t('undo')} ${t('suggestion_failed')}`);
              }
            },
          },
        });
      } catch {
        setStrategies(prev);
        toast.error(`${t('strategy_updated')} ${t('suggestion_failed')}`);
      }
    })();
  };

  const handleSettings = (id: string) => {
    const target = strategies.find((s) => s.id === id) ?? null;
    setSettingsStrategy(target);
    setIsSettingsOpen(true);
  };

  const fetchSuggestionDetail = async (id: string) => {
    setIsReviewLoading(true);

    if (useMockData) {
      setIsReviewLoading(false);
      return;
    }
    try {
      const data = await api<any>(`/suggestions/${id}`);
      const suggestion = (data as { suggestion?: unknown })?.suggestion as Partial<Suggestion> | undefined;
      if (!suggestion) return;

      setReviewDetails((prev) => {
        const current = suggestions.find((s) => s.id === id);
        if (!current) return prev;
        return {
          ...current,
          title: String(suggestion.title ?? current.title),
          description: String(suggestion.description ?? current.description),
          impactLevel: (suggestion.impactLevel as Suggestion['impactLevel']) ?? current.impactLevel,
          impactMetric: String(suggestion.impactMetric ?? current.impactMetric),
        };
      });
    } catch {
      setReviewDetails(null);
    } finally {
      setIsReviewLoading(false);
    }
  };

  const setSuggestionState = (id: string, next: Partial<SuggestionQueueItem>) => {
    setSuggestions((current) => current.map((s) => (s.id === id ? { ...s, ...next } : s)));
  };

  // Dismiss via POST /suggestions/:id/dismiss, snooze/approve via POST /suggestions/:id/decision
  const postDecision = async (id: string, decision: 'approve' | 'dismiss' | 'snooze', snoozeUntil?: string) => {
    if (useMockData) return;

    if (decision === 'dismiss') {
      await api(`/suggestions/${id}/dismiss`, { method: 'POST' });
    } else {
      await api(`/suggestions/${id}/decision`, {
        method: 'POST',
        body: { decision, snoozeUntil },
      });
    }
  };

  // Apply suggestion via POST /suggestions/:id/apply
  const applySuggestion = async (id: string) => {
    if (useMockData) return;

    const current = suggestions.find((s) => s.id === id);
    const title = (current?.title ?? '').toLowerCase();
    const isPauseType = title.includes('pause');
    const isScaleType = title.includes('scale') || title.includes('winning');

    let scalePatch: { dailyBudget: number } | undefined;
    if (isScaleType && current?.target?.level === 'adset') {
      try {
        const data = await api<any>(`/meta/adsets?accountId=${encodeURIComponent(account)}`);
        const rows = Array.isArray((data as { adsets?: unknown }).adsets)
          ? ((data as { adsets?: unknown }).adsets as unknown[])
          : Array.isArray(data)
            ? (data as unknown[])
            : [];

        const target = rows
          .map((x) => x as Record<string, unknown>)
          .find((x) => String(x.id ?? '') === current.target?.id);

        const budgetRaw = target?.dailyBudget;
        const budgetText = typeof budgetRaw === 'string' ? budgetRaw : typeof budgetRaw === 'number' ? String(budgetRaw) : '';
        const numeric = Number(budgetText.replace('₺', '').trim());
        if (!Number.isNaN(numeric) && Number.isFinite(numeric) && numeric > 0) {
          scalePatch = { dailyBudget: Math.round(numeric * 1.2) };
        }
      } catch {
        // ignore
      }
    }

    const actionPlan =
      isPauseType && current?.target
        ? {
            items: [
              {
                entity: current.target.level,
                id: current.target.id,
                patch: { status: 'paused' },
                reason: current.title,
              },
            ],
          }
        : scalePatch && current?.target
          ? {
              items: [
                {
                  entity: current.target.level,
                  id: current.target.id,
                  patch: scalePatch,
                  reason: current.title,
                },
              ],
            }
        : undefined;

    await api(`/suggestions/${id}/apply`, {
      method: 'POST',
      body: { dryRun: false, options: {}, ...(actionPlan ? { actionPlan } : {}) },
    });
  };

  useEffect(() => {
    const fetchStrategies = async () => {
      setIsLoading(true);
      setError(null);

      if (useMockData) {
        setStrategies(defaultStrategies);
        setIsLoading(false);
        return;
      }

      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const res = await fetch(
          `${baseUrl}/api/optimizations/strategies?accountId=${encodeURIComponent(account)}&range=${encodeURIComponent(range)}${
            range === 'custom' && from && to
              ? `&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
              : ''
          }`
        );

        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }

        const data = await res.json();
        const rows: unknown[] = Array.isArray(data)
          ? data
          : Array.isArray((data as { strategies?: unknown }).strategies)
            ? ((data as { strategies?: unknown }).strategies as unknown[])
            : [];

        if (rows.length === 0) {
          setStrategies([]);
          return;
        }

        const mapped: OptimizationStrategy[] = rows.map((item) => {
          const obj = item as Record<string, unknown>;
          return {
            id: String(obj.id ?? ''),
            title: String(obj.title ?? ''),
            description: String(obj.description ?? ''),
            status: (String(obj.status ?? 'waiting') as OptimizationStrategy['status']) || 'waiting',
            iconCategory: (String(obj.iconCategory ?? 'performance') as OptimizationStrategy['iconCategory']) || 'performance',
            lastCheck: obj.lastCheck ? String(obj.lastCheck) : undefined,
          };
        });

        setStrategies(mapped);
      } catch (err) {
        console.error('Failed to fetch optimization strategies', err);
        setStrategies(defaultStrategies);
        setError('Could not fetch live data. Showing sample data for now.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStrategies();
  }, [useMockData, account, range, from, to]);

  // Fetch suggestions via GET /suggestions?accountId=...&status=PENDING
  useEffect(() => {
    const fetchSuggestions = async () => {
      setIsSuggestionsLoading(true);
      setSuggestionsError(null);

      if (useMockData) {
        const mapped = mockSuggestions.map((s) => ({ ...s, state: 'pending' as const }));
        setSuggestions(mapped);
        setIsSuggestionsLoading(false);
        return;
      }

      try {
        const data = await api<any>(`/suggestions?accountId=${encodeURIComponent(account)}&status=PENDING`);
        const rows: unknown[] = Array.isArray((data as { suggestions?: unknown }).suggestions)
          ? ((data as { suggestions?: unknown }).suggestions as unknown[])
          : Array.isArray(data)
            ? (data as unknown[])
            : [];

        const mapped = (rows as Suggestion[]).map((s) => ({ ...s, state: 'pending' as const }));
        setSuggestions(mapped);
      } catch (err) {
        console.error('Failed to fetch suggestions', err);
        const mapped = mockSuggestions.map((s) => ({ ...s, state: 'pending' as const }));
        setSuggestions(mapped);
        setSuggestionsError('Could not fetch live data. Showing sample suggestions for now.');
      } finally {
        setIsSuggestionsLoading(false);
      }
    };

    fetchSuggestions();
  }, [useMockData, account, range, from, to]);

  // Fetch autopilot config via GET /autopilot/config/:accountId
  useEffect(() => {
    const fetchAutopilotConfig = async () => {
      if (useMockData) {
        setAutopilotConfig({ enabled: false, mode: 'suggest', maxActionsPerDay: 10, requireApproval: true });
        return;
      }

      setIsAutopilotConfigLoading(true);
      try {
        const data = await api<AutopilotConfig>(`/autopilot/config/${encodeURIComponent(account)}`);
        setAutopilotConfig(data);
      } catch (err) {
        console.error('Failed to fetch autopilot config', err);
        setAutopilotConfig({ enabled: false, mode: 'suggest', maxActionsPerDay: 10, requireApproval: true });
      } finally {
        setIsAutopilotConfigLoading(false);
      }
    };

    fetchAutopilotConfig();
  }, [useMockData, account]);

  // Fetch recent autopilot actions via GET /autopilot/actions?accountId=...&limit=10
  useEffect(() => {
    const fetchRecentActions = async () => {
      if (useMockData) {
        setRecentActions([]);
        return;
      }

      setIsActionsLoading(true);
      try {
        const data = await api<any>(`/autopilot/actions?accountId=${encodeURIComponent(account)}&limit=10`);
        const actions = Array.isArray(data)
          ? data
          : Array.isArray((data as { actions?: unknown }).actions)
            ? ((data as { actions?: unknown }).actions as AutopilotAction[])
            : [];
        setRecentActions(actions);
      } catch (err) {
        console.error('Failed to fetch autopilot actions', err);
        setRecentActions([]);
      } finally {
        setIsActionsLoading(false);
      }
    };

    fetchRecentActions();
  }, [useMockData, account]);

  return (
    <div className="space-y-8">
      <PageHeader
        title={t('title')}
        description={t('description')}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link href={supportLink('bug')}>
              <Button variant="ghost" size="sm" icon={<Bug className="w-4 h-4" />}>
                {t('report_bug')}
              </Button>
            </Link>
            <Link href={supportLink('other')}>
              <Button variant="ghost" size="sm" icon={<LifeBuoy className="w-4 h-4" />}>
                {t('support')}
              </Button>
            </Link>
          </div>
        }
      />

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, idx) => (
            <Card key={idx} padding="lg">
              <Skeleton className="h-6 w-1/3 mb-4" />
              <Skeleton className="h-4 w-2/3 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </Card>
          ))}
        </div>
      ) : (
        <>
          {error && (
            <Card padding="lg">
              <p className="text-sm font-semibold text-gray-900">Bilgi</p>
              <p className="text-sm text-gray-600 mt-1">{error}</p>
            </Card>
          )}

          {strategies.length > 0 ? (
            <div className="space-y-4">
              {strategies.map((strategy) => (
                <OptimizationStrategyRow
                  key={strategy.id}
                  strategy={strategy}
                  settings={strategySettings[strategy.id]}
                  onToggle={handleToggle}
                  onSettings={handleSettings}
                />
              ))}
            </div>
          ) : (
            <EmptyStateCard
              icon={Zap}
              title={t('no_strategies')}
              description={t('no_strategies_desc')}
            />
          )}
        </>
      )}

      {/* Autopilot Config Section */}
      <section className="pt-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-indigo-600 text-white rounded-md">
            <Shield size={18} />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">{t('autopilot_config') || 'Autopilot Config'}</h2>
        </div>
        {isAutopilotConfigLoading ? (
          <Card padding="lg">
            <Skeleton className="h-6 w-1/3 mb-4" />
            <Skeleton className="h-4 w-2/3" />
          </Card>
        ) : autopilotConfig ? (
          <Card padding="lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">{t('status') || 'Status'}</p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {autopilotConfig.enabled ? (
                    <span className="inline-flex items-center gap-1 text-green-700">
                      <Activity size={14} /> {t('active_status') || 'Active'}
                    </span>
                  ) : (
                    <span className="text-gray-500">{t('paused_status') || 'Disabled'}</span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">{t('mode') || 'Mode'}</p>
                <p className="text-sm font-medium text-gray-900 mt-1 capitalize">{autopilotConfig.mode}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">{t('max_actions_day') || 'Max Actions/Day'}</p>
                <p className="text-sm font-medium text-gray-900 mt-1">{autopilotConfig.maxActionsPerDay}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">{t('approval_required') || 'Approval Required'}</p>
                <p className="text-sm font-medium text-gray-900 mt-1">{autopilotConfig.requireApproval ? t('yes') || 'Yes' : t('no') || 'No'}</p>
              </div>
            </div>
          </Card>
        ) : null}
      </section>

      {/* Recent Autopilot Actions */}
      {recentActions.length > 0 && (
        <section className="pt-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gray-100 text-gray-700 rounded-md">
                <Clock size={18} />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">{t('recent_actions') || 'Recent Actions'}</h2>
            </div>
            <p className="text-sm text-gray-500">{recentActions.length} {t('actions') || 'actions'}</p>
          </div>
          {isActionsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">
              {recentActions.map((action) => (
                <Card key={action.id} padding="md" className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                    <Activity size={18} className="text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{action.description || action.type}</p>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                      {action.entityType}: {action.entityName || action.entityId}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-gray-400">{new Date(action.createdAt).toLocaleString()}</p>
                    <p className={`text-xs font-medium mt-0.5 ${action.status === 'EXECUTED' || action.status === 'APPROVED' ? 'text-green-600' : action.status === 'PENDING' ? 'text-amber-600' : 'text-gray-500'}`}>
                      {action.status}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      )}

      <section className="pt-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-600 text-white rounded-md">
              <Lightbulb size={18} />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">{t('suggestion_queue')}</h2>
          </div>
          <p className="text-sm text-gray-600">
            {isSuggestionsLoading ? t('loading') : `${suggestions.filter((s) => s.state === 'pending').length} ${t('active_suggestions')}`}
          </p>
        </div>

        {isSuggestionsLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, idx) => (
              <Card key={idx} padding="lg">
                <Skeleton className="h-4 w-1/4 mb-3" />
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </Card>
            ))}
          </div>
        ) : (
          <>
            {suggestionsError && (
              <Card padding="lg" className="mb-4">
                <p className="text-sm font-semibold text-gray-900">Bilgi</p>
                <p className="text-sm text-gray-600 mt-1">{suggestionsError}</p>
              </Card>
            )}

            {suggestions.filter((s) => s.state === 'pending').length > 0 ? (
              <div className="space-y-4">
                {suggestions
                  .filter((s) => s.state === 'pending')
                  .map((s) => (
                    <Card key={s.id} variant="interactive" padding="lg" className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-500 uppercase">{s.impactLevel} {t('impact')}</p>
                        <p className="text-base font-semibold text-gray-900 mt-1">{s.title}</p>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{s.description}</p>
                        {s.target && (
                          <div className="mt-3 bg-gray-50 rounded-md p-3">
                            <p className="text-xs font-semibold text-gray-500 uppercase">{t('affected')}</p>
                            <p className="text-sm font-medium text-gray-900 mt-1 truncate">
                              {s.target.level === 'campaign'
                                ? `${t('campaign_label')}: ${s.target.name}`
                                : s.target.level === 'adset'
                                  ? `${t('adset_label')}: ${s.target.name}`
                                  : `${t('ad_label')}: ${s.target.name}`}
                            </p>
                          </div>
                        )}
                        <p className="text-sm font-semibold text-blue-600 mt-2">{s.impactMetric}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Eye className="w-4 h-4" />}
                          onClick={() => {
                            setReviewSuggestion(s);
                            setReviewDetails(s);
                            void fetchSuggestionDetail(s.id);
                          }}
                        >
                          {t('review')}
                        </Button>
                        {s.target && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenSuggestionTarget(s)}
                          >
                            {t('open_target')}
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
              </div>
            ) : (
              <EmptyStateCard
                icon={Lightbulb}
                title={t('no_suggestions_today')}
                description={t('no_suggestions_desc')}
              />
            )}
          </>
        )}
      </section>

      {reviewSuggestion && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity" onClick={() => setReviewSuggestion(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg pointer-events-auto flex flex-col max-h-[90vh] border border-gray-200">
              <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex items-center justify-between rounded-t-lg">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{t('review_suggestion')}</h3>
                  <p className="text-sm text-gray-600">{reviewSuggestion.title}</p>
                </div>
                <button
                  onClick={() => setReviewSuggestion(null)}
                  className="p-2 hover:bg-gray-100 rounded-md transition-colors text-gray-400 hover:text-gray-600"
                  aria-label={t('cancel')}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-4 overflow-y-auto">
                <div className="bg-gray-50 rounded-md p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase">{t('impact')}</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{reviewSuggestion.impactLevel} — {reviewSuggestion.impactMetric}</p>
                </div>

                {reviewSuggestion.target && (
                  <div className="bg-white rounded-md p-4 border border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase">{t('affected')}</p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">
                      {reviewSuggestion.target.level === 'campaign'
                        ? `${t('campaign_label')}: ${reviewSuggestion.target.name}`
                        : reviewSuggestion.target.level === 'adset'
                          ? `${t('adset_label')}: ${reviewSuggestion.target.name}`
                          : `${t('ad_label')}: ${reviewSuggestion.target.name}`}
                    </p>
                    <p className="text-xs text-gray-500 mt-2 font-mono">
                      {reviewSuggestion.target.level}:{reviewSuggestion.target.id}
                    </p>
                    <div className="mt-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenSuggestionTarget(reviewSuggestion)}
                      >
                        {t('open_target')}
                      </Button>
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-sm font-semibold text-gray-900">{t('what_is_it')}</p>
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                    {isReviewLoading ? t('loading') : (reviewDetails?.description ?? reviewSuggestion.description)}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-900">{t('what_does_it_do')}</p>
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                    {t('suggestion_description')}
                  </p>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between gap-3 rounded-b-lg">
                <Button
                  variant="ghost"
                  onClick={() => {
                    const prev = reviewSuggestion;
                    setSuggestionState(prev.id, { state: 'dismissed' });
                    setReviewSuggestion(null);
                    toast.success(t('suggestion_dismissed'), {
                      duration: 6000,
                      action: {
                        label: t('undo'),
                        onClick: () => setSuggestionState(prev.id, { state: 'pending' }),
                      },
                    });
                    void (async () => {
                      try {
                        await postDecision(prev.id, 'dismiss');
                      } catch {
                        setSuggestionState(prev.id, { state: 'pending' });
                        toast.error(t('suggestion_failed'));
                      }
                    })();
                  }}
                >
                  {t('dismiss')}
                </Button>

                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      const prev = reviewSuggestion;
                      const until = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
                      setSuggestionState(prev.id, { state: 'snoozed', snoozeUntil: until });
                      setReviewSuggestion(null);
                      toast.success(t('suggestion_snoozed'), {
                        duration: 6000,
                        action: {
                          label: t('undo'),
                          onClick: () => setSuggestionState(prev.id, { state: 'pending', snoozeUntil: undefined }),
                        },
                      });
                      void (async () => {
                        try {
                          await postDecision(prev.id, 'snooze', until);
                        } catch {
                          setSuggestionState(prev.id, { state: 'pending', snoozeUntil: undefined });
                          toast.error(t('suggestion_failed'));
                        }
                      })();
                    }}
                  >
                    {t('snooze_7d')}
                  </Button>

                  <Button
                    variant="primary"
                    onClick={() => setIsApplyConfirmOpen(true)}
                  >
                    {t('approve_apply')}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <ConfirmModal
            isOpen={isApplyConfirmOpen}
            onClose={() => setIsApplyConfirmOpen(false)}
            title={t('confirm_title')}
            message={reviewSuggestion.title}
            confirmText={t('yes_apply')}
            cancelText={t('cancel')}
            variant="primary"
            loading={isApplyLoading}
            onConfirm={() => {
              if (isApplyLoading) return;
              const s = reviewSuggestion;
              setIsApplyLoading(true);
              void (async () => {
                const prevState = s.state;
                setSuggestionState(s.id, { state: 'applied' });
                try {
                  await applySuggestion(s.id);
                  toast.success(t('suggestion_applied'));
                  setReviewSuggestion(null);
                  setIsApplyConfirmOpen(false);
                } catch {
                  setSuggestionState(s.id, { state: prevState });
                  toast.error(t('suggestion_failed'));
                } finally {
                  setIsApplyLoading(false);
                }
              })();
            }}
          />
        </>
      )}

      {/* Execution History */}
      {executionHistory.length > 0 && (
        <section className="pt-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gray-100 text-gray-700 rounded-md">
                <Zap size={18} />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">{t('run_history') || 'Run History'}</h2>
            </div>
            <p className="text-sm text-gray-500">{executionHistory.length} {t('runs') || 'runs'}</p>
          </div>
          <div className="space-y-3">
            {executionHistory.map((entry) => (
              <Card key={entry.id} padding="md" className="flex items-center gap-4">
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center shrink-0">
                  <Zap size={18} className="text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{entry.strategyTitle}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {entry.targetMode === 'all'
                      ? `${entry.targetLevel === 'campaign' ? tc('level_campaign') : entry.targetLevel === 'adset' ? tc('level_adset') : tc('level_ad')} / ${tc('all')}`
                      : `${entry.targetLevel === 'campaign' ? tc('level_campaign') : entry.targetLevel === 'adset' ? tc('level_adset') : tc('level_ad')} / ${entry.targetNames.join(', ')}`
                    }
                  </p>
                </div>
                <div className="text-xs text-gray-400 shrink-0">
                  {new Date(entry.timestamp).toLocaleString()}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const strat = strategies.find((s) => s.id === entry.strategyId);
                    if (strat) {
                      setSettingsStrategy(strat);
                      setStrategySettings((prev) => ({
                        ...prev,
                        [entry.strategyId]: {
                          targetLevel: entry.targetLevel,
                          targetMode: entry.targetMode,
                          targetIds: entry.targetIds,
                        },
                      }));
                      setIsSettingsOpen(true);
                    }
                  }}
                >
                  {t('rerun') || 'Re-run'}
                </Button>
              </Card>
            ))}
          </div>
        </section>
      )}

      <OptimizationSettingsModal
        key={settingsStrategy ? `${settingsStrategy.id}-${isSettingsOpen}` : 'new'}
        isOpen={isSettingsOpen}
        onClose={() => {
          setIsSettingsOpen(false);
          setTimeout(() => setSettingsStrategy(null), 150);
        }}
        strategy={settingsStrategy}
        campaigns={mockMetaCampaigns.map((c) => ({ id: c.id, name: c.name }))}
        adSets={mockMetaAdSets.map((a) => ({ id: a.id, name: a.name }))}
        ads={mockMetaAds.map((a) => ({ id: a.id, name: a.name }))}
        initialSettings={
          (settingsStrategy && strategySettings[settingsStrategy.id]) ?? {
            targetLevel: 'campaign',
            targetMode: 'all',
            targetIds: [],
          }
        }
        onSave={(strategyId, settings) => {
          setStrategySettings((prev) => ({ ...prev, [strategyId]: settings }));
          toast.success(t('strategy_saved'));
          setIsSettingsOpen(false);
          setTimeout(() => setSettingsStrategy(null), 150);
        }}
        onRun={(strategyId, settings) => {
          setStrategySettings((prev) => ({ ...prev, [strategyId]: settings }));

          const strat = strategies.find((s) => s.id === strategyId);
          const allEntities = settings.targetLevel === 'campaign'
            ? mockMetaCampaigns
            : settings.targetLevel === 'adset'
              ? mockMetaAdSets
              : mockMetaAds;
          const targetNames = settings.targetMode === 'all'
            ? []
            : settings.targetIds.map((id) => allEntities.find((e) => e.id === id)?.name ?? id);

          const entry: ExecutionHistoryEntry = {
            id: String(Date.now()),
            strategyId,
            strategyTitle: strat?.title ?? '',
            targetLevel: settings.targetLevel,
            targetMode: settings.targetMode,
            targetIds: settings.targetIds,
            targetNames,
            timestamp: new Date().toISOString(),
          };
          setExecutionHistory((prev) => [entry, ...prev]);
          toast.success(t('strategy_executed') || 'Optimization executed successfully');
          setIsSettingsOpen(false);
          setTimeout(() => setSettingsStrategy(null), 150);
        }}
      />
    </div>
  );
}
