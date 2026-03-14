'use client';

import { Badge, Card } from '@/components/ui';
import { TrendingUp, TrendingDown } from 'lucide-react';

export interface Campaign {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'archived';
  spend: number;
  roas: number;
  conversions: number;
  ctr: number;
  impressions: number;
}

interface CampaignSnapshotTableProps {
  campaigns: Campaign[];
  onCampaignClick?: (campaign: Campaign) => void;
  loading?: boolean;
}

export function CampaignSnapshotTable({
  campaigns,
  onCampaignClick,
  loading = false,
}: CampaignSnapshotTableProps) {
  if (loading) {
    return (
      <Card padding="none">
        <div className="divide-y divide-gray-200">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="p-4 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-4 bg-gray-200 rounded w-20" />
                <div className="ml-auto h-4 bg-gray-200 rounded w-24" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (campaigns.length === 0) {
    return (
      <Card padding="lg">
        <div className="text-center py-8">
          <p className="text-gray-500">No campaigns found yet</p>
        </div>
      </Card>
    );
  }

  const getStatusVariant = (status: Campaign['status']) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'paused':
        return 'warning';
      case 'archived':
        return 'neutral';
    }
  };

  const getStatusLabel = (status: Campaign['status']) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'paused':
        return 'Paused';
      case 'archived':
        return 'Archived';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('tr-TR').format(value);
  };

  return (
    <Card padding="none" className="overflow-hidden">
      {/* Table Header - Hidden on mobile */}
      <div className="hidden md:grid md:grid-cols-6 gap-4 p-4 bg-gray-50 border-b border-gray-200">
        <div className="col-span-2">
          <span className="text-xs font-semibold text-gray-600 uppercase">
            Campaign
          </span>
        </div>
        <div>
          <span className="text-xs font-semibold text-gray-600 uppercase">
            Spend
          </span>
        </div>
        <div>
          <span className="text-xs font-semibold text-gray-600 uppercase">
            ROAS
          </span>
        </div>
        <div>
          <span className="text-xs font-semibold text-gray-600 uppercase">
            Conversions
          </span>
        </div>
        <div>
          <span className="text-xs font-semibold text-gray-600 uppercase">
            CTR
          </span>
        </div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-gray-200">
        {campaigns.map((campaign) => (
          <div
            key={campaign.id}
            className={`
              p-4 transition-colors duration-150
              ${onCampaignClick ? 'cursor-pointer hover:bg-gray-50' : ''}
            `}
            onClick={() => onCampaignClick?.(campaign)}
          >
            {/* Desktop Layout */}
            <div className="hidden md:grid md:grid-cols-6 gap-4 items-center">
              <div className="col-span-2">
                <div className="flex items-center gap-3">
                  <Badge variant={getStatusVariant(campaign.status)} size="sm" dot>
                    {getStatusLabel(campaign.status)}
                  </Badge>
                  <span className="font-medium text-gray-900 truncate">
                    {campaign.name}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(campaign.spend)}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {campaign.roas >= 3 ? (
                    <TrendingUp className="w-4 h-4 text-accent-success" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-accent-danger" />
                  )}
                  <span className="text-sm font-medium text-gray-900">
                    {campaign.roas.toFixed(1)}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-900">
                  {formatNumber(campaign.conversions)}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-900">
                  {campaign.ctr.toFixed(2)}%
                </span>
              </div>
            </div>

            {/* Mobile Layout */}
            <div className="md:hidden space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate mb-1">
                    {campaign.name}
                  </p>
                  <Badge variant={getStatusVariant(campaign.status)} size="sm" dot>
                    {getStatusLabel(campaign.status)}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-600 text-xs">Spend</p>
                  <p className="font-medium text-gray-900">
                    {formatCurrency(campaign.spend)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-xs">ROAS</p>
                  <p className="font-medium text-gray-900">{campaign.roas.toFixed(1)}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-xs">Conversions</p>
                  <p className="font-medium text-gray-900">
                    {formatNumber(campaign.conversions)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-xs">CTR</p>
                  <p className="font-medium text-gray-900">{campaign.ctr.toFixed(2)}%</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
