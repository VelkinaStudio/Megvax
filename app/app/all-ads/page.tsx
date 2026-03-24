'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useTranslations } from '@/lib/i18n';
import {
  Search, Filter, Download, ArrowUpDown, Eye, Pause, Play,
  Settings2, ChevronDown, BarChart3, RefreshCw, MoreHorizontal,
  TrendingUp, TrendingDown, Layers, X, Calendar, LayoutGrid
} from 'lucide-react';
import { PageHeader } from '@/components/dashboard';
import { Button, Card, Badge, Checkbox } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import { ColumnCustomizer } from '@/components/dashboard/ColumnCustomizer';
import { StatsSummaryBar, type StatItem } from '@/components/dashboard/StatsSummaryBar';
import { useDashboardQuery } from '@/components/dashboard/useDashboardQuery';
import {
  METRIC_COLUMNS,
  FIXED_COLUMNS,
  DEFAULT_VISIBLE_COLUMNS,
  formatColumnValue,
  getColumnById,
  type ColumnDefinition
} from '@/lib/data/meta-columns';

type AdStatus = 'active' | 'paused' | 'archived';
type ViewMode = 'table' | 'summary' | 'detailed';

interface AllAdsItem {
  id: string;
  name: string;
  accountId: string;
  accountName: string;
  campaignId: string;
  campaignName: string;
  adSetId: string;
  adSetName: string;
  status: AdStatus;
  spend: number;
  impressions: number;
  reach: number;
  frequency: number;
  clicks: number;
  ctr: number;
  cpc: number;
  cpm: number;
  roas: number;
  conversions: number;
  conversionValue: number;
  linkClicks: number;
  addToCart: number;
  videoViews: number;
}

type SortField = keyof AllAdsItem;
type SortDirection = 'asc' | 'desc';

export default function AllAdsPage() {
  const t = useTranslations('all_ads');
  const toast = useToast();
  const { range, from, to } = useDashboardQuery();
  const [allAds, setAllAds] = useState<AllAdsItem[]>([]);
  const [accounts, setAccounts] = useState<{ id: string; name: string }[]>([]);

  // Fetch ads from API
  useEffect(() => {
    const fetchAds = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/ads?limit=100`);
        if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
        const data = await res.json();
        const rows: AllAdsItem[] = Array.isArray(data) ? data : Array.isArray(data?.ads) ? data.ads : [];
        setAllAds(rows);

        // Extract unique accounts
        const accountMap = new Map<string, string>();
        rows.forEach((ad: AllAdsItem) => {
          if (ad.accountId && ad.accountName) {
            accountMap.set(ad.accountId, ad.accountName);
          }
        });
        setAccounts(Array.from(accountMap.entries()).map(([id, name]) => ({ id, name })));
      } catch (error) {
        console.error('Failed to fetch ads', error);
        setAllAds([]);
      }
    };

    fetchAds();
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<AdStatus | 'all'>('all');
  const [sortField, setSortField] = useState<SortField>('spend');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isColumnCustomizerOpen, setIsColumnCustomizerOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(DEFAULT_VISIBLE_COLUMNS);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | 'custom'>('7d');
  const [customDateRange, setCustomDateRange] = useState({ from: '', to: '' });

  const filteredAds = useMemo(() => {
    let result = [...allAds];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (ad) =>
          ad.name.toLowerCase().includes(query) ||
          ad.campaignName.toLowerCase().includes(query) ||
          ad.adSetName.toLowerCase().includes(query) ||
          ad.accountName.toLowerCase().includes(query)
      );
    }

    if (selectedAccounts.length > 0) {
      result = result.filter((ad) => selectedAccounts.includes(ad.accountId));
    }

    if (selectedStatus !== 'all') {
      result = result.filter((ad) => ad.status === selectedStatus);
    }

    result.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      const modifier = sortDirection === 'asc' ? 1 : -1;

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return aVal.localeCompare(bVal) * modifier;
      }
      return ((aVal as number) - (bVal as number)) * modifier;
    });

    return result;
  }, [allAds, searchQuery, selectedAccounts, selectedStatus, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const toggleAccount = (accountId: string) => {
    setSelectedAccounts((prev) =>
      prev.includes(accountId) ? prev.filter((id) => id !== accountId) : [...prev, accountId]
    );
  };

  const formatCurrency = (value: number) => `₺${value.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`;
  const formatNumber = (value: number) => value.toLocaleString('tr-TR');
  const formatPercent = (value: number) => `%${value.toFixed(2)}`;

  const totals = useMemo(() => {
    return filteredAds.reduce(
      (acc, ad) => ({
        spend: acc.spend + ad.spend,
        impressions: acc.impressions + ad.impressions,
        reach: acc.reach + ad.reach,
        clicks: acc.clicks + ad.clicks,
        conversions: acc.conversions + ad.conversions,
        conversionValue: acc.conversionValue + ad.conversionValue,
        linkClicks: acc.linkClicks + ad.linkClicks,
      }),
      { spend: 0, impressions: 0, reach: 0, clicks: 0, conversions: 0, conversionValue: 0, linkClicks: 0 }
    );
  }, [filteredAds]);

  const summaryStats: StatItem[] = useMemo(() => [
    { id: 'spend', label: t('total_spend'), value: totals.spend, formattedValue: formatCurrency(totals.spend), change: 12.5 },
    { id: 'impressions', label: t('impressions'), value: totals.impressions, formattedValue: formatNumber(totals.impressions), change: 8.2 },
    { id: 'clicks', label: t('clicks'), value: totals.clicks, formattedValue: formatNumber(totals.clicks), change: 15.3 },
    { id: 'ctr', label: t('ctr'), value: totals.clicks / totals.impressions * 100, formattedValue: `%${(totals.clicks / totals.impressions * 100).toFixed(2)}`, change: -2.1 },
    { id: 'conversions', label: t('conversions'), value: totals.conversions, formattedValue: formatNumber(totals.conversions), change: 22.4 },
    { id: 'roas', label: t('roas'), value: totals.conversionValue / totals.spend, formattedValue: `${(totals.conversionValue / totals.spend).toFixed(2)}x`, change: 5.7 },
  ], [totals, t]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success(t('data_updated'));
    }, 1500);
  }, [toast, t]);

  const handleExport = useCallback(() => {
    toast.info(t('export_started'));
  }, [toast, t]);

  const toggleRowSelection = (id: string) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const toggleAllRows = () => {
    if (selectedRows.length === filteredAds.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredAds.map(ad => ad.id));
    }
  };

  const getStatusBadge = (status: AdStatus) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">{t('active')}</Badge>;
      case 'paused':
        return <Badge variant="warning">{t('paused')}</Badge>;
      case 'archived':
        return <Badge variant="neutral">{t('archived')}</Badge>;
    }
  };

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <th
      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        <ArrowUpDown className={`w-3 h-3 ${sortField === field ? 'text-blue-600' : 'text-gray-400'}`} />
      </div>
    </th>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title')}
        description={`${accounts.length} ${t('description')} ${filteredAds.length}`}
        actions={
          <div className="flex items-center gap-2">
            {/* Date Range Selector */}
            <div className="flex items-center gap-2 mr-4">
              <div className="relative">
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value as '7d' | '30d' | 'custom')}
                  className="pl-9 pr-8 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="7d">{t('last_7_days')}</option>
                  <option value="30d">{t('last_30_days')}</option>
                  <option value="custom">{t('custom_date')}</option>
                </select>
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
              {dateRange === 'custom' && (
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={customDateRange.from}
                    onChange={(e) => setCustomDateRange(prev => ({ ...prev, from: e.target.value }))}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    type="date"
                    value={customDateRange.to}
                    onChange={(e) => setCustomDateRange(prev => ({ ...prev, to: e.target.value }))}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              icon={<RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />}
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              {t('refresh')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon={<Download className="w-4 h-4" />}
              onClick={handleExport}
            >
              {t('export')}
            </Button>
          </div>
        }
      />

      {/* Summary Stats Bar */}
      <StatsSummaryBar stats={summaryStats} expandable />

      {/* View Mode Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {selectedRows.length > 0 && (
            <div className="flex items-center gap-2 pl-4 border-l border-gray-200">
              <span className="text-sm text-gray-600">{selectedRows.length} {t('selected')}</span>
              <Button variant="ghost" size="sm" onClick={() => setSelectedRows([])}>
                <X className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => toast.info(t('bulk_action'))}>
                {t('bulk_action')}
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {dateRange === '7d' ? t('last_7_days') : dateRange === '30d' ? t('last_30_days') : t('custom_date')}
          </span>
          <Button
            variant="ghost"
            size="sm"
            icon={<Settings2 className="w-4 h-4" />}
            onClick={() => setIsColumnCustomizerOpen(true)}
          >
            {t('columns')} ({visibleColumns.length})
          </Button>
        </div>
      </div>

      <Card padding="none">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={t('search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-2">
              <div className="relative">
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Filter className="w-4 h-4" />
                  {t('filter')}
                  {(selectedAccounts.length > 0 || selectedStatus !== 'all') && (
                    <span className="w-2 h-2 bg-blue-600 rounded-full" />
                  )}
                </button>

                {isFilterOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-lg z-20 p-4">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">{t('accounts')}</h4>
                        <div className="space-y-2">
                          {accounts.map((account) => (
                            <label key={account.id} className="flex items-center gap-2 cursor-pointer">
                              <Checkbox
                                checked={selectedAccounts.includes(account.id)}
                                onChange={() => toggleAccount(account.id)}
                              />
                              <span className="text-sm text-gray-700">{account.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">{t('status')}</h4>
                        <select
                          value={selectedStatus}
                          onChange={(e) => setSelectedStatus(e.target.value as AdStatus | 'all')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        >
                          <option value="all">{t('all')}</option>
                          <option value="active">{t('active')}</option>
                          <option value="paused">{t('paused')}</option>
                          <option value="archived">{t('archived')}</option>
                        </select>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            setSelectedAccounts([]);
                            setSelectedStatus('all');
                          }}
                        >
                          {t('clear')}
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          className="flex-1"
                          onClick={() => setIsFilterOpen(false)}
                        >
                          {t('apply')}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 w-12">
                  <Checkbox
                    checked={selectedRows.length === filteredAds.slice(0, 50).length && filteredAds.length > 0}
                    onChange={toggleAllRows}
                  />
                </th>
                <SortableHeader field="name">{t('ad')}</SortableHeader>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('account')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('status')}</th>
                <SortableHeader field="spend">{t('spend')}</SortableHeader>
                <SortableHeader field="impressions">{t('impressions')}</SortableHeader>
                <SortableHeader field="clicks">{t('clicks')}</SortableHeader>
                <SortableHeader field="ctr">{t('ctr')}</SortableHeader>
                <SortableHeader field="cpc">{t('cpc')}</SortableHeader>
                <SortableHeader field="roas">{t('roas')}</SortableHeader>
                <SortableHeader field="conversions">{t('conversions')}</SortableHeader>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAds.slice(0, 50).map((ad) => (
                <tr
                  key={ad.id}
                  className={`hover:bg-gray-50 transition-colors ${selectedRows.includes(ad.id) ? 'bg-blue-50' : ''
                    }`}
                >
                  <td className="px-4 py-4 w-12">
                    <Checkbox
                      checked={selectedRows.includes(ad.id)}
                      onChange={() => toggleRowSelection(ad.id)}
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{ad.name}</p>
                      <p className="text-xs text-gray-500">{ad.campaignName} / {ad.adSetName}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-gray-600">{ad.accountName}</span>
                  </td>
                  <td className="px-4 py-4">{getStatusBadge(ad.status)}</td>
                  <td className="px-4 py-4 text-sm font-medium text-gray-900">{formatCurrency(ad.spend)}</td>
                  <td className="px-4 py-4 text-sm text-gray-600">{formatNumber(ad.impressions)}</td>
                  <td className="px-4 py-4 text-sm text-gray-600">{formatNumber(ad.clicks)}</td>
                  <td className="px-4 py-4 text-sm text-gray-600">{formatPercent(ad.ctr)}</td>
                  <td className="px-4 py-4 text-sm text-gray-600">{formatCurrency(ad.cpc)}</td>
                  <td className="px-4 py-4">
                    <span className={`text-sm font-semibold ${ad.roas >= 2 ? 'text-emerald-600' : ad.roas >= 1 ? 'text-gray-900' : 'text-red-600'
                      }`}>
                      {ad.roas.toFixed(2)}x
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">{ad.conversions}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
                        title={t('view')}
                        onClick={() => toast.info(t('view'))}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        className={`p-1.5 rounded-lg transition-colors ${ad.status === 'active'
                            ? 'hover:bg-amber-50 text-amber-500 hover:text-amber-600'
                            : 'hover:bg-green-50 text-green-500 hover:text-green-600'
                          }`}
                        title={ad.status === 'active' ? t('pause') : t('activate')}
                        onClick={() => toast.info(t('pause'))}
                      >
                        {ad.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                      <button
                        className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
                        title={t('more')}
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAds.length > 50 && (
          <div className="p-4 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500">
              {filteredAds.length} {t('showing_results')}
            </p>
          </div>
        )}

        {filteredAds.length === 0 && (
          <div className="p-12 text-center">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">{t('no_results')}</p>
          </div>
        )}
      </Card>

      {/* Column Customizer Modal */}
      <ColumnCustomizer
        isOpen={isColumnCustomizerOpen}
        onClose={() => setIsColumnCustomizerOpen(false)}
        selectedColumns={visibleColumns}
        onColumnsChange={setVisibleColumns}
        locale="tr"
      />
    </div>
  );
}
