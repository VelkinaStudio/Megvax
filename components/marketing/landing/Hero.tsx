'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import { useTranslations } from '@/lib/i18n';

const ease = [0.22, 1, 0.36, 1] as const;

/* ─── CSS keyframes injected once ─── */
const cssAnimations = `
@keyframes kpi-shimmer {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.85); }
}
@keyframes row-highlight {
  0%, 100% { background: rgba(255,255,255,0.03); }
  50% { background: rgba(255,255,255,0.06); }
}
@keyframes amber-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
`;

/* ─── Data ─── */
const kpis = [
  { label: 'Reklam Harcaması', value: '₺48.2K', change: '+12%', up: true, accent: '#3B82F6' },
  { label: 'ROAS', value: '3.4x', change: '+0.6x', up: true, accent: '#10B981' },
  { label: 'Dönüşüm', value: '1,247', change: '+18%', up: true, accent: '#8B5CF6' },
  { label: 'CPA', value: '₺38.6', change: '-14%', up: false, accent: '#F59E0B' },
] as const;

const sparklineHeights = [30, 45, 35, 55, 50, 65, 60, 75, 68, 80, 72, 85];

const chartBars = [
  { s: 35, r: 50 }, { s: 40, r: 55 }, { s: 30, r: 45 },
  { s: 55, r: 70 }, { s: 45, r: 62 }, { s: 60, r: 78 },
  { s: 50, r: 72 }, { s: 65, r: 85 }, { s: 55, r: 75 },
  { s: 70, r: 90 }, { s: 60, r: 82 }, { s: 75, r: 95 },
  { s: 68, r: 88 }, { s: 80, r: 98 },
];

const campaigns = [
  { name: 'Yaz İndirimi — Geniş Kitle', status: 'Aktif', spend: '₺12.4K', roas: '4.1x', active: true, highlight: true },
  { name: 'Sepet Terk — Retargeting', status: 'Aktif', spend: '₺8.7K', roas: '5.8x', active: true, highlight: false },
  { name: 'Benzer Kitle — Top %5', status: 'AI Durdurdu', spend: '₺4.2K', roas: '1.2x', active: false, highlight: false },
] as const;

export function Hero() {
  const t = useTranslations('landing');

  return (
    <section className="relative min-h-[100vh] flex flex-col items-center justify-center overflow-hidden pt-32 md:pt-40">
      {/* Inject CSS animations */}
      <style dangerouslySetInnerHTML={{ __html: cssAnimations }} />

      {/* Gradient orb */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(37,99,235,0.08) 0%, rgba(37,99,235,0.03) 40%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0, ease }}
          className="mb-8"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-black/[0.08] bg-white/80 backdrop-blur-sm text-[13px] font-medium text-[#6B7280]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {t('hero_badge')}
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          className="text-[clamp(2.75rem,6vw+0.5rem,5rem)] font-extrabold leading-[0.95] tracking-[-0.04em] text-[#1A1A1A]"
          style={{
            fontFamily: 'var(--font-display)',
            textWrap: 'balance',
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease }}
        >
          {t('hero_title')}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="mt-6 text-[clamp(1.1rem,1.5vw,1.25rem)] text-[#6B7280] max-w-2xl mx-auto leading-relaxed"
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
            className="group inline-flex items-center gap-2.5 px-7 py-3.5 bg-[#2563EB] text-white text-[15px] font-semibold rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.08),0_0_0_1px_rgba(37,99,235,0.4)] hover:shadow-[0_8px_30px_rgba(37,99,235,0.25)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
          >
            {t('hero_cta')}
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/book"
            className="group inline-flex items-center gap-2.5 px-7 py-3.5 text-[#1A1A1A]/50 text-[15px] font-medium hover:text-[#1A1A1A]/80 transition-colors"
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

        {/* ────────────────────────────────────────────
            Dashboard frame
        ──────────────────────────────────────────── */}
        <motion.div
          className="mt-20 md:mt-28 relative"
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
            className="relative rounded-2xl border border-black/[0.08] ring-1 ring-black/[0.04] bg-[#0C0D14] overflow-hidden"
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
              {/* AI çalışıyor indicator */}
              <div className="flex items-center gap-1.5">
                <span
                  className="w-1.5 h-1.5 rounded-full bg-[#10B981]"
                  style={{ animation: 'pulse-dot 2s ease-in-out infinite' }}
                />
                <span className="text-[10px] text-white/25 whitespace-nowrap hidden sm:inline">
                  AI çalışıyor...
                </span>
              </div>
            </div>

            {/* Dashboard content */}
            <div className="relative p-4 md:p-6 space-y-4">

              {/* Dot-grid pattern overlay */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)',
                  backgroundSize: '16px 16px',
                }}
              />

              {/* ── KPI cards ── */}
              <div className="relative grid grid-cols-2 md:grid-cols-4 gap-2.5">
                {kpis.map((kpi) => (
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
                        style={{ color: kpi.up ? '#10B981' : '#EF4444' }}
                      >
                        {kpi.change}
                      </span>
                    </div>
                    {/* Mini sparkline with shimmer */}
                    <div
                      className="mt-2 flex items-end gap-[2px] h-4"
                      style={{ animation: 'kpi-shimmer 4s ease-in-out infinite' }}
                    >
                      {sparklineHeights.map((h, i) => (
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

              {/* ── Chart area ── */}
              <div className="relative rounded-lg bg-white/[0.03] border border-white/[0.06] p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-medium text-white/35">
                    Performans Özeti
                  </span>
                  <div className="flex gap-3">
                    <span className="text-[10px] text-white/20 flex items-center gap-1.5">
                      <span className="w-2 h-[3px] rounded-full bg-[#3B82F6]" /> Harcama
                    </span>
                    <span className="text-[10px] text-white/20 flex items-center gap-1.5">
                      <span className="w-2 h-[3px] rounded-full bg-[#10B981]" /> Gelir
                    </span>
                  </div>
                </div>
                <div className="h-28 md:h-36 flex items-end gap-[3px]">
                  {chartBars.map((bar, i) => (
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

              {/* ── Campaign rows ── */}
              <div className="relative space-y-1.5">
                {campaigns.map((row) => (
                  <div
                    key={row.name}
                    className="flex items-center justify-between px-3 py-2 rounded-lg border border-white/[0.05] text-[11px] md:text-xs"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      borderLeft: !row.active
                        ? '2px solid rgba(245, 158, 11, 0.5)'
                        : undefined,
                      animation: row.highlight
                        ? 'row-highlight 3s ease-in-out 2s 1 forwards'
                        : undefined,
                    }}
                  >
                    <span className="text-white/50 truncate max-w-[35%]">{row.name}</span>

                    {row.active ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400">
                        {row.status}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/20">
                        <span
                          className="w-2 h-2 rounded-full bg-[#F59E0B]"
                          style={{ animation: 'amber-pulse 1.5s ease-in-out infinite' }}
                        />
                        {row.status}
                      </span>
                    )}

                    <span className="text-white/30 hidden sm:block">{row.spend}</span>
                    <span className="text-white/50 font-medium">{row.roas}</span>
                  </div>
                ))}
              </div>

              {/* ── Sektör Karşılaştırması ── */}
              <div className="relative rounded-lg bg-white/[0.05] border border-white/[0.07] p-3">
                <div className="text-[10px] font-medium text-white/35 mb-2.5">
                  Sektör Karşılaştırması
                </div>
                <div className="space-y-2">
                  {/* Your ROAS */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-white/40 w-24 text-left shrink-0">
                      Sizin ROAS
                    </span>
                    <div className="flex-1 h-3 rounded-full bg-white/[0.05] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#10B981]/60"
                        style={{ width: '81%' }}
                      />
                    </div>
                    <span className="text-[11px] font-bold text-[#10B981] w-10 text-right shrink-0">
                      3.4x
                    </span>
                  </div>
                  {/* Sector avg */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-white/40 w-24 text-left shrink-0">
                      Sektör Ort.
                    </span>
                    <div className="flex-1 h-3 rounded-full bg-white/[0.05] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-white/15"
                        style={{ width: '50%' }}
                      />
                    </div>
                    <span className="text-[11px] font-medium text-white/40 w-10 text-right shrink-0">
                      2.1x
                    </span>
                  </div>
                </div>
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
