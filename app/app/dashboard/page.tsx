'use client';

import { useEffect, useMemo, useState } from 'react';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { SuggestionCard } from '@/components/dashboard/SuggestionCard';
import { CampaignTable } from '@/components/dashboard/CampaignTable';
import { KpiMetric, Suggestion, Campaign } from '@/types/dashboard';
import { ArrowRight, BarChart2, Bug, LifeBuoy, Lightbulb } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';
import { Button, Card, Skeleton, ConfirmModal } from '@/components/ui';
import { PageHeader, EmptyStateCard, SectorComparison } from '@/components/dashboard';
import { mockKpiMetrics, mockMetaCampaigns, mockSuggestions } from '@/components/dashboard/mockData';
import { useDashboardQuery } from '@/components/dashboard/useDashboardQuery';
import { usePlatform } from '@/components/dashboard/PlatformContext';
import { useTranslations } from '@/lib/i18n';

export default function DashboardPage() {
  const toast = useToast();
  const router = useRouter();
  const { platform } = usePlatform();
  const t = useTranslations('dashboard');
  const tc = useTranslations('common');
  const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' || !process.env.NEXT_PUBLIC_API_URL;
  const { account, range, from, to, withQuery } = useDashboardQuery();
  const [metrics, setMetrics] = useState<KpiMetric[]>([]);
  const [topCampaigns, setTopCampaigns] = useState<Campaign[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isMetricsLoading, setIsMetricsLoading] = useState(false);
  const [metricsError, setMetricsError] = useState<string | null>(null);
  const [isTopCampaignsLoading, setIsTopCampaignsLoading] = useState(false);
  const [topCampaignsError, setTopCampaignsError] = useState<string | null>(null);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState<string | null>(null);

  const [applySuggestion, setApplySuggestion] = useState<Suggestion | null>(null);
  const [isApplyConfirmOpen, setIsApplyConfirmOpen] = useState(false);
  const [isApplyLoading, setIsApplyLoading] = useState(false);

  const targetLabel = (level: NonNullable<Suggestion['target']>['level']) => {
    if (level === 'campaign') return tc('level_campaign');
    if (level === 'adset') return tc('level_adset');
    return tc('level_ad');
  };

  const handleApplySuggestion = (suggestion: Suggestion) => {
    setApplySuggestion(suggestion);
    setIsApplyConfirmOpen(true);
  };

  const handleOpenSuggestionTarget = (suggestion: Suggestion) => {
    if (!suggestion.target) return;

    const { level, id, name } = suggestion.target;

    // Navigate based on entity level
    if (level === 'campaign') {
      router.push(withQuery(`/app/campaigns?focusCampaign=${encodeURIComponent(id)}&campaignName=${encodeURIComponent(name)}`));
    } else if (level === 'adset') {
      router.push(withQuery(`/app/campaigns?focusAdSet=${encodeURIComponent(id)}&adSetName=${encodeURIComponent(name)}`));
    } else if (level === 'ad') {
      router.push(withQuery(`/app/all-ads?focusAd=${encodeURIComponent(id)}&adName=${encodeURIComponent(name)}`));
    }
  };

  const supportLink = (category: string) => {
    const base = withQuery('/app/support');
    const join = base.includes('?') ? '&' : '?';
    return `${base}${join}category=${encodeURIComponent(category)}`;
  };

  const rangeLabel = useMemo(() => {
    if (range === '30d') return t('last_30_days');
    if (range === 'custom') {
      if (from && to) return `${t('custom')} (${from} → ${to})`;
      return t('custom');
    }
    return t('last_7_days');
  }, [from, range, to, t]);

  useEffect(() => {
    const fetchOverview = async () => {
      setIsMetricsLoading(true);
      setMetricsError(null);

      if (useMockData) {
        setMetrics(mockKpiMetrics);
        setIsMetricsLoading(false);
        return;
      }

      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const res = await fetch(
          `${baseUrl}/api/overview?accountId=${encodeURIComponent(account)}&range=${encodeURIComponent(range)}${range === 'custom' && from && to
            ? `&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
            : ''
          }`
        );

        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }

        const data = await res.json();
        if (!data || !Array.isArray(data.metrics)) {
          setMetrics([]);
          return;
        }

        setMetrics(data.metrics as KpiMetric[]);
      } catch (error) {
        console.error(t('error_fetching_metrics'), error);
        setMetrics(mockKpiMetrics);
        setMetricsError(tc('live_data_unavailable'));
      } finally {
        setIsMetricsLoading(false);
      }
    };

    fetchOverview();
  }, [useMockData, account, range, from, to]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      setIsSuggestionsLoading(true);
      setSuggestionsError(null);

      if (useMockData) {
        setSuggestions(mockSuggestions);
        setIsSuggestionsLoading(false);
        return;
      }

      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const res = await fetch(
          `${baseUrl}/api/overview/suggestions?accountId=${encodeURIComponent(account)}&range=${encodeURIComponent(range)}${range === 'custom' && from && to
            ? `&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
            : ''
          }`
        );

        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }

        const data = await res.json();
        const rows: unknown[] = Array.isArray((data as { suggestions?: unknown }).suggestions)
          ? ((data as { suggestions?: unknown }).suggestions as unknown[])
          : Array.isArray(data)
            ? (data as unknown[])
            : [];

        setSuggestions(rows as Suggestion[]);
      } catch (error) {
        console.error(t('error_fetching_suggestions'), error);
        setSuggestions(mockSuggestions);
        setSuggestionsError(tc('live_data_unavailable'));
      } finally {
        setIsSuggestionsLoading(false);
      }
    };

    fetchSuggestions();
  }, [useMockData, account, range, from, to]);

  useEffect(() => {
    const fetchTopCampaigns = async () => {
      setIsTopCampaignsLoading(true);
      setTopCampaignsError(null);

      if (useMockData) {
        setTopCampaigns(mockMetaCampaigns.slice(0, 5));
        setIsTopCampaignsLoading(false);
        return;
      }

      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const res = await fetch(
          `${baseUrl}/api/meta/campaigns?accountId=${encodeURIComponent(account)}&range=${encodeURIComponent(range)}${range === 'custom' && from && to
            ? `&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
            : ''
          }`
        );

        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }

        const data = await res.json();
        if (!data || !Array.isArray(data.campaigns)) {
          setTopCampaigns([]);
          return;
        }

        setTopCampaigns((data.campaigns as Campaign[]).slice(0, 5));
      } catch (error) {
        console.error(t('error_fetching_campaigns'), error);
        setTopCampaigns(mockMetaCampaigns.slice(0, 5));
        setTopCampaignsError(tc('live_data_unavailable'));
      } finally {
        setIsTopCampaignsLoading(false);
      }
    };

    fetchTopCampaigns();
  }, [useMockData, account, range, from, to]);

  if (platform !== 'meta') {
    return (
      <EmptyStateCard
        icon={BarChart2}
        title={t('google_dashboard_soon')}
        description={t('google_dashboard_description')}
      />
    );
  }

  return (
    <div className="space-y-10">

      {/* KPIs Section */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <div className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm font-medium text-gray-600">
            {rangeLabel}
          </div>
        </div>

        {isMetricsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <Card key={idx} padding="lg">
                <Skeleton className="h-6 w-2/3 mb-3" />
                <Skeleton className="h-8 w-1/2 mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </Card>
            ))}
          </div>
        ) : (
          <>
            {metricsError && (
              <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-sm text-amber-800">{metricsError}</p>
              </div>
            )}

            {metrics.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {metrics.map((metric) => (
                  <KpiCard key={metric.id} metric={metric} />
                ))}
              </div>
            ) : (
              <EmptyStateCard
                icon={BarChart2}
                title={t('no_metrics_yet')}
                description={t('no_metrics_description')}
                actionLabel={t('go_to_accounts')}
                onAction={() => router.push(withQuery('/app/accounts'))}
              />
            )}
          </>
        )}
      </section>

      <ConfirmModal
        isOpen={isApplyConfirmOpen && !!applySuggestion}
        onClose={() => {
          if (isApplyLoading) return;
          setIsApplyConfirmOpen(false);
          setTimeout(() => setApplySuggestion(null), 150);
        }}
        title={t('confirm_apply')}
        message={
          applySuggestion?.target
            ? `${applySuggestion?.title}\n
${tc('affected')}: ${targetLabel(applySuggestion.target.level)}: ${applySuggestion.target.name}. ${t('apply_simulation')}`
            : `${applySuggestion?.title}\n\n${t('apply_simulation')}`
        }
        confirmText={t('yes_apply')}
        cancelText={tc('cancel')}
        variant="danger"
        loading={isApplyLoading}
        onConfirm={() => {
          if (!applySuggestion || isApplyLoading) return;
          setIsApplyLoading(true);
          void (async () => {
            try {
              toast.success(t('suggestion_applied_success', { title: applySuggestion.title }));
              setIsApplyConfirmOpen(false);
              setTimeout(() => setApplySuggestion(null), 150);
            } finally {
              setIsApplyLoading(false);
            }
          })();
        }}
      />

      {/* Suggestions Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">{t('smart_suggestions')}</h2>
          <Link href={withQuery('/app/smart-suggestions')} className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors">
            {t('view_all')} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isSuggestionsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, idx) => (
              <Card key={idx} padding="lg">
                <Skeleton className="h-4 w-1/3 mb-3" />
                <Skeleton className="h-5 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </Card>
            ))}
          </div>
        ) : (
          <>
            {suggestionsError && (
              <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-sm text-amber-800">{suggestionsError}</p>
              </div>
            )}

            {suggestions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {suggestions.slice(0, 3).map((suggestion) => (
                  <SuggestionCard
                    key={suggestion.id}
                    suggestion={suggestion}
                    onApply={handleApplySuggestion}
                    onOpenTarget={handleOpenSuggestionTarget}
                  />
                ))}
              </div>
            ) : (
              <EmptyStateCard
                icon={Lightbulb}
                title={t('no_suggestions_today')}
                description={t('no_suggestions_description')}
                actionLabel={t('go_to_optimizations')}
                onAction={() => router.push(withQuery('/app/smart-suggestions'))}
              />
            )}
          </>
        )}
      </section>

      {/* Sector Comparison Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectorComparison />
        <Card padding="lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('performance_summary')}</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm text-gray-600">{t('active_campaigns')}</span>
              <span className="text-lg font-semibold text-gray-900">{topCampaigns.filter(c => c.status === 'active').length}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm text-gray-600">{t('pending_suggestions')}</span>
              <span className="text-lg font-semibold text-gray-900">{suggestions.length}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm text-gray-600">{t('total_spend')}</span>
              <span className="text-lg font-semibold text-gray-900">
                {(() => {
                  const spendValue = metrics.find(m => m.id === 'spend')?.value ?? 0;
                  const numericSpend = typeof spendValue === 'string'
                    ? parseFloat(spendValue.replace(/[^0-9,.\-]/g, '').replace(/\./g, '').replace(',', '.'))
                    : spendValue;
                  return `₺${Number(numericSpend || 0).toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
                })()}
              </span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-gray-600">{t('avg_roas')}</span>
              <span className="text-lg font-semibold text-green-600">
                {(() => {
                  const roasValue = metrics.find(m => m.id === 'roas')?.value ?? 0;
                  const numericRoas = typeof roasValue === 'string'
                    ? parseFloat(roasValue.replace(/[^0-9,.]/g, '').replace(',', '.'))
                    : roasValue;
                  return `${Number(numericRoas || 0).toFixed(2)}x`;
                })()}
              </span>
            </div>
          </div>
        </Card>
      </section>

      {/* Campaigns Table Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">{t('top_campaigns')}</h2>
          <Link href={withQuery('/app/campaigns')}>
            <Button variant="ghost" size="sm">
              {t('all_campaigns')}
            </Button>
          </Link>
        </div>

        {isTopCampaignsLoading ? (
          <Card padding="none" className="overflow-hidden">
            <div className="divide-y divide-gray-200">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className="p-4">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              ))}
            </div>
          </Card>
        ) : (
          <>
            {topCampaignsError && (
              <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-sm text-amber-800">{topCampaignsError}</p>
              </div>
            )}

            {topCampaigns.length > 0 ? (
              <CampaignTable campaigns={topCampaigns} />
            ) : (
              <EmptyStateCard
                icon={BarChart2}
                title={t('no_campaigns_to_show')}
                description={t('no_campaigns_description')}
              />
            )}
          </>
        )}
      </section>

      <section>
        <Card className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-gray-900">{t('have_issue')}</p>
            <p className="text-sm text-gray-600 mt-1">{t('have_issue_description')}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href={supportLink('bug')}>
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <Bug className="w-4 h-4" />
                {t('report_bug')}
              </Button>
            </Link>
            <Link href={supportLink('other')}>
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <LifeBuoy className="w-4 h-4" />
                {tc('support')}
              </Button>
            </Link>
          </div>
        </Card>
      </section>
    </div>
  );
}
