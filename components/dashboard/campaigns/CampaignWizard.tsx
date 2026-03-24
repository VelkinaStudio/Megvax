'use client';

import { useEffect, useRef, useState } from 'react';
import { WizardModal } from './WizardModal';
import {
  ObjectiveStep,
  CampaignSettingsStep,
  AdSetStep,
  AdStep,
  AdSetPresetSettings,
  BudgetType,
  CreativeCta,
  CreativeFormat,
  CreativeMediaType,
  CreativeSourceType,
  UploadedCreativeMeta,
} from './CampaignWizardSteps';
import { useToast } from '@/components/ui/Toast';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { createArchiveChainUndoAction } from '@/components/ui/toastUndo';

interface CampaignWizardProps {
  isOpen: boolean;
  onClose: () => void;
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

  const campaign = root.campaign;
  if (campaign && typeof campaign === 'object') {
    const campaignObj = campaign as Record<string, unknown>;
    if (typeof campaignObj.id === 'string') return campaignObj.id;
  }

  return undefined;
}

function extractNestedCreatedId(created: unknown, nestedKey: string): string | undefined {
  if (!created || typeof created !== 'object') return undefined;
  const root = created as Record<string, unknown>;
  if (typeof root.id === 'string') return root.id;

  const nested = root[nestedKey];
  if (nested && typeof nested === 'object') {
    const nestedObj = nested as Record<string, unknown>;
    if (typeof nestedObj.id === 'string') return nestedObj.id;
  }

  return undefined;
}

export function CampaignWizard({ isOpen, onClose }: CampaignWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [objective, setObjective] = useState('');
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const [campaignName, setCampaignName] = useState('');
  const [campaignBudgetType, setCampaignBudgetType] = useState<BudgetType>('daily');
  const [campaignBudgetAmount, setCampaignBudgetAmount] = useState('');

  const [adSetName, setAdSetName] = useState('');
  const [adSetDailyBudget, setAdSetDailyBudget] = useState('');
  const [adSetPreset, setAdSetPreset] = useState<AdSetPresetSettings>({
    startAt: '',
    hasEnd: false,
    endAt: '',
    placementMode: 'advantage',
    placements: ['facebook_feed', 'instagram_feed', 'instagram_story', 'instagram_reels'],
    optimizationGoal: 'CONVERSIONS',
    bidStrategy: 'LOWEST_COST',
    bidAmount: '',
  });

  const [creativeSourceType, setCreativeSourceType] = useState<CreativeSourceType>('upload');
  const [selectedAiImage, setSelectedAiImage] = useState<string | null>(null);
  const [creativeMediaType, setCreativeMediaType] = useState<CreativeMediaType>('image');
  const [creativeFormat, setCreativeFormat] = useState<CreativeFormat>('1:1');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedPreviewUrl, setUploadedPreviewUrl] = useState<string | null>(null);
  const [uploadedMeta, setUploadedMeta] = useState<UploadedCreativeMeta | null>(null);
  const [videoThumbDataUrl, setVideoThumbDataUrl] = useState<string | null>(null);
  const [manualThumbFile, setManualThumbFile] = useState<File | null>(null);
  const [manualThumbPreviewUrl, setManualThumbPreviewUrl] = useState<string | null>(null);

  const [adPrimaryText, setAdPrimaryText] = useState('');
  const [adHeadline, setAdHeadline] = useState('');
  const [adDescription, setAdDescription] = useState('');
  const [adCallToAction, setAdCallToAction] = useState<CreativeCta>('LEARN_MORE');
  const [adPageId, setAdPageId] = useState('');
  const [adLinkUrl, setAdLinkUrl] = useState('');

  const objectUrlRef = useRef<{ preview?: string; thumb?: string }>({});

  useEffect(() => {
    if (!isOpen) {
      setIsConfirmOpen(false);
      setIsSubmitting(false);
      setCurrentStep(0);
      setObjective('');
      setCampaignName('');
      setCampaignBudgetType('daily');
      setCampaignBudgetAmount('');
      setAdSetName('');
      setAdSetDailyBudget('');
      setAdSetPreset({
        startAt: '',
        hasEnd: false,
        endAt: '',
        placementMode: 'advantage',
        placements: ['facebook_feed', 'instagram_feed', 'instagram_story', 'instagram_reels'],
        optimizationGoal: 'CONVERSIONS',
        bidStrategy: 'LOWEST_COST',
        bidAmount: '',
      });
      setCreativeSourceType('upload');
      setSelectedAiImage(null);
      setCreativeMediaType('image');
      setCreativeFormat('1:1');
      setUploadedFile(null);
      setUploadedMeta(null);
      setVideoThumbDataUrl(null);
      setManualThumbFile(null);
      if (objectUrlRef.current.thumb) URL.revokeObjectURL(objectUrlRef.current.thumb);
      if (objectUrlRef.current.preview) URL.revokeObjectURL(objectUrlRef.current.preview);
      objectUrlRef.current = {};
      setManualThumbPreviewUrl(null);
      setUploadedPreviewUrl(null);
      setAdPrimaryText('');
      setAdHeadline('');
      setAdDescription('');
      setAdCallToAction('LEARN_MORE');
      setAdPageId('');
      setAdLinkUrl('');
    }
  }, [isOpen]);

  const handleUploadCreativeFile = (file: File | null) => {
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    if (!isImage && !isVideo) {
      toast.error('Please select an image or video file.');
      return;
    }

    setCreativeMediaType(isVideo ? 'video' : 'image');

    if (objectUrlRef.current.preview) URL.revokeObjectURL(objectUrlRef.current.preview);
    const previewUrl = URL.createObjectURL(file);
    objectUrlRef.current.preview = previewUrl;

    setUploadedFile(file);
    setUploadedPreviewUrl(previewUrl);
    setUploadedMeta({ sizeBytes: file.size, type: isVideo ? 'video' : 'image' });
    setVideoThumbDataUrl(null);

    setManualThumbFile(null);
    if (objectUrlRef.current.thumb) URL.revokeObjectURL(objectUrlRef.current.thumb);
    objectUrlRef.current.thumb = undefined;
    setManualThumbPreviewUrl(null);

    setSelectedAiImage(null);
    setCreativeSourceType('upload');

    if (isImage) {
      const img = new Image();
      img.onload = () => {
        setUploadedMeta({ sizeBytes: file.size, type: 'image', width: img.naturalWidth, height: img.naturalHeight });
      };
      img.src = previewUrl;
      return;
    }

    if (isVideo) {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.src = previewUrl;
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
    if (objectUrlRef.current.thumb) URL.revokeObjectURL(objectUrlRef.current.thumb);
    const url = URL.createObjectURL(file);
    objectUrlRef.current.thumb = url;
    setManualThumbPreviewUrl(url);
  };

  const steps = [
    { title: 'Campaign Objective', component: <ObjectiveStep selected={objective} onSelect={setObjective} /> },
    {
      title: 'Campaign Settings',
      component: (
        <CampaignSettingsStep
          name={campaignName}
          onNameChange={setCampaignName}
          budgetType={campaignBudgetType}
          onBudgetTypeChange={setCampaignBudgetType}
          budgetAmount={campaignBudgetAmount}
          onBudgetAmountChange={setCampaignBudgetAmount}
        />
      ),
    },
    {
      title: 'Ad Set',
      component: (
        <AdSetStep
          name={adSetName}
          onNameChange={setAdSetName}
          dailyBudget={adSetDailyBudget}
          onDailyBudgetChange={setAdSetDailyBudget}
          settings={adSetPreset}
          onSettingsChange={setAdSetPreset}
        />
      ),
    },
    {
      title: 'Ad Creative',
      component: (
        <AdStep
          sourceType={creativeSourceType}
          onSourceTypeChange={setCreativeSourceType}
          selectedAiImage={selectedAiImage}
          onSelectAiImage={setSelectedAiImage}
          mediaType={creativeMediaType}
          onMediaTypeChange={setCreativeMediaType}
          format={creativeFormat}
          onFormatChange={setCreativeFormat}
          pageId={adPageId}
          onPageIdChange={setAdPageId}
          linkUrl={adLinkUrl}
          onLinkUrlChange={setAdLinkUrl}
          uploadedFile={uploadedFile}
          uploadedPreviewUrl={uploadedPreviewUrl}
          uploadedMeta={uploadedMeta}
          videoThumbDataUrl={videoThumbDataUrl}
          manualThumbPreviewUrl={manualThumbPreviewUrl}
          onUploadFile={handleUploadCreativeFile}
          onUploadThumbnail={handleUploadThumbnail}
          primaryText={adPrimaryText}
          onPrimaryTextChange={setAdPrimaryText}
          headline={adHeadline}
          onHeadlineChange={setAdHeadline}
          description={adDescription}
          onDescriptionChange={setAdDescription}
          callToAction={adCallToAction}
          onCallToActionChange={setAdCallToAction}
        />
      ),
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const executeFinish = async () => {
    if (isSubmitting) return;

    if (!objective) {
      toast.error('Please select a campaign objective.');
      return;
    }

    if (!campaignName.trim()) {
      toast.error('Please enter a campaign name.');
      return;
    }

    if (campaignBudgetAmount && Number(campaignBudgetAmount) < 1) {
      toast.error('Campaign budget cannot be 0.');
      return;
    }

    if (!adSetName.trim()) {
      toast.error('Please enter an ad set name.');
      return;
    }

    if (!adSetDailyBudget || Number(adSetDailyBudget) < 1) {
      toast.error('Please enter the ad set daily budget.');
      return;
    }

    if (!adPageId.trim()) {
      toast.error('Please enter a page ID.');
      return;
    }

    if (!adLinkUrl.trim()) {
      toast.error('Please enter a target URL.');
      return;
    }

    if (creativeSourceType === 'upload' && !uploadedFile) {
      toast.error('Please upload a creative file.');
      return;
    }

    if (creativeSourceType === 'ai' && !selectedAiImage) {
      toast.error('Please select a creative from the AI library.');
      return;
    }

    try {
      setIsSubmitting(true);

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

      const campaignRes = await fetch(`${baseUrl}/api/meta/campaigns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: campaignName.trim(), objective }),
      });

      if (!campaignRes.ok) {
        const errorBody: unknown = await campaignRes.json().catch(() => ({}));
        console.error('Campaign creation error', errorBody);
        const userMsg = extractMetaUserMessage(errorBody);
        toast.error(userMsg ? `Meta API: ${userMsg}` : 'An error occurred while creating the campaign.');
        return;
      }

      const createdCampaign: unknown = await campaignRes.json().catch(() => ({}));
      const createdCampaignId = extractCreatedId(createdCampaign);
      if (!createdCampaignId) {
        toast.error('Campaign created but ID could not be retrieved.');
        return;
      }

      const adSetRes = await fetch(`${baseUrl}/api/meta/adsets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaignId: createdCampaignId,
          name: adSetName.trim(),
          dailyBudget: Number(adSetDailyBudget),
          schedule: {
            startAt: adSetPreset.startAt || undefined,
            endAt: adSetPreset.hasEnd ? adSetPreset.endAt || undefined : undefined,
          },
          placements:
            adSetPreset.placementMode === 'advantage'
              ? { mode: 'advantage' }
              : { mode: 'manual', placements: adSetPreset.placements },
          optimization: {
            goal: adSetPreset.optimizationGoal,
            bidStrategy: adSetPreset.bidStrategy,
            bidAmount: adSetPreset.bidStrategy === 'LOWEST_COST' ? undefined : adSetPreset.bidAmount || undefined,
          },
        }),
      });

      if (!adSetRes.ok) {
        const errorBody: unknown = await adSetRes.json().catch(() => ({}));
        console.error('Ad set creation error', errorBody);

        if (adSetRes.status === 400) {
          const retryRes = await fetch(`${baseUrl}/api/meta/adsets`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              campaignId: createdCampaignId,
              name: adSetName.trim(),
              dailyBudget: Number(adSetDailyBudget),
            }),
          });

          if (!retryRes.ok) {
            const retryBody: unknown = await retryRes.json().catch(() => ({}));
            console.error('Ad set creation error (minimal retry)', retryBody);
            const retryMsg = extractMetaUserMessage(retryBody);
            toast.error(retryMsg ? `Meta API: ${retryMsg}` : 'An error occurred while creating the ad set.');
            return;
          }

          const createdRetry: unknown = await retryRes.json().catch(() => ({}));
          const createdRetryId =
            createdRetry && typeof createdRetry === 'object'
              ? (createdRetry as Record<string, unknown>).id && typeof (createdRetry as Record<string, unknown>).id === 'string'
                ? ((createdRetry as Record<string, unknown>).id as string)
                : (createdRetry as Record<string, unknown>).adset && typeof (createdRetry as Record<string, unknown>).adset === 'object'
                  ? (createdRetry as Record<string, unknown>).adset &&
                    typeof ((createdRetry as Record<string, unknown>).adset as Record<string, unknown>).id === 'string'
                    ? (((createdRetry as Record<string, unknown>).adset as Record<string, unknown>).id as string)
                    : undefined
                  : undefined
              : undefined;

          if (!createdRetryId) {
            toast.error('Ad set created but ID could not be retrieved.');
            return;
          }

          // Swap in retry result to continue the flow
          const createdAdSetId = createdRetryId;

          const creative = {
            source: creativeSourceType,
            mediaType: creativeMediaType,
            format: creativeFormat,
            primaryText: adPrimaryText,
            headline: adHeadline,
            description: adDescription,
            callToAction: adCallToAction,
            thumbnail:
              creativeMediaType === 'video'
                ? {
                    source: manualThumbFile ? 'upload' : 'auto',
                  }
                : undefined,
            upload:
              creativeSourceType === 'upload' && uploadedFile
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
              creativeSourceType === 'ai' && selectedAiImage
                ? {
                    assetId: selectedAiImage,
                  }
                : undefined,
          };

          const adBody = {
            adSetId: createdAdSetId,
            pageId: adPageId.trim(),
            linkUrl: adLinkUrl.trim(),
            name: `${adSetName.trim()} - Kreatif`,
            message: adPrimaryText,
            creative,
          };

          let adRes: Response;
          if (creativeSourceType === 'upload' && uploadedFile) {
            const form = new FormData();
            form.append('data', JSON.stringify(adBody));
            form.append('file', uploadedFile);
            if (manualThumbFile) form.append('thumbnailFile', manualThumbFile);

            adRes = await fetch(`${baseUrl}/api/meta/ads`, {
              method: 'POST',
              body: form,
            });

            if (!adRes.ok && (adRes.status === 400 || adRes.status === 415)) {
              adRes = await fetch(`${baseUrl}/api/meta/ads`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(adBody),
              });
            }
          } else {
            adRes = await fetch(`${baseUrl}/api/meta/ads`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(adBody),
            });
          }

          if (!adRes.ok) {
            const contentType = adRes.headers.get('content-type') ?? '';
            const adErrorBody: unknown = contentType.includes('application/json')
              ? await adRes.json().catch(() => ({}))
              : await adRes.text().catch(() => '');
            console.error('Ad creation error', adErrorBody);
            const adUserMsg = extractMetaUserMessage(adErrorBody);
            toast.error(adUserMsg ? `Meta API: ${adUserMsg}` : 'An error occurred while creating the ad.');
            return;
          }

          toast.success('Campaign + Ad Set + Ad created and submitted for review.');
          onClose();
          return;
        }

        const userMsg = extractMetaUserMessage(errorBody);
        toast.error(userMsg ? `Meta API: ${userMsg}` : 'An error occurred while creating the ad set.');
        return;
      }

      const createdAdSet: unknown = await adSetRes.json().catch(() => ({}));
      const createdAdSetId = extractNestedCreatedId(createdAdSet, 'adset');

      if (!createdAdSetId) {
        toast.error('Ad set created but ID could not be retrieved.');
        return;
      }

      const creative = {
        source: creativeSourceType,
        mediaType: creativeMediaType,
        format: creativeFormat,
        primaryText: adPrimaryText,
        headline: adHeadline,
        description: adDescription,
        callToAction: adCallToAction,
        thumbnail:
          creativeMediaType === 'video'
            ? {
                source: manualThumbFile ? 'upload' : 'auto',
              }
            : undefined,
        upload:
          creativeSourceType === 'upload' && uploadedFile
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
          creativeSourceType === 'ai' && selectedAiImage
            ? {
                assetId: selectedAiImage,
              }
            : undefined,
      };

      const adBody = {
        adSetId: createdAdSetId,
        pageId: adPageId.trim(),
        linkUrl: adLinkUrl.trim(),
        name: `${adSetName.trim()} - Kreatif`,
        message: adPrimaryText,
        creative,
      };

      let adRes: Response;
      if (creativeSourceType === 'upload' && uploadedFile) {
        const form = new FormData();
        form.append('data', JSON.stringify(adBody));
        form.append('file', uploadedFile);
        if (manualThumbFile) form.append('thumbnailFile', manualThumbFile);

        adRes = await fetch(`${baseUrl}/api/meta/ads`, {
          method: 'POST',
          body: form,
        });

        if (!adRes.ok && (adRes.status === 400 || adRes.status === 415)) {
          adRes = await fetch(`${baseUrl}/api/meta/ads`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(adBody),
          });
        }
      } else {
        adRes = await fetch(`${baseUrl}/api/meta/ads`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(adBody),
        });
      }

      if (!adRes.ok) {
        const contentType = adRes.headers.get('content-type') ?? '';
        const errorBody: unknown = contentType.includes('application/json')
          ? await adRes.json().catch(() => ({}))
          : await adRes.text().catch(() => '');
        console.error('Ad creation error', errorBody);
        const userMsg = extractMetaUserMessage(errorBody);
        toast.error(userMsg ? `Meta API: ${userMsg}` : 'An error occurred while creating the ad.');
        return;
      }

      const createdAd: unknown = await adRes.json().catch(() => ({}));
      const createdAdId = extractNestedCreatedId(createdAd, 'ad');

      toast.success('Campaign + Ad Set + Ad created and submitted for review.');
      onClose();
    } catch (error) {
      console.error('Campaign creation error', error);
      toast.error('An error occurred while creating the campaign.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinish = () => {
    if (isSubmitting) return;
    setIsConfirmOpen(true);
  };

  const isStepValid = () => {
    if (currentStep === 0) return !!objective;
    if (currentStep === 1) return !!campaignName.trim();
    if (currentStep === 2) return !!adSetName.trim() && !!adSetDailyBudget && Number(adSetDailyBudget) > 0;
    if (currentStep === 3) {
      if (!adPageId.trim()) return false;
      if (!adLinkUrl.trim()) return false;
      if (creativeSourceType === 'upload') return !!uploadedFile;
      return !!selectedAiImage;
    }
    return true;
  };

  return (
    <>
      <WizardModal
        isOpen={isOpen}
        onClose={() => {
          setIsConfirmOpen(false);
          onClose();
        }}
        title={steps[currentStep].title}
        currentStep={currentStep}
        totalSteps={steps.length}
        onNext={handleNext}
        onBack={handleBack}
        onFinish={handleFinish}
        isStepValid={!isSubmitting && isStepValid()}
      >
        {steps[currentStep].component}
      </WizardModal>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Are you sure?"
        description="A new campaign will be created."
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
