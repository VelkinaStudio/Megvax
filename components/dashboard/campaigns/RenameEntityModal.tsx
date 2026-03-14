'use client';

import { useEffect, useMemo, useState } from 'react';
import { Pencil, X } from 'lucide-react';

type EntityType = 'campaign' | 'adset' | 'ad';

export interface RenameEntityModalProps {
  isOpen: boolean;
  entity: EntityType;
  currentName: string;
  onClose: () => void;
  onSave: (name: string) => Promise<void>;
}

function entityLabel(entity: EntityType) {
  if (entity === 'campaign') return 'Campaign';
  if (entity === 'adset') return 'Ad Set';
  return 'Ad';
}

export function RenameEntityModal({ isOpen, entity, currentName, onClose, onSave }: RenameEntityModalProps) {
  const [name, setName] = useState(currentName);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setName(currentName);
    setIsSaving(false);
  }, [currentName, isOpen]);

  const canSave = useMemo(() => {
    const trimmed = name.trim();
    return trimmed.length > 1 && trimmed !== currentName.trim() && !isSaving;
  }, [currentName, isSaving, name]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity" onClick={() => (!isSaving ? onClose() : null)} />
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4">
        <div className="bg-brand-white border-2 border-brand-black rounded-[2px] w-full max-w-lg pointer-events-auto flex flex-col max-h-[90vh] min-h-0 overflow-hidden animate-in zoom-in-95 duration-200">
          <div className="px-6 py-5 border-b-2 border-brand-black bg-paper-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-paper-white border-2 border-brand-black rounded-[2px] text-brand-black">
                <Pencil size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-brand-black">Rename</h2>
                <p className="text-xs text-brand-black/70">Update the {entityLabel(entity).toLowerCase()} name.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => (!isSaving ? onClose() : null)}
              className="p-2 hover:bg-paper-white rounded-[2px] border border-transparent hover:border-brand-black transition-colors text-brand-black/60 hover:text-brand-black"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6 space-y-4 overflow-y-auto flex-1 min-h-0">
            <div>
              <label className="form-label">New Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
                placeholder="e.g. US - Prospecting - Lead"
                autoFocus
              />
              <p className="text-xs text-brand-black/60 mt-2">Tip: Adding country/target/segment improves readability for agency use.</p>
            </div>
          </div>

          <div className="px-6 py-4 border-t-2 border-brand-black bg-paper-white flex items-center justify-end gap-3">
            <button
              type="button"
              className="minimal-button secondary"
              disabled={isSaving}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="minimal-button primary"
              disabled={!canSave}
              onClick={() => {
                if (!canSave) return;
                setIsSaving(true);
                void (async () => {
                  try {
                    await onSave(name.trim());
                    onClose();
                  } finally {
                    setIsSaving(false);
                  }
                })();
              }}
            >
              {isSaving ? 'Kaydediliyor…' : 'Kaydet'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
