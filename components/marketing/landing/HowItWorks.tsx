'use client';

import { useTranslations } from '@/lib/i18n';
import { ScrollReveal, StaggerContainer, StaggerItem } from './ScrollReveal';

const steps = [
  { number: '1', key: 'step1', accent: '#3B82F6' },
  { number: '2', key: 'step2', accent: '#8B5CF6' },
  { number: '3', key: 'step3', accent: '#10B981' },
] as const;

export function HowItWorks() {
  const t = useTranslations('landing');

  return (
    <section className="relative py-20 md:py-28">
      {/* Subtle divider */}
      <div className="absolute inset-x-0 top-0 h-px bg-white/[0.04]" />

      <div className="max-w-5xl mx-auto px-6">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="text-xs font-medium uppercase tracking-widest text-white/20 mb-3 block">
              {t('how_it_works_label')}
            </span>
            <h2
              className="text-2xl md:text-3xl font-bold text-white tracking-[-0.02em]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {t('how_it_works_heading')}
            </h2>
          </div>
        </ScrollReveal>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 relative" stagger={0.12}>
          {/* Connecting line (desktop only) */}
          <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

          {steps.map((step) => (
            <StaggerItem key={step.key}>
              <div className="text-center">
                {/* Number circle */}
                <div className="relative inline-flex mb-6">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-base font-bold text-white"
                    style={{
                      backgroundColor: `${step.accent}12`,
                      border: `1px solid ${step.accent}25`,
                    }}
                  >
                    <span style={{ color: step.accent }}>{step.number}</span>
                  </div>
                </div>

                {/* Title */}
                <h3
                  className="text-base font-semibold text-white mb-1.5 tracking-[-0.01em]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {t(`${step.key}_title`)}
                </h3>

                {/* Description */}
                <p className="text-sm text-white/40">
                  {t(`${step.key}_desc`)}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
