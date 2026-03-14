'use client';

import { X, AlertTriangle } from 'lucide-react';

type ConfirmVariant = 'primary' | 'danger';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
  isConfirmLoading?: boolean;
  confirmHint?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'primary',
  isConfirmLoading = false,
  confirmHint,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const confirmClassName =
    variant === 'danger'
      ? 'bg-alert-red text-brand-white'
      : 'bg-brand-black text-brand-white';

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity" onClick={onCancel} />
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4">
        <div className="bg-brand-white rounded-[2px] border-2 border-brand-black w-full max-w-md pointer-events-auto flex flex-col animate-in zoom-in-95 duration-200">
          <div className="px-6 py-5 border-b border-brand-black flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-paper-white rounded-[2px] text-brand-black border border-brand-black">
                <AlertTriangle size={18} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-brand-black">{title}</h2>
                {description && <p className="text-sm text-brand-black/70 mt-0.5">{description}</p>}
              </div>
            </div>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-paper-white rounded-[2px] transition-colors text-brand-black/60 hover:text-brand-black border border-transparent hover:border-brand-black"
              aria-label="Kapat"
            >
              <X size={20} />
            </button>
          </div>

          {confirmHint && (
            <div className="px-6 py-4">
              <div className="border-2 border-brand-black bg-paper-white rounded-[2px] p-4 text-sm text-brand-black leading-relaxed">
                {confirmHint}
              </div>
            </div>
          )}

          <div className="px-6 py-4 border-t border-brand-black bg-paper-white flex justify-end gap-3">
            <button
              onClick={onCancel}
              disabled={isConfirmLoading}
              className="minimal-button secondary disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              disabled={isConfirmLoading}
              className={`minimal-button disabled:opacity-60 disabled:cursor-not-allowed ${confirmClassName}`}
            >
              {isConfirmLoading ? 'Processing…' : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
