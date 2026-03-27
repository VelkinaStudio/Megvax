'use client';

import { useState, useEffect, useMemo } from 'react';
import { Mail, Lock, User, Building, ArrowRight, Eye, EyeOff, Check, Shield, Clock, CreditCard } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/Toast';
import { useTranslations } from '@/lib/i18n';
import { useAuth } from '@/lib/auth-context';
import { ApiError } from '@/lib/api';

/* ───── Password strength calculation ───── */
function getPasswordStrength(password: string): { level: 0 | 1 | 2 | 3; label: string } {
  if (!password) return { level: 0, label: '' };

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { level: 1, label: 'weak' };
  if (score <= 4) return { level: 2, label: 'medium' };
  return { level: 3, label: 'strong' };
}

const strengthColors = {
  0: 'bg-[#E5E7EB]',
  1: 'bg-red-500',
  2: 'bg-amber-500',
  3: 'bg-emerald-500',
};

const strengthTextColors = {
  0: 'text-[#9CA3AF]',
  1: 'text-red-500',
  2: 'text-amber-500',
  3: 'text-emerald-500',
};

/* ───── Animated glow orb ───── */
function GlowOrb({ className }: { className?: string }) {
  return (
    <motion.div
      animate={{
        scale: [1, 1.15, 1],
        opacity: [0.3, 0.5, 0.3],
      }}
      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      className={`absolute rounded-full blur-[80px] pointer-events-none ${className}`}
    />
  );
}

/* ───── Trust badge ───── */
function TrustBadge({
  icon: Icon,
  text,
  delay,
}: {
  icon: typeof Check;
  text: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-center gap-3"
    >
      <div className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-emerald-400" />
      </div>
      <span className="text-white/60 text-sm">{text}</span>
    </motion.div>
  );
}

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

  const passwordStrength = useMemo(() => getPasswordStrength(formData.password), [formData.password]);

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
    toast.info(t('google_coming_soon') || 'Google signup coming soon');
  };

  return (
    <main className="min-h-screen flex bg-[#FAFAF8]">
      {/* ─── Left: Brand Panel (hidden on mobile) ─── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="hidden lg:flex lg:w-[60%] relative overflow-hidden bg-[#0C0D14] flex-col justify-between p-12"
      >
        {/* Background glow effects */}
        <GlowOrb className="w-[400px] h-[400px] bg-[#2563EB]/30 -top-20 -left-20" />
        <GlowOrb className="w-[300px] h-[300px] bg-[#7c3aed]/20 bottom-20 right-10" />

        {/* Top: Logo */}
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#2563EB] flex items-center justify-center">
              <span className="text-white font-bold text-sm" style={{ fontFamily: 'var(--font-display)' }}>M</span>
            </div>
            <span className="text-xl font-semibold tracking-tight text-white" style={{ fontFamily: 'var(--font-display)' }}>MegVax</span>
          </Link>
        </div>

        {/* Center: Headline + Trust elements */}
        <div className="relative z-10 flex-1 flex flex-col justify-center -mt-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-4"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {t('brand_signup_headline')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-white/50 text-lg max-w-md mb-12"
          >
            {t('brand_signup_desc')}
          </motion.p>

          {/* Trust badges */}
          <div className="flex flex-col gap-4">
            <TrustBadge icon={Clock} text={t('trust_free_trial')} delay={0.5} />
            <TrustBadge icon={CreditCard} text={t('trust_no_card')} delay={0.65} />
            <TrustBadge icon={Shield} text={t('trust_cancel_anytime')} delay={0.8} />
          </div>
        </div>

        {/* Bottom: Social proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="relative z-10"
        >
          <p className="text-white/30 text-sm">{t('brand_trusted')}</p>
        </motion.div>
      </motion.div>

      {/* ─── Right: Signup Form ─── */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-24 py-12"
      >
        {/* Mobile logo (hidden on lg+) */}
        <div className="lg:hidden mb-10">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#2563EB] flex items-center justify-center">
              <span className="text-white font-bold text-sm" style={{ fontFamily: 'var(--font-display)' }}>M</span>
            </div>
            <span className="text-xl font-semibold tracking-tight text-[#1A1A1A]" style={{ fontFamily: 'var(--font-display)' }}>MegVax</span>
          </Link>
        </div>

        <div className="w-full max-w-[420px] mx-auto lg:mx-0">
          {/* Heading */}
          <h1 className="text-2xl font-bold text-[#1A1A1A] mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            {t('signup_title')}
          </h1>
          <p className="text-[#6B7280] text-sm mb-8">
            {t('signup_subtitle')}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-sm font-medium text-[#374151]">
                {t('full_name')}
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#9CA3AF]" />
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full pl-11 pr-4 py-3 bg-white border border-[#E5E7EB] rounded-xl text-[#1A1A1A] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all duration-200"
                  required
                />
              </div>
            </div>

            {/* Company (optional) */}
            <div className="space-y-1.5">
              <label htmlFor="company" className="text-sm font-medium text-[#374151]">
                {t('company_name')} <span className="text-[#9CA3AF] font-normal">({t('optional')})</span>
              </label>
              <div className="relative">
                <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#9CA3AF]" />
                <input
                  id="company"
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Company Inc."
                  className="w-full pl-11 pr-4 py-3 bg-white border border-[#E5E7EB] rounded-xl text-[#1A1A1A] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all duration-200"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-[#374151]">
                {t('work_email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#9CA3AF]" />
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@company.com"
                  className="w-full pl-11 pr-4 py-3 bg-white border border-[#E5E7EB] rounded-xl text-[#1A1A1A] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all duration-200"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-[#374151]">
                {t('password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#9CA3AF]" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3 bg-white border border-[#E5E7EB] rounded-xl text-[#1A1A1A] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all duration-200"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280] transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                </button>
              </div>

              {/* Password strength indicator */}
              {formData.password.length > 0 && (
                <div className="pt-1.5 space-y-1.5">
                  <div className="flex gap-1">
                    {[1, 2, 3].map((segment) => (
                      <div
                        key={segment}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          passwordStrength.level >= segment
                            ? strengthColors[passwordStrength.level]
                            : 'bg-[#E5E7EB]'
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs ${strengthTextColors[passwordStrength.level]}`}>
                    {t(`password_${passwordStrength.label}`)}
                  </p>
                </div>
              )}

              <p className="text-xs text-[#9CA3AF]">{t('password_requirements')}</p>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3 pt-1">
              <input
                type="checkbox"
                id="terms"
                checked={formData.terms}
                onChange={(e) => setFormData({ ...formData, terms: e.target.checked })}
                className="w-4 h-4 mt-0.5 rounded border-[#D1D5DB] text-[#2563EB] focus:ring-[#2563EB] focus:ring-offset-0"
                required
              />
              <label htmlFor="terms" className="text-sm text-[#6B7280] leading-snug">
                <Link href="/terms" className="text-[#2563EB] hover:text-[#1D4ED8] font-medium transition-colors">
                  {t('terms_of_service')}
                </Link>{' '}
                {t('and')}{' '}
                <Link href="/privacy" className="text-[#2563EB] hover:text-[#1D4ED8] font-medium transition-colors">
                  {t('privacy_policy')}
                </Link>
                {t('terms_accept')}
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="glow-button w-full py-3 px-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-[#2563EB]/25 active:scale-[0.98]"
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
          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E5E7EB]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-[#FAFAF8] text-[#9CA3AF] uppercase tracking-wider">{t('or_continue_with')}</span>
            </div>
          </div>

          {/* Google Signup */}
          <button
            type="button"
            onClick={handleGoogleSignup}
            disabled={isLoading}
            className="w-full py-3 px-4 bg-white border border-[#E5E7EB] text-[#374151] font-medium rounded-xl hover:bg-[#F9FAFB] transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#D1D5DB] hover:shadow-sm active:scale-[0.98]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {t('google_signup')}
          </button>

          {/* Login Link */}
          <p className="mt-8 text-center text-sm text-[#6B7280]">
            {t('have_account')}{' '}
            <Link
              href="/login"
              className="text-[#2563EB] hover:text-[#1D4ED8] font-semibold transition-colors"
            >
              {t('login_link')}
            </Link>
          </p>
        </div>
      </motion.div>
    </main>
  );
}
