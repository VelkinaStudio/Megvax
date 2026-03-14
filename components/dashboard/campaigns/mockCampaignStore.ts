'use client';

import { useSyncExternalStore } from 'react';

import type { Ad, AdSet, Campaign } from '@/types/dashboard';
import { mockMetaAdSets, mockMetaAds, mockMetaCampaigns } from '@/components/dashboard/mockData';

type MockCampaignState = {
  campaigns: Campaign[];
  adSets: AdSet[];
  ads: Ad[];
  initialized: boolean;
};

type Listener = () => void;

type DuplicateResult = {
  campaignId?: string;
  adSetId?: string;
  adId?: string;
  created: Array<{ entity: 'campaign' | 'adset' | 'ad'; id: string }>;
};

let state: MockCampaignState = {
  campaigns: [],
  adSets: [],
  ads: [],
  initialized: false,
};

const listeners = new Set<Listener>();

function emit() {
  for (const l of listeners) l();
}

function nextId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export function initMockCampaignStore(seed?: Partial<Pick<MockCampaignState, 'campaigns' | 'adSets' | 'ads'>>) {
  if (state.initialized) return;
  state = {
    campaigns: seed?.campaigns ?? mockMetaCampaigns.slice(),
    adSets: seed?.adSets ?? mockMetaAdSets.slice(),
    ads: seed?.ads ?? mockMetaAds.slice(),
    initialized: true,
  };
  emit();
}

export function subscribeMockCampaignStore(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getMockCampaignSnapshot() {
  return state;
}

export function useMockCampaignStore() {
  return useSyncExternalStore(subscribeMockCampaignStore, getMockCampaignSnapshot, getMockCampaignSnapshot);
}

export function renameMockEntity(params: { entity: 'campaign' | 'adset' | 'ad'; id: string; name: string }) {
  const name = params.name.trim();
  if (!name) return;

  if (params.entity === 'campaign') {
    state = {
      ...state,
      campaigns: state.campaigns.map((c) => (c.id === params.id ? { ...c, name } : c)),
    };
    emit();
    return;
  }

  if (params.entity === 'adset') {
    state = {
      ...state,
      adSets: state.adSets.map((a) => (a.id === params.id ? { ...a, name } : a)),
      ads: state.ads.map((ad) => (ad.adSetId === params.id ? { ...ad, adSetName: name } : ad)),
    };
    emit();
    return;
  }

  state = {
    ...state,
    ads: state.ads.map((a) => (a.id === params.id ? { ...a, name } : a)),
  };
  emit();
}

export function patchMockStatus(params: { entity: 'campaign' | 'adset' | 'ad'; id: string; status: 'active' | 'paused' | 'archived' }) {
  if (params.entity === 'campaign') {
    state = {
      ...state,
      campaigns: state.campaigns.map((c) => (c.id === params.id ? { ...c, status: params.status } : c)),
    };
    emit();
    return;
  }

  if (params.entity === 'adset') {
    state = {
      ...state,
      adSets: state.adSets.map((a) => (a.id === params.id ? { ...a, status: params.status } : a)),
    };
    emit();
    return;
  }

  state = {
    ...state,
    ads: state.ads.map((a) => (a.id === params.id ? { ...a, status: params.status } : a)),
  };
  emit();
}

export function updateMockAdCreative(params: { adId: string; previewUrl: string }) {
  const url = params.previewUrl.trim();
  if (!url) return;

  state = {
    ...state,
    ads: state.ads.map((a) => (a.id === params.adId ? { ...a, previewUrl: url } : a)),
  };
  emit();
}

export function removeMockEntities(items: Array<{ entity: 'campaign' | 'adset' | 'ad'; id: string }>) {
  const campaignIds = new Set(items.filter((x) => x.entity === 'campaign').map((x) => x.id));
  const adSetIds = new Set(items.filter((x) => x.entity === 'adset').map((x) => x.id));
  const adIds = new Set(items.filter((x) => x.entity === 'ad').map((x) => x.id));

  const derivedAdSetIds = new Set<string>();
  const derivedAdIds = new Set<string>();

  for (const a of state.adSets) {
    if (campaignIds.has(a.campaignId)) derivedAdSetIds.add(a.id);
  }

  for (const ad of state.ads) {
    if (adSetIds.has(ad.adSetId) || derivedAdSetIds.has(ad.adSetId)) derivedAdIds.add(ad.id);
  }

  state = {
    ...state,
    campaigns: state.campaigns.filter((c) => !campaignIds.has(c.id)),
    adSets: state.adSets.filter((a) => !adSetIds.has(a.id) && !derivedAdSetIds.has(a.id)),
    ads: state.ads.filter((a) => !adIds.has(a.id) && !derivedAdIds.has(a.id)),
  };
  emit();
}

export function duplicateMockCampaign(campaignId: string): DuplicateResult {
  const source = state.campaigns.find((c) => c.id === campaignId);
  if (!source) return { created: [] };

  const newCampaignId = nextId('mc');
  const newCampaign: Campaign = {
    ...source,
    id: newCampaignId,
    name: `${source.name} (Kopya)`,
    status: 'paused',
  };

  const sourceAdSets = state.adSets.filter((a) => a.campaignId === campaignId);
  const adSetIdMap = new Map<string, string>();

  const newAdSets: AdSet[] = sourceAdSets.map((a) => {
    const newId = nextId('mas');
    adSetIdMap.set(a.id, newId);
    return {
      ...a,
      id: newId,
      campaignId: newCampaignId,
      campaignName: newCampaign.name,
      name: `${a.name} (Kopya)`,
      status: 'paused',
    };
  });

  const sourceAds = state.ads.filter((ad) => adSetIdMap.has(ad.adSetId));
  const newAds: Ad[] = sourceAds.map((ad) => {
    const newId = nextId('ma');
    const mappedAdSetId = adSetIdMap.get(ad.adSetId) ?? ad.adSetId;
    const mappedAdSetName = newAdSets.find((a) => a.id === mappedAdSetId)?.name ?? ad.adSetName;
    return {
      ...ad,
      id: newId,
      adSetId: mappedAdSetId,
      adSetName: mappedAdSetName,
      name: `${ad.name} (Kopya)`,
      status: 'paused',
    };
  });

  const created: DuplicateResult['created'] = [{ entity: 'campaign', id: newCampaignId }];
  for (const a of newAdSets) created.push({ entity: 'adset', id: a.id });
  for (const a of newAds) created.push({ entity: 'ad', id: a.id });

  state = {
    ...state,
    campaigns: [newCampaign, ...state.campaigns],
    adSets: [...newAdSets, ...state.adSets],
    ads: [...newAds, ...state.ads],
  };
  emit();

  return { campaignId: newCampaignId, created };
}

export function duplicateMockAdSet(adSetId: string): DuplicateResult {
  const source = state.adSets.find((a) => a.id === adSetId);
  if (!source) return { created: [] };

  const newAdSetId = nextId('mas');
  const newAdSet: AdSet = {
    ...source,
    id: newAdSetId,
    name: `${source.name} (Kopya)`,
    status: 'paused',
  };

  const sourceAds = state.ads.filter((ad) => ad.adSetId === adSetId);
  const newAds: Ad[] = sourceAds.map((ad) => ({
    ...ad,
    id: nextId('ma'),
    adSetId: newAdSetId,
    adSetName: newAdSet.name,
    name: `${ad.name} (Kopya)`,
    status: 'paused',
  }));

  const created: DuplicateResult['created'] = [{ entity: 'adset', id: newAdSetId }];
  for (const a of newAds) created.push({ entity: 'ad', id: a.id });

  state = {
    ...state,
    adSets: [newAdSet, ...state.adSets],
    ads: [...newAds, ...state.ads],
  };
  emit();

  return { adSetId: newAdSetId, created };
}

export function duplicateMockAd(adId: string): DuplicateResult {
  const source = state.ads.find((a) => a.id === adId);
  if (!source) return { created: [] };

  const newAdId = nextId('ma');
  const createdAd: Ad = {
    ...source,
    id: newAdId,
    name: `${source.name} (Kopya)`,
    status: 'paused',
  };

  state = {
    ...state,
    ads: [createdAd, ...state.ads],
  };
  emit();

  return { adId: newAdId, created: [{ entity: 'ad', id: newAdId }] };
}
