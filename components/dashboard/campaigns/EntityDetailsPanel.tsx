'use client';

import { useMemo, useState } from 'react';
import { ChevronRight, Copy, ExternalLink, Pencil, Pause, Play, Plus, X } from 'lucide-react';

import type { Ad, AdSet, Campaign } from '@/types/dashboard';
import { InsightsView } from '@/components/dashboard/insights/InsightsView';
import { createMockInsightsSingle } from '@/components/dashboard/insights/mock';

export type CampaignEntityLevel = 'campaign' | 'adset' | 'ad';

export type CampaignEntitySelection = { level: CampaignEntityLevel; id: string } | null;

export interface EntityDetailsPanelProps {
  selection: CampaignEntitySelection;
  campaigns: Campaign[];
  adSets: AdSet[];
  ads: Ad[];
  onClose: () => void;
  onSelect: (next: CampaignEntitySelection) => void;
  onRename: (entity: CampaignEntityLevel, id: string, name: string) => void;
  onDuplicate: (entity: CampaignEntityLevel, id: string, name: string) => void;
  onToggleStatus: (entity: CampaignEntityLevel, id: string) => void;
  onOpenCreativeSwap: (adId: string, adName: string, previewUrl: string) => void;
  onCreateAdSet: (campaignId: string) => void;
  onCreateAd: (adSetId: string) => void;
}

function statusLabel(status: string) {
  if (status === 'active') return 'Active';
  if (status === 'paused') return 'Paused';
  return 'Archived';
}

export function EntityDetailsPanel({
  selection,
  campaigns,
  adSets,
  ads,
  onClose,
  onSelect,
  onRename,
  onDuplicate,
  onToggleStatus,
  onOpenCreativeSwap,
  onCreateAdSet,
  onCreateAd,
}: EntityDetailsPanelProps) {
  const [tab, setTab] = useState<'overview' | 'settings' | 'review'>('overview');

  const campaignById = useMemo(() => new Map(campaigns.map((c) => [c.id, c] as const)), [campaigns]);
  const adSetById = useMemo(() => new Map(adSets.map((a) => [a.id, a] as const)), [adSets]);

  const selectedCampaignId = useMemo(() => {
    if (!selection) return undefined;
    if (selection.level === 'campaign') return selection.id;

    if (selection.level === 'adset') {
      const adSet = adSetById.get(selection.id);
      return adSet?.campaignId;
    }

    const ad = ads.find((a) => a.id === selection.id);
    if (!ad) return undefined;
    const adSet = adSetById.get(ad.adSetId);
    return adSet?.campaignId;
  }, [adSetById, ads, selection]);

  const selectedAdSetId = useMemo(() => {
    if (!selection) return undefined;
    if (selection.level === 'adset') return selection.id;
    if (selection.level === 'ad') {
      const ad = ads.find((a) => a.id === selection.id);
      return ad?.adSetId;
    }
    return undefined;
  }, [ads, selection]);

  const selectedCampaign = useMemo(() => {
    if (!selectedCampaignId) return undefined;
    return campaignById.get(selectedCampaignId);
  }, [campaignById, selectedCampaignId]);

  const selectedAdSet = useMemo(() => {
    if (!selectedAdSetId) return undefined;
    return adSetById.get(selectedAdSetId);
  }, [adSetById, selectedAdSetId]);

  const selectedAd = useMemo(() => {
    if (!selection || selection.level !== 'ad') return undefined;
    return ads.find((a) => a.id === selection.id);
  }, [ads, selection]);

  const campaignOptions = useMemo(() => campaigns.slice().sort((a, b) => a.name.localeCompare(b.name)), [campaigns]);

  const adSetOptions = useMemo(() => {
    const filtered = selectedCampaignId ? adSets.filter((a) => a.campaignId === selectedCampaignId) : adSets;
    return filtered.slice().sort((a, b) => a.name.localeCompare(b.name));
  }, [adSets, selectedCampaignId]);

  const adOptions = useMemo(() => {
    let filtered = ads;
    if (selectedAdSetId) {
      filtered = ads.filter((a) => a.adSetId === selectedAdSetId);
    } else if (selectedCampaignId) {
      const adSetIds = new Set(adSets.filter((a) => a.campaignId === selectedCampaignId).map((a) => a.id));
      filtered = ads.filter((a) => adSetIds.has(a.adSetId));
    }
    return filtered.slice().sort((a, b) => a.name.localeCompare(b.name));
  }, [adSets, ads, selectedAdSetId, selectedCampaignId]);

  const selectedEntity = useMemo(() => {
    if (!selection) return null;
    if (selection.level === 'campaign') return campaignById.get(selection.id) ?? null;
    if (selection.level === 'adset') return adSetById.get(selection.id) ?? null;
    return ads.find((a) => a.id === selection.id) ?? null;
  }, [adSetById, ads, campaignById, selection]);

  const selectedName = useMemo(() => {
    if (!selection) return '';
    if (selection.level === 'campaign') return campaignById.get(selection.id)?.name ?? '';
    if (selection.level === 'adset') return adSetById.get(selection.id)?.name ?? '';
    return ads.find((a) => a.id === selection.id)?.name ?? '';
  }, [adSetById, ads, campaignById, selection]);

  const selectedStatus = useMemo(() => {
    if (!selection) return '';
    if (selection.level === 'campaign') return campaignById.get(selection.id)?.status ?? '';
    if (selection.level === 'adset') return adSetById.get(selection.id)?.status ?? '';
    return ads.find((a) => a.id === selection.id)?.status ?? '';
  }, [adSetById, ads, campaignById, selection]);

  const insights = useMemo(() => {
    if (!selection) return null;
    return createMockInsightsSingle(selection.level, selection.id);
  }, [selection]);

  return (
    <div className="bg-brand-white border-2 border-brand-black rounded-[2px] overflow-hidden lg:sticky lg:top-6">
      <div className="px-4 py-4 bg-paper-white border-b-2 border-brand-black flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold text-brand-black/70 uppercase">Details Panel</p>
          <p className="text-sm font-bold text-brand-black truncate mt-1">{selection ? selectedName : 'Make a selection'}</p>
        </div>
        <button type="button" className="p-2 border-2 border-brand-black rounded-[2px] text-brand-black hover:bg-brand-white" onClick={onClose} aria-label="Close">
          <X size={16} />
        </button>
      </div>

      <div className="p-4 border-b-2 border-brand-black bg-brand-white space-y-3">
        <div className="grid grid-cols-1 gap-2">
          <div>
            <label className="form-label">Campaign</label>
            <select
              className="form-select"
              value={selectedCampaignId ?? ''}
              onChange={(e) => {
                const id = e.target.value;
                if (!id) return;
                onSelect({ level: 'campaign', id });
                setTab('overview');
              }}
            >
              <option value="">Select…</option>
              {campaignOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">Ad Set</label>
            <select
              className="form-select"
              value={selectedAdSetId ?? ''}
              onChange={(e) => {
                const id = e.target.value;
                if (!id) return;
                onSelect({ level: 'adset', id });
                setTab('overview');
              }}
              disabled={adSetOptions.length === 0}
            >
              <option value="">Select…</option>
              {adSetOptions.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">Ad</label>
            <select
              className="form-select"
              value={selection?.level === 'ad' ? selection.id : ''}
              onChange={(e) => {
                const id = e.target.value;
                if (!id) return;
                onSelect({ level: 'ad', id });
                setTab('overview');
              }}
              disabled={adOptions.length === 0}
            >
              <option value="">Select…</option>
              {adOptions.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {!selection || !selectedEntity ? (
        <div className="p-6">
          <p className="text-sm font-bold text-brand-black">Select an entity</p>
          <p className="text-sm text-brand-black/70 mt-2">Choose from the left or use the dropdowns above.</p>
        </div>
      ) : (
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-brand-black/70 uppercase">{selection.level}</span>
            <ChevronRight size={14} className="text-brand-black/60" />
            <span className="text-xs font-mono text-brand-black/70 truncate">{selection.id}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button type="button" className="minimal-button secondary" onClick={() => onToggleStatus(selection.level, selection.id)}>
              {selectedStatus === 'active' ? <Pause size={16} /> : <Play size={16} />}
              {selectedStatus === 'active' ? 'Pause' : 'Activate'}
            </button>
            <button type="button" className="minimal-button secondary" onClick={() => onRename(selection.level, selection.id, selectedName)}>
              <Pencil size={16} />
              Rename
            </button>
            <button type="button" className="minimal-button secondary" onClick={() => onDuplicate(selection.level, selection.id, selectedName)}>
              <Copy size={16} />
              Duplicate
            </button>
            {selection.level === 'campaign' && (
              <button type="button" className="minimal-button secondary" onClick={() => onCreateAdSet(selection.id)}>
                <Plus size={16} />
                New Ad Set
              </button>
            )}
            {selection.level === 'adset' && (
              <button type="button" className="minimal-button secondary" onClick={() => onCreateAd(selection.id)}>
                <Plus size={16} />
                New Ad
              </button>
            )}
            {selection.level === 'ad' && selectedAd?.previewUrl && (
              <a href={selectedAd.previewUrl} target="_blank" rel="noreferrer" className="minimal-button secondary">
                <ExternalLink size={16} />
                Preview
              </a>
            )}
            {selection.level === 'ad' && selectedAd && (
              <button
                type="button"
                className="minimal-button secondary"
                onClick={() => onOpenCreativeSwap(selectedAd.id, selectedAd.name, selectedAd.previewUrl)}
              >
                <Copy size={16} />
                Creative
              </button>
            )}
          </div>

          <div className="flex p-1 bg-paper-white border-2 border-brand-black rounded-[2px]">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setTab('overview');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-[2px] transition-colors ${tab === 'overview' ? 'bg-brand-black text-brand-white' : 'text-brand-black/70 hover:text-brand-black'}`}
            >
              Overview
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setTab('settings');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-[2px] transition-colors ${tab === 'settings' ? 'bg-brand-black text-brand-white' : 'text-brand-black/70 hover:text-brand-black'}`}
            >
              Settings
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setTab('review');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-[2px] transition-colors ${tab === 'review' ? 'bg-brand-black text-brand-white' : 'text-brand-black/70 hover:text-brand-black'}`}
            >
              Review
            </button>
          </div>

          {tab === 'overview' && (
            <div className="space-y-3">
              <div className="border-2 border-brand-black rounded-[2px] bg-paper-white p-4">
                <p className="text-xs font-bold text-brand-black/70 uppercase">Status</p>
                <p className="text-sm font-bold text-brand-black mt-1">{statusLabel(selectedStatus)}</p>
              </div>

              {selection.level === 'campaign' && selectedCampaign && (
                <div className="border-2 border-brand-black rounded-[2px] bg-brand-white p-4">
                  <p className="text-xs font-bold text-brand-black/70 uppercase">KPI</p>
                  <p className="text-sm text-brand-black/70 mt-1">
                    Spend: <span className="font-mono">{selectedCampaign.spend}</span>
                    <span className="mx-2">•</span>
                    ROAS: <span className="font-mono font-bold text-action-blue">{selectedCampaign.roas}</span>
                    <span className="mx-2">•</span>
                    Conversions: <span className="font-mono">{selectedCampaign.conversions}</span>
                  </p>
                </div>
              )}

              {selection.level === 'adset' && selectedAdSet && (
                <div className="border-2 border-brand-black rounded-[2px] bg-brand-white p-4">
                  <p className="text-xs font-bold text-brand-black/70 uppercase">KPI</p>
                  <p className="text-sm text-brand-black/70 mt-1">
                    Budget: <span className="font-mono">{selectedAdSet.dailyBudget}</span>
                    <span className="mx-2">•</span>
                    Spend: <span className="font-mono">{selectedAdSet.spend}</span>
                    <span className="mx-2">•</span>
                    ROAS: <span className="font-mono font-bold text-action-blue">{selectedAdSet.roas}</span>
                  </p>
                </div>
              )}

              {selection.level === 'ad' && selectedAd && (
                <div className="border-2 border-brand-black rounded-[2px] bg-brand-white p-4">
                  <p className="text-xs font-bold text-brand-black/70 uppercase">KPI</p>
                  <p className="text-sm text-brand-black/70 mt-1">
                    Spend: <span className="font-mono">{selectedAd.spend}</span>
                    <span className="mx-2">•</span>
                    ROAS: <span className="font-mono font-bold text-action-blue">{selectedAd.roas}</span>
                    <span className="mx-2">•</span>
                    CTR: <span className="font-mono">{selectedAd.ctr}</span>
                  </p>
                </div>
              )}
            </div>
          )}

          {tab === 'settings' && (
            <div className="space-y-3">
              <div className="border-2 border-brand-black rounded-[2px] bg-brand-white p-4">
                <p className="text-xs font-bold text-brand-black/70 uppercase">Note</p>
                <p className="text-sm text-brand-black/70 mt-1">
                  This panel shows minimal settings in v1. Meta Ads Manager-like fields will be detailed as the backend is integrated.
                </p>
              </div>

              {selection.level === 'campaign' && selectedCampaign && (
                <div className="border-2 border-brand-black rounded-[2px] bg-paper-white p-4">
                  <p className="text-xs font-bold text-brand-black/70 uppercase">Campaign</p>
                  <p className="text-sm text-brand-black/70 mt-1">Name: <span className="font-mono">{selectedCampaign.name}</span></p>
                  <p className="text-sm text-brand-black/70 mt-1">Status: <span className="font-mono">{statusLabel(selectedCampaign.status)}</span></p>
                </div>
              )}

              {selection.level === 'adset' && selectedAdSet && (
                <div className="border-2 border-brand-black rounded-[2px] bg-paper-white p-4">
                  <p className="text-xs font-bold text-brand-black/70 uppercase">Adset</p>
                  <p className="text-sm text-brand-black/70 mt-1">Name: <span className="font-mono">{selectedAdSet.name}</span></p>
                  <p className="text-sm text-brand-black/70 mt-1">Budget: <span className="font-mono">{selectedAdSet.dailyBudget}</span></p>
                  {selectedAdSet.bidStrategy && (
                    <p className="text-sm text-brand-black/70 mt-1">Bid: <span className="font-mono">{selectedAdSet.bidStrategy}</span></p>
                  )}
                </div>
              )}

              {selection.level === 'ad' && selectedAd && (
                <div className="border-2 border-brand-black rounded-[2px] bg-paper-white p-4">
                  <p className="text-xs font-bold text-brand-black/70 uppercase">Ad</p>
                  <p className="text-sm text-brand-black/70 mt-1">Name: <span className="font-mono">{selectedAd.name}</span></p>
                  <p className="text-sm text-brand-black/70 mt-1 break-all">Preview: <span className="font-mono">{selectedAd.previewUrl}</span></p>
                </div>
              )}
            </div>
          )}

          {tab === 'review' && (
            <div className="space-y-3">
              {insights ? <InsightsView insights={insights} /> : null}
            </div>
          )}
        </div>
      )}

      <div className="px-4 py-3 bg-paper-white border-t-2 border-brand-black text-xs text-brand-black/60">
        {selectedCampaign ? `Campaign: ${selectedCampaign.name}` : 'Campaign: -'}
        {selectedAdSet ? ` • Adset: ${selectedAdSet.name}` : ''}
      </div>
    </div>
  );
}
