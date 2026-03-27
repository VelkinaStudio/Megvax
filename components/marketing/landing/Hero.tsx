'use client';

import Link from 'next/link';
import { motion, useMotionValue, useSpring, useTransform, useInView } from 'framer-motion';
import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { Shield } from 'lucide-react';
import { useTranslations } from '@/lib/i18n';
import { GradientMesh } from './GradientMesh';

const spring = {
  type: 'spring' as const,
  stiffness: 100,
  damping: 20,
  mass: 0.8,
};

// ─── Floating Particles ────────────────────────────────────────────────────
// Subtle ambient dots that drift slowly in the hero background.
// Uses Framer Motion for GPU-accelerated transform/opacity animations.

interface Particle {
  id: number;
  x: number;   // % from left
  y: number;   // % from top
  size: number; // px
  duration: number;
  delay: number;
  dx: number;  // drift x range
  dy: number;  // drift y range
}

function useParticles(count: number): Particle[] {
  return useMemo(() => {
    // Seeded pseudo-random for SSR/client consistency
    const particles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      // Distribute across the section with some entropy
      const seed = (i * 137.508) % 1; // golden angle fraction
      particles.push({
        id: i,
        x: ((i * 23.7 + 10) % 90) + 5,
        y: ((i * 31.3 + 15) % 80) + 10,
        size: 2 + (seed * 3),
        duration: 8 + (i % 5) * 2,
        delay: (i * 0.4) % 3,
        dx: 15 + (i % 4) * 8,
        dy: 10 + (i % 3) * 6,
      });
    }
    return particles;
  }, [count]);
}

function FloatingParticles() {
  const particles = useParticles(10);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="hero-particle absolute rounded-full bg-[#2563EB]"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            opacity: 0,
            willChange: 'transform, opacity',
          }}
          animate={{
            x: [0, p.dx, -p.dx * 0.6, 0],
            y: [0, -p.dy, p.dy * 0.5, 0],
            opacity: [0, 0.12, 0.08, 0],
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

// ─── Mouse-tracking Spotlight ──────────────────────────────────────────────
// A radial gradient glow that follows the cursor across the hero section.

function MouseSpotlight() {
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current?.parentElement;
    if (!el) return;

    function handleMove(e: MouseEvent) {
      const rect = el!.getBoundingClientRect();
      setPos({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
      });
    }

    el.addEventListener('mousemove', handleMove);
    return () => el.removeEventListener('mousemove', handleMove);
  }, []);

  return (
    <div
      ref={ref}
      className="absolute inset-0 pointer-events-none transition-opacity duration-700"
      aria-hidden="true"
      style={{
        background: `radial-gradient(600px circle at ${pos.x}% ${pos.y}%, rgba(37, 99, 235, 0.06), transparent 60%)`,
        willChange: 'background',
      }}
    />
  );
}

// ─── Stat Counter (hero-specific) ──────────────────────────────────────────
// Counts up from 0 on scroll-in using requestAnimationFrame.

function HeroStatCounter({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const [display, setDisplay] = useState(text);
  const hasAnimated = useRef(false);

  // Parse the stat value: "3.2x" → number=3.2, suffix="x" | "12 hrs" → number=12, suffix=" hrs" | "150+" → number=150, suffix="+"
  const parsed = useMemo(() => {
    const match = text.match(/^([\d.,]+)\s*(.*)$/);
    if (!match) return null;
    const numStr = match[1].replace(',', '.');
    const num = parseFloat(numStr);
    if (isNaN(num)) return null;
    return { num, suffix: match[2], hasDecimal: numStr.includes('.'), decimalPlaces: numStr.includes('.') ? numStr.split('.')[1].length : 0 };
  }, [text]);

  const animate = useCallback(() => {
    if (hasAnimated.current || !parsed) return;
    hasAnimated.current = true;

    const start = performance.now();
    const durationMs = 1600;
    const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / durationMs, 1);
      const eased = easeOutExpo(progress);
      const current = eased * parsed.num;

      const formatted = parsed.hasDecimal
        ? current.toFixed(parsed.decimalPlaces)
        : Math.round(current).toString();

      setDisplay(`${formatted}${parsed.suffix}`);

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        // Ensure we land on the exact original text
        setDisplay(text);
      }
    };

    requestAnimationFrame(tick);
  }, [parsed, text]);

  useEffect(() => {
    if (isInView && parsed) {
      animate();
    }
  }, [isInView, parsed, animate]);

  // If we can't parse it (e.g. pure text), just show it static
  if (!parsed) {
    return <span ref={ref}>{text}</span>;
  }

  return <span ref={ref}>{display}</span>;
}

// ─── Dashboard Mockup ──────────────────────────────────────────────────────

interface DashboardTranslations {
  overview: string;
  accountName: string;
  dateRange: string;
  spend: string;
  conversions: string;
  spendVsRevenue: string;
  revenue: string;
  campaign: string;
  status: string;
  campaign1: string;
  campaign2: string;
  campaign3: string;
  statusActive: string;
  statusScaled: string;
  statusPaused: string;
}

function DashboardMockup({ translations: tr }: { translations: DashboardTranslations }) {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [3, -3]), {
    stiffness: 150,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-3, 3]), {
    stiffness: 150,
    damping: 20,
  });

  function handleMouseMove(e: React.MouseEvent) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 60, damping: 20, mass: 1, delay: 0.8 }}
      style={{ rotateX, rotateY, transformPerspective: 1200 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="mt-16 mx-auto max-w-4xl"
    >
      <div className="relative group">
        <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-[#2563EB]/20 via-[#2563EB]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-sm" />

        <div className="relative rounded-2xl overflow-hidden bg-[#0a0b10] shadow-2xl shadow-black/30 border border-white/[0.06]">
          {/* Browser chrome */}
          <div className="flex items-center gap-2 px-4 py-2.5 bg-[#0e0f15] border-b border-white/[0.04]">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="px-3 py-0.5 rounded bg-white/[0.04] text-white/25 text-[10px] font-mono flex items-center gap-1.5">
                <svg className="w-2.5 h-2.5 text-emerald-500/60" viewBox="0 0 12 12" fill="currentColor">
                  <path d="M6 0a6 6 0 100 12A6 6 0 006 0zm2.8 4.85L5.6 8.05a.5.5 0 01-.7 0L3.2 6.37a.5.5 0 11.7-.7l1.35 1.34L8.1 4.15a.5.5 0 01.7.7z" />
                </svg>
                app.megvax.com/dashboard
              </div>
            </div>
          </div>

          <div className="flex">
            {/* Sidebar */}
            <div className="hidden sm:flex flex-col w-[52px] bg-[#0a0b10] border-r border-white/[0.04] py-3 items-center gap-1 shrink-0">
              <div className="w-7 h-7 rounded-lg bg-[#2563EB] flex items-center justify-center mb-3">
                <span className="text-white font-bold text-[10px]">M</span>
              </div>
              {[
                'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
                'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z',
                'M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z',
                'M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z',
              ].map((d, i) => (
                <div key={i} className={`w-8 h-8 rounded-lg flex items-center justify-center ${i === 0 ? 'bg-white/[0.06]' : 'hover:bg-white/[0.04]'} transition-colors`}>
                  <svg className={`w-3.5 h-3.5 ${i === 0 ? 'text-white/60' : 'text-white/20'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={d} />
                  </svg>
                </div>
              ))}
            </div>

            {/* Main content */}
            <div className="relative flex-1 p-4 sm:p-5 bg-[#0f1117] min-h-0">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[11px] text-white/30">{tr.overview}</p>
                  <p className="text-sm font-semibold text-white/80" style={{ fontFamily: 'var(--font-display)' }}>{tr.accountName}</p>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/[0.04] text-[9px] text-white/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {tr.dateRange}
                </div>
              </div>

              {/* KPI cards with sparklines */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
                {[
                  { label: tr.spend, value: '₺142.8K', change: '+12%', spark: [30, 45, 38, 52, 48, 60, 65] },
                  { label: 'ROAS', value: '3.42x', change: '+0.8x', spark: [20, 28, 25, 35, 32, 40, 42] },
                  { label: tr.conversions, value: '1.284', change: '+18%', spark: [25, 30, 28, 38, 35, 45, 50] },
                  { label: 'CPA', value: '₺28.40', change: '-15%', spark: [50, 45, 48, 38, 40, 32, 28] },
                ].map((kpi) => (
                  <div key={kpi.label} className="rounded-lg bg-white/[0.03] border border-white/[0.05] p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-[9px] text-white/35">{kpi.label}</p>
                      <p className="text-[9px] text-emerald-400 font-medium">{kpi.change}</p>
                    </div>
                    <p className="text-base font-semibold text-white mb-1.5" style={{ fontFamily: 'var(--font-display)' }}>{kpi.value}</p>
                    <svg className="w-full h-5" viewBox="0 0 70 20" fill="none" preserveAspectRatio="none">
                      <motion.polyline
                        points={kpi.spark.map((v, idx) => `${idx * (70 / 6)},${20 - v * 0.35}`).join(' ')}
                        stroke="rgba(16,185,129,0.4)"
                        strokeWidth="1.5"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ delay: 1.2, duration: 0.8 }}
                      />
                    </svg>
                  </div>
                ))}
              </div>

              {/* SVG area chart */}
              <div className="rounded-lg bg-white/[0.03] border border-white/[0.05] p-3 mb-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] text-white/35">{tr.spendVsRevenue}</p>
                  <div className="flex gap-3 text-[9px] text-white/25">
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" />{tr.spend}</span>
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />{tr.revenue}</span>
                  </div>
                </div>
                <svg className="w-full h-24 sm:h-28" viewBox="0 0 300 100" fill="none" preserveAspectRatio="none">
                  {[25, 50, 75].map((y) => (
                    <line key={y} x1="0" y1={y} x2="300" y2={y} stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                  ))}
                  <motion.path d="M0 70 Q25 62 50 58 T100 48 T150 40 T200 30 T250 22 T300 15 L300 100 L0 100 Z" fill="url(#revFill)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 0.8 }} />
                  <motion.path d="M0 70 Q25 62 50 58 T100 48 T150 40 T200 30 T250 22 T300 15" stroke="#10B981" strokeWidth="1.5" fill="none" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.2, duration: 1 }} />
                  <motion.path d="M0 80 Q25 75 50 72 T100 65 T150 60 T200 52 T250 48 T300 42 L300 100 L0 100 Z" fill="url(#spendFill)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4, duration: 0.8 }} />
                  <motion.path d="M0 80 Q25 75 50 72 T100 65 T150 60 T200 52 T250 48 T300 42" stroke="#3B82F6" strokeWidth="1.5" fill="none" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.4, duration: 1 }} />
                  <defs>
                    <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="100" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#10B981" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="spendFill" x1="0" y1="0" x2="0" y2="100" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.1" />
                      <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* Campaign table */}
              <div className="rounded-lg bg-white/[0.03] border border-white/[0.05] overflow-hidden">
                <div className="grid grid-cols-[1fr_70px_50px] sm:grid-cols-[1fr_72px_52px_52px_80px] gap-1.5 px-3 py-1.5 text-[8px] text-white/25 border-b border-white/[0.04] uppercase tracking-wider">
                  <span>{tr.campaign}</span>
                  <span className="text-right">{tr.spend}</span>
                  <span className="text-right">ROAS</span>
                  <span className="text-right hidden sm:block">CPA</span>
                  <span className="text-right hidden sm:block">{tr.status}</span>
                </div>
                {[
                  { name: tr.campaign1, spend: '₺24.5K', roas: '4.2x', cpa: '₺22', status: tr.statusActive, sColor: 'text-emerald-400', sBg: 'bg-emerald-400/10' },
                  { name: tr.campaign2, spend: '₺18.2K', roas: '5.1x', cpa: '₺18', status: tr.statusScaled, sColor: 'text-blue-400', sBg: 'bg-blue-400/10' },
                  { name: tr.campaign3, spend: '₺12.8K', roas: '1.1x', cpa: '₺45', status: tr.statusPaused, sColor: 'text-amber-400', sBg: 'bg-amber-400/10' },
                ].map((row) => (
                  <div key={row.name} className="grid grid-cols-[1fr_70px_50px] sm:grid-cols-[1fr_72px_52px_52px_80px] gap-1.5 px-3 py-2 text-[10px] text-white/60 border-b border-white/[0.02] last:border-0">
                    <span className="font-medium text-white/80 truncate">{row.name}</span>
                    <span className="text-right font-mono text-[10px]">{row.spend}</span>
                    <span className="text-right font-mono text-[10px]">{row.roas}</span>
                    <span className="text-right font-mono text-[10px] hidden sm:block">{row.cpa}</span>
                    <span className="text-right hidden sm:flex items-center justify-end">
                      <span className={`text-[8px] px-1.5 py-0.5 rounded ${row.sBg} ${row.sColor}`}>{row.status}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-[80%] h-[100px] bg-[#2563EB]/6 rounded-full blur-3xl pointer-events-none" />
    </motion.div>
  );
}

export function Hero() {
  const t = useTranslations('landing');

  // Split headline for gradient effect on last part
  const title = t('hero_title');
  const titleWords = title.split(' ');
  const lastWord = titleWords.pop();
  const firstPart = titleWords.join(' ');

  const stats = [
    { value: t('hero_stat_roas'), label: t('hero_stat_roas_label') },
    { value: t('hero_stat_time'), label: t('hero_stat_time_label') },
    { value: t('hero_stat_accounts'), label: t('hero_stat_accounts_label') },
  ];

  return (
    <section className="relative pt-32 pb-24 px-6 overflow-hidden">
      <GradientMesh />

      {/* Floating ambient particles */}
      <FloatingParticles />

      {/* Mouse-tracking radial spotlight */}
      <MouseSpotlight />

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.1 }}
          className="flex justify-center mb-8"
        >
          <span className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-[#2563EB]/10 text-[#2563EB] text-xs font-medium tracking-wide shadow-sm shadow-[#2563EB]/5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2563EB] opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2563EB]" />
            </span>
            {t('hero_badge')}
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.2 }}
          className="text-center text-4xl sm:text-5xl lg:text-[3.5rem] xl:text-6xl font-bold tracking-tight leading-[1.08] max-w-3xl mx-auto"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {firstPart}{' '}
          <span
            className="shimmer-text bg-gradient-to-r from-[#2563EB] via-[#60A5FA] via-[#7C3AED] to-[#2563EB] bg-clip-text text-transparent"
            style={{ backgroundSize: '200% auto' }}
          >
            {lastWord}
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.35 }}
          className="text-center text-lg text-[#6B7280] max-w-xl mx-auto mt-6 leading-relaxed"
        >
          {t('hero_subtitle')}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10"
        >
          <Link
            href="/signup"
            className="glow-button inline-flex items-center justify-center px-7 py-3.5 rounded-xl bg-[#2563EB] text-white font-medium text-sm hover:bg-[#1D4ED8] transition-all duration-300 shadow-lg shadow-[#2563EB]/25 hover:shadow-xl hover:shadow-[#2563EB]/30 hover:-translate-y-0.5 w-full sm:w-auto"
          >
            {t('hero_cta')}
          </Link>
          <span className="text-xs text-[#71717A] flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            {t('hero_trust')}
          </span>
        </motion.div>

        {/* Stats strip — numbers count up on scroll */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.65 }}
          className="flex items-center justify-center gap-8 sm:gap-14 mt-12 text-center"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center">
              <span className="text-xl sm:text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                <HeroStatCounter text={stat.value} />
              </span>
              <span className="text-[11px] text-[#71717A] mt-1">{stat.label}</span>
            </div>
          ))}
        </motion.div>

        {/* Product Dashboard */}
        <DashboardMockup translations={{
          overview: t('dashboard_overview'),
          accountName: t('dashboard_account_name'),
          dateRange: t('dashboard_date_range'),
          spend: t('dashboard_spend'),
          conversions: t('dashboard_conversions'),
          spendVsRevenue: t('dashboard_spend_vs_revenue'),
          revenue: t('dashboard_revenue'),
          campaign: t('dashboard_campaign'),
          status: t('dashboard_status'),
          campaign1: t('dashboard_campaign_1'),
          campaign2: t('dashboard_campaign_2'),
          campaign3: t('dashboard_campaign_3'),
          statusActive: t('dashboard_status_active'),
          statusScaled: t('dashboard_status_scaled'),
          statusPaused: t('dashboard_status_paused'),
        }} />
      </div>
    </section>
  );
}
