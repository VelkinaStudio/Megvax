'use client';

import { Zap, Target, LayoutDashboard, TrendingUp, Shield, Clock } from 'lucide-react';
import { useTranslations } from '@/lib/i18n';
import { ScrollReveal, StaggerContainer, StaggerItem } from './ScrollReveal';

const features = [
  { icon: Zap, key: 'autopilot', accent: '#3B82F6' },
  { icon: Target, key: 'suggestions', accent: '#8B5CF6' },
  { icon: LayoutDashboard, key: 'dashboard', accent: '#10B981' },
  { icon: TrendingUp, key: 'scaling', accent: '#F59E0B' },
  { icon: Shield, key: 'protection', accent: '#EC4899' },
  { icon: Clock, key: 'realtime', accent: '#06B6D4' },
] as const;

export function WhatItDoes() {
  const t = useTranslations('landing');

  return (
    <section id="features" className="relative py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section header */}
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="text-xs font-medium uppercase tracking-widest text-[#3B82F6]/80 mb-3 block">
              {t('features_label')}
            </span>
            <h2
              className="text-2xl md:text-4xl font-bold text-white tracking-[-0.02em]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {t('features_heading')}
            </h2>
            <p className="text-sm md:text-base text-white/40 mt-3 max-w-lg mx-auto">
              {t('features_subheading')}
            </p>
          </div>
        </ScrollReveal>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" stagger={0.08}>
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <StaggerItem key={feature.key}>
                <div className="group relative rounded-2xl bg-white/[0.04] border border-white/[0.08] p-6 hover:bg-white/[0.06] hover:border-white/[0.14] transition-all duration-300">
                  {/* Accent glow on hover */}
                  <div
                    className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${feature.accent}40, transparent)`,
                    }}
                  />

                  {/* Icon */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${feature.accent}10` }}
                  >
                    <Icon
                      className="w-5 h-5"
                      style={{ color: feature.accent }}
                    />
                  </div>

                  {/* Title */}
                  <h3
                    className="text-[15px] font-semibold text-white mb-1.5 tracking-[-0.01em]"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {t(`feature_${feature.key}_title`)}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-white/45 leading-relaxed">
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
