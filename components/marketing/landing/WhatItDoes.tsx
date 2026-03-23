'use client';

import { Zap, Target, LayoutDashboard } from 'lucide-react';
import { useTranslations } from '@/lib/i18n';
import { ScrollReveal, StaggerContainer, StaggerItem } from './ScrollReveal';

const features = [
  { icon: Zap, key: 'autopilot' },
  { icon: Target, key: 'suggestions' },
  { icon: LayoutDashboard, key: 'dashboard' },
] as const;

export function WhatItDoes() {
  const t = useTranslations('landing');

  return (
    <section id="features" className="relative py-24 md:py-32">
      <div className="max-w-5xl mx-auto px-6">
        <ScrollReveal>
          <h2
            className="text-2xl md:text-3xl font-bold text-white text-center mb-4 tracking-[-0.02em]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {t('features_heading')}
          </h2>
        </ScrollReveal>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-14" stagger={0.1}>
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <StaggerItem key={feature.key}>
                <div className="group relative rounded-2xl bg-white/[0.03] border border-white/[0.07] p-7 hover:bg-white/[0.05] hover:border-white/[0.12] transition-all duration-300">
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-xl bg-[#2563EB]/10 flex items-center justify-center mb-5">
                    <Icon className="w-5 h-5 text-[#60A5FA]" />
                  </div>

                  {/* Title */}
                  <h3
                    className="text-[17px] font-semibold text-white mb-2 tracking-[-0.01em]"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {t(`feature_${feature.key}_title`)}
                  </h3>

                  {/* Description — 2 lines max */}
                  <p className="text-sm text-white/40 leading-relaxed">
                    {t(`feature_${feature.key}_desc`)}
                  </p>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
