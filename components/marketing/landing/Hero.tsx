'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import { useTranslations } from '@/lib/i18n';

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const t = useTranslations('landing');

  return (
    <section className="relative min-h-[100vh] flex flex-col items-center justify-center overflow-hidden pt-16">
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0, ease }}
          className="mb-8"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-black/[0.06] bg-white text-xs font-medium text-[#6B7280]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {t('hero_badge')}
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          className="text-[clamp(2.5rem,6vw,4rem)] font-extrabold leading-[0.95] tracking-[-0.03em] text-[#1A1A1A]"
          style={{ fontFamily: 'var(--font-display)', whiteSpace: 'pre-line' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease }}
        >
          {t('hero_title')}
        </motion.h1>

        {/* Subtext */}
        <motion.p
          className="mt-6 text-base md:text-lg text-[#6B7280] max-w-2xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease }}
        >
          {t('hero_subtitle')}
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease }}
        >
          <Link
            href="/signup"
            className="group inline-flex items-center gap-2.5 px-7 py-3.5 bg-[#2563EB] text-white text-[15px] font-semibold rounded-xl hover:bg-[#1D4ED8] hover:shadow-[0_0_30px_rgba(37,99,235,0.2)] transition-all duration-200"
          >
            {t('hero_cta')}
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/book"
            className="group inline-flex items-center gap-2.5 px-7 py-3.5 text-[#1A1A1A]/60 text-[15px] font-medium hover:text-[#1A1A1A]/80 transition-colors"
          >
            <Play className="w-3.5 h-3.5" />
            {t('hero_cta_secondary')}
          </Link>
        </motion.div>

        {/* Trust line */}
        <motion.p
          className="mt-4 text-[13px] text-[#71717A]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4, ease }}
        >
          {t('cta_trust')}
        </motion.p>

        {/* Dashboard frame */}
        <motion.div
          className="mt-16 md:mt-20 relative"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5, ease }}
        >
          {/* Subtle glow */}
          <div
            className="absolute -inset-10 rounded-3xl opacity-30"
            style={{
              background:
                'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(37,99,235,0.08) 0%, transparent 70%)',
            }}
          />

          {/* Frame container */}
          <div
            className="relative rounded-2xl border border-black/[0.08] bg-[#0C0D14] overflow-hidden"
            style={{
              transform: 'perspective(2000px) rotateX(2deg)',
              transformOrigin: 'bottom center',
              boxShadow:
                '0 25px 80px -12px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.04)',
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
                  <span className="text-[10px] text-white/15">
                    app.megvax.com/dashboard
                  </span>
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
                      <span className="text-sm md:text-base font-bold text-white">
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

            {/* Bottom fade inside frame */}
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#FAFAF8] to-transparent pointer-events-none" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
