'use client';

import { useEffect, useMemo, useState } from 'react';
import { Copy, X } from 'lucide-react';

type EntityType = 'campaign' | 'adset' | 'ad';

export interface DuplicateEntityModalProps {
  isOpen: boolean;
  entity: EntityType;
  sourceName: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

function entityLabel(entity: EntityType) {
  if (entity === 'campaign') return 'Campaign';
  if (entity === 'adset') return 'Ad Set';
  return 'Ad';
}

function defaultHint(entity: EntityType) {
  if (entity === 'campaign') {
    return 'Campaign will be duplicated. Child ad sets and ads will also be copied. The new campaign will open as "Paused".';
  }
  if (entity === 'adset') {
    return 'Ad set will be duplicated. Child ads will also be copied. The new ad set will open as "Paused".';
  }
  return 'Ad will be duplicated. The new ad will open as "Paused".';
}

export function DuplicateEntityModal({ isOpen, entity, sourceName, onClose, onConfirm }: DuplicateEntityModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setIsSubmitting(false);
  }, [isOpen]);

  const hint = useMemo(() => defaultHint(entity), [entity]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity" onClick={() => (!isSubmitting ? onClose() : null)} />
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4">
        <div className="bg-brand-white border-2 border-brand-black rounded-[2px] w-full max-w-lg pointer-events-auto flex flex-col max-h-[90vh] min-h-0 overflow-hidden animate-in zoom-in-95 duration-200">
          <div className="px-6 py-5 border-b-2 border-brand-black bg-paper-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-paper-white border-2 border-brand-black rounded-[2px] text-brand-black">
                <Copy size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-brand-black">Duplicate</h2>
                <p className="text-xs text-brand-black/70">Create a copy of this {entityLabel(entity).toLowerCase()}.</p>
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

          <div className="p-6 space-y-4 overflow-y-auto flex-1 min-h-0">
            <div className="border-2 border-brand-black rounded-[2px] bg-paper-white p-4">
              <p className="text-xs font-bold text-brand-black/70 uppercase">Source</p>
              <p className="text-sm font-bold text-brand-black mt-1">{sourceName}</p>
            </div>

            <div className="border-2 border-brand-black rounded-[2px] bg-brand-white p-4">
              <p className="text-xs font-bold text-brand-black/70 uppercase">What happens?</p>
              <p className="text-sm text-brand-black/70 mt-1 leading-relaxed">{hint}</p>
            </div>
          </div>

          <div className="px-6 py-4 border-t-2 border-brand-black bg-paper-white flex items-center justify-end gap-3">
            <button type="button" className="minimal-button secondary" disabled={isSubmitting} onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="minimal-button primary"
              disabled={isSubmitting}
              onClick={() => {
                if (isSubmitting) return;
                setIsSubmitting(true);
                void (async () => {
                  try {
                    await onConfirm();
                    onClose();
                  } finally {
                    setIsSubmitting(false);
                  }
                })();
              }}
            >
              {isSubmitting ? 'Creating…' : 'Yes, Duplicate'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
