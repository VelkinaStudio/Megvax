'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui';
import { X, Check, Loader2, Facebook } from 'lucide-react';
import { api, ApiError } from '@/lib/api';

interface ConnectAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- onConnect called after successful OAuth flow (Phase 2)
export function ConnectAccountModal({ isOpen, onClose, onConnect }: ConnectAccountModalProps) {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'success'>('idle');
  const toast = useToast();

  if (!isOpen) return null;

  const handleConnect = async () => {
    setStatus('connecting');
    try {
      const data = await api<{ url: string }>('/meta/auth-url');
      window.location.href = data.url; // Redirect to Facebook OAuth
    } catch (error) {
      if (error instanceof ApiError && error.status === 403) {
        toast.error('Yalnızca yöneticiler Meta hesabı bağlayabilir');
      } else {
        toast.error('Meta bağlantısı başlatılamadı');
      }
      setStatus('idle');
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4">
        <div className="bg-brand-white border-2 border-brand-black rounded-[2px] w-full max-w-md pointer-events-auto flex flex-col items-center text-center p-8 animate-in zoom-in-95 duration-200">
          
          {/* Close Button */}
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 p-2 hover:bg-paper-white rounded-[2px] border border-transparent hover:border-brand-black transition-colors text-brand-black/60 hover:text-brand-black"
          >
            <X size={20} />
          </button>

          {/* Content */}
          {status === 'idle' && (
            <>
              <div className="w-16 h-16 bg-paper-white border-2 border-brand-black rounded-[2px] flex items-center justify-center mb-6 text-action-blue">
                <Facebook size={32} />
              </div>
              <h2 className="text-xl font-bold text-brand-black mb-2">Connect Meta Account</h2>
              <p className="text-sm text-brand-black/70 mb-8 max-w-xs leading-relaxed">
                Authorize Megvax with Meta Business Manager to access and manage your ad accounts.
              </p>
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleConnect}
                icon={<Facebook size={20} className="fill-white" />}
              >
                Continue with Facebook
              </Button>
              <p className="mt-4 text-xs text-brand-black/60">
                Secure connection. You can revoke permissions at any time.
              </p>
            </>
          )}

          {status === 'connecting' && (
            <div className="py-8 flex flex-col items-center">
              <Loader2 size={48} className="text-action-blue animate-spin mb-6" />
              <h3 className="text-lg font-bold text-brand-black mb-2">Connecting...</h3>
              <p className="text-sm text-brand-black/70">Communicating with Meta servers.</p>
            </div>
          )}

          {status === 'success' && (
            <div className="py-8 flex flex-col items-center animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 bg-brand-black rounded-[2px] flex items-center justify-center mb-6 text-brand-white">
                <Check size={32} strokeWidth={3} />
              </div>
              <h3 className="text-lg font-bold text-brand-black mb-2">Success!</h3>
              <p className="text-sm text-brand-black/70">Your account has been connected successfully.</p>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
