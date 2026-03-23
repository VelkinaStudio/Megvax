'use client';

import { useState, useEffect } from 'react';
import { Mail, Lock, User, Building, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MarketingNav } from '@/components/marketing/MarketingNav';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import { useToast } from '@/components/ui/Toast';
import { useTranslations } from '@/lib/i18n';
import { useAuth } from '@/lib/auth-context';
import { ApiError } from '@/lib/api';

export default function SignupPage() {
  const router = useRouter();
  const toast = useToast();
  const t = useTranslations('auth');
  const tc = useTranslations('common');
  const { register, isAuthenticated } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    password: '',
    terms: false,
  });

  useEffect(() => {
    if (isAuthenticated) router.replace('/app/dashboard');
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.terms) {
      toast.error(t('accept_terms'));
      return;
    }
    setIsLoading(true);

    try {
      await register(formData.email, formData.password, formData.name);
      toast.success(t('signup_success'));
      router.push('/app/dashboard');
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error(t('signup_error') || 'Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    toast.info('Google signup coming soon');
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <MarketingNav />

      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 flex justify-center">
          <div className="w-full max-w-md">
            {/* Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900">{t('signup_title')}</h1>
                <p className="text-gray-600 mt-2 text-sm">
                  {t('signup_subtitle')}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name */}
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-gray-700">
                    {t('full_name')}
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Doe"
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Company */}
                <div className="space-y-2">
                  <label htmlFor="company" className="text-sm font-medium text-gray-700">
                    {t('company_name')}
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="company"
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="Company Inc."
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-700">
                    {t('work_email')}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="email@company.com"
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-gray-700">
                    {t('password')}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">{t('password_requirements')}</p>
                </div>

                {/* Terms */}
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={formData.terms}
                    onChange={(e) => setFormData({ ...formData, terms: e.target.checked })}
                    className="w-4 h-4 mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    required
                  />
                  <label htmlFor="terms" className="text-sm text-gray-600">
                    <Link href="/terms" className="text-blue-600 hover:text-blue-700 font-medium">
                      {t('terms_of_service')}
                    </Link>{' '}
                    {t('and')}{' '}
                    <Link href="/privacy" className="text-blue-600 hover:text-blue-700 font-medium">
                      {t('privacy_policy')}
                    </Link>
                    {t('terms_accept')}
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.98]"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      {t('create_account')}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">{t('or')}</span>
                </div>
              </div>

              {/* Google Signup */}
              <button
                type="button"
                onClick={handleGoogleSignup}
                disabled={isLoading}
                className="w-full py-3 px-4 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-300 hover:shadow-sm active:scale-[0.98]"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {t('google_signup')}
              </button>

              {/* Login Link */}
              <p className="mt-8 text-center text-sm text-gray-600">
                {t('have_account')}{' '}
                <Link
                  href="/login"
                  className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                >
                  {t('login_link')}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </main>
  );
}
