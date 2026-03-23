'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Lock, Loader2, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { useTranslations } from '@/lib/i18n';
import { api, ApiError } from '@/lib/api';

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('password_changed_title')}</h1>
          <p className="text-gray-600 mb-6">{t('password_changed_desc')}</p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center w-full py-3 px-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all"
          >
            {t('back_to_login_btn')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Link href="/login" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          {t('back_to_login')}
        </Link>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
            <Lock className="w-6 h-6 text-blue-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('new_password_set')}</h1>
          <p className="text-gray-600 mb-6">{t('new_password_set_desc')}</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">{t('new_password_label')}</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">{t('confirm_password_label')}</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !token}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> {t('updating')}</> : t('change_password_btn')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
