'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, Loader2, CheckCircle } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { useTranslations } from '@/lib/i18n';

export default function ForgotPasswordPage() {
  const toast = useToast();
  const t = useTranslations('auth');
  const tc = useTranslations('common');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast.success(t('reset_link_sent'));
    setIsSubmitted(true);
    setIsLoading(false);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('email_sent_title')}</h1>
          <p className="text-gray-600 mb-6">
            <span className="font-medium text-gray-900">{email}</span> {t('reset_email_sent')}
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('back_to_login')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('back_to_login')}
        </Link>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
            <Mail className="w-6 h-6 text-blue-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('forgot_password_title')}</h1>
          <p className="text-gray-600 mb-6">
            {t('forgot_password_description')}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                {t('email')}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="email@company.com"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t('sending')}
                </>
              ) : (
                t('send_link')
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
