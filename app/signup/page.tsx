'use client';

import { useState, useEffect, useMemo } from 'react';
import { Mail, Lock, User, Building, ArrowRight, Eye, EyeOff, Clock, Zap, LayoutGrid } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
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

/* ───── Animated gradient background with shifting position ───── */
function AnimatedGradientBg() {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background: 'linear-gradient(135deg, #0C0D14, #111827, #0C0D14, #111827)',
        backgroundSize: '400% 400%',
        animation: 'gradientShift 20s ease infinite',
      }}
    >
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 0%; }
          25% { background-position: 100% 50%; }
          50% { background-position: 50% 100%; }
          75% { background-position: 0% 50%; }
          100% { background-position: 0% 0%; }
        }
      `}</style>
    </div>
  );
}

/* ───── Subtle ambient particles (reduced count, very low opacity) ───── */
function SubtleParticles() {
  const [particles] = useState(() =>
    Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1.5 + Math.random() * 2,
      opacity: 0.03 + Math.random() * 0.02,
      duration: 14 + Math.random() * 16,
      delay: Math.random() * 6,
      driftX: (Math.random() - 0.5) * 50,
      driftY: (Math.random() - 0.5) * 35,
    }))
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-white"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            opacity: p.opacity,
          }}
          animate={{
            x: [0, p.driftX, -p.driftX * 0.5, 0],
            y: [0, p.driftY, -p.driftY * 0.7, 0],
            opacity: [p.opacity, p.opacity * 1.4, p.opacity * 0.7, p.opacity],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

/* ───── Benefit card with glass-morphism ───── */
function BenefitCard({
  icon: Icon,
  title,
  delay,
}: {
  icon: typeof Clock;
  title: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        delay,
        type: 'spring',
        stiffness: 120,
        damping: 18,
      }}
      className="backdrop-blur-sm bg-white/[0.04] border border-white/[0.08] rounded-xl px-5 py-4 flex items-center gap-4"
    >
      <div className="w-10 h-10 rounded-lg bg-[#2563EB]/10 border border-[#2563EB]/20 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-[#60A5FA]" />
      </div>
      <span className="text-white/80 text-[15px] font-medium">{title}</span>
    </motion.div>
  );
}

/* ───── Social proof avatar circles ───── */
function SocialProofAvatars({ text }: { text: string }) {
  const avatars = useMemo(
    () => [
      { initials: 'AK', bg: '#2563EB' },
      { initials: 'SE', bg: '#7C3AED' },
      { initials: 'MO', bg: '#0891B2' },
      { initials: 'FY', bg: '#059669' },
      { initials: 'BT', bg: '#D97706' },
    ],
    []
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.2, duration: 0.6 }}
      className="flex items-center gap-3"
    >
      <div className="flex -space-x-2">
        {avatars.map((a, i) => (
          <motion.div
            key={a.initials}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: 1.4 + i * 0.1,
              type: 'spring',
              stiffness: 260,
              damping: 20,
            }}
            className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold text-white border-2 border-[#0C0D14]"
            style={{ backgroundColor: a.bg }}
          >
            {a.initials}
          </motion.div>
        ))}
      </div>
      <span className="text-white/40 text-sm">{text}</span>
    </motion.div>
  );
}

/* ───── Focus-enhanced input wrapper ───── */
function FocusInput({
  children,
  isFocused,
}: {
  children: React.ReactNode;
  isFocused: boolean;
}) {
  return (
    <motion.div
      className="relative"
      animate={{
        scale: isFocused ? 1.02 : 1,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <motion.div
        className="absolute -inset-[2px] rounded-[14px] pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(37,99,235,0.15), rgba(37,99,235,0.08))',
        }}
        animate={{ opacity: isFocused ? 1 : 0 }}
        transition={{ duration: 0.25 }}
      />
      <div className="relative">{children}</div>
    </motion.div>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const toast = useToast();
  const t = useTranslations('auth');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- reserved for future use
  const tc = useTranslations('common');
  const { register, isAuthenticated } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);
  const [companyFocused, setCompanyFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
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
      {/* ─── Left: Premium Brand Panel (hidden on mobile) ─── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="hidden lg:flex lg:w-[60%] relative overflow-hidden flex-col justify-between p-12"
      >
        {/* Animated gradient background */}
        <AnimatedGradientBg />

        {/* Subtle ambient particles */}
        <SubtleParticles />

        {/* Soft glow accent — top left */}
        <div
          className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)' }}
        />
        {/* Soft glow accent — bottom right */}
        <div
          className="absolute -bottom-24 -right-24 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)' }}
        />

        {/* Top: Logo */}
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#2563EB] flex items-center justify-center">
              <span className="text-white font-bold text-sm" style={{ fontFamily: 'var(--font-display)' }}>M</span>
            </div>
            <span className="text-xl font-semibold tracking-tight text-white" style={{ fontFamily: 'var(--font-display)' }}>MegVax</span>
          </Link>
        </div>

        {/* Center: Hero text + Benefit cards */}
        <div className="relative z-10 flex-1 flex flex-col justify-center -mt-4">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 100, damping: 20 }}
            className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-3"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {t('brand_signup_prefix')}{' '}
            <span className="bg-gradient-to-r from-[#2563EB] via-[#60A5FA] to-[#2563EB] bg-clip-text text-transparent">
              {t('brand_signup_accent')}
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, type: 'spring', stiffness: 100, damping: 20 }}
            className="text-white/45 text-lg max-w-md mb-10"
          >
            {t('brand_signup_desc')}
          </motion.p>

          {/* 3 benefit cards */}
          <div className="flex flex-col gap-3 max-w-[380px]">
            <BenefitCard icon={Clock} title={t('benefit_free_trial')} delay={0.5} />
            <BenefitCard icon={Zap} title={t('benefit_quick_setup')} delay={0.65} />
            <BenefitCard icon={LayoutGrid} title={t('benefit_all_platforms')} delay={0.8} />
          </div>
        </div>

        {/* Bottom: Social proof + Trust badges */}
        <div className="relative z-10 space-y-4">
          <SocialProofAvatars text={t('social_proof_signup')} />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 0.8 }}
            className="text-white/25 text-xs"
          >
            {t('trust_badge_free')} &middot; {t('trust_no_card')} &middot; {t('trust_cancel_anytime')}
          </motion.p>
        </div>
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
            {/* Name — focus-enhanced */}
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-sm font-medium text-[#374151]">
                {t('full_name')}
              </label>
              <FocusInput isFocused={nameFocused}>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#9CA3AF]" />
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    onFocus={() => setNameFocused(true)}
                    onBlur={() => setNameFocused(false)}
                    placeholder="John Doe"
                    className="w-full pl-11 pr-4 py-3 bg-white border border-[#E5E7EB] rounded-xl text-[#1A1A1A] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all duration-200"
                    required
                  />
                </div>
              </FocusInput>
            </div>

            {/* Company (optional) — focus-enhanced */}
            <div className="space-y-1.5">
              <label htmlFor="company" className="text-sm font-medium text-[#374151]">
                {t('company_name')} <span className="text-[#9CA3AF] font-normal">({t('optional')})</span>
              </label>
              <FocusInput isFocused={companyFocused}>
                <div className="relative">
                  <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#9CA3AF]" />
                  <input
                    id="company"
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    onFocus={() => setCompanyFocused(true)}
                    onBlur={() => setCompanyFocused(false)}
                    placeholder="Company Inc."
                    className="w-full pl-11 pr-4 py-3 bg-white border border-[#E5E7EB] rounded-xl text-[#1A1A1A] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all duration-200"
                  />
                </div>
              </FocusInput>
            </div>

            {/* Email — focus-enhanced */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-[#374151]">
                {t('work_email')}
              </label>
              <FocusInput isFocused={emailFocused}>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#9CA3AF]" />
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    placeholder="email@company.com"
                    className="w-full pl-11 pr-4 py-3 bg-white border border-[#E5E7EB] rounded-xl text-[#1A1A1A] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all duration-200"
                    required
                  />
                </div>
              </FocusInput>
            </div>

            {/* Password — focus-enhanced */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-[#374151]">
                {t('password')}
              </label>
              <FocusInput isFocused={passwordFocused}>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#9CA3AF]" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
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
              </FocusInput>

              {/* Password strength indicator — spring-animated bars */}
              <AnimatePresence>
                {formData.password.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="pt-1.5 space-y-1.5 overflow-hidden"
                  >
                    <div className="flex gap-1">
                      {[1, 2, 3].map((segment) => (
                        <div key={segment} className="relative h-1 flex-1 rounded-full bg-[#E5E7EB] overflow-hidden">
                          <motion.div
                            className={`absolute inset-0 rounded-full ${
                              passwordStrength.level >= segment
                                ? strengthColors[passwordStrength.level]
                                : 'bg-[#E5E7EB]'
                            }`}
                            initial={{ scaleX: 0 }}
                            animate={{
                              scaleX: passwordStrength.level >= segment ? 1 : 0,
                            }}
                            transition={{
                              type: 'spring',
                              stiffness: 200,
                              damping: 20,
                              delay: segment * 0.08,
                            }}
                            style={{ transformOrigin: 'left' }}
                          />
                        </div>
                      ))}
                    </div>
                    <p className={`text-xs ${strengthTextColors[passwordStrength.level]}`}>
                      {t(`password_${passwordStrength.label}`)}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

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
