'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { BarChart3, ArrowRight, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { usePlatform } from '@/components/dashboard/PlatformContext';
import { useDashboardQuery } from '@/components/dashboard/useDashboardQuery';
import { useTranslations } from '@/lib/i18n';
import { Button, Card, Badge } from '@/components/ui';
import { PageHeader, EmptyStateCard } from '@/components/dashboard';
import { InsightsView } from '@/components/dashboard/insights/InsightsView';
import { createMockInsightsSingle } from '@/components/dashboard/insights/mock';
import type { InsightsLevel, InsightsSingleResponse } from '@/types/dashboard';
import { Sparkline } from '@/components/ui/Sparkline';
import { api } from '@/lib/api';

type LevelOption = {
  key: InsightsLevel;
  labelKey: string;
  descKey: string;
};

const levelOptions: LevelOption[] = [
  { key: 'account', labelKey: 'level_account', descKey: 'level_account_desc' },
  { key: 'campaign', labelKey: 'level_campaign', descKey: 'level_campaign_desc' },
  { key: 'adset', labelKey: 'level_adset', descKey: 'level_adset_desc' },
  { key: 'ad', labelKey: 'level_ad', descKey: 'level_ad_desc' },
];

const mockCampaignOptions = [
  { id: 'mc1', name: 'Retargeting - Sales' },
  { id: 'mc2', name: 'Prospecting - Lead' },
  { id: 'mc3', name: 'Catalog - Conversion' },
];

const mockAdSetOptions = [
  { id: 'mas1', name: 'Women 25-34' },
  { id: 'mas2', name: 'Men 25-44' },
];

const mockAdOptions = [
  { id: 'ma1', name: 'Story_Video_v1' },
  { id: 'ma2', name: 'Feed_Image_v3' },
];

export default function InsightsPage() {
  const { platform } = usePlatform();
  const { account, range, withQuery } = useDashboardQuery();
  const t = useTranslations('insights');
  const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' || !process.env.NEXT_PUBLIC_API_URL;

  const [level, setLevel] = useState<InsightsLevel>('account');
  const [entityId, setEntityId] = useState<string>('all');
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('7d');

  const entityOptions = useMemo(() => {
    if (level === 'campaign') return mockCampaignOptions;
    if (level === 'adset') return mockAdSetOptions;
    if (level === 'ad') return mockAdOptions;
    return [];
  }, [level]);

  const effectiveEntityId = useMemo(() => {
    if (level === 'account') return `${platform}:${account}:${range}`;
    if (entityId && entityId !== 'all') return entityId;
    if (level === 'campaign') return mockCampaignOptions[0]?.id ?? 'campaign:missing';
    if (level === 'adset') return mockAdSetOptions[0]?.id ?? 'adset:missing';
    if (level === 'ad') return mockAdOptions[0]?.id ?? 'ad:missing';
    return 'all';
  }, [account, entityId, level, platform, range]);

  const [insights, setInsights] = useState<InsightsSingleResponse>(() =>
    createMockInsightsSingle(level, effectiveEntityId)
  );

  // Fetch real insights data when not using mock
  useEffect(() => {
    if (useMockData) {
      setInsights(createMockInsightsSingle(level, effectiveEntityId));
      return;
    }

    const accountId = account || '';
    if (!accountId) return;

    const daysMap = { '7d': 7, '30d': 30, '90d': 90 };
    const days = daysMap[dateRange];
    const toDate = new Date();
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);
    const from = fromDate.toISOString().split('T')[0];
    const to = toDate.toISOString().split('T')[0];

    const entityType = level !== 'account' ? level.toUpperCase() : undefined;
    const entityIdParam = level !== 'account' ? effectiveEntityId : undefined;

    const url = `/insights?accountId=${encodeURIComponent(accountId)}${
      entityType ? `&entityType=${entityType}` : ''
    }${entityIdParam ? `&entityId=${encodeURIComponent(entityIdParam)}` : ''}${
      from ? `&from=${from}` : ''
    }${to ? `&to=${to}` : ''}`;

    api<{ data: any[] }>(url)
      .then((response) => {
        const snapshots = response.data || [];

        // Build summary by aggregating InsightSnapshot[] fields
        const summary = snapshots.reduce(
          (acc, snap) => ({
            spend: acc.spend + (snap.spend ?? 0),
            conversions: acc.conversions + (snap.conversions ?? 0),
            impressions: acc.impressions + (snap.impressions ?? 0),
            clicks: acc.clicks + (snap.clicks ?? 0),
            roas: 0, // computed below
            ctr: 0,  // computed below
            cpc: 0,  // computed below
            cpm: 0,  // computed below
          }),
          { spend: 0, conversions: 0, impressions: 0, clicks: 0, roas: 0, ctr: 0, cpc: 0, cpm: 0 }
        );

        const totalImpressions = summary.impressions || 1;
        const totalClicks = summary.clicks || 1;
        const totalSpend = summary.spend || 1;

        summary.ctr = Number(((summary.clicks / totalImpressions) * 100).toFixed(2));
        summary.cpc = Number((totalSpend / totalClicks).toFixed(2));
        summary.cpm = Number(((totalSpend / totalImpressions) * 1000).toFixed(2));
        // Average ROAS across snapshots (weighted by spend)
        const weightedRoas = snapshots.reduce((acc, snap) => acc + (snap.roas ?? 0) * (snap.spend ?? 0), 0);
        summary.roas = Number((weightedRoas / (summary.spend || 1)).toFixed(2));

        // Build timeseries from snapshots
        const timeseries = snapshots.map((snap: any) => ({
          date: snap.date,
          spend: snap.spend ?? 0,
          roas: snap.roas ?? 0,
          conversions: snap.conversions ?? 0,
          ctr: snap.ctr ?? 0,
        }));

        setInsights({
          level,
          entityId: effectiveEntityId,
          summary: {
            spend: summary.spend,
            roas: summary.roas,
            conversions: summary.conversions,
            ctr: summary.ctr,
            cpc: summary.cpc,
            cpm: summary.cpm,
            impressions: summary.impressions,
          },
          timeseries,
          breakdowns: createMockInsightsSingle(level, effectiveEntityId).breakdowns,
        });
      })
      .catch(() => {
        // Fall back to mock data on error
        setInsights(createMockInsightsSingle(level, effectiveEntityId));
      });
  }, [useMockData, account, level, effectiveEntityId, dateRange]);

  const activeLevelMeta = useMemo(() => levelOptions.find((x) => x.key === level), [level]);

  // Derive sparkline data from timeseries (spend values)
  const chartData = useMemo(() => {
    if (insights.timeseries.length > 0) {
      return insights.timeseries.map((p) => p.spend);
    }
    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
    return Array.from({ length: days }, (_, i) => 50 + i * 2);
  }, [insights.timeseries, dateRange]);

  if (platform !== 'meta') {
    return (
      <EmptyStateCard
        icon={BarChart3}
        title={t('google_soon')}
        description={t('google_soon_desc')}
      />
    );
  }

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title={t('title')}
        description={t('description')}
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as '7d' | '30d' | '90d')}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="7d">{t('last_7_days')}</option>
                <option value="30d">{t('last_30_days')}</option>
                <option value="90d">{t('last_90_days')}</option>
              </select>
            </div>
          </div>
        }
      />

      {useMockData && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">{t('info_label')}:</span> {t('mock_data_info')}
          </p>
        </div>
      )}

      {/* Visual Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card padding="md" className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-gray-500 uppercase">{t('spend')}</p>
            <TrendingUp className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-xl font-bold text-gray-900">₺{insights.summary.spend.toLocaleString('tr-TR')}</p>
          <div className="mt-2 h-8">
            <Sparkline data={chartData.slice(0, 14)} width={120} height={32} color="#10B981" />
          </div>
        </Card>
        <Card padding="md" className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-gray-500 uppercase">{t('roas')}</p>
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{insights.summary.roas.toFixed(2)}x</span>
          </div>
          <p className="text-xl font-bold text-gray-900">{insights.summary.roas.toFixed(2)}x</p>
          <div className="mt-2 h-8">
            <Sparkline data={chartData.map(v => v * 0.05)} width={120} height={32} color="#4F46E5" />
          </div>
        </Card>
        <Card padding="md" className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-gray-500 uppercase">{t('conversions')}</p>
            <TrendingUp className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-xl font-bold text-gray-900">{insights.summary.conversions}</p>
          <div className="mt-2 h-8">
            <Sparkline data={chartData.map(v => v * 0.3)} width={120} height={32} color="#F59E0B" />
          </div>
        </Card>
        <Card padding="md" className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-gray-500 uppercase">{t('ctr')}</p>
            <span className="text-xs font-medium text-gray-600">%{insights.summary.ctr.toFixed(2)}</span>
          </div>
          <p className="text-xl font-bold text-gray-900">%{insights.summary.ctr.toFixed(2)}</p>
          <div className="mt-2 h-8">
            <Sparkline data={chartData.map(v => v * 0.02)} width={120} height={32} color="#EF4444" />
          </div>
        </Card>
      </div>

      <div className="flex justify-end mb-4">
        <Link href={withQuery('/app/campaigns')}>
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            {t('back_to_campaigns')}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      <Card className="p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-500 uppercase mb-2">{t('level')}</p>
            <div className="flex flex-wrap gap-2">
              {levelOptions.map((opt) => {
                const isActive = opt.key === level;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => {
                      setLevel(opt.key);
                      setEntityId('all');
                    }}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {t(opt.labelKey)}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-gray-500 mt-2">{activeLevelMeta ? t(activeLevelMeta.descKey) : ''}</p>
          </div>

          {level !== 'account' && (
            <div className="w-full lg:w-[360px]">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('entity_select')}</label>
              <select
                value={entityId}
                onChange={(e) => setEntityId(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">{t('entity_default')}</option>
                {entityOptions.map((o) => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-2">{t('entity_hint')}</p>
            </div>
          )}
        </div>
      </Card>

      <InsightsView insights={insights} />
    </div>
  );
}
