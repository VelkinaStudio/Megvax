'use client';

import { useTranslations } from '@/lib/i18n';
import { ScrollReveal } from './ScrollReveal';

const steps = [
  { number: '01', key: 'step1' },
  { number: '02', key: 'step2' },
  { number: '03', key: 'step3' },
] as const;

export function HowItWorks() {
  const t = useTranslations('landing');

  return (
    <section className="relative py-16 md:py-20">
      <div className="max-w-4xl mx-auto px-6">
        <ScrollReveal>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8 md:gap-0">
            {steps.map((step, i) => (
              <div key={step.key} className="flex items-center flex-1">
                <div className="flex items-start gap-4 flex-1">
                  {/* Step number */}
                  <span
                    className="text-xs font-bold text-[#2563EB] bg-[#2563EB]/10 w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {step.number}
                  </span>

                  <div>
                    <h3
                      className="text-[15px] font-semibold text-white tracking-[-0.01em]"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      {t(`${step.key}_title`)}
                    </h3>
                    <p className="text-sm text-white/35 mt-0.5">
                      {t(`${step.key}_desc`)}
                    </p>
                  </div>
                </div>

                {/* Connector line (not on last) */}
                {i < steps.length - 1 && (
                  <div className="hidden md:block w-12 h-px bg-white/[0.08] mx-4 shrink-0" />
                )}
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
