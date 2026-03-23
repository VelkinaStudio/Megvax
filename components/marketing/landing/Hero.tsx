'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useTranslations } from '@/lib/i18n';

export function Hero() {
  const t = useTranslations('landing');

  return (
    <section className="relative min-h-[100vh] flex items-center justify-center overflow-hidden pt-16">
      {/* Background — subtle radial gradient, no gimmicks */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 30%, #111827 0%, #0A0A0F 70%)',
        }}
      />

      {/* Faint grid — adds depth without being distracting */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '64px 64px',
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Headline */}
        <motion.h1
          className="text-[clamp(2.5rem,7vw,5.5rem)] font-extrabold leading-[0.95] tracking-[-0.03em] text-white"
          style={{ fontFamily: 'var(--font-display)' }}
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {t('hero_title')}
        </motion.h1>

        {/* Subtext */}
        <motion.p
          className="mt-6 text-lg md:text-xl text-white/45 max-w-xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          {t('hero_subtitle')}
        </motion.p>

        {/* CTA */}
        <motion.div
          className="mt-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link
            href="/signup"
            className="group inline-flex items-center gap-2.5 px-7 py-3.5 bg-[#2563EB] text-white text-[15px] font-semibold rounded-xl hover:bg-[#1D4ED8] transition-all duration-200 hover:shadow-[0_0_40px_rgba(37,99,235,0.25)]"
          >
            {t('hero_cta')}
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </motion.div>

        {/* Dashboard Preview — clipped, with perspective tilt */}
        <motion.div
          className="mt-16 md:mt-20 relative"
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Glow behind the preview */}
          <div className="absolute -inset-8 bg-[#2563EB]/[0.08] rounded-3xl blur-3xl" />

          {/* Dashboard mockup frame */}
          <div
            className="relative rounded-xl border border-white/[0.08] bg-[#0F1117] overflow-hidden shadow-2xl"
            style={{
              transform: 'perspective(2000px) rotateX(4deg)',
              transformOrigin: 'bottom center',
            }}
          >
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-[#0A0B10]">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
              </div>
              <div className="flex-1 mx-8">
                <div className="h-5 bg-white/[0.04] rounded-md max-w-xs mx-auto" />
              </div>
            </div>

            {/* Dashboard content — schematic, not a screenshot */}
            <div className="p-6 md:p-8 space-y-5">
              {/* Top row — KPIs */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: 'Harcama', value: '₺48.2K', color: 'bg-[#2563EB]/20 text-[#60A5FA]' },
                  { label: 'ROAS', value: '3.4x', color: 'bg-emerald-500/20 text-emerald-400' },
                  { label: 'Dönüşüm', value: '1,247', color: 'bg-violet-500/20 text-violet-400' },
                  { label: 'CPA', value: '₺38.6', color: 'bg-amber-500/20 text-amber-400' },
                ].map((kpi) => (
                  <div
                    key={kpi.label}
                    className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-3 md:p-4"
                  >
                    <div className="text-[10px] md:text-xs text-white/30 mb-1">{kpi.label}</div>
                    <div className={`text-sm md:text-lg font-bold ${kpi.color.split(' ')[1]}`}>
                      {kpi.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chart area placeholder */}
              <div className="rounded-lg bg-white/[0.02] border border-white/[0.04] h-32 md:h-44 flex items-end px-4 pb-4 gap-1.5">
                {[40, 55, 35, 65, 50, 72, 60, 80, 68, 85, 75, 90].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-sm bg-[#2563EB]/30"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>

              {/* Campaign rows */}
              <div className="space-y-2">
                {[
                  { name: 'Summer Sale — Broad', status: 'Aktif', spend: '₺12.4K', roas: '4.1x' },
                  { name: 'Retargeting — Cart', status: 'Aktif', spend: '₺8.7K', roas: '5.8x' },
                  { name: 'Lookalike — Top 5%', status: 'Duraklatıldı', spend: '₺4.2K', roas: '1.2x' },
                ].map((row) => (
                  <div
                    key={row.name}
                    className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04] text-xs md:text-sm"
                  >
                    <span className="text-white/60 truncate max-w-[40%]">{row.name}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                        row.status === 'Aktif'
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : 'bg-white/5 text-white/30'
                      }`}
                    >
                      {row.status}
                    </span>
                    <span className="text-white/40 hidden sm:block">{row.spend}</span>
                    <span className="text-white/60 font-medium">{row.roas}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Fade-out at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0A0A0F] to-transparent pointer-events-none" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
