'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, Loader2, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { useTranslations } from '@/lib/i18n';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const toast = useToast();
  const t = useTranslations('auth');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (token) {
      setTimeout(() => {
        setStatus('success');
        toast.success(t('verify_success_toast'));
      }, 2000);
    } else {
      setStatus('error');
    }
  }, [token, toast]);

  const handleResend = async () => {
    setIsResending(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast.success(t('verify_resend_toast'));
    setIsResending(false);
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('verify_title_loading')}</h1>
          <p className="text-gray-600">{t('verify_loading_desc')}</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('verify_success_title')}</h1>
          <p className="text-gray-600 mb-6">{t('verify_success_desc')}</p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center w-full py-3 px-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all"
          >
            {t('verify_login')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('verify_fail_title')}</h1>
        <p className="text-gray-600 mb-6">{t('verify_fail_desc')}</p>
        <button
          onClick={handleResend}
          disabled={isResending}
          className="w-full py-3 px-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isResending ? <><Loader2 className="w-5 h-5 animate-spin" /> {t('verify_resending')}</> : <><RefreshCw className="w-5 h-5" /> {t('verify_resend')}</>}
        </button>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
