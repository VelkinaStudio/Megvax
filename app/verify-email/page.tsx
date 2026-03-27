'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { useTranslations } from '@/lib/i18n';
import { api, ApiError } from '@/lib/api';

const spring = { type: 'spring' as const, stiffness: 100, damping: 20 };

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const toast = useToast();
  const t = useTranslations('auth');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus('error');
        return;
      }
      try {
        await api('/auth/verify-email', { method: 'POST', body: { token }, skipAuth: true });
        setStatus('success');
        toast.success(t('verify_success_toast'));
      } catch (error) {
        setStatus('error');
        if (error instanceof ApiError) {
          toast.error(error.message);
        }
      }
    };
    void verify();
  }, [token, toast, t]);

  const handleResend = () => {
    setIsResending(true);
    toast.success(t('verify_resend_sent'));
    setTimeout(() => setIsResending(false), 1500);
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={spring}
          className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-black/[0.06] p-8 text-center"
        >
          <div className="w-16 h-16 bg-[#EFF6FF] rounded-2xl flex items-center justify-center mx-auto mb-6 border border-[#2563EB]/10">
            <Loader2 className="w-8 h-8 text-[#2563EB] animate-spin" />
          </div>
          <h1 className="text-2xl font-bold text-[#1A1A1A] mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            {t('verify_title_loading')}
          </h1>
          <p className="text-[#6B7280]">{t('verify_loading_desc')}</p>
        </motion.div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={spring}
          className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-black/[0.06] p-8 text-center"
        >
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-emerald-100">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-[#1A1A1A] mb-4" style={{ fontFamily: 'var(--font-display)' }}>
            {t('verify_success_title')}
          </h1>
          <p className="text-[#6B7280] mb-6">{t('verify_success_desc')}</p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center w-full py-3 px-4 bg-[#2563EB] text-white rounded-xl font-semibold hover:bg-[#1D4ED8] transition-all hover:shadow-lg hover:shadow-[#2563EB]/25"
          >
            {t('verify_login')}
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={spring}
        className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-black/[0.06] p-8 text-center"
      >
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-red-100">
          <XCircle className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-[#1A1A1A] mb-4" style={{ fontFamily: 'var(--font-display)' }}>
          {t('verify_fail_title')}
        </h1>
        <p className="text-[#6B7280] mb-6">{t('verify_fail_desc')}</p>
        <button
          onClick={handleResend}
          disabled={isResending}
          className="w-full py-3 px-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-[#2563EB]/25"
        >
          {isResending ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> {t('verify_resending')}</>
          ) : (
            <><RefreshCw className="w-5 h-5" /> {t('verify_resend')}</>
          )}
        </button>
      </motion.div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#2563EB]" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
