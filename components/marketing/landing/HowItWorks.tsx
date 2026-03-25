'use client';

import { useTranslations } from '@/lib/i18n';
import { ScrollReveal } from './ScrollReveal';

export function HowItWorks() {
  const t = useTranslations('landing');

  const steps = [
    { num: '1', title: t('step1_title'), desc: t('step1_desc') },
    { num: '2', title: t('step2_title'), desc: t('step2_desc') },
    { num: '3', title: t('step3_title'), desc: t('step3_desc') },
  ];

  return (
    <section className="py-20">
      <div className="max-w-4xl mx-auto px-6">
        <ScrollReveal>
          <h2
            className="text-[32px] font-bold text-[#1A1A1A] text-center mb-12"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {t('how_it_works_heading')}
          </h2>

          <div className="grid md:grid-cols-3 gap-8 mt-12 relative">
            <div className="hidden md:block absolute top-4 left-[16.67%] right-[16.67%] h-px bg-[#E5E7EB]" />

            {steps.map((step) => (
              <div key={step.num} className="text-center">
                <div className="w-8 h-8 rounded-full bg-[#EFF6FF] text-[#2563EB] font-mono text-sm flex items-center justify-center mx-auto relative z-10">
                  {step.num}
                </div>
                <h3
                  className="mt-4 text-[18px] font-semibold text-[#1A1A1A]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {step.title}
                </h3>
                <p className="mt-1 text-[14px] text-[#6B7280]">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
