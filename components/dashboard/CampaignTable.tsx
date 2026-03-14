'use client';

import { useEffect, useMemo, useRef, type ChangeEvent } from 'react';
import { Campaign } from '@/types/dashboard';
import { MoreHorizontal, Pause, Play, Edit2 } from 'lucide-react';
import { Card } from '@/components/ui';
import { useTranslations } from '@/lib/i18n';

interface CampaignTableProps {
  campaigns: Campaign[];
  onEdit?: (campaign: Campaign) => void;
  onToggleStatus?: (campaign: Campaign) => void;
  selectedIds?: string[];
  onToggleSelect?: (id: string, selected: boolean) => void;
  onToggleSelectAll?: (selected: boolean, ids: string[]) => void;
}

export function CampaignTable({
  campaigns,
  onEdit,
  onToggleStatus,
  selectedIds = [],
  onToggleSelect,
  onToggleSelectAll,
}: CampaignTableProps) {
  const t = useTranslations('campaigns');
  const tc = useTranslations('common');
  const hasSelection = Boolean(onToggleSelect && onToggleSelectAll);
  const hasActions = Boolean(onEdit || onToggleStatus);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const allIds = useMemo(() => campaigns.map((c) => c.id), [campaigns]);
  const selectedCount = selectedIds.length;
  const isAllSelected = campaigns.length > 0 && selectedCount === campaigns.length;
  const isIndeterminate = selectedCount > 0 && selectedCount < campaigns.length;
  const selectAllRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!hasSelection) return;
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = isIndeterminate;
    }
  }, [hasSelection, isIndeterminate]);

  return (
    <Card padding="none" className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {hasSelection && (
                <th className="p-4 font-medium text-xs uppercase tracking-wider w-12">
                  <input
                    ref={selectAllRef}
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => onToggleSelectAll?.(e.target.checked, allIds)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    aria-label={tc('select_all')}
                  />
                </th>
              )}
              <th className="p-4 font-medium text-xs uppercase tracking-wider text-gray-600">{t('campaign')}</th>
              <th className="p-4 font-medium text-xs uppercase tracking-wider text-gray-600">{t('status')}</th>
              <th className="p-4 font-medium text-xs uppercase tracking-wider text-gray-600 text-right">{t('spend')}</th>
              <th className="p-4 font-medium text-xs uppercase tracking-wider text-gray-600 text-right">{t('roas')}</th>
              <th className="p-4 font-medium text-xs uppercase tracking-wider text-gray-600 text-right">{t('conversions')}</th>
              {hasActions && <th className="p-4 font-medium text-xs uppercase tracking-wider text-gray-600 text-center">{tc('actions')}</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {campaigns.map((campaign) => (
              <tr key={campaign.id} className="hover:bg-gray-50 transition-colors group">
                {hasSelection && (
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedSet.has(campaign.id)}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => onToggleSelect?.(campaign.id, e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      aria-label={`Select ${campaign.name}`}
                    />
                  </td>
                )}
                <td className="p-4 truncate max-w-[200px] font-medium text-gray-900">
                  {campaign.name}
                </td>
                <td className="p-4">
                  <span
                    className={`
                    inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${campaign.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : campaign.status === 'paused'
                          ? 'bg-gray-100 text-gray-700'
                          : 'bg-red-100 text-red-700'}
                  `}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${campaign.status === 'active' ? 'bg-green-500' : campaign.status === 'paused' ? 'bg-gray-500' : 'bg-red-500'}`}
                    ></span>
                    {campaign.status === 'active' ? tc('active') : campaign.status === 'paused' ? tc('paused') : t('archived') || 'Archived'}
                  </span>
                </td>
                <td className="p-4 text-right font-mono text-sm text-gray-600">{campaign.spend}</td>
                <td className="p-4 text-right font-mono text-sm font-semibold text-blue-600">
                  {campaign.roas}
                </td>
                <td className="p-4 text-right font-mono text-sm text-gray-600">{campaign.conversions}</td>
                {hasActions && (
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {onEdit && (
                        <button
                          onClick={() => onEdit?.(campaign)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-all"
                          aria-label={`${tc('edit')} ${campaign.name}`}
                          title={tc('edit')}
                        >
                          <Edit2 size={16} aria-hidden="true" />
                        </button>
                      )}
                      {onToggleStatus && (
                        <button
                          onClick={() => onToggleStatus?.(campaign)}
                          className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-all"
                          aria-label={campaign.status === 'active' ? `${t('bulk_pause')} ${campaign.name}` : `${t('bulk_activate')} ${campaign.name}`}
                          title={campaign.status === 'active' ? t('bulk_pause') : t('bulk_activate')}
                        >
                          {campaign.status === 'active' ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
                        </button>
                      )}
                      <button 
                        className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-all"
                        aria-label={`${tc('more_actions')} ${campaign.name}`}
                      >
                        <MoreHorizontal size={16} aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
