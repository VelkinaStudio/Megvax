'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import { useTranslations } from '@/lib/i18n';

const ease = [0.22, 1, 0.36, 1] as const;

const logos = [
  'TrendModa',
  'GrowthLab',
  'FitShop',
  'Modanisa',
  'Hepsiburada',
  'N11',
];

export function Hero() {
  const t = useTranslations('landing');

  return (
    <section className="relative min-h-[100vh] flex flex-col items-center justify-center overflow-hidden pt-16">
      {/* Background layers */}
      <div className="absolute inset-0 bg-[#0A0A0F]" />

      {/* Radial gradient — warm center glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% 40%, rgba(37,99,235,0.08) 0%, transparent 70%)',
        }}
      />

      {/* Subtle noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Faint grid */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
          className="mb-8"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] text-xs font-medium text-white/50 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {t('hero_badge')}
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          className="text-[clamp(2.5rem,7vw,5rem)] font-extrabold leading-[0.95] tracking-[-0.03em] text-white"
          style={{ fontFamily: 'var(--font-display)' }}
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease }}
        >
          {t('hero_title')}
        </motion.h1>

        {/* Subtext */}
        <motion.p
          className="mt-6 text-base md:text-lg text-white/50 max-w-2xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease }}
        >
          {t('hero_subtitle')}
        </motion.p>

        {/* Dual CTAs */}
        <motion.div
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35, ease }}
        >
          <Link
            href="/signup"
            className="group inline-flex items-center gap-2.5 px-7 py-3.5 bg-[#2563EB] text-white text-[15px] font-semibold rounded-xl hover:bg-[#1D4ED8] transition-all duration-200 hover:shadow-[0_0_40px_rgba(37,99,235,0.3)]"
          >
            {t('hero_cta')}
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/book"
            className="group inline-flex items-center gap-2.5 px-7 py-3.5 text-white/60 text-[15px] font-medium rounded-xl border border-white/[0.1] hover:border-white/[0.2] hover:text-white/80 transition-all duration-200 hover:bg-white/[0.03]"
          >
            <Play className="w-3.5 h-3.5" />
            {t('hero_cta_secondary')}
          </Link>
        </motion.div>

        {/* Trust line */}
        <motion.p
          className="mt-4 text-xs text-white/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5, ease }}
        >
          {t('cta_trust')}
        </motion.p>

        {/* Logo strip */}
        <motion.div
          className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6, ease }}
        >
          <span className="text-[11px] uppercase tracking-widest text-white/25 font-medium">
            {t('hero_trusted_by')}
          </span>
          {logos.map((name) => (
            <span
              key={name}
              className="text-[13px] font-semibold text-white/25 tracking-wide"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {name}
            </span>
          ))}
        </motion.div>

        {/* Dashboard Preview */}
        <motion.div
          className="mt-16 md:mt-20 relative"
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.5, ease }}
        >
          {/* Glow behind the preview */}
          <div className="absolute -inset-10 rounded-3xl opacity-60" style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(37,99,235,0.12) 0%, transparent 70%)',
          }} />

          {/* Dashboard mockup frame */}
          <div
            className="relative rounded-2xl border border-white/[0.08] bg-[#0C0D14] overflow-hidden"
            style={{
              transform: 'perspective(2000px) rotateX(2deg)',
              transformOrigin: 'bottom center',
              boxShadow: '0 25px 80px -12px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
            }}
          >
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.05] bg-[#08090E]">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#FF5F57]" />
                <div className="w-2 h-2 rounded-full bg-[#FEBC2E]" />
                <div className="w-2 h-2 rounded-full bg-[#28C840]" />
              </div>
              <div className="flex-1 mx-12">
                <div className="h-5 bg-white/[0.04] rounded-md max-w-xs mx-auto flex items-center justify-center">
                  <span className="text-[10px] text-white/15">app.megvax.com/dashboard</span>
                </div>
              </div>
            </div>

            {/* Dashboard content */}
            <div className="p-4 md:p-6 space-y-4">
              {/* Top row — KPIs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                {[
                  { label: 'Ad Spend', value: '₺48.2K', change: '+12%', up: true, accent: '#3B82F6' },
                  { label: 'ROAS', value: '3.4x', change: '+0.6x', up: true, accent: '#10B981' },
                  { label: 'Conversions', value: '1,247', change: '+18%', up: true, accent: '#8B5CF6' },
                  { label: 'CPA', value: '₺38.6', change: '-14%', up: false, accent: '#F59E0B' },
                ].map((kpi) => (
                  <div
                    key={kpi.label}
                    className="rounded-lg bg-white/[0.05] border border-white/[0.07] p-3"
                  >
                    <div className="text-[10px] text-white/35 mb-1.5">{kpi.label}</div>
                    <div className="flex items-end justify-between">
                      <span
                        className="text-sm md:text-base font-bold text-white"
                      >
                        {kpi.value}
                      </span>
                      <span
                        className="text-[10px] font-medium"
                        style={{ color: kpi.up ? '#10B981' : '#10B981' }}
                      >
                        {kpi.change}
                      </span>
                    </div>
                    {/* Mini sparkline */}
                    <div className="mt-2 flex items-end gap-[2px] h-4">
                      {[30, 45, 35, 55, 50, 65, 60, 75, 68, 80, 72, 85].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-[1px]"
                          style={{
                            height: `${h}%`,
                            backgroundColor: kpi.accent,
                            opacity: 0.15 + (i / 12) * 0.35,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chart area */}
              <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-medium text-white/35">Performance Overview</span>
                  <div className="flex gap-3">
                    <span className="text-[10px] text-white/20 flex items-center gap-1.5">
                      <span className="w-2 h-[3px] rounded-full bg-[#3B82F6]" /> Spend
                    </span>
                    <span className="text-[10px] text-white/20 flex items-center gap-1.5">
                      <span className="w-2 h-[3px] rounded-full bg-[#10B981]" /> Revenue
                    </span>
                  </div>
                </div>
                <div className="h-28 md:h-36 flex items-end gap-[3px]">
                  {[
                    { s: 35, r: 50 }, { s: 40, r: 55 }, { s: 30, r: 45 },
                    { s: 55, r: 70 }, { s: 45, r: 62 }, { s: 60, r: 78 },
                    { s: 50, r: 72 }, { s: 65, r: 85 }, { s: 55, r: 75 },
                    { s: 70, r: 90 }, { s: 60, r: 82 }, { s: 75, r: 95 },
                    { s: 68, r: 88 }, { s: 80, r: 98 },
                  ].map((bar, i) => (
                    <div key={i} className="flex-1 flex gap-[1px]">
                      <div
                        className="flex-1 rounded-t-[2px] bg-[#3B82F6]/25"
                        style={{ height: `${bar.s}%` }}
                      />
                      <div
                        className="flex-1 rounded-t-[2px] bg-[#10B981]/25"
                        style={{ height: `${bar.r}%` }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Campaign rows */}
              <div className="space-y-1.5">
                {[
                  { name: 'Summer Sale — Broad Audience', status: 'Active', spend: '₺12.4K', roas: '4.1x', active: true },
                  { name: 'Retargeting — Cart Abandonment', status: 'Active', spend: '₺8.7K', roas: '5.8x', active: true },
                  { name: 'Lookalike — Top 5% Customers', status: 'Paused by AI', spend: '₺4.2K', roas: '1.2x', active: false },
                ].map((row) => (
                  <div
                    key={row.name}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.05] text-[11px] md:text-xs"
                  >
                    <span className="text-white/50 truncate max-w-[35%]">{row.name}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                        row.active
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-amber-500/10 text-amber-400'
                      }`}
                    >
                      {row.status}
                    </span>
                    <span className="text-white/30 hidden sm:block">{row.spend}</span>
                    <span className="text-white/50 font-medium">{row.roas}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Fade-out at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#0A0A0F] to-transparent pointer-events-none" />
          </div>
        </motion.div>
      </div>

      {/* Bottom gradient fade into next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0A0A0F] to-transparent pointer-events-none z-20" />
    </section>
  );
}
