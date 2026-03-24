'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useTranslations } from '@/lib/i18n';
import { ScrollReveal } from './ScrollReveal';

export function FinalCTA() {
  const t = useTranslations('landing');

  return (
    <section className="relative py-24 md:py-32">
      {/* Background glow — subtle, layered */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 50% 40% at 50% 60%, rgba(37,99,235,0.08) 0%, transparent 70%),
            radial-gradient(ellipse 80% 30% at 50% 100%, rgba(37,99,235,0.04) 0%, transparent 50%)
          `,
        }}
      />

      <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
        <ScrollReveal>
          <h2
            className="text-2xl md:text-4xl font-bold text-white tracking-[-0.02em]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {t('cta_heading')}
          </h2>

          <p className="mt-4 text-sm md:text-base text-white/40 max-w-md mx-auto">
            {t('cta_subheading')}
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2.5 px-7 py-3.5 bg-[#2563EB] text-white text-[15px] font-semibold rounded-xl hover:bg-[#1D4ED8] transition-all duration-200 hover:shadow-[0_0_40px_rgba(37,99,235,0.3)]"
            >
              {t('cta_button')}
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/book"
              className="inline-flex items-center gap-2 px-7 py-3.5 text-white/50 text-[15px] font-medium rounded-xl border border-white/[0.08] hover:border-white/[0.15] hover:text-white/70 transition-all duration-200"
            >
              {t('hero_cta_secondary')}
            </Link>
          </div>

          <p className="mt-4 text-xs text-white/20">
            {t('cta_trust')}
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
