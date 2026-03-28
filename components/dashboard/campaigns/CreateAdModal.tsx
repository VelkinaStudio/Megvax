'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { X, ChevronRight, ChevronLeft, Check, Image as ImageIcon, Upload, Sparkles, Film } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { ConfirmModal, Button } from '@/components/ui';

interface CreateAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAdSetId?: string;
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
  const nested = root.ad;
  if (nested && typeof nested === 'object') {
    const nestedObj = nested as Record<string, unknown>;
    if (typeof nestedObj.id === 'string') return nestedObj.id;
  }
  return undefined;
}

export function CreateAdModal({ isOpen, onClose, initialAdSetId }: CreateAdModalProps) {
  const toast = useToast();

  const [sourceType, setSourceType] = useState<'upload' | 'ai'>('upload');
  const [selectedAiImage, setSelectedAiImage] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [creativeFormat, setCreativeFormat] = useState<'1:1' | '4:5' | '9:16' | '1.91:1'>('1:1');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedPreviewUrl, setUploadedPreviewUrl] = useState<string | null>(null);
  const [videoThumbDataUrl, setVideoThumbDataUrl] = useState<string | null>(null);
  const [manualThumbFile, setManualThumbFile] = useState<File | null>(null);
  const [manualThumbPreviewUrl, setManualThumbPreviewUrl] = useState<string | null>(null);

  const [uploadedMeta, setUploadedMeta] = useState<{
    sizeBytes: number;
    width?: number;
    height?: number;
    durationSec?: number;
    type: 'image' | 'video';
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const thumbInputRef = useRef<HTMLInputElement | null>(null);

  const [adSets, setAdSets] = useState<{ id: string; name: string }[]>([]);
  const [selectedAdSetId, setSelectedAdSetId] = useState('');
  const [adName, setAdName] = useState('');
  const [pageId, setPageId] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [message, setMessage] = useState('');
  const [headline, setHeadline] = useState('');
  const [description, setDescription] = useState('');
  const [callToAction, setCallToAction] = useState<'LEARN_MORE' | 'SHOP_NOW' | 'SIGN_UP' | 'SEND_MESSAGE'>('LEARN_MORE');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const fetchAdSets = async () => {
      if (!isOpen) return;

      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const res = await fetch(`${baseUrl}/api/meta/adsets`);
        if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
        const data = await res.json();
        if (!data || !Array.isArray(data.adsets)) return;
        setAdSets((data.adsets as { id: string; name: string }[]) || []);
      } catch (error) {
        console.error('Failed to fetch ad sets', error);
        toast.error('Failed to load ad sets.');
      }
    };

    fetchAdSets();
  }, [isOpen, toast]);

  useEffect(() => {
    if (!isOpen) return;
    if (!initialAdSetId) return;
    setSelectedAdSetId(initialAdSetId);
  }, [isOpen, initialAdSetId]);

  useEffect(() => {
    if (isOpen) return;
    setCurrentStep(0);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    return () => {
      if (uploadedPreviewUrl) URL.revokeObjectURL(uploadedPreviewUrl);
      if (manualThumbPreviewUrl) URL.revokeObjectURL(manualThumbPreviewUrl);
    };
  }, [isOpen, uploadedPreviewUrl, manualThumbPreviewUrl]);

  const handleUploadFile = (file: File | null) => {
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    if (!isImage && !isVideo) {
      toast.error('Please select an image or video file.');
      return;
    }

    setMediaType(isVideo ? 'video' : 'image');

    if (uploadedPreviewUrl) URL.revokeObjectURL(uploadedPreviewUrl);
    const url = URL.createObjectURL(file);
    setUploadedFile(file);
    setUploadedPreviewUrl(url);
    setUploadedMeta({ sizeBytes: file.size, type: isVideo ? 'video' : 'image' });
    setVideoThumbDataUrl(null);
    setManualThumbFile(null);
    if (manualThumbPreviewUrl) URL.revokeObjectURL(manualThumbPreviewUrl);
    setManualThumbPreviewUrl(null);

    setSelectedAiImage(null);
    setSourceType('upload');

    if (isImage) {
      const imgEl = new window.Image();
      imgEl.onload = () => {
        setUploadedMeta({
          sizeBytes: file.size,
          type: 'image',
          width: imgEl.naturalWidth,
          height: imgEl.naturalHeight,
        });
      };
      imgEl.src = url;
      return;
    }

    if (isVideo) {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.src = url;
      video.muted = true;
      video.playsInline = true;
      video.onloadedmetadata = () => {
        const durationSec = Number.isFinite(video.duration) ? video.duration : undefined;
        const width = video.videoWidth || undefined;
        const height = video.videoHeight || undefined;
        setUploadedMeta({ sizeBytes: file.size, type: 'video', durationSec, width, height });

        try {
          const d = durationSec ?? 0;
          video.currentTime = Math.min(0.1, d > 0 ? d * 0.05 : 0.1);
        } catch {
          // ignore
        }
      };

      video.onseeked = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setVideoThumbDataUrl(dataUrl);
        } catch {
          // ignore
        }
      };
    }
  };

  const handleUploadThumbnail = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file for thumbnail.');
      return;
    }

    setManualThumbFile(file);
    if (manualThumbPreviewUrl) URL.revokeObjectURL(manualThumbPreviewUrl);
    const url = URL.createObjectURL(file);
    setManualThumbPreviewUrl(url);
  };

  const formatAspect = useMemo(() => {
    if (creativeFormat === '1:1') return 1;
    if (creativeFormat === '4:5') return 4 / 5;
    if (creativeFormat === '9:16') return 9 / 16;
    return 1.91;
  }, [creativeFormat]);

  const creativeChecks = useMemo(() => {
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
        warnings.push({
          level: 'warn',
          text: `Selected format (${creativeFormat}) doesn't match file aspect ratio. Cropping may be needed.`,
        });
      }
    }

    if (uploadedMeta.type === 'image') {
      if (sizeMb > 30) {
        warnings.push({ level: 'warn', text: 'Image file size is large. May cause upload/display issues.' });
      }
    }

    if (uploadedMeta.type === 'video') {
      const duration = uploadedMeta.durationSec;
      if (typeof duration === 'number' && Number.isFinite(duration)) {
        metaText.push(`Duration: ${duration.toFixed(1)}s`);

        if (creativeFormat === '9:16' && duration > 60) {
          warnings.push({
            level: 'warn',
            text: 'Shorter duration recommended for 9:16 (Story/Reels) videos. This video appears long.',
          });
        }

        if (duration > 180) {
          warnings.push({ level: 'warn', text: 'Video duration is high. May negatively affect review and delivery performance.' });
        }
      } else {
        warnings.push({ level: 'info', text: 'Could not read video duration. It can still be published; try a different file if needed.' });
      }

      if (sizeMb > 1024) {
        warnings.push({ level: 'warn', text: 'Video file size is very large. Upload may fail.' });
      }

      if (!manualThumbPreviewUrl && !videoThumbDataUrl) {
        warnings.push({ level: 'info', text: 'No thumbnail selected. Meta may auto-select a thumbnail.' });
      }
    }

    return { warnings, metaText };
  }, [uploadedMeta, sourceType, formatAspect, creativeFormat, manualThumbPreviewUrl, videoThumbDataUrl]);

  const executeFinish = async () => {
    if (isSubmitting) return;

    if (!selectedAdSetId || !adName || !pageId || !linkUrl) {
      toast.error('Please fill in ad set, ad name, page ID, and link URL.');
      return;
    }

    if (sourceType === 'upload' && !uploadedFile) {
      toast.error('Please upload an image or video.');
      return;
    }

    if (sourceType === 'ai' && !selectedAiImage) {
      toast.error('Please select a creative from the AI library.');
      return;
    }

    try {
      setIsSubmitting(true);

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

      const creative = {
        source: sourceType,
        mediaType,
        format: creativeFormat,
        primaryText: message,
        headline,
        description,
        callToAction,
        thumbnail:
          mediaType === 'video'
            ? {
                source: manualThumbFile ? 'upload' : 'auto',
              }
            : undefined,
        upload:
          sourceType === 'upload' && uploadedFile
            ? {
                fileName: uploadedFile.name,
                fileType: uploadedFile.type,
                sizeBytes: uploadedFile.size,
                width: uploadedMeta?.width,
                height: uploadedMeta?.height,
                durationSec: uploadedMeta?.durationSec,
              }
            : undefined,
        ai:
          sourceType === 'ai' && selectedAiImage
            ? {
                assetId: selectedAiImage,
              }
            : undefined,
      };

      const jsonBody = {
        adSetId: selectedAdSetId,
        pageId,
        linkUrl,
        name: adName,
        message,
        creative,
      };

      let res: Response;

      if (sourceType === 'upload' && uploadedFile) {
        try {
          const form = new FormData();
          form.append('data', JSON.stringify(jsonBody));
          form.append('file', uploadedFile);
          if (manualThumbFile) form.append('thumbnailFile', manualThumbFile);

          res = await fetch(`${baseUrl}/api/meta/ads`, {
            method: 'POST',
            body: form,
          });
        } catch {
          res = await fetch(`${baseUrl}/api/meta/ads`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(jsonBody),
          });
        }
      } else {
        res = await fetch(`${baseUrl}/api/meta/ads`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(jsonBody),
        });
      }

      if (!res.ok) {
        const contentType = res.headers.get('content-type') ?? '';
        const errorBody: unknown = contentType.includes('application/json')
          ? await res.json().catch(() => ({}))
          : await res.text().catch(() => '');

        console.error('Ad creation error', errorBody);
        const userMsg = extractMetaUserMessage(errorBody);

        if ((res.status === 400 || res.status === 415) && sourceType === 'upload' && uploadedFile) {
          const retryRes = await fetch(`${baseUrl}/api/meta/ads`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(jsonBody),
          });

          if (!retryRes.ok) {
            const retryContentType = retryRes.headers.get('content-type') ?? '';
            const retryBody: unknown = retryContentType.includes('application/json')
              ? await retryRes.json().catch(() => ({}))
              : await retryRes.text().catch(() => '');

            console.error('Ad creation error (JSON fallback)', retryBody);
            const retryMsg = extractMetaUserMessage(retryBody);
            toast.error(retryMsg ? `Meta API: ${retryMsg}` : 'An error occurred while creating the ad.');
            return;
          }

          const createdRetry: unknown = await retryRes.json().catch(() => ({}));
          const createdRetryId = extractCreatedId(createdRetry);
          if (createdRetryId) {
            toast.success('New ad created and submitted for review.');
          } else {
            toast.success('New ad created and submitted for review.');
          }

          onClose();
          setSelectedAdSetId('');
          setAdName('');
          setPageId('');
          setLinkUrl('');
          setMessage('');
          setHeadline('');
          setDescription('');
          setCallToAction('LEARN_MORE');
          setSelectedAiImage(null);
          setSourceType('upload');
          setMediaType('image');
          setCreativeFormat('1:1');
          setUploadedFile(null);
          setUploadedMeta(null);
          setVideoThumbDataUrl(null);
          setManualThumbFile(null);
          if (manualThumbPreviewUrl) URL.revokeObjectURL(manualThumbPreviewUrl);
          setManualThumbPreviewUrl(null);
          if (uploadedPreviewUrl) URL.revokeObjectURL(uploadedPreviewUrl);
          setUploadedPreviewUrl(null);
          return;
        }

        toast.error(userMsg ? `Meta API: ${userMsg}` : 'An error occurred while creating the ad.');
        return;
      }

      const created: unknown = await res.json().catch(() => ({}));
      const createdId = extractCreatedId(created);

      if (createdId) {
        toast.success('New ad created and submitted for review.');
      } else {
        toast.success('New ad created and submitted for review.');
      }

      onClose();
      setSelectedAdSetId('');
      setAdName('');
      setPageId('');
      setLinkUrl('');
      setMessage('');
      setHeadline('');
      setDescription('');
      setCallToAction('LEARN_MORE');
      setSelectedAiImage(null);
      setSourceType('upload');
      setMediaType('image');
      setCreativeFormat('1:1');
      setUploadedFile(null);
      setUploadedMeta(null);
      setVideoThumbDataUrl(null);
      setManualThumbFile(null);
      if (manualThumbPreviewUrl) URL.revokeObjectURL(manualThumbPreviewUrl);
      setManualThumbPreviewUrl(null);
      if (uploadedPreviewUrl) URL.revokeObjectURL(uploadedPreviewUrl);
      setUploadedPreviewUrl(null);
    } catch (error) {
      console.error('Error creating ad', error);
      toast.error('An error occurred while creating the ad.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinish = () => {
    if (!selectedAdSetId || !adName || !pageId || !linkUrl) {
      toast.error('Please fill in ad set, ad name, page ID, and link URL.');
      return;
    }

    if (sourceType === 'upload' && !uploadedFile) {
      toast.error('Please upload an image or video.');
      return;
    }

    if (sourceType === 'ai' && !selectedAiImage) {
      toast.error('Please select a creative from the AI library.');
      return;
    }

    setIsConfirmOpen(true);
  };

  if (!isOpen) return null;

  const steps = [
    {
      key: 'setup',
      title: 'Target & Identity',
      isValid: Boolean(selectedAdSetId && adName.trim() && pageId.trim() && linkUrl.trim()),
      content: (
        <div className="space-y-10">
          <div className="space-y-3">
            <p className="text-xs font-bold text-brand-black/70 uppercase">Target</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="form-label">Campaign</label>
                <select className="form-select-muted cursor-not-allowed text-brand-black/70" disabled>
                  <option>Selected ad set&apos;s campaign</option>
                </select>
              </div>
              <div>
                <label className="form-label">Ad Set</label>
                <select value={selectedAdSetId} onChange={(e) => setSelectedAdSetId(e.target.value)} className="form-select">
                  <option value="">Select ad set</option>
                  {adSets.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-bold text-brand-black/70 uppercase">Ad Details</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="form-label">Ad Name</label>
                <input
                  type="text"
                  placeholder="e.g. Story_Video_v1"
                  value={adName}
                  onChange={(e) => setAdName(e.target.value)}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Facebook Page ID</label>
                <input
                  type="text"
                  placeholder="1234567890"
                  value={pageId}
                  onChange={(e) => setPageId(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="form-label">Target URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Status</label>
                <input
                  type="text"
                  value="Draft (pending review)"
                  readOnly
                  className="form-input bg-paper-white text-brand-black/70"
                />
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'creative',
      title: 'Creative Media',
      isValid: sourceType === 'upload' ? Boolean(uploadedFile) : Boolean(selectedAiImage),
      content: (
        <div className="space-y-10">
          <div className="space-y-3">
            <p className="text-xs font-bold text-brand-black/70 uppercase">Source</p>
            <div className="flex p-1 bg-paper-white border-2 border-brand-black rounded-[2px]">
              <button
                type="button"
                onClick={() => setSourceType('upload')}
                className={`flex-1 py-3 text-sm font-bold rounded-[2px] transition-all flex items-center justify-center gap-2 ${
                  sourceType === 'upload' ? 'bg-brand-black text-brand-white' : 'text-brand-black/70 hover:text-brand-black'
                }`}
              >
                <Upload size={16} />
                Upload Media
              </button>
              <button
                type="button"
                onClick={() => setSourceType('ai')}
                className={`flex-1 py-3 text-sm font-bold rounded-[2px] transition-all flex items-center justify-center gap-2 ${
                  sourceType === 'ai' ? 'bg-brand-black text-brand-white' : 'text-brand-black/70 hover:text-brand-black'
                }`}
              >
                <Sparkles size={16} />
                AI Library
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-bold text-brand-black/70 uppercase">Format</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="form-label">Media Type</label>
                <div className="flex p-1 bg-paper-white border-2 border-brand-black rounded-[2px]">
                  <button
                    type="button"
                    onClick={() => setMediaType('image')}
                    className={`flex-1 py-3 text-sm font-bold rounded-[2px] transition-all flex items-center justify-center gap-2 ${
                      mediaType === 'image' ? 'bg-brand-black text-brand-white' : 'text-brand-black/70 hover:text-brand-black'
                    }`}
                  >
                    <ImageIcon size={16} />
                    Image
                  </button>
                  <button
                    type="button"
                    onClick={() => setMediaType('video')}
                    className={`flex-1 py-3 text-sm font-bold rounded-[2px] transition-all flex items-center justify-center gap-2 ${
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
                <select
                  value={creativeFormat}
                  onChange={(e) => setCreativeFormat(e.target.value as typeof creativeFormat)}
                  className="form-select"
                >
                  <option value="1:1">1:1 (Square)</option>
                  <option value="4:5">4:5 (Vertical Feed)</option>
                  <option value="9:16">9:16 (Story / Reels)</option>
                  <option value="1.91:1">1.91:1 (Landscape)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-bold text-brand-black/70 uppercase">Selection</p>
            {sourceType === 'upload' ? (
              <div
                className="border-2 border-dashed border-brand-black rounded-[2px] p-10 flex flex-col items-center justify-center text-center hover:bg-paper-white transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={mediaType === 'video' ? 'video/*' : 'image/*'}
                  className="hidden"
                  onChange={(e) => handleUploadFile(e.target.files?.[0] ?? null)}
                />
                <Upload size={24} className="text-brand-black/60 mb-3" />
                <p className="text-sm text-brand-black/70">{uploadedFile ? uploadedFile.name : 'Drag & drop or click to select'}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => setSelectedAiImage(i.toString())}
                    className={`aspect-square bg-paper-white rounded-[2px] flex items-center justify-center cursor-pointer border-2 relative transition-colors ${
                      selectedAiImage === i.toString() ? 'border-action-blue' : 'border-brand-black/20 hover:border-brand-black'
                    }`}
                  >
                    <Sparkles size={18} className="text-brand-black/30" />
                    {selectedAiImage === i.toString() && (
                      <div className="absolute top-2 right-2 bg-action-blue w-3 h-3 rounded-[2px]" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {sourceType === 'upload' && mediaType === 'video' && (
              <div className="border-2 border-brand-black rounded-[2px] bg-paper-white p-5">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-brand-black">Thumbnail</p>
                    <p className="text-sm text-brand-black/70 mt-1">
                      You can upload a custom thumbnail. If not, one will be auto-selected.
                    </p>
                  </div>
                  <Button type="button" onClick={() => thumbInputRef.current?.click()} variant="secondary" className="shrink-0">
                    Select Thumbnail
                  </Button>
                  <input
                    ref={thumbInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleUploadThumbnail(e.target.files?.[0] ?? null)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'copy',
      title: 'Copy',
      isValid: true,
      content: (
        <div className="space-y-10">
          <div className="space-y-3">
            <p className="text-xs font-bold text-brand-black/70 uppercase">Headline & CTA</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="form-label">Headline</label>
                <input
                  type="text"
                  placeholder="e.g. Summer Sale Now On"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">CTA</label>
                <select
                  value={callToAction}
                  onChange={(e) => setCallToAction(e.target.value as typeof callToAction)}
                  className="form-select"
                >
                  <option value="LEARN_MORE">Learn More</option>
                  <option value="SHOP_NOW">Shop Now</option>
                  <option value="SIGN_UP">Sign Up</option>
                  <option value="SEND_MESSAGE">Send Message</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-bold text-brand-black/70 uppercase">Text</p>
            <div>
              <label className="form-label">Primary Text</label>
              <textarea
                rows={6}
                className="form-textarea"
                placeholder="Ad copy..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            <div>
              <label className="form-label">Description</label>
              <textarea
                rows={3}
                className="form-textarea"
                placeholder="e.g. Free shipping and fast delivery"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'review',
      title: 'Review & Submit',
      isValid: Boolean(selectedAdSetId && adName.trim() && pageId.trim() && linkUrl.trim()) &&
        (sourceType === 'upload' ? Boolean(uploadedFile) : Boolean(selectedAiImage)),
      content: (
        <div className="space-y-10">
          <div className="border-2 border-brand-black rounded-[2px] bg-paper-white p-6">
            <p className="text-xs font-bold text-brand-black/70 uppercase">Summary</p>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border-2 border-brand-black rounded-[2px] bg-brand-white p-4">
                <p className="text-xs font-bold text-brand-black/70 uppercase">Ad Set</p>
                <p className="text-sm font-bold text-brand-black mt-1">{selectedAdSetId || '-'}</p>
              </div>
              <div className="border-2 border-brand-black rounded-[2px] bg-brand-white p-4">
                <p className="text-xs font-bold text-brand-black/70 uppercase">Ad Name</p>
                <p className="text-sm font-bold text-brand-black mt-1">{adName || '-'}</p>
              </div>
              <div className="border-2 border-brand-black rounded-[2px] bg-brand-white p-4">
                <p className="text-xs font-bold text-brand-black/70 uppercase">Page ID</p>
                <p className="text-sm font-bold text-brand-black mt-1">{pageId || '-'}</p>
              </div>
              <div className="border-2 border-brand-black rounded-[2px] bg-brand-white p-4">
                <p className="text-xs font-bold text-brand-black/70 uppercase">Target URL</p>
                <p className="text-sm font-bold text-brand-black mt-1 truncate">{linkUrl || '-'}</p>
              </div>
            </div>

            <div className="mt-6 border-2 border-brand-black rounded-[2px] bg-brand-white p-4">
              <p className="text-xs font-bold text-brand-black/70 uppercase">Creative</p>
              <p className="text-sm text-brand-black/70 mt-2">
                Source: <span className="font-bold text-brand-black">{sourceType === 'upload' ? 'Upload' : 'AI'}</span>
                <span className="mx-2">•</span>
                Media: <span className="font-bold text-brand-black">{mediaType}</span>
                <span className="mx-2">•</span>
                Format: <span className="font-bold text-brand-black">{creativeFormat}</span>
              </p>
            </div>

            <div className="mt-6 border-2 border-brand-black rounded-[2px] bg-brand-white p-4">
              <p className="text-xs font-bold text-brand-black/70 uppercase">Copy</p>
              <p className="text-sm font-bold text-brand-black mt-2 truncate">{headline || 'No headline'}</p>
              <p className="text-sm text-brand-black/70 mt-2 whitespace-pre-wrap">{message || 'No text'}</p>
            </div>
          </div>

          <div className="border-2 border-brand-black rounded-[2px] bg-paper-white p-6">
            <p className="text-sm font-bold text-brand-black">Final step</p>
            <p className="text-sm text-brand-black/70 mt-2">
              Review the preview on the right before submitting for approval.
            </p>
          </div>
        </div>
      ),
    },
  ] as const;

  const totalSteps = steps.length;
  const activeStep = steps[currentStep];
  const canGoBack = currentStep > 0;
  const canGoNext = currentStep < totalSteps - 1;
  const stepIsValid = Boolean(activeStep?.isValid);

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity" onClick={onClose} />
      <div className="fixed inset-0 z-40 pointer-events-none p-4 md:p-6">
        <div className="bg-brand-white border-2 border-brand-black rounded-[2px] w-full max-w-[1440px] mx-auto pointer-events-auto flex flex-col overflow-hidden max-h-[90vh] min-h-0">
          <div className="px-8 py-6 border-b-2 border-brand-black bg-paper-white flex items-start justify-between gap-6">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-black rounded-[2px] text-brand-white shrink-0">
                  <ImageIcon size={18} />
                </div>
                <div className="min-w-0">
                  <h2 className="text-xl font-bold text-brand-black">New Ad</h2>
                  <p className="text-sm text-brand-black/70 mt-1">
                    {activeStep.title} • Step {currentStep + 1} / {totalSteps}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {steps.map((s, idx) => {
                  const isActive = idx === currentStep;
                  const isDone = idx < currentStep;
                  return (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => setCurrentStep(idx)}
                      className={`px-3 py-2 border-2 rounded-[2px] text-xs font-bold transition-colors ${
                        isActive
                          ? 'border-brand-black bg-brand-black text-brand-white'
                          : isDone
                            ? 'border-brand-black bg-brand-white text-brand-black'
                            : 'border-brand-black/30 bg-brand-white text-brand-black/60 hover:border-brand-black hover:text-brand-black'
                      }`}
                    >
                      {idx + 1}. {s.title}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 hover:bg-paper-white rounded-[2px] border border-transparent hover:border-brand-black transition-colors text-brand-black/60 hover:text-brand-black"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto lg:overflow-hidden">
            <div className="min-h-0 flex flex-col lg:grid lg:grid-cols-12 lg:overflow-hidden">
              <div className="flex-1 min-h-0 lg:col-span-7 xl:col-span-7 lg:overflow-y-auto p-6 md:p-8">
                {activeStep.content}
              </div>

              <div className="min-h-0 lg:col-span-5 xl:col-span-5 lg:overflow-y-auto p-6 md:p-8 bg-paper-white border-t-2 border-brand-black lg:border-t-0 lg:border-l-2">
                <div className="border-2 border-brand-black rounded-[2px] bg-brand-white p-6">
                <p className="text-xs font-bold text-brand-black/70 uppercase">Preview</p>
                <div className="mt-4 bg-brand-white border-2 border-brand-black rounded-[2px] overflow-hidden">
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
                        <Image
                          src={uploadedPreviewUrl}
                          alt="Preview"
                          fill
                          unoptimized
                          sizes="(min-width: 1024px) 520px, 100vw"
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
                  <div className="p-4 border-t-2 border-brand-black">
                    <p className="text-base font-bold text-brand-black truncate">{headline || 'Headline'}</p>
                    <p className="text-sm text-brand-black/70 mt-2 line-clamp-3">{message || 'Text'}</p>
                    <p className="text-xs text-brand-black/70 mt-3">Format: {creativeFormat} • CTA: {callToAction}</p>
                  </div>
                </div>

                {sourceType === 'upload' && uploadedFile && (
                  <div className="mt-6 border-2 border-brand-black rounded-[2px] bg-paper-white p-5">
                    <p className="text-xs font-bold text-brand-black/70 uppercase">File Checks</p>
                    {creativeChecks.metaText.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {creativeChecks.metaText.map((t) => (
                          <span
                            key={t}
                            className="px-2 py-1 border-2 border-brand-black rounded-[2px] bg-brand-white text-xs font-mono text-brand-black/70"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}

                    {creativeChecks.warnings.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {creativeChecks.warnings.map((w, idx) => (
                          <div key={idx} className="border-2 border-brand-black rounded-[2px] bg-brand-white p-3">
                            <p className={`text-sm font-bold ${w.level === 'warn' ? 'text-alert-red' : 'text-brand-black'}`}>
                              {w.level === 'warn' ? 'Warning' : 'Info'}
                            </p>
                            <p className="text-sm text-brand-black/70 mt-1">{w.text}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            </div>
          </div>

          <div className="px-8 py-6 border-t-2 border-brand-black bg-paper-white flex items-center justify-between gap-4">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>

            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
                disabled={!canGoBack || isSubmitting}
                icon={<ChevronLeft size={16} />}
              >
                Back
              </Button>

              {canGoNext ? (
                <Button
                  variant="primary"
                  onClick={() => setCurrentStep((s) => Math.min(totalSteps - 1, s + 1))}
                  disabled={!stepIsValid || isSubmitting}
                  icon={<ChevronRight size={16} />}
                >
                  Next
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={() => handleFinish()}
                  disabled={!stepIsValid || isSubmitting}
                  icon={<Check size={16} />}
                >
                  Submit for Review
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={isConfirmOpen}
        title="Are you sure?"
        message="A new ad will be created and submitted for review."
        confirmText="Yes, Publish"
        cancelText="Cancel"
        variant="primary"
        loading={isSubmitting}
        onClose={() => {
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
