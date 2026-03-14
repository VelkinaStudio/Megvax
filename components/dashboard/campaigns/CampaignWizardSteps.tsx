import { useMemo, useRef } from 'react';
import NextImage from 'next/image';
import { Target, TrendingUp, Users, ShoppingBag, MousePointer, MessageCircle, Upload, Sparkles, CheckCircle, Image as ImageIcon, Film } from 'lucide-react';

export type BudgetType = 'daily' | 'lifetime';
export type CreativeSourceType = 'upload' | 'ai';
export type CreativeMediaType = 'image' | 'video';
export type CreativeFormat = '1:1' | '4:5' | '9:16' | '1.91:1';
export type CreativeCta = 'LEARN_MORE' | 'SHOP_NOW' | 'SIGN_UP' | 'SEND_MESSAGE';

export type PlacementMode = 'advantage' | 'manual';
export type OptimizationGoal = 'CONVERSIONS' | 'LINK_CLICKS' | 'LANDING_PAGE_VIEWS' | 'LEADS' | 'REACH';
export type BidStrategy = 'LOWEST_COST' | 'COST_CAP' | 'BID_CAP';

export interface UploadedCreativeMeta {
  sizeBytes: number;
  width?: number;
  height?: number;
  durationSec?: number;
  type: CreativeMediaType;
}

export interface AdSetPresetSettings {
  startAt: string;
  hasEnd: boolean;
  endAt: string;
  placementMode: PlacementMode;
  placements: string[];
  optimizationGoal: OptimizationGoal;
  bidStrategy: BidStrategy;
  bidAmount: string;
}

// Step 1: Objective
export function ObjectiveStep({ selected, onSelect }: { selected: string, onSelect: (id: string) => void }) {
  const objectives = [
    { id: 'sales', label: 'Sales', icon: ShoppingBag, desc: 'Increase conversions and sales.' },
    { id: 'leads', label: 'Leads', icon: Users, desc: 'Collect form submissions and information.' },
    { id: 'traffic', label: 'Traffic', icon: MousePointer, desc: 'Drive visitors to your website.' },
    { id: 'engagement', label: 'Engagement', icon: MessageCircle, desc: 'Get messages, comments, and likes.' },
    { id: 'awareness', label: 'Awareness', icon: Target, desc: 'Show your brand to more people.' },
    { id: 'promotion', label: 'App Promotion', icon: TrendingUp, desc: 'Increase app downloads.' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {objectives.map((obj) => (
        <div 
          key={obj.id}
          onClick={() => onSelect(obj.id)}
          className={
            `
            p-6 rounded-[2px] border-2 cursor-pointer transition-all duration-200 flex items-start gap-4
            ${selected === obj.id 
              ? 'border-brand-black bg-paper-white' 
              : 'border-brand-black/30 hover:border-brand-black'}
          `
          }
        >
          <div className={
            `
            p-3 rounded-[2px] shrink-0 border-2 border-brand-black
            ${selected === obj.id ? 'bg-brand-black text-brand-white' : 'bg-paper-white text-brand-black/70'}
          `}
          >
            <obj.icon size={24} />
          </div>
          <div>
            <h3 className={`font-bold text-lg mb-1 ${selected === obj.id ? 'text-brand-black' : 'text-brand-black/70'}`}>
              {obj.label}
            </h3>
            <p className="text-sm text-brand-black/70 leading-relaxed">{obj.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// Step 2: Campaign Settings
export function CampaignSettingsStep({
  name,
  onNameChange,
  budgetType,
  onBudgetTypeChange,
  budgetAmount,
  onBudgetAmountChange,
}: {
  name: string;
  onNameChange: (next: string) => void;
  budgetType: BudgetType;
  onBudgetTypeChange: (next: BudgetType) => void;
  budgetAmount: string;
  onBudgetAmountChange: (next: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <label className="form-label">Campaign Name</label>
        <input 
          type="text" 
          placeholder="e.g. Summer Sale 2025" 
          className="form-input"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="form-label">Budget Type</label>
          <select
            className="form-select"
            value={budgetType}
            onChange={(e) => onBudgetTypeChange(e.target.value as BudgetType)}
          >
            <option value="daily">Daily Budget</option>
            <option value="lifetime">Lifetime Budget</option>
          </select>
        </div>
        <div>
          <label className="form-label">Amount</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-brand-black/70">₺</span>
            <input 
              type="number" 
              placeholder="500" 
              className="form-input pl-8"
              value={budgetAmount}
              onChange={(e) => onBudgetAmountChange(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="p-4 bg-paper-white border-2 border-brand-black rounded-[2px] flex items-start gap-3">
         <div className="w-1.5 h-1.5 rounded-[2px] bg-action-blue mt-2 shrink-0" />
         <p className="text-sm text-brand-black/70 font-medium leading-relaxed">
           Advantage+ budget optimization is enabled by default. Megvax will direct your spend to the best-performing ad set.
         </p>
      </div>
    </div>
  );
}

// Step 3: AdSet Stub
export function AdSetStep({
  name,
  onNameChange,
  dailyBudget,
  onDailyBudgetChange,
  settings,
  onSettingsChange,
}: {
  name: string;
  onNameChange: (next: string) => void;
  dailyBudget: string;
  onDailyBudgetChange: (next: string) => void;
  settings: AdSetPresetSettings;
  onSettingsChange: (next: AdSetPresetSettings) => void;
}) {
  const placementOptions = [
    { id: 'facebook_feed', label: 'Facebook Feed' },
    { id: 'instagram_feed', label: 'Instagram Feed' },
    { id: 'instagram_story', label: 'Instagram Story' },
    { id: 'instagram_reels', label: 'Instagram Reels' },
    { id: 'facebook_story', label: 'Facebook Story' },
  ];

  const togglePlacement = (id: string) => {
    const exists = settings.placements.includes(id);
    onSettingsChange({
      ...settings,
      placements: exists ? settings.placements.filter((p) => p !== id) : [...settings.placements, id],
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="form-label">Ad Set Name</label>
        <input
          type="text"
          placeholder="e.g. US - 25-45 - Women"
          className="form-input"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
        />
      </div>

      <div>
        <label className="form-label">Daily Budget</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-brand-black/70">₺</span>
          <input
            type="number"
            placeholder="250"
            className="form-input pl-8"
            value={dailyBudget}
            onChange={(e) => onDailyBudgetChange(e.target.value)}
          />
        </div>
      </div>

      <div className="border-2 border-brand-black rounded-[2px] bg-paper-white p-4">
        <p className="text-xs font-bold text-brand-black/70 uppercase">Schedule</p>
        <div className="grid grid-cols-2 gap-4 mt-3">
          <div>
            <label className="form-label">Start</label>
            <input
              type="datetime-local"
              className="form-input"
              value={settings.startAt}
              onChange={(e) => onSettingsChange({ ...settings, startAt: e.target.value })}
            />
          </div>
          <div>
            <label className="form-label">End</label>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.hasEnd}
                onChange={(e) => onSettingsChange({ ...settings, hasEnd: e.target.checked })}
                className="h-4 w-4 border-2 border-brand-black rounded-[2px]"
              />
              <span className="text-sm font-medium text-brand-black/70">Set end time</span>
            </div>
            <input
              type="datetime-local"
              className="form-input mt-2"
              value={settings.endAt}
              onChange={(e) => onSettingsChange({ ...settings, endAt: e.target.value })}
              disabled={!settings.hasEnd}
            />
          </div>
        </div>
      </div>

      <div className="border-2 border-brand-black rounded-[2px] bg-paper-white p-4">
        <p className="text-xs font-bold text-brand-black/70 uppercase">Placements</p>
        <div className="mt-3 flex p-1 bg-brand-white border-2 border-brand-black rounded-[2px]">
          <button
            type="button"
            onClick={() => onSettingsChange({ ...settings, placementMode: 'advantage' })}
            className={`flex-1 py-2 text-sm font-bold rounded-[2px] transition-all ${
              settings.placementMode === 'advantage' ? 'bg-brand-black text-brand-white' : 'text-brand-black/70 hover:text-brand-black'
            }`}
          >
            Advantage+ (Auto)
          </button>
          <button
            type="button"
            onClick={() => onSettingsChange({ ...settings, placementMode: 'manual' })}
            className={`flex-1 py-2 text-sm font-bold rounded-[2px] transition-all ${
              settings.placementMode === 'manual' ? 'bg-brand-black text-brand-white' : 'text-brand-black/70 hover:text-brand-black'
            }`}
          >
            Manual
          </button>
        </div>

        {settings.placementMode === 'manual' && (
          <div className="mt-4 grid grid-cols-2 gap-2">
            {placementOptions.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => togglePlacement(p.id)}
                className={`px-3 py-2 border-2 rounded-[2px] text-sm font-bold text-left transition-colors ${
                  settings.placements.includes(p.id)
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
        <p className="text-xs font-bold text-brand-black/70 uppercase">Optimization & Bidding</p>
        <div className="grid grid-cols-2 gap-4 mt-3">
          <div>
            <label className="form-label">Optimization Goal</label>
            <select
              className="form-select"
              value={settings.optimizationGoal}
              onChange={(e) => onSettingsChange({ ...settings, optimizationGoal: e.target.value as OptimizationGoal })}
            >
              <option value="CONVERSIONS">Conversions</option>
              <option value="LEADS">Lead</option>
              <option value="LANDING_PAGE_VIEWS">Landing Page Views</option>
              <option value="LINK_CLICKS">Link Clicks</option>
              <option value="REACH">Reach</option>
            </select>
          </div>

          <div>
            <label className="form-label">Bid Strategy</label>
            <select
              className="form-select"
              value={settings.bidStrategy}
              onChange={(e) => onSettingsChange({ ...settings, bidStrategy: e.target.value as BidStrategy })}
            >
              <option value="LOWEST_COST">Lowest Cost</option>
              <option value="COST_CAP">Cost Cap</option>
              <option value="BID_CAP">Bid Cap</option>
            </select>
          </div>
        </div>

        {settings.bidStrategy !== 'LOWEST_COST' && (
          <div className="mt-4">
            <label className="form-label">Limit (₺)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-brand-black/70">₺</span>
              <input
                type="number"
                placeholder="e.g. 35"
                className="form-input pl-8"
                value={settings.bidAmount}
                onChange={(e) => onSettingsChange({ ...settings, bidAmount: e.target.value })}
              />
            </div>
            <p className="text-xs text-brand-black/60 mt-2">This limit helps control delivery cost. Performance may fluctuate.</p>
          </div>
        )}
      </div>

      <div className="p-6 border-2 border-brand-black rounded-[2px] bg-paper-white text-center">
        <p className="text-brand-black/70 font-medium mb-2">Audience & Placement Settings</p>
        <p className="text-xs text-brand-black/60 mb-4">This section is currently under development.</p>
        <button className="minimal-button secondary">
          Use Default Settings
        </button>
      </div>
    </div>
  );
}

// Step 4: Ad Creation
export function AdStep({
  sourceType,
  onSourceTypeChange,
  selectedAiImage,
  onSelectAiImage,
  mediaType,
  onMediaTypeChange,
  format,
  onFormatChange,
  pageId,
  onPageIdChange,
  linkUrl,
  onLinkUrlChange,
  uploadedFile,
  uploadedPreviewUrl,
  uploadedMeta,
  videoThumbDataUrl,
  manualThumbPreviewUrl,
  onUploadFile,
  onUploadThumbnail,
  primaryText,
  onPrimaryTextChange,
  headline,
  onHeadlineChange,
  description,
  onDescriptionChange,
  callToAction,
  onCallToActionChange,
}: {
  sourceType: CreativeSourceType;
  onSourceTypeChange: (next: CreativeSourceType) => void;
  selectedAiImage: string | null;
  onSelectAiImage: (next: string | null) => void;
  mediaType: CreativeMediaType;
  onMediaTypeChange: (next: CreativeMediaType) => void;
  format: CreativeFormat;
  onFormatChange: (next: CreativeFormat) => void;
  pageId: string;
  onPageIdChange: (next: string) => void;
  linkUrl: string;
  onLinkUrlChange: (next: string) => void;
  uploadedFile: File | null;
  uploadedPreviewUrl: string | null;
  uploadedMeta: UploadedCreativeMeta | null;
  videoThumbDataUrl: string | null;
  manualThumbPreviewUrl: string | null;
  onUploadFile: (file: File | null) => void;
  onUploadThumbnail: (file: File | null) => void;
  primaryText: string;
  onPrimaryTextChange: (next: string) => void;
  headline: string;
  onHeadlineChange: (next: string) => void;
  description: string;
  onDescriptionChange: (next: string) => void;
  callToAction: CreativeCta;
  onCallToActionChange: (next: CreativeCta) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const thumbInputRef = useRef<HTMLInputElement | null>(null);

  const formatAspect = useMemo(() => {
    if (format === '1:1') return 1;
    if (format === '4:5') return 4 / 5;
    if (format === '9:16') return 9 / 16;
    return 1.91;
  }, [format]);

  const checks = useMemo(() => {
    if (!uploadedMeta || sourceType !== 'upload') {
      return { warnings: [] as { level: 'info' | 'warn'; text: string }[], metaText: [] as string[] };
    }

    const warnings: { level: 'info' | 'warn'; text: string }[] = [];
    const metaText: string[] = [];

    const sizeMb = uploadedMeta.sizeBytes / (1024 * 1024);
    metaText.push(`File: ${sizeMb.toFixed(1)} MB`);

    if (uploadedMeta.width && uploadedMeta.height) {
      metaText.push(`Resolution: ${uploadedMeta.width}×${uploadedMeta.height}`);
      const actualAspect = uploadedMeta.width / uploadedMeta.height;
      const delta = Math.abs(actualAspect - formatAspect);
      if (delta > 0.08) {
        warnings.push({ level: 'warn', text: `Selected format (${format}) doesn't match file aspect ratio. Cropping may be needed.` });
      }
    }

    if (uploadedMeta.type === 'image') {
      if (sizeMb > 30) warnings.push({ level: 'warn', text: 'Image file size is large. May cause upload/display issues.' });
    }

    if (uploadedMeta.type === 'video') {
      const duration = uploadedMeta.durationSec;
      if (typeof duration === 'number' && Number.isFinite(duration)) {
        metaText.push(`Duration: ${duration.toFixed(1)}s`);
        if (format === '9:16' && duration > 60) {
          warnings.push({ level: 'warn', text: 'Shorter duration recommended for 9:16 (Story/Reels) videos. This video appears long.' });
        }
        if (duration > 180) warnings.push({ level: 'warn', text: 'Video duration is high. May negatively affect review and delivery performance.' });
      } else {
        warnings.push({ level: 'info', text: 'Could not read video duration. It can still be published; try a different file if needed.' });
      }

      if (sizeMb > 1024) warnings.push({ level: 'warn', text: 'Video file size is very large. Upload may fail.' });
      if (!manualThumbPreviewUrl && !videoThumbDataUrl) warnings.push({ level: 'info', text: 'No thumbnail selected. Meta may auto-select a thumbnail.' });
    }

    return { warnings, metaText };
  }, [uploadedMeta, sourceType, format, formatAspect, manualThumbPreviewUrl, videoThumbDataUrl]);

  return (
    <div className="space-y-6">
      {/* Toggle Source */}
      <div className="flex p-1 bg-paper-white border-2 border-brand-black rounded-[2px]">
        <button
          type="button"
          onClick={() => onSourceTypeChange('upload')}
          className={`flex-1 py-2 text-sm font-bold rounded-[2px] transition-all flex items-center justify-center gap-2 ${
            sourceType === 'upload' ? 'bg-brand-black text-brand-white' : 'text-brand-black/70 hover:text-brand-black'
          }`}
        >
          <Upload size={16} />
          Upload Media
        </button>
        <button
          type="button"
          onClick={() => onSourceTypeChange('ai')}
          className={`flex-1 py-2 text-sm font-bold rounded-[2px] transition-all flex items-center justify-center gap-2 ${
            sourceType === 'ai' ? 'bg-brand-black text-brand-white' : 'text-brand-black/70 hover:text-brand-black'
          }`}
        >
          <Sparkles size={16} />
          AI Library
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="form-label">Media Type</label>
          <div className="flex p-1 bg-paper-white border-2 border-brand-black rounded-[2px]">
            <button
              type="button"
              onClick={() => onMediaTypeChange('image')}
              className={`flex-1 py-2 text-sm font-bold rounded-[2px] transition-all flex items-center justify-center gap-2 ${
                mediaType === 'image' ? 'bg-brand-black text-brand-white' : 'text-brand-black/70 hover:text-brand-black'
              }`}
            >
              <ImageIcon size={16} />
              Image
            </button>
            <button
              type="button"
              onClick={() => onMediaTypeChange('video')}
              className={`flex-1 py-2 text-sm font-bold rounded-[2px] transition-all flex items-center justify-center gap-2 ${
                mediaType === 'video' ? 'bg-brand-black text-brand-white' : 'text-brand-black/70 hover:text-brand-black'
              }`}
            >
              <Film size={16} />
              Video
            </button>
          </div>
        </div>

        <div>
          <label className="form-label">Format</label>
          <select className="form-select" value={format} onChange={(e) => onFormatChange(e.target.value as CreativeFormat)}>
            <option value="1:1">1:1 (Square)</option>
            <option value="4:5">4:5 (Vertical Feed)</option>
            <option value="9:16">9:16 (Story / Reels)</option>
            <option value="1.91:1">1.91:1 (Landscape)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="form-label">Headline</label>
          <input
            type="text"
            placeholder="e.g. Summer Sale Now On"
            className="form-input"
            value={headline}
            onChange={(e) => onHeadlineChange(e.target.value)}
          />
        </div>
        <div>
          <label className="form-label">CTA</label>
          <select
            value={callToAction}
            onChange={(e) => onCallToActionChange(e.target.value as CreativeCta)}
            className="form-select"
          >
            <option value="LEARN_MORE">Learn More</option>
            <option value="SHOP_NOW">Shop Now</option>
            <option value="SIGN_UP">Sign Up</option>
            <option value="SEND_MESSAGE">Send Message</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="form-label">Page ID</label>
          <input
            type="text"
            placeholder="e.g. 1234567890"
            className="form-input"
            value={pageId}
            onChange={(e) => onPageIdChange(e.target.value)}
          />
        </div>
        <div>
          <label className="form-label">Target URL</label>
          <input
            type="url"
            placeholder="https://..."
            className="form-input"
            value={linkUrl}
            onChange={(e) => onLinkUrlChange(e.target.value)}
          />
        </div>
      </div>

      {/* Upload Mode */}
      {sourceType === 'upload' && (
        <div
          className="border-2 border-dashed border-brand-black rounded-[2px] p-8 flex flex-col items-center justify-center text-center hover:bg-paper-white transition-colors cursor-pointer group animate-in fade-in slide-in-from-bottom-2 duration-300"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={mediaType === 'video' ? 'video/*' : 'image/*'}
            className="hidden"
            onChange={(e) => onUploadFile(e.target.files?.[0] ?? null)}
          />
          <div className="w-12 h-12 bg-paper-white border-2 border-brand-black rounded-[2px] flex items-center justify-center mb-4 transition-all">
            <Upload size={24} className="text-brand-black/60" />
          </div>
          <h4 className="text-lg font-bold text-brand-black mb-1">Upload Media</h4>
          <p className="text-sm text-brand-black/70 mb-4">{uploadedFile ? uploadedFile.name : 'Select an image or video'}</p>
          <button type="button" className="text-action-blue font-bold text-sm hover:underline">Choose File</button>
        </div>
      )}

      {/* AI Mode */}
      {sourceType === 'ai' && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <p className="text-xs font-bold text-brand-black/70 uppercase mb-3">Select from AI Creative Studio</p>
          <div className="grid grid-cols-3 gap-3 max-h-64 overflow-y-auto pr-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div 
                key={i}
                onClick={() => onSelectAiImage(i.toString())}
                className={
                  `
                  aspect-square bg-paper-white rounded-[2px] relative cursor-pointer border-2 transition-all overflow-hidden group
                  ${selectedAiImage === i.toString() ? 'border-action-blue' : 'border-brand-black/20 hover:border-brand-black'}
                `
                }
              >
                {/* Placeholder Image */}
                <div className="w-full h-full flex items-center justify-center bg-brand-white text-brand-black/30 group-hover:bg-paper-white">
                  <Sparkles size={20} />
                </div>
                
                {selectedAiImage === i.toString() && (
                  <div className="absolute top-2 right-2 bg-action-blue text-brand-white rounded-[2px] p-1">
                    <CheckCircle size={12} />
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-center text-brand-black/60 mt-2">Showing recently generated visuals.</p>
        </div>
      )}

      <div className="border-2 border-brand-black rounded-[2px] bg-paper-white p-4">
        <p className="text-xs font-bold text-brand-black/70 uppercase">Preview</p>
        <div className="mt-3 bg-brand-white border-2 border-brand-black rounded-[2px] overflow-hidden">
          <div className="w-full aspect-[4/3] relative flex items-center justify-center bg-paper-white">
            {sourceType === 'upload' && uploadedPreviewUrl ? (
              mediaType === 'video' ? (
                <video
                  src={uploadedPreviewUrl}
                  poster={manualThumbPreviewUrl ?? videoThumbDataUrl ?? undefined}
                  className="w-full h-full object-contain"
                  controls
                />
              ) : (
                <NextImage
                  src={uploadedPreviewUrl}
                  alt="Preview"
                  fill
                  unoptimized
                  sizes="(min-width: 768px) 600px, 100vw"
                  className="object-contain"
                />
              )
            ) : sourceType === 'ai' && selectedAiImage ? (
              <div className="w-full h-full flex items-center justify-center text-brand-black/40">
                <Sparkles size={22} />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-brand-black/40">
                <ImageIcon size={22} />
              </div>
            )}
          </div>
          <div className="p-3 border-t-2 border-brand-black">
            <p className="text-sm font-bold text-brand-black truncate">{headline || 'Headline'}</p>
            <p className="text-xs text-brand-black/70 mt-1 line-clamp-2">{primaryText || 'Text'}</p>
          </div>
        </div>
        <p className="text-xs text-brand-black/70 mt-2">Format: {format} • CTA: {callToAction}</p>

        {sourceType === 'upload' && uploadedFile && (
          <div className="mt-4 border-2 border-brand-black rounded-[2px] bg-brand-white p-4">
            <p className="text-xs font-bold text-brand-black/70 uppercase">File Checks</p>
            {checks.metaText.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {checks.metaText.map((t) => (
                  <span key={t} className="px-2 py-1 border-2 border-brand-black rounded-[2px] bg-paper-white text-xs font-mono text-brand-black/70">
                    {t}
                  </span>
                ))}
              </div>
            )}

            {mediaType === 'video' && (
              <div className="mt-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-brand-black">Thumbnail</p>
                  <p className="text-xs text-brand-black/70 mt-1">You can upload a custom thumbnail. If not, one will be auto-selected.</p>
                </div>
                <button type="button" onClick={() => thumbInputRef.current?.click()} className="minimal-button secondary shrink-0">
                  Select Thumbnail
                </button>
                <input
                  ref={thumbInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onUploadThumbnail(e.target.files?.[0] ?? null)}
                />
              </div>
            )}

            {checks.warnings.length > 0 && (
              <div className="mt-3 space-y-2">
                {checks.warnings.map((w, idx) => (
                  <div key={idx} className="border-2 border-brand-black rounded-[2px] bg-paper-white p-3">
                    <p className={`text-sm font-bold ${w.level === 'warn' ? 'text-alert-red' : 'text-brand-black'}`}>{w.level === 'warn' ? 'Warning' : 'Info'}</p>
                    <p className="text-sm text-brand-black/70 mt-1">{w.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div>
        <label className="form-label">Reklam Metni</label>
        <textarea 
          rows={3}
          className="form-textarea"
          placeholder="What would you like to tell your customers?"
          value={primaryText}
          onChange={(e) => onPrimaryTextChange(e.target.value)}
        />
      </div>

      <div>
        <label className="form-label">Description</label>
        <textarea
          rows={2}
          className="form-textarea"
          placeholder="e.g. Free shipping and fast delivery"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
        />
      </div>
    </div>
  );
}
