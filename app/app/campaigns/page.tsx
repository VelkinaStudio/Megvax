'use client';

import { useTranslations } from '@/lib/i18n';
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Campaign, AdSet, Ad } from '@/types/dashboard';
import { api } from '@/lib/api';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { MetricValue } from '@/components/ui/MetricCell';
import { Sparkline } from '@/components/ui/Sparkline';
import { TreeTable, BulkActionBar } from '@/components/ui/TreeTable';
import { SlideOver } from '@/components/ui/SplitPane';
import { PageHeader } from '@/components/dashboard';
import { usePlatform } from '@/components/dashboard/PlatformContext';
import { useSearchParams } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';
import {
  Plus,
  Filter,
  Search,
  MoreHorizontal,
  Play,
  Pause,
  Copy,
  Trash2,
  Layers,
  Target,
  Image as ImageIcon,
  X,
  Loader2
} from 'lucide-react';

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

type EntityType = 'campaign' | 'adset' | 'ad';

interface CampaignNode extends Campaign {
  type: 'campaign';
  children?: AdSetNode[];
}

interface AdSetNode extends AdSet {
  type: 'adset';
  children?: AdNode[];
}

interface AdNode extends Ad {
  type: 'ad';
}

type TreeNode = CampaignNode | AdSetNode | AdNode;

function parseCurrency(value: string): number {
  const cleaned = value.replace(/[^\d.-]/g, '');
  return parseFloat(cleaned) || 0;
}

function parsePercentage(value: string): number {
  const cleaned = value.replace('%', '');
  return parseFloat(cleaned) || 0;
}

function generateMockSparkline(): number[] {
  return Array.from({ length: 14 }, () => Math.random() * 100 + 50);
}

const mockCampaigns: CampaignNode[] = [
  {
    id: 'camp_1',
    type: 'campaign',
    name: 'Retargeting - Sales Campaign',
    status: 'active',
    spend: '₺45,230',
    roas: '3.45',
    conversions: 128,
    children: [
      {
        id: 'as_1',
        type: 'adset',
        name: 'Women 25-34 Istanbul',
        status: 'active',
        campaignId: 'camp_1',
        campaignName: 'Retargeting - Sales Campaign',
        bidStrategy: 'lowest_cost',
        dailyBudget: '₺500',
        spend: '₺18,450',
        roas: '4.20',
        conversions: 52,
        children: [
          {
            id: 'ad_1',
            type: 'ad',
            name: 'Story_Video_Product_1',
            status: 'active',
            adSetId: 'as_1',
            adSetName: 'Women 25-34 Istanbul',
            previewUrl: '/creatives/story1.jpg',
            ctr: '%2.4',
            spend: '₺8,230',
            roas: '4.50',
            conversions: 28,
          },
          {
            id: 'ad_2',
            type: 'ad',
            name: 'Feed_Carousel_Product_Set',
            status: 'active',
            adSetId: 'as_1',
            adSetName: 'Women 25-34 Istanbul',
            previewUrl: '/creatives/carousel1.jpg',
            ctr: '%1.8',
            spend: '₺10,220',
            roas: '3.95',
            conversions: 24,
          },
        ],
      },
      {
        id: 'as_2',
        type: 'adset',
        name: 'Men 35-44 Ankara',
        status: 'paused',
        campaignId: 'camp_1',
        campaignName: 'Retargeting - Sales Campaign',
        bidStrategy: 'cost_cap',
        dailyBudget: '₺400',
        spend: '₺12,780',
        roas: '2.10',
        conversions: 18,
        children: [
          {
            id: 'ad_3',
            type: 'ad',
            name: 'Reels_Video_Discount',
            status: 'paused',
            adSetId: 'as_2',
            adSetName: 'Erkek 35-44 Ankara',
            previewUrl: '/creatives/reels1.jpg',
            ctr: '%1.2',
            spend: '₺12,780',
            roas: '2.10',
            conversions: 18,
          },
        ],
      },
    ],
  },
  {
    id: 'camp_2',
    type: 'campaign',
    name: 'Prospecting - New Customer',
    status: 'active',
    spend: '₺32,150',
    roas: '2.15',
    conversions: 67,
    children: [
      {
        id: 'as_3',
        type: 'adset',
        name: 'Broad Audience - Lookalike 1%',
        status: 'active',
        campaignId: 'camp_2',
        campaignName: 'Prospecting - New Customer',
        bidStrategy: 'lowest_cost',
        dailyBudget: '₺800',
        spend: '₺32,150',
        roas: '2.15',
        conversions: 67,
        children: [
          {
            id: 'ad_4',
            type: 'ad',
            name: 'Video_Intro_Brand',
            status: 'active',
            adSetId: 'as_3',
            adSetName: 'Broad Audience - Lookalike 1%',
            previewUrl: '/creatives/intro1.jpg',
            ctr: '%1.6',
            spend: '₺15,080',
            roas: '2.30',
            conversions: 35,
          },
          {
            id: 'ad_5',
            type: 'ad',
            name: 'Image_Testimonial_1',
            status: 'active',
            adSetId: 'as_3',
            adSetName: 'Broad Audience - Lookalike 1%',
            previewUrl: '/creatives/testimonial1.jpg',
            ctr: '%1.4',
            spend: '₺17,070',
            roas: '2.02',
            conversions: 32,
          },
        ],
      },
    ],
  },
  {
    id: 'camp_3',
    type: 'campaign',
    name: 'Catalog - Conversion Optimization',
    status: 'paused',
    spend: '₺12,450',
    roas: '1.85',
    conversions: 23,
    children: [
      {
        id: 'as_4',
        type: 'adset',
        name: 'Catalog - Dynamic Ads',
        status: 'paused',
        campaignId: 'camp_3',
        campaignName: 'Catalog - Conversion Optimization',
        bidStrategy: 'lowest_cost',
        dailyBudget: '₺300',
        spend: '₺12,450',
        roas: '1.85',
        conversions: 23,
      },
    ],
  },
];

const levelIcons = {
  0: <Layers className="w-4 h-4" />,
  1: <Target className="w-4 h-4" />,
  2: <ImageIcon className="w-4 h-4" />,
};

export default function CampaignsPage() {
  const t = useTranslations('campaigns');
  const { platform } = usePlatform();
  const toast = useToast();
  const searchParams = useSearchParams();
  
  const [isLoading, setIsLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<CampaignNode[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedEntity, setSelectedEntity] = useState<TreeNode | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused'>('all');

  // Fetch campaigns from API (or fall back to mock data)
  useEffect(() => {
    const fetchTree = async () => {
      setIsLoading(true);
      const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' || !process.env.NEXT_PUBLIC_API_URL;

      if (useMockData) {
        setCampaigns(mockCampaigns);
        setIsLoading(false);
        return;
      }

      try {
        const accountId = searchParams.get('account');
        const accountParam = accountId ? `&accountId=${encodeURIComponent(accountId)}` : '';
        const data = await api<{ data: any[]; cursor: string | null; hasMore: boolean }>(`/campaigns?limit=100${accountParam}`);
        const mapped: CampaignNode[] = (data.data || []).map((c: any) => ({
          id: c.id,
          type: 'campaign' as const,
          name: c.name,
          status: c.status?.toLowerCase() || 'paused',
          spend: c.dailyBudget ? `₺${Number(c.dailyBudget).toLocaleString('tr-TR')}` : '₺0',
          roas: '—',
          conversions: 0,
          children: [], // AdSets loaded on expand
        }));
        setCampaigns(mapped);
      } catch (error) {
        console.error('Failed to fetch campaigns', error);
        setCampaigns(mockCampaigns);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTree();
  }, []);

  // Handle focusLevel/focusId from smart suggestions navigation
  useEffect(() => {
    const focusLevel = searchParams.get('focusLevel');
    const focusId = searchParams.get('focusId');
    if (!focusLevel || !focusId) return;

    // Find the entity and its parent chain to expand
    const idsToExpand = new Set<string>();
    let foundNode: TreeNode | null = null;

    for (const campaign of campaigns) {
      if (focusLevel === 'campaign' && campaign.id === focusId) {
        foundNode = campaign;
        break;
      }
      if (campaign.children) {
        for (const adSet of campaign.children) {
          if (focusLevel === 'adset' && adSet.id === focusId) {
            idsToExpand.add(campaign.id);
            foundNode = adSet;
            break;
          }
          if (adSet.children) {
            for (const ad of adSet.children) {
              if (focusLevel === 'ad' && ad.id === focusId) {
                idsToExpand.add(campaign.id);
                idsToExpand.add(adSet.id);
                foundNode = ad;
                break;
              }
            }
          }
          if (foundNode) break;
        }
      }
      if (foundNode) break;
    }

    if (foundNode) {
      setExpandedIds(idsToExpand);
      setSelectedIds(new Set([focusId]));
      setSelectedEntity(foundNode);
    }
  }, [searchParams, campaigns]);

  const filteredData = useMemo(() => {
    if (!searchQuery && statusFilter === 'all') return campaigns;
    const query = searchQuery.toLowerCase();
    
    const filterNode = (node: CampaignNode): CampaignNode | null => {
      const matchesSearch = node.name.toLowerCase().includes(query);
      const matchesStatus = statusFilter === 'all' || node.status === statusFilter;
      
      let filteredChildren: AdSetNode[] | undefined;
      
      if (node.children) {
        filteredChildren = node.children
          .map((adSet) => {
            const adSetMatches = adSet.name.toLowerCase().includes(query);
            const adSetStatusMatches = statusFilter === 'all' || adSet.status === statusFilter;
            
            let filteredAds: AdNode[] | undefined;
            
            if (adSet.children) {
              filteredAds = adSet.children.filter(
                (ad) =>
                  ad.name.toLowerCase().includes(query) &&
                  (statusFilter === 'all' || ad.status === statusFilter)
              );
            }
            
            if (adSetMatches && adSetStatusMatches) {
              return { ...adSet, children: filteredAds?.length ? filteredAds : adSet.children };
            } else if (filteredAds?.length) {
              return { ...adSet, children: filteredAds };
            }
            return null;
          })
          .filter(Boolean) as AdSetNode[];
      }
      
      if (matchesSearch && matchesStatus) {
        return { ...node, children: filteredChildren?.length ? filteredChildren : node.children };
      } else if (filteredChildren?.length) {
        return { ...node, children: filteredChildren };
      }
      return null;
    };
    
    return campaigns.map(filterNode).filter(Boolean) as CampaignNode[];
  }, [campaigns, searchQuery, statusFilter]);

  const getAllIds = useCallback((nodes: TreeNode[]): string[] => {
    const ids: string[] = [];
    const collect = (node: TreeNode) => {
      ids.push(node.id);
      if ('children' in node && node.children) {
        node.children.forEach(collect);
      }
    };
    nodes.forEach(collect);
    return ids;
  }, []);

  const allIds = useMemo(() => getAllIds(filteredData), [filteredData, getAllIds]);

  const columns = useMemo(
    () => [
      {
        key: 'name',
        header: t('name'),
        width: '40%',
        render: (row: TreeNode, level: number) => {
          const isCampaign = row.type === 'campaign';
          return (
            <div className="flex flex-col">
              <span className={cn(
                'font-medium',
                isCampaign ? 'text-gray-900' : 'text-gray-700'
              )}>
                {row.name}
              </span>
              {isCampaign && (
                <span className="text-xs text-gray-500 mt-0.5">
                  {row.children?.length || 0} {t('adset_count')}
                </span>
              )}
            </div>
          );
        },
      },
      {
        key: 'status',
        header: t('status'),
        width: '15%',
        align: 'left' as const,
        render: (row: TreeNode) => (
          <StatusBadge 
            status={row.status as any} 
            size="sm" 
            pulse={row.status === 'active'}
          />
        ),
      },
      {
        key: 'spend',
        header: t('spend'),
        width: '15%',
        align: 'right' as const,
        render: (row: TreeNode) => {
          const value = parseCurrency(row.spend || '0');
          return <MetricValue value={value} format="currency" trend={5.2} />;
        },
      },
      {
        key: 'roas',
        header: t('roas'),
        width: '10%',
        align: 'right' as const,
        render: (row: TreeNode) => {
          const value = parsePercentage(row.roas || '0');
          return (
            <div className="flex items-center justify-end gap-1">
              <span className={cn(
                'font-medium',
                value >= 3 ? 'text-emerald-600' : value >= 2 ? 'text-amber-600' : 'text-red-600'
              )}>
                {row.roas}
              </span>
            </div>
          );
        },
      },
      {
        key: 'conversions',
        header: t('conversions'),
        width: '10%',
        align: 'right' as const,
        render: (row: TreeNode) => (
          <span className="text-gray-900 font-medium tabular-nums">
            {row.conversions || 0}
          </span>
        ),
      },
      {
        key: 'trend',
        header: t('trend'),
        width: '10%',
        align: 'center' as const,
        render: () => (
          <Sparkline 
            data={generateMockSparkline()} 
            width={60} 
            height={20} 
            color="#4F46E5"
          />
        ),
      },
    ],
    [t]
  );

  const bulkActions = useMemo(
    () => [
      {
        label: t('bulk_activate'),
        icon: <Play className="w-4 h-4" />,
        variant: 'primary' as const,
        onClick: () => {
          toast.success(`${selectedIds.size} ${t('items_activated')}`);
        },
      },
      {
        label: t('bulk_pause'),
        icon: <Pause className="w-4 h-4" />,
        variant: 'secondary' as const,
        onClick: () => {
          toast.success(`${selectedIds.size} ${t('items_paused')}`);
        },
      },
      {
        label: t('bulk_copy'),
        icon: <Copy className="w-4 h-4" />,
        variant: 'secondary' as const,
        onClick: () => {
          toast.info(t('copy_feature_coming'));
        },
      },
    ],
    [selectedIds.size, toast, t]
  );

  const handleRowClick = useCallback((row: TreeNode) => {
    setSelectedEntity(row);
  }, []);

  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleEdit = useCallback(() => {
    if (!selectedEntity) return;
    setIsEditModalOpen(true);
    setIsMoreMenuOpen(false);
  }, [selectedEntity]);

  const handleDuplicate = useCallback(() => {
    if (!selectedEntity) return;
    toast.success(`${selectedEntity.name} ${t('duplicate')}`);
    setIsMoreMenuOpen(false);
  }, [selectedEntity, toast, t]);

  const handleDelete = useCallback(() => {
    if (!selectedEntity) return;
    toast.info(t('delete_confirmation'));
    setIsMoreMenuOpen(false);
  }, [selectedEntity, toast, t]);

  const handleSaveEdit = useCallback(() => {
    toast.success(t('changes_saved'));
    setIsEditModalOpen(false);
  }, [toast, t]);

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title={t('title')}
        description={`${campaigns.length} ${t('description')} ${campaigns.reduce((acc, c) => acc + (c.children?.length || 0), 0)}`}
        actions={
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            {t('new_campaign')}
          </button>
        }
      />

      <div className="flex items-center gap-3 mb-4 px-1">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={t('search_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">{t('all_statuses')}</option>
          <option value="active">{t('active')}</option>
          <option value="paused">{t('paused')}</option>
        </select>

        <button className="inline-flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
          <Filter className="w-4 h-4" />
          {t('filters')}
        </button>
      </div>

      <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        )}
        <TreeTable
          data={filteredData as any}
          columns={columns as any}
          getChildren={(row: any) => row.children}
          getRowId={(row: any) => row.id}
          expandedRowIds={expandedIds}
          onExpandedChange={setExpandedIds}
          selectedRowIds={selectedIds}
          onSelectionChange={setSelectedIds}
          onRowClick={handleRowClick as any}
          levelIcons={levelIcons}
          maxLevel={2}
        />
      </div>

      <BulkActionBar
        selectedCount={selectedIds.size}
        totalCount={allIds.length}
        actions={bulkActions}
        onClear={() => setSelectedIds(new Set())}
      />

      <SlideOver
        isOpen={!!selectedEntity}
        onClose={() => setSelectedEntity(null)}
        title={selectedEntity?.name}
        size="lg"
      >
        {selectedEntity && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">{t('spend')}</p>
                <p className="text-lg font-semibold text-gray-900">{selectedEntity.spend || '₺0'}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">{t('roas')}</p>
                <p className="text-lg font-semibold text-gray-900">{selectedEntity.roas || '0'}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">{t('conversions')}</p>
                <p className="text-lg font-semibold text-gray-900">{selectedEntity.conversions || 0}</p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">{t('performance_trend')}</h4>
              <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
                <Sparkline 
                  data={generateMockSparkline()} 
                  width={400} 
                  height={150} 
                  color="#4F46E5"
                  showArea
                />
              </div>
            </div>

            <div className="flex gap-3 relative">
              <button 
                onClick={handleEdit}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                {t('edit')}
              </button>
              <div className="relative">
                <button 
                  onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                  className="px-4 py-2 border border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>
                {isMoreMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setIsMoreMenuOpen(false)}
                    />
                    <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-20 py-1">
                      <button
                        onClick={handleDuplicate}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Copy className="w-4 h-4" />
                        {t('duplicate')}
                      </button>
                      <button
                        onClick={() => {
                          const newStatus = selectedEntity?.status === 'active' ? 'paused' : 'active';
                          toast.success(`${selectedEntity?.name} ${newStatus === 'active' ? t('active_status') : t('paused_status')}`);
                          setIsMoreMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        {selectedEntity?.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        {selectedEntity?.status === 'active' ? t('bulk_pause') : t('bulk_activate')}
                      </button>
                      <div className="border-t border-gray-100 my-1" />
                      <button
                        onClick={handleDelete}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        {t('delete')}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </SlideOver>

      {/* Edit Modal */}
      {isEditModalOpen && selectedEntity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedEntity.type === 'campaign' ? t('campaign') : selectedEntity.type === 'adset' ? t('adset') : t('ad')} {t('edit')}
              </h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('name')}</label>
                <input
                  type="text"
                  defaultValue={selectedEntity.name}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('status')}</label>
                <select 
                  defaultValue={selectedEntity.status}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">{t('active')}</option>
                  <option value="paused">{t('paused')}</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {t('cancel')}
              </button>
              <button 
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t('save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
