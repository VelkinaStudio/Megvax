'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Mail, Lock, ArrowRight, Eye, EyeOff, Copy, Check, UserCircle, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/Toast';
import { useTranslations } from '@/lib/i18n';
import { useAuth } from '@/lib/auth-context';
import { ApiError } from '@/lib/api';

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

/* ───── Mini area chart SVG with animated pathLength draw-in ───── */
function MiniAreaChart() {
  const chartPath = 'M0,80 C30,75 50,60 80,55 C110,50 130,35 160,40 C190,45 210,25 240,20 C270,15 290,30 320,18 C350,6 370,12 400,8';
  const areaPath = `${chartPath} L400,100 L0,100 Z`;

  return (
    <svg viewBox="0 0 400 100" className="w-full h-[100px]" preserveAspectRatio="none">
      <defs>
        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2563EB" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Area fill */}
      <motion.path
        d={areaPath}
        fill="url(#chartGradient)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
      />
      {/* Line stroke with draw-in animation */}
      <motion.path
        d={chartPath}
        fill="none"
        stroke="#2563EB"
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.8, duration: 2, ease: [0.22, 1, 0.36, 1] }}
      />
      {/* Endpoint dot */}
      <motion.circle
        cx="400"
        cy="8"
        r="4"
        fill="#2563EB"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2.8, duration: 0.4, type: 'spring', stiffness: 200, damping: 15 }}
      />
      <motion.circle
        cx="400"
        cy="8"
        r="8"
        fill="#2563EB"
        opacity="0.2"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 0.2, scale: [1, 1.5, 1] }}
        transition={{
          delay: 2.8,
          opacity: { duration: 0.3 },
          scale: { delay: 3.2, duration: 2, repeat: Infinity, ease: 'easeInOut' },
        }}
      />
    </svg>
  );
}

/* ───── Login Dashboard Preview — miniature dashboard mockup ───── */
function LoginDashboardPreview({ t }: { t: (key: string) => string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{
        opacity: 1,
        y: [0, -6, 0],
      }}
      transition={{
        opacity: { delay: 0.6, duration: 0.8, ease: [0.22, 1, 0.36, 1] },
        y: { delay: 1.4, duration: 4, repeat: Infinity, ease: 'easeInOut' },
      }}
      className="w-full max-w-[420px] backdrop-blur-sm bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 overflow-hidden"
    >
      {/* Chart header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] uppercase tracking-wider text-white/40 font-medium">
          {t('dashboard_preview_title')}
        </span>
        <span className="text-[10px] text-white/25 font-mono">
          {t('dashboard_preview_period')}
        </span>
      </div>

      {/* Mini area chart */}
      <div className="mb-4">
        <MiniAreaChart />
      </div>

      {/* KPI pills */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1 bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2.5">
          <p className="text-[10px] uppercase tracking-wider text-white/35 mb-0.5">ROAS</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold text-white">4.2x</span>
            <span className="text-[11px] font-medium text-emerald-400">↑18%</span>
          </div>
        </div>
        <div className="flex-1 bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2.5">
          <p className="text-[10px] uppercase tracking-wider text-white/35 mb-0.5">CPA</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold text-white">&#8378;28</span>
            <span className="text-[11px] font-medium text-emerald-400">↓15%</span>
          </div>
        </div>
      </div>

      {/* Mini campaign row */}
      <div className="bg-white/[0.03] border border-white/[0.05] rounded-lg px-3 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
          <span className="text-[12px] text-white/70 font-medium">{t('dashboard_preview_campaign')}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-emerald-400/80 uppercase tracking-wide font-medium">{t('dashboard_preview_active')}</span>
          <span className="text-[12px] text-white/50 font-mono">&#8378;24.5K</span>
        </div>
      </div>
    </motion.div>
  );
}

/* ───── Social proof avatar circles ───── */
function SocialProofAvatars({ t }: { t: (key: string) => string }) {
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
      <span className="text-white/40 text-sm">{t('social_proof_trusted')}</span>
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
      {/* Blue glow ring that fades in on focus */}
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

/* ───── Demo accounts card — auto-fill on click ───── */
function DemoCredentialRow({
  icon: Icon,
  label,
  email,
  password,
  hint,
  onFill,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  email: string;
  password: string;
  hint: string;
  onFill: (email: string, password: string) => void;
}) {
  const [copied, setCopied] = useState<'email' | 'password' | null>(null);

  const handleCopy = useCallback((text: string, field: 'email' | 'password') => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 1500);
  }, []);

  return (
    <div className="group flex items-start gap-3 p-2.5 rounded-lg hover:bg-[#F3F4F6] transition-colors">
      <div className="w-8 h-8 rounded-full bg-[#F3F4F6] group-hover:bg-white flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors">
        <Icon className="w-4 h-4 text-[#6B7280]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-[#374151] mb-1">{label}</p>
        <div className="flex items-center gap-1.5 text-xs text-[#6B7280] font-mono">
          <span className="truncate">{email}</span>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleCopy(email, 'email'); }}
            className="flex-shrink-0 p-0.5 rounded hover:bg-[#E5E7EB] transition-colors"
            title="Copy email"
          >
            {copied === 'email' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-[#9CA3AF]" />}
          </button>
          <span className="text-[#D1D5DB]">/</span>
          <span>{password}</span>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleCopy(password, 'password'); }}
            className="flex-shrink-0 p-0.5 rounded hover:bg-[#E5E7EB] transition-colors"
            title="Copy password"
          >
            {copied === 'password' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-[#9CA3AF]" />}
          </button>
        </div>
        <button
          type="button"
          onClick={() => onFill(email, password)}
          className="mt-1 text-[10px] text-[#2563EB] hover:text-[#1D4ED8] font-medium transition-colors"
        >
          {hint}
        </button>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();
  const t = useTranslations('auth');
  const tc = useTranslations('common');
  const { login, isAuthenticated, user, devLogin } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      router.replace(user.isAdmin ? '/admin' : '/app/dashboard');
    }
  }, [isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(formData.email, formData.password);
      toast.success(tc('success') + '!');
      // Redirect happens in useEffect based on user.isAdmin
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error(t('invalid_credentials'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    toast.info(t('google_coming_soon') || 'Google login coming soon');
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

        {/* Center: Hero text + Dashboard preview */}
        <div className="relative z-10 flex-1 flex flex-col justify-center -mt-4">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 100, damping: 20 }}
            className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-3"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {t('brand_welcome_prefix')}{' '}
            <span className="bg-gradient-to-r from-[#2563EB] via-[#60A5FA] to-[#2563EB] bg-clip-text text-transparent">
              {t('brand_welcome_accent')}
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, type: 'spring', stiffness: 100, damping: 20 }}
            className="text-white/45 text-lg max-w-md mb-10"
          >
            {t('brand_login_desc')}
          </motion.p>

          {/* Mini dashboard preview */}
          <LoginDashboardPreview t={t} />
        </div>

        {/* Bottom: Social proof + Trust badges */}
        <div className="relative z-10 space-y-4">
          <SocialProofAvatars t={t} />
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

      {/* ─── Right: Login Form ─── */}
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
            {t('login_title')}
          </h1>
          <p className="text-[#6B7280] text-sm mb-8">
            {t('login_subtitle')}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email — focus-enhanced */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-[#374151]">
                {t('email')}
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
            </div>

            {/* Remember Me + Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                  className="w-4 h-4 rounded border-[#D1D5DB] text-[#2563EB] focus:ring-[#2563EB] focus:ring-offset-0"
                />
                <span className="text-[#6B7280]">{t('remember_me')}</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-[#2563EB] hover:text-[#1D4ED8] font-medium transition-colors"
              >
                {t('forgot_password')}
              </Link>
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
                  {tc('login')}
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

          {/* Google Login */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full py-3 px-4 bg-white border border-[#E5E7EB] text-[#374151] font-medium rounded-xl hover:bg-[#F9FAFB] transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#D1D5DB] hover:shadow-sm active:scale-[0.98]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {t('google_login')}
          </button>

          {/* Dev bypass — only in development */}
          {process.env.NODE_ENV === 'development' && (
            <button
              type="button"
              onClick={async () => { await devLogin(); router.push('/app/dashboard'); }}
              disabled={isLoading}
              className="w-full mt-3 py-2.5 px-4 bg-gray-900 text-[#D1D5DB] text-sm font-mono rounded-xl hover:bg-gray-800 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 border border-gray-700 border-dashed"
            >
              [DEV] Skip to Dashboard
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Signup Link */}
          <p className="mt-8 text-center text-sm text-[#6B7280]">
            {t('no_account')}{' '}
            <Link
              href="/signup"
              className="text-[#2563EB] hover:text-[#1D4ED8] font-semibold transition-colors"
            >
              {t('create_account')}
            </Link>
          </p>

          {/* Back to Home */}
          <p className="mt-3 text-center">
            <Link
              href="/"
              className="text-sm text-[#9CA3AF] hover:text-[#6B7280] transition-colors inline-flex items-center gap-1"
            >
              ← {t('back_to_home')}
            </Link>
          </p>

          {/* Demo Accounts — only visible when NEXT_PUBLIC_DEMO_MODE is 'true' */}
          {process.env.NEXT_PUBLIC_DEMO_MODE === 'true' && (
            <div className="mt-6 border border-[#E5E7EB] bg-[#F9FAFB] rounded-xl p-4">
              <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-3">
                {t('demo_accounts_title')}
              </p>
              <div className="space-y-1">
                <DemoCredentialRow
                  icon={UserCircle}
                  label={t('demo_user_label')}
                  email="demo@megvax.com"
                  password="demo123"
                  hint={t('click_to_fill')}
                  onFill={(email, password) => setFormData({ ...formData, email, password })}
                />
                <DemoCredentialRow
                  icon={ShieldCheck}
                  label={t('demo_admin_label')}
                  email="admin@megvax.com"
                  password="admin123"
                  hint={t('click_to_fill')}
                  onFill={(email, password) => setFormData({ ...formData, email, password })}
                />
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </main>
  );
}
