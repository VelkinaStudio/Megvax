'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, CreditCard, Clock } from 'lucide-react';
import { useTranslations } from '@/lib/i18n';
import { ScrollReveal } from './ScrollReveal';

const trustBadges = [
  { icon: Shield, key: 'cta_trust_free' },
  { icon: CreditCard, key: 'cta_trust_no_card' },
  { icon: Clock, key: 'cta_trust_setup' },
] as const;

export function FinalCTA() {
  const t = useTranslations('landing');

  return (
    <section className="py-28 px-6">
      <div className="mx-auto max-w-4xl">
        <ScrollReveal>
          <div className="relative overflow-hidden rounded-3xl bg-landing-frame-bg p-10 sm:p-14 text-center">
            {/* Gradient orbs */}
            <div className="absolute top-0 left-0 w-[400px] h-[400px] rounded-full bg-[#2563EB]/15 blur-[100px] -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-[300px] h-[300px] rounded-full bg-violet-500/10 blur-[80px] translate-x-1/3 translate-y-1/3" />

            {/* Dot grid overlay */}
            <div
              className="absolute inset-0 opacity-100"
              style={{
                backgroundImage:
                  'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />

            {/* Content */}
            <div className="relative z-10">
              {/* Live badge */}
              <motion.div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.08] border border-white/[0.06] text-white/60 text-xs font-medium mb-6"
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1, duration: 0.5 }}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                </span>
                {t('cta_social_proof')}
              </motion.div>

              <h2
                className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white mb-5 leading-tight"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {t('cta_heading')}
              </h2>

              <p className="text-white/50 max-w-md mx-auto mb-8 text-sm sm:text-base leading-relaxed">
                {t('cta_subtitle')}
              </p>

              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="inline-block"
              >
                <Link
                  href="/signup"
                  className="group inline-flex items-center justify-center px-8 py-4 rounded-xl bg-white text-landing-frame-bg font-semibold text-sm hover:bg-white/90 transition-all duration-300 shadow-xl shadow-black/20"
                >
                  {t('cta_button')}
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </motion.div>

              <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mt-6 text-xs text-white/35">
                {trustBadges.map(({ icon: Icon, key }) => (
                  <span key={key} className="flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5" />
                    {t(key)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
