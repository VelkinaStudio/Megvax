'use client';

import { useEffect, useState } from 'react';
import { X, ChevronRight, Layers } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';


type PlacementMode = 'advantage' | 'manual';
type OptimizationGoal = 'CONVERSIONS' | 'LINK_CLICKS' | 'LANDING_PAGE_VIEWS' | 'LEADS' | 'REACH';
type BidStrategy = 'LOWEST_COST' | 'COST_CAP' | 'BID_CAP';

interface CreateAdSetModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCampaignId?: string;
}

function extractMetaUserMessage(errorBody: unknown): string | undefined {
  if (!errorBody || typeof errorBody !== 'object') return undefined;
  const root = errorBody as Record<string, unknown>;

  const details = root.details;
  const detailsObj = details && typeof details === 'object' ? (details as Record<string, unknown>) : null;
  const detailsError = detailsObj?.error;

  const candidate =
    detailsError && typeof detailsError === 'object'
      ? (detailsError as Record<string, unknown>)
      : root.error && typeof root.error === 'object'
        ? (root.error as Record<string, unknown>)
        : null;

  const msg = candidate?.error_user_msg ?? candidate?.message;
  return typeof msg === 'string' ? msg : undefined;
}

function extractCreatedId(created: unknown): string | undefined {
  if (!created || typeof created !== 'object') return undefined;
  const root = created as Record<string, unknown>;
  if (typeof root.id === 'string') return root.id;
  const nested = root.adset;
  if (nested && typeof nested === 'object') {
    const nestedObj = nested as Record<string, unknown>;
    if (typeof nestedObj.id === 'string') return nestedObj.id;
  }
  return undefined;
}

export function CreateAdSetModal({ isOpen, onClose, initialCampaignId }: CreateAdSetModalProps) {
  const toast = useToast();

  const [campaigns, setCampaigns] = useState<{ id: string; name: string }[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
  const [name, setName] = useState('');
  const [dailyBudget, setDailyBudget] = useState<string>('');
  const [startAt, setStartAt] = useState('');
  const [hasEnd, setHasEnd] = useState(false);
  const [endAt, setEndAt] = useState('');
  const [placementMode, setPlacementMode] = useState<PlacementMode>('advantage');
  const [placements, setPlacements] = useState<string[]>(['facebook_feed', 'instagram_feed', 'instagram_story', 'instagram_reels']);
  const [optimizationGoal, setOptimizationGoal] = useState<OptimizationGoal>('CONVERSIONS');
  const [bidStrategy, setBidStrategy] = useState<BidStrategy>('LOWEST_COST');
  const [bidAmount, setBidAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const placementOptions = [
    { id: 'facebook_feed', label: 'Facebook Feed' },
    { id: 'instagram_feed', label: 'Instagram Feed' },
    { id: 'instagram_story', label: 'Instagram Story' },
    { id: 'instagram_reels', label: 'Instagram Reels' },
    { id: 'facebook_story', label: 'Facebook Story' },
  ];

  const togglePlacement = (id: string) => {
    setPlacements((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  };

  useEffect(() => {
    const fetchCampaigns = async () => {
      if (!isOpen) return;

      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const res = await fetch(`${baseUrl}/api/meta/campaigns`);
        if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
        const data = await res.json();
        if (!data || !Array.isArray(data.campaigns)) return;
        setCampaigns((data.campaigns as { id: string; name: string }[]) || []);
      } catch (error) {
        console.error('Failed to fetch campaigns', error);
        toast.error('Failed to load campaigns.');
      }
    };

    fetchCampaigns();
  }, [isOpen, toast]);

  useEffect(() => {
    if (!isOpen) return;
    if (!initialCampaignId) return;
    setSelectedCampaignId(initialCampaignId);
  }, [isOpen, initialCampaignId]);

  if (!isOpen) return null;

  const executeFinish = async () => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

      const payload = {
        campaignId: selectedCampaignId,
        name,
        dailyBudget: Number(dailyBudget),
        schedule: {
          startAt: startAt || undefined,
          endAt: hasEnd ? endAt || undefined : undefined,
        },
        placements:
          placementMode === 'advantage'
            ? { mode: 'advantage' }
            : { mode: 'manual', placements },
        optimization: {
          goal: optimizationGoal,
          bidStrategy,
          bidAmount: bidStrategy === 'LOWEST_COST' ? undefined : bidAmount || undefined,
        },
      };

      let res = await fetch(`${baseUrl}/api/meta/adsets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorBody: unknown = await res.json().catch(() => ({}));
        console.error('Ad set creation error', errorBody);

        if (res.status === 400) {
          const retryRes = await fetch(`${baseUrl}/api/meta/adsets`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              campaignId: selectedCampaignId,
              name,
              dailyBudget: Number(dailyBudget),
            }),
          });

          if (!retryRes.ok) {
            const retryBody: unknown = await retryRes.json().catch(() => ({}));
            console.error('Ad set creation error (minimal retry)', retryBody);
            const retryMsg = extractMetaUserMessage(retryBody);
            toast.error(retryMsg ? `Meta API: ${retryMsg}` : 'An error occurred while creating the ad set.');
            return;
          }

          res = retryRes;
        } else {
          const userMsg = extractMetaUserMessage(errorBody);
          toast.error(userMsg ? `Meta API: ${userMsg}` : 'An error occurred while creating the ad set.');
          return;
        }
      }

      const created: unknown = await res.json().catch(() => ({}));
      const createdId = extractCreatedId(created);

      if (createdId) {
        toast.success('New ad set created.');
      } else {
        toast.success('New ad set created.');
      }

      onClose();
      setSelectedCampaignId('');
      setName('');
      setDailyBudget('');
      setStartAt('');
      setHasEnd(false);
      setEndAt('');
      setPlacementMode('advantage');
      setPlacements(['facebook_feed', 'instagram_feed', 'instagram_story', 'instagram_reels']);
      setOptimizationGoal('CONVERSIONS');
      setBidStrategy('LOWEST_COST');
      setBidAmount('');
    } catch (error) {
      console.error('Ad set creation error', error);
      toast.error('An error occurred while creating the ad set.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinish = () => {
    if (!selectedCampaignId || !name || !dailyBudget) {
      toast.error('Please fill in campaign, ad set name, and daily budget.');
      return;
    }

    if (bidStrategy !== 'LOWEST_COST' && bidAmount && Number(bidAmount) < 1) {
      toast.error('Limit cannot be 0.');
      return;
    }

    setIsConfirmOpen(true);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity" onClick={onClose} />
      <div className="fixed inset-0 z-50 pointer-events-none p-4 md:p-6">
        <div className="bg-brand-white border-2 border-brand-black rounded-[2px] w-full max-w-[1440px] mx-auto pointer-events-auto flex flex-col max-h-[90vh] min-h-0 overflow-hidden">
          
          {/* Header */}
          <div className="px-6 py-5 border-b-2 border-brand-black bg-paper-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-paper-white border-2 border-brand-black rounded-[2px] text-brand-black">
                <Layers size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-brand-black">New Ad Set</h2>
                <p className="text-xs text-brand-black/70">Add an audience to an existing campaign.</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-paper-white rounded-[2px] border border-transparent hover:border-brand-black transition-colors text-brand-black/60 hover:text-brand-black"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-6 flex-1 min-h-0 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full min-h-0">
              <div className="lg:col-span-8 overflow-y-auto min-h-0 pr-1">
                <div className="space-y-6">
                  <div>
                    <label className="form-label">Select Campaign</label>
                    <select value={selectedCampaignId} onChange={(e) => setSelectedCampaignId(e.target.value)} className="form-select">
                      <option value="">Select campaign</option>
                      {campaigns.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Ad Set Name</label>
                    <input
                      type="text"
                      placeholder="e.g. US - 25-45 - Interest"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Daily Budget</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-black/70">₺</span>
                        <input
                          type="number"
                          placeholder="250"
                          value={dailyBudget}
                          onChange={(e) => setDailyBudget(e.target.value)}
                          className="form-input pl-8"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="form-label">Bid Strategy</label>
                      <select className="form-select" value={bidStrategy} onChange={(e) => setBidStrategy(e.target.value as BidStrategy)}>
                        <option value="LOWEST_COST">Lowest Cost</option>
                        <option value="COST_CAP">Cost Cap</option>
                        <option value="BID_CAP">Bid Cap</option>
                      </select>
                    </div>
                  </div>

                  {bidStrategy !== 'LOWEST_COST' && (
                    <div>
                      <label className="form-label">Limit (₺)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-black/70">₺</span>
                        <input
                          type="number"
                          placeholder="e.g. 35"
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value)}
                          className="form-input pl-8"
                        />
                      </div>
                      <p className="text-xs text-brand-black/60 mt-2">
                        This limit helps control delivery cost. Performance may fluctuate.
                      </p>
                    </div>
                  )}

                  <div className="border-2 border-brand-black rounded-[2px] bg-paper-white p-4">
                    <p className="text-xs font-bold text-brand-black/70 uppercase">Schedule</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                      <div>
                        <label className="form-label">Start</label>
                        <input
                          type="datetime-local"
                          className="form-input"
                          value={startAt}
                          onChange={(e) => setStartAt(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="form-label">End</label>
                        <input
                          type="datetime-local"
                          className="form-input"
                          value={endAt}
                          onChange={(e) => setEndAt(e.target.value)}
                          disabled={!hasEnd}
                        />
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <input type="checkbox" className="w-4 h-4" checked={hasEnd} onChange={(e) => setHasEnd(e.target.checked)} />
                      <span className="text-sm text-brand-black/70">Set end date</span>
                    </div>
                  </div>

                  <div className="border-2 border-brand-black rounded-[2px] bg-paper-white p-4">
                    <p className="text-xs font-bold text-brand-black/70 uppercase">Placements</p>
                    <div className="mt-3 flex p-1 bg-brand-white border-2 border-brand-black rounded-[2px]">
                      <button
                        type="button"
                        onClick={() => setPlacementMode('advantage')}
                        className={`flex-1 py-2 text-sm font-bold rounded-[2px] transition-all ${
                          placementMode === 'advantage' ? 'bg-brand-black text-brand-white' : 'text-brand-black/70 hover:text-brand-black'
                        }`}
                      >
                        Advantage+ (Auto)
                      </button>
                      <button
                        type="button"
                        onClick={() => setPlacementMode('manual')}
                        className={`flex-1 py-2 text-sm font-bold rounded-[2px] transition-all ${
                          placementMode === 'manual' ? 'bg-brand-black text-brand-white' : 'text-brand-black/70 hover:text-brand-black'
                        }`}
                      >
                        Manual
                      </button>
                    </div>

                    {placementMode === 'manual' && (
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        {placementOptions.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => togglePlacement(p.id)}
                            className={`px-3 py-2 border-2 rounded-[2px] text-sm font-bold text-left transition-colors ${
                              placements.includes(p.id)
                                ? 'border-brand-black bg-brand-black text-brand-white'
                                : 'border-brand-black bg-brand-white text-brand-black/70 hover:text-brand-black'
                            }`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="border-2 border-brand-black rounded-[2px] bg-paper-white p-4">
                    <p className="text-xs font-bold text-brand-black/70 uppercase">Optimizasyon</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                      <div>
                        <label className="form-label">Optimization Goal</label>
                        <select
                          className="form-select"
                          value={optimizationGoal}
                          onChange={(e) => setOptimizationGoal(e.target.value as OptimizationGoal)}
                        >
                          <option value="CONVERSIONS">Conversions</option>
                          <option value="LEADS">Lead</option>
                          <option value="LANDING_PAGE_VIEWS">Landing Page Views</option>
                          <option value="LINK_CLICKS">Link Clicks</option>
                          <option value="REACH">Reach</option>
                        </select>
                      </div>
                      <div>
                        <label className="form-label">Placement Mode</label>
                        <select className="form-select" value={placementMode} onChange={(e) => setPlacementMode(e.target.value as PlacementMode)}>
                          <option value="advantage">Advantage+ (Auto)</option>
                          <option value="manual">Manual</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-paper-white border-2 border-brand-black rounded-[2px] text-center">
                    <p className="text-xs text-brand-black/70">
                      Audience selection is managed via presets in this version. Detailed options coming soon.
                    </p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 overflow-y-auto min-h-0">
                <div className="border-2 border-brand-black rounded-[2px] bg-paper-white p-6">
                  <p className="text-xs font-bold text-brand-black/70 uppercase">Summary</p>

                  <div className="mt-4 space-y-4">
                    <div className="border-2 border-brand-black rounded-[2px] bg-brand-white p-4">
                      <p className="text-xs font-bold text-brand-black/70 uppercase">Campaign</p>
                      <p className="text-sm font-bold text-brand-black mt-1">
                        {campaigns.find((c) => c.id === selectedCampaignId)?.name || selectedCampaignId || '-'}
                      </p>
                    </div>

                    <div className="border-2 border-brand-black rounded-[2px] bg-brand-white p-4">
                      <p className="text-xs font-bold text-brand-black/70 uppercase">Ad Set</p>
                      <p className="text-sm font-bold text-brand-black mt-1">{name || '-'}</p>
                      <p className="text-xs text-brand-black/70 mt-2">Daily budget: {dailyBudget ? `₺${dailyBudget}` : '-'}</p>
                      <p className="text-xs text-brand-black/70 mt-1">
                        Bid: {bidStrategy === 'LOWEST_COST' ? 'Lowest Cost' : bidStrategy === 'COST_CAP' ? 'Cost Cap' : 'Bid Cap'}
                        {bidStrategy !== 'LOWEST_COST' ? ` • Limit: ${bidAmount ? `₺${bidAmount}` : '-'}` : ''}
                      </p>
                    </div>

                    <div className="border-2 border-brand-black rounded-[2px] bg-brand-white p-4">
                      <p className="text-xs font-bold text-brand-black/70 uppercase">Schedule</p>
                      <p className="text-xs text-brand-black/70 mt-2">Start: {startAt || '-'}</p>
                      <p className="text-xs text-brand-black/70 mt-1">End: {hasEnd ? endAt || '-' : '— (open-ended)'}</p>
                    </div>

                    <div className="border-2 border-brand-black rounded-[2px] bg-brand-white p-4">
                      <p className="text-xs font-bold text-brand-black/70 uppercase">Placements</p>
                      <p className="text-xs text-brand-black/70 mt-2">
                        Mode: {placementMode === 'advantage' ? 'Advantage+ (Auto)' : 'Manual'}
                      </p>
                      <p className="text-xs text-brand-black/70 mt-1">
                        {placementMode === 'manual' ? `Selected: ${placements.length}` : 'Selected: Auto'}
                      </p>
                    </div>

                    <div className="border-2 border-brand-black rounded-[2px] bg-brand-white p-4">
                      <p className="text-xs font-bold text-brand-black/70 uppercase">Optimization</p>
                      <p className="text-xs text-brand-black/70 mt-2">Goal: {optimizationGoal}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t-2 border-brand-black bg-paper-white flex justify-end gap-3">
            <Button 
              variant="secondary"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button 
              variant="primary"
              onClick={handleFinish}
              disabled={isSubmitting}
              icon={<ChevronRight size={16} />}
            >
              Create
            </Button>
          </div>

        </div>
      </div>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Are you sure?"
        description="A new ad set will be created."
        confirmHint="This will create a new entity in the ad account. A short-lived undo option will be available after creation."
        confirmLabel="Yes, Create"
        cancelLabel="Cancel"
        variant="primary"
        isConfirmLoading={isSubmitting}
        onCancel={() => {
          if (isSubmitting) return;
          setIsConfirmOpen(false);
        }}
        onConfirm={async () => {
          if (isSubmitting) return;
          await executeFinish();
          setIsConfirmOpen(false);
        }}
      />
    </>
  );
}
