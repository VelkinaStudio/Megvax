'use client';

import { useTranslations } from '@/lib/i18n';
import { ScrollReveal } from './ScrollReveal';

/**
 * ProductShowcaseSection wraps the existing showcase area with a proper
 * section header and dark background for visual rhythm.
 *
 * The actual ProductShowcase tabs (Insights, Creative, Tree, Benchmark)
 * are rendered inside HowItWorks or as standalone. This section provides
 * the framing: dark bg, badge, heading, subtitle.
 */
export function ProductShowcaseSection({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations('landing');

  return (
    <section className="relative py-24 md:py-32 bg-landing-frame-bg overflow-hidden">
      {/* Background texture */}
      <div
        className="absolute inset-0 opacity-100"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Subtle gradient accents */}
      <div className="absolute top-0 left-1/3 w-[400px] h-[400px] rounded-full bg-[#2563EB]/8 blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] rounded-full bg-violet-500/5 blur-[100px]" />

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        {/* Section header */}
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 rounded-full bg-white/[0.06] text-white/50 text-xs font-medium mb-4 border border-white/[0.06]">
              {t('showcase_section_badge')}
            </span>
            <h2
              className="text-[clamp(1.75rem,4vw,2.5rem)] font-bold tracking-tight text-white mb-4"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {t('showcase_section_heading')}
            </h2>
            <p className="text-white/40 max-w-md mx-auto text-sm sm:text-base">
              {t('showcase_section_subtitle')}
            </p>
          </div>
        </ScrollReveal>

        {/* Showcase content (children passed from page) */}
        {children}
      </div>
    </section>
  );
}
