'use client';

import { useEffect, useMemo, useState } from 'react';
import { Frame, Link2, X } from 'lucide-react';

export interface CreativeSwapModalProps {
  isOpen: boolean;
  adName: string;
  currentPreviewUrl: string;
  onClose: () => void;
  onConfirm: (nextPreviewUrl: string) => Promise<void>;
}

export function CreativeSwapModal({
  isOpen,
  adName,
  currentPreviewUrl,
  onClose,
  onConfirm,
}: CreativeSwapModalProps) {
  const [nextUrl, setNextUrl] = useState(currentPreviewUrl);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setNextUrl(currentPreviewUrl);
    setIsSubmitting(false);
  }, [currentPreviewUrl, isOpen]);

  const canSubmit = useMemo(() => {
    const trimmed = nextUrl.trim();
    return trimmed.length > 6 && trimmed !== currentPreviewUrl.trim() && !isSubmitting;
  }, [currentPreviewUrl, isSubmitting, nextUrl]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity" onClick={() => (!isSubmitting ? onClose() : null)} />
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4">
        <div className="bg-brand-white border-2 border-brand-black rounded-[2px] w-full max-w-3xl pointer-events-auto flex flex-col max-h-[90vh] min-h-0 overflow-hidden animate-in zoom-in-95 duration-200">
          <div className="px-6 py-5 border-b-2 border-brand-black bg-paper-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-paper-white border-2 border-brand-black rounded-[2px] text-brand-black">
                <Frame size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-brand-black">Swap Creative</h2>
                <p className="text-xs text-brand-black/70">Ad: {adName}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => (!isSubmitting ? onClose() : null)}
              className="p-2 hover:bg-paper-white rounded-[2px] border border-transparent hover:border-brand-black transition-colors text-brand-black/60 hover:text-brand-black"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 min-h-0">
              <div className="p-6 border-b-2 lg:border-b-0 lg:border-r-2 border-brand-black">
                <p className="text-xs font-bold text-brand-black/70 uppercase">Current</p>
                <div className="mt-3 border-2 border-brand-black rounded-[2px] bg-paper-white p-4">
                  <p className="text-xs text-brand-black/70 font-mono break-all">{currentPreviewUrl || '-'}</p>
                </div>
                <div className="mt-4 border-2 border-brand-black rounded-[2px] bg-brand-white overflow-hidden">
                  <div className="aspect-video bg-paper-white" />
                  <div className="p-3 border-t-2 border-brand-black">
                    <p className="text-xs text-brand-black/70">Preview mock: in real integration, creative will be rendered from URL.</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <p className="text-xs font-bold text-brand-black/70 uppercase">New Creative URL</p>
                <div className="mt-3">
                  <label className="form-label">Preview URL</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-black/70">
                      <Link2 size={16} />
                    </span>
                    <input
                      value={nextUrl}
                      onChange={(e) => setNextUrl(e.target.value)}
                      className="form-input pl-9"
                      placeholder="https://..."
                      autoFocus
                    />
                  </div>
                  <p className="text-xs text-brand-black/60 mt-2">
                    Note: On Meta&apos;s side, creative swaps usually require a new Ad Creative + publish flow. This screen is a controlled &quot;swap&quot; mock in v1.
                  </p>
                </div>

                <div className="mt-4 border-2 border-brand-black rounded-[2px] bg-paper-white p-4">
                  <p className="text-xs font-bold text-brand-black/70 uppercase">Safe Flow</p>
                  <p className="text-sm text-brand-black/70 mt-1 leading-relaxed">
                    1) New creative is validated.
                    <br />
                    2) Tested on ad copy.
                    <br />
                    3) After approval, swap is applied to the live ad.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t-2 border-brand-black bg-paper-white flex items-center justify-end gap-3">
            <button type="button" className="minimal-button secondary" disabled={isSubmitting} onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="minimal-button primary"
              disabled={!canSubmit}
              onClick={() => {
                if (!canSubmit) return;
                setIsSubmitting(true);
                void (async () => {
                  try {
                    await onConfirm(nextUrl.trim());
                    onClose();
                  } finally {
                    setIsSubmitting(false);
                  }
                })();
              }}
            >
              {isSubmitting ? 'Applying…' : 'Update Creative'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
