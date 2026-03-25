'use client';

import { useTranslations } from '@/lib/i18n';
import { ScrollReveal, StaggerContainer, StaggerItem } from './ScrollReveal';

export function WhatItDoes() {
  const t = useTranslations('landing');

  const features = [
    { title: t('feature_autopilot_title'), desc: t('feature_autopilot_desc') },
    { title: t('feature_suggestions_title'), desc: t('feature_suggestions_desc') },
    { title: t('feature_dashboard_title'), desc: t('feature_dashboard_desc') },
  ];

  return (
    <section className="py-24">
      <div className="max-w-5xl mx-auto px-6">
        <ScrollReveal>
          <h2
            className="text-[32px] font-bold text-[#1A1A1A] text-center mb-12"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {t('features_heading')}
          </h2>
        </ScrollReveal>

        <StaggerContainer className="grid md:grid-cols-3 gap-4">
          {features.map((feature, i) => (
            <StaggerItem key={i}>
              <div className="bg-white border border-black/[0.06] rounded-2xl p-8 transition-all duration-200 hover:border-black/[0.1] hover:shadow-sm">
                <h3
                  className="text-[20px] font-semibold text-[#1A1A1A] mb-3"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {feature.title}
                </h3>
                <p className="text-[15px] text-[#6B7280] leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
