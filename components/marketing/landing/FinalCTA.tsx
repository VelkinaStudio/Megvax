'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, CreditCard, Clock } from 'lucide-react';
import { useTranslations } from '@/lib/i18n';
import { ScrollReveal } from './ScrollReveal';

// ─── Floating UI preview elements ────────────────────────────────────────────

function FloatingCard({
  className,
  delay,
  children,
}: {
  className: string;
  delay: number;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      className={`absolute rounded-xl bg-white/[0.06] backdrop-blur-sm border border-white/[0.08] shadow-lg pointer-events-none ${className}`}
      animate={{
        y: [0, -8, 0],
        rotate: [0, 0.5, 0],
      }}
      transition={{
        duration: 5,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  );
}

// ─── Trust badges ────────────────────────────────────────────────────────────

const trustBadges = [
  { icon: Shield, key: 'cta_trust_free' },
  { icon: CreditCard, key: 'cta_trust_no_card' },
  { icon: Clock, key: 'cta_trust_setup' },
] as const;

// ─── Main Component ──────────────────────────────────────────────────────────

export function FinalCTA() {
  const t = useTranslations('landing');

  return (
    <section className="py-8 sm:py-12 px-4 sm:px-6">
      <ScrollReveal>
        <div className="relative overflow-hidden rounded-3xl sm:rounded-[2rem] bg-landing-frame-bg mx-auto max-w-7xl">
          {/* Background effects */}
          <div className="absolute inset-0">
            {/* Large gradient orbs */}
            <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-[#2563EB]/20 blur-[120px] -translate-y-1/2" />
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-violet-500/15 blur-[100px] translate-y-1/3" />
            <div className="absolute top-1/2 left-0 w-[300px] h-[300px] rounded-full bg-cyan-500/10 blur-[80px] -translate-x-1/2" />

            {/* Dot grid overlay */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
                backgroundSize: '28px 28px',
              }}
            />

            {/* Subtle gradient mesh lines */}
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                backgroundSize: '60px 60px',
              }}
            />
          </div>

          {/* Floating UI preview elements */}
          <FloatingCard className="top-12 left-8 sm:left-16 p-3 hidden lg:block" delay={0}>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-emerald-500/20 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>
              <div>
                <div className="h-1.5 w-12 rounded bg-white/15 mb-1" />
                <div className="h-1 w-8 rounded bg-white/8" />
              </div>
            </div>
          </FloatingCard>

          <FloatingCard className="top-20 right-10 sm:right-20 p-3 hidden lg:block" delay={1.5}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-6 rounded bg-[#2563EB]/20 flex items-center justify-center text-[8px] text-[#2563EB]/60 font-mono">
                4.3x
              </div>
              <div className="h-4 w-16 flex items-end gap-[2px]">
                {[40, 55, 45, 70, 65, 80, 75].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t bg-[#2563EB]/30"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
          </FloatingCard>

          <FloatingCard className="bottom-24 left-12 sm:left-24 p-2.5 hidden lg:block" delay={2.5}>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-violet-500/20 flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="h-1.5 w-14 rounded bg-white/10" />
            </div>
          </FloatingCard>

          <FloatingCard className="bottom-16 right-16 sm:right-28 p-2.5 hidden lg:block" delay={3.5}>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded bg-amber-500/20 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              </div>
              <div>
                <div className="h-1 w-10 rounded bg-white/12 mb-0.5" />
                <div className="h-1 w-6 rounded bg-emerald-400/20" />
              </div>
            </div>
          </FloatingCard>

          {/* Content */}
          <div className="relative z-10 py-20 sm:py-28 lg:py-32 px-6 sm:px-10 text-center">
            {/* Social proof badge */}
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.08] border border-white/[0.08] text-white/60 text-xs font-medium mb-8"
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              {t('cta_join_count')}
            </motion.div>

            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-5 leading-tight max-w-2xl mx-auto"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {t('cta_heading')}
            </h2>

            <p className="text-white/45 max-w-lg mx-auto mb-10 text-sm sm:text-base leading-relaxed">
              {t('cta_subtitle')}
            </p>

            {/* Dual CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              {/* Primary CTA */}
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href="/signup"
                  className="group inline-flex items-center justify-center px-8 py-4 rounded-xl bg-white text-landing-frame-bg font-semibold text-sm hover:bg-white/90 transition-all duration-300 shadow-xl shadow-black/20"
                >
                  {t('cta_button')}
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </motion.div>

              {/* Secondary CTA */}
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href="/book"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-white/[0.08] border border-white/[0.12] text-white/80 font-semibold text-sm hover:bg-white/[0.12] hover:text-white transition-all duration-300"
                >
                  {t('cta_book_demo')}
                </Link>
              </motion.div>
            </div>

            {/* Trust badges — more prominent */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs text-white/40">
              {trustBadges.map(({ icon: Icon, key }) => (
                <span key={key} className="flex items-center gap-2 bg-white/[0.04] px-3 py-1.5 rounded-full">
                  <Icon className="w-3.5 h-3.5 text-white/50" />
                  {t(key)}
                </span>
              ))}
            </div>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
