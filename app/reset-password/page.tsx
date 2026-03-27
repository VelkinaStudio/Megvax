'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock, Loader2, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { useTranslations } from '@/lib/i18n';
import { api, ApiError } from '@/lib/api';

const spring = { type: 'spring' as const, stiffness: 100, damping: 20 };

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const toast = useToast();
  const t = useTranslations('auth');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error(t('invalid_reset_link'));
    }
  }, [token, toast, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error(t('passwords_dont_match'));
      return;
    }

    if (password.length < 8) {
      toast.error(t('password_min_length'));
      return;
    }

    setIsLoading(true);

    try {
      await api('/auth/reset-password', { method: 'POST', body: { token, newPassword: password }, skipAuth: true });
      toast.success(t('password_changed_title'));
      setIsSuccess(true);
      setTimeout(() => router.push('/login'), 2000);
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error(t('reset_failed') || 'Password reset failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
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
            {t('password_changed_title')}
          </h1>
          <p className="text-[#6B7280] mb-6">{t('password_changed_desc')}</p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center w-full py-3 px-4 bg-[#2563EB] text-white rounded-xl font-semibold hover:bg-[#1D4ED8] transition-all hover:shadow-lg hover:shadow-[#2563EB]/25"
          >
            {t('back_to_login_btn')}
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
          <Link href="/login" className="inline-flex items-center gap-2 text-[#6B7280] hover:text-[#1A1A1A] mb-8 transition-colors text-sm font-medium">
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
            <Lock className="w-6 h-6 text-[#2563EB]" />
          </div>

          <h1 className="text-2xl font-bold text-[#1A1A1A] mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            {t('new_password_set')}
          </h1>
          <p className="text-[#6B7280] mb-6 text-sm">{t('new_password_set_desc')}</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-[#374151]">
                {t('new_password_label')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full pl-11 pr-12 py-3 bg-[#F3F2EF] border border-black/[0.08] rounded-xl text-[#1A1A1A] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-[#374151]">
                {t('confirm_password_label')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-[#F3F2EF] border border-black/[0.08] rounded-xl text-[#1A1A1A] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !token}
              className="w-full py-3 px-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-[#2563EB]/25 active:scale-[0.98]"
            >
              {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> {t('updating')}</> : t('change_password_btn')}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#2563EB]" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
