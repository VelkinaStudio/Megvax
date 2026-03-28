'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Loader2, CheckCircle } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { useTranslations } from '@/lib/i18n';
import { api, ApiError } from '@/lib/api';

const spring = { type: 'spring' as const, stiffness: 100, damping: 20 };

export default function ForgotPasswordPage() {
  const toast = useToast();
  const t = useTranslations('auth');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- reserved for future use
  const tc = useTranslations('common');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await api('/auth/forgot-password', { method: 'POST', body: { email }, skipAuth: true });
      toast.success(t('reset_link_sent'));
      setIsSubmitted(true);
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error(t('reset_link_error') || 'Failed to send reset link. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
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
            {t('email_sent_title')}
          </h1>
          <p className="text-[#6B7280] mb-6 leading-relaxed">
            <span className="font-medium text-[#1A1A1A]">{email}</span> {t('reset_email_sent')}
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-[#2563EB] font-medium hover:text-[#1D4ED8] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('back_to_login')}
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.05 }}
        >
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-[#6B7280] hover:text-[#1A1A1A] mb-8 transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('back_to_login')}
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg border border-black/[0.06] p-8"
        >
          <div className="w-12 h-12 bg-[#EFF6FF] rounded-xl flex items-center justify-center mb-6 border border-[#2563EB]/10">
            <Mail className="w-6 h-6 text-[#2563EB]" />
          </div>

          <h1 className="text-2xl font-bold text-[#1A1A1A] mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            {t('forgot_password_title')}
          </h1>
          <p className="text-[#6B7280] mb-6 text-sm leading-relaxed">
            {t('forgot_password_description')}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-[#374151]">
                {t('email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-[#F3F2EF] border border-black/[0.08] rounded-xl text-[#1A1A1A] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
                  placeholder="email@company.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-[#2563EB]/25 active:scale-[0.98]"
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
        </motion.div>
      </div>
    </div>
  );
}
