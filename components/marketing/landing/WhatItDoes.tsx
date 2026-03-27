'use client';

import { motion } from 'framer-motion';
import { type ReactNode } from 'react';
import { useTranslations } from '@/lib/i18n';
import { ScrollReveal, StaggerContainer, StaggerItem } from './ScrollReveal';

// ─── MockupFrame with tilt hover ────────────────────────────────────────────
function MockupFrame({
  children,
  glowColor = 'bg-accent-primary/5',
}: {
  children: ReactNode;
  glowColor?: string;
}) {
  return (
    <motion.div
      className="group/mockup relative"
      whileHover={{ scale: 1.02, rotateY: -2, rotateX: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      style={{ transformPerspective: 1000 }}
    >
      {/* Glow effect */}
      <div
        className={`absolute -inset-4 rounded-3xl ${glowColor} opacity-0 group-hover/mockup:opacity-100 blur-2xl transition-opacity duration-700`}
      />
      {/* Shadow depth */}
      <div className="absolute -inset-1 rounded-2xl bg-gradient-to-b from-white/[0.05] to-transparent opacity-0 group-hover/mockup:opacity-100 transition-opacity duration-500" />
      <div className="relative">{children}</div>
    </motion.div>
  );
}

// ─── Autopilot Mockup — Activity Feed ───────────────────────────────────────
function AutopilotMockup() {
  const t = useTranslations('landing');

  const items = [
    {
      action: t('autopilot_action_paused'),
      campaign: t('autopilot_campaign_1'),
      reason: t('autopilot_reason_1'),
      color: 'text-amber-400',
      bg: 'bg-amber-400/10',
      saved: t('autopilot_saved_1'),
      time: t('autopilot_time_1'),
    },
    {
      action: t('autopilot_action_scaled'),
      campaign: t('autopilot_campaign_2'),
      reason: t('autopilot_reason_2'),
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10',
      saved: null,
      time: t('autopilot_time_2'),
    },
    {
      action: t('autopilot_action_paused'),
      campaign: t('autopilot_campaign_3'),
      reason: t('autopilot_reason_3'),
      color: 'text-amber-400',
      bg: 'bg-amber-400/10',
      saved: t('autopilot_saved_3'),
      time: t('autopilot_time_3'),
    },
  ];

  return (
    <MockupFrame glowColor="bg-amber-500/8">
      <div className="rounded-2xl bg-landing-frame-bg p-5 shadow-2xl shadow-black/20 border border-white/[0.06]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] text-white/50 font-medium">
              {t('autopilot_active')}
            </span>
          </div>
          <span className="text-[10px] text-white/30">{t('autopilot_last_hours')}</span>
        </div>
        <div className="space-y-2.5">
          {items.map((item, i) => (
            <motion.div
              key={i}
              className="flex items-center gap-3 rounded-xl bg-white/[0.04] border border-white/[0.06] px-3 py-3 hover:bg-white/[0.06] transition-colors"
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
            >
              <span
                className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${item.bg} ${item.color} whitespace-nowrap`}
              >
                {item.action}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white/80 truncate">{item.campaign}</p>
                <p className="text-[10px] text-white/40">{item.reason}</p>
              </div>
              <div className="text-right shrink-0">
                {item.saved && (
                  <p className="text-[10px] text-emerald-400 font-medium">
                    {item.saved}
                  </p>
                )}
                <p className="text-[9px] text-white/20">{item.time}</p>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="mt-4 pt-3 border-t border-white/[0.05] flex items-center justify-between">
          <span className="text-[10px] text-white/30">{t('autopilot_actions_completed')}</span>
          <span className="text-[11px] text-emerald-400 font-semibold">
            {t('autopilot_total_saved')}
          </span>
        </div>
      </div>
    </MockupFrame>
  );
}

// ─── Smart Suggestions Mockup ─────────────────────────────────────────────
function SuggestionsMockup() {
  const t = useTranslations('landing');

  return (
    <MockupFrame glowColor="bg-violet-500/8">
      <div className="rounded-2xl bg-landing-frame-bg p-5 shadow-2xl shadow-black/20 border border-white/[0.06]">
        <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-4 mb-3">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center shrink-0">
              <svg
                className="w-4 h-4 text-violet-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-xs font-medium text-white/90">
                  {t('suggestion_title')}
                </p>
                <span className="px-1.5 py-0.5 rounded text-[9px] bg-violet-500/15 text-violet-400">
                  {t('suggestion_confidence')}
                </span>
              </div>
              <p className="text-[11px] text-white/50 leading-relaxed">
                {t('suggestion_description')}
              </p>
            </div>
          </div>
          <div className="rounded-lg bg-white/[0.03] p-3 mb-4">
            <p className="text-[10px] text-white/30 mb-2">{t('suggestion_estimated_impact')}</p>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-xs font-semibold text-white/80">{t('suggestion_extra_revenue')}</p>
                <p className="text-[9px] text-white/30">{t('suggestion_extra_revenue_label')}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-violet-400">{t('suggestion_expected_roas')}</p>
                <p className="text-[9px] text-white/30">{t('suggestion_expected_roas_label')}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-white/80">{t('suggestion_expected_cpa')}</p>
                <p className="text-[9px] text-white/30">{t('suggestion_expected_cpa_label')}</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 px-3 py-2 rounded-lg bg-violet-500 text-white text-[11px] font-medium text-center">
              {t('suggestion_approve')}
            </div>
            <div className="px-4 py-2 rounded-lg bg-white/[0.06] text-white/50 text-[11px] text-center">
              {t('suggestion_reject')}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
          <span className="text-[10px] text-white/30">
            {t('suggestion_pending')}
          </span>
        </div>
      </div>
    </MockupFrame>
  );
}

// ─── Dashboard Mockup ──────────────────────────────────────────────────────
function DashboardMockup() {
  const t = useTranslations('landing');

  const accounts = [
    { nameKey: 'dashboard_account_1', spendKey: 'dashboard_spend_1', roasKey: 'dashboard_roas_1', campaigns: 5, color: 'bg-violet-500' },
    { nameKey: 'dashboard_account_2', spendKey: 'dashboard_spend_2', roasKey: 'dashboard_roas_2', campaigns: 3, color: 'bg-cyan-500' },
    { nameKey: 'dashboard_account_3', spendKey: 'dashboard_spend_3', roasKey: 'dashboard_roas_3', campaigns: 4, color: 'bg-rose-500' },
  ];

  return (
    <MockupFrame glowColor="bg-teal-500/8">
      <div className="rounded-2xl bg-landing-frame-bg p-5 shadow-2xl shadow-black/20 border border-white/[0.06]">
        <div className="flex gap-1 mb-4 p-1 rounded-lg bg-white/[0.04]">
          <div className="px-3 py-1.5 rounded-md bg-white/[0.08] text-[10px] text-white/80 font-medium">
            {t('dashboard_tab_all_accounts')}
          </div>
          <div className="px-3 py-1.5 rounded-md text-[10px] text-white/30">
            {t('dashboard_tab_campaigns')}
          </div>
          <div className="px-3 py-1.5 rounded-md text-[10px] text-white/30">
            {t('dashboard_tab_reports')}
          </div>
        </div>
        <div className="space-y-2">
          {accounts.map((account, i) => (
            <motion.div
              key={i}
              className="flex items-center gap-3 rounded-xl bg-white/[0.04] border border-white/[0.06] px-4 py-3 hover:bg-white/[0.06] transition-colors"
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
            >
              <div
                className={`w-9 h-9 rounded-lg ${account.color} flex items-center justify-center text-white text-xs font-bold`}
              >
                {t(account.nameKey)[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white/85">
                  {t(account.nameKey)}
                </p>
                <p className="text-[10px] text-white/35">
                  {t('dashboard_active_campaigns', { count: String(account.campaigns) })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-mono text-white/70 font-medium">
                  {t(account.spendKey)}
                </p>
                <p className="text-[10px] text-emerald-400 font-medium">
                  {t(account.roasKey)} ROAS
                </p>
              </div>
              <svg
                className="w-4 h-4 text-white/20"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 4.5l7.5 7.5-7.5 7.5"
                />
              </svg>
            </motion.div>
          ))}
        </div>
        <div className="mt-4 pt-3 border-t border-white/[0.05] flex items-center justify-between">
          <span className="text-[10px] text-white/30">
            {t('dashboard_summary')}
          </span>
          <span className="text-[11px] text-white/60 font-medium">
            {t('dashboard_total')}
          </span>
        </div>
      </div>
    </MockupFrame>
  );
}

// ─── Feature Section Config ──────────────────────────────────────────────────
interface FeatureConfig {
  numberKey: string;
  titleKey: string;
  descKey: string;
  badgeKey: string;
  badgeColor: string;
  gradientFrom: string;
  gradientTo: string;
  accentColor: string;
  mockup: ReactNode;
}

const featureConfigs: FeatureConfig[] = [
  {
    numberKey: 'what_it_does_feature1_number',
    titleKey: 'what_it_does_feature1_title',
    descKey: 'what_it_does_feature1_desc',
    badgeKey: 'what_it_does_feature1_badge',
    badgeColor: 'bg-amber-500/10 text-amber-600',
    gradientFrom: 'from-amber-50/50',
    gradientTo: 'to-transparent',
    accentColor: 'text-amber-500/20',
    mockup: <AutopilotMockup />,
  },
  {
    numberKey: 'what_it_does_feature2_number',
    titleKey: 'what_it_does_feature2_title',
    descKey: 'what_it_does_feature2_desc',
    badgeKey: 'what_it_does_feature2_badge',
    badgeColor: 'bg-violet-500/10 text-violet-600',
    gradientFrom: 'from-violet-50/50',
    gradientTo: 'to-transparent',
    accentColor: 'text-violet-500/20',
    mockup: <SuggestionsMockup />,
  },
  {
    numberKey: 'what_it_does_feature3_number',
    titleKey: 'what_it_does_feature3_title',
    descKey: 'what_it_does_feature3_desc',
    badgeKey: 'what_it_does_feature3_badge',
    badgeColor: 'bg-teal-500/10 text-teal-600',
    gradientFrom: 'from-teal-50/50',
    gradientTo: 'to-transparent',
    accentColor: 'text-teal-500/20',
    mockup: <DashboardMockup />,
  },
];

// ─── Main Component ──────────────────────────────────────────────────────────
export function WhatItDoes() {
  const t = useTranslations('landing');

  return (
    <section id="features" className="py-24 md:py-32 scroll-mt-20">
      <div className="mx-auto max-w-6xl px-6">
        {/* Section Header */}
        <ScrollReveal>
          <div className="text-center mb-20">
            <span className="inline-block px-3 py-1 rounded-full bg-accent-primary/8 text-accent-primary text-xs font-medium mb-4">
              {t('what_it_does_section_badge')}
            </span>
            <h2
              className="text-[clamp(1.75rem,4vw,2.5rem)] font-bold text-landing-text tracking-[-0.03em] mb-4"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {t('what_it_does_section_heading')}
            </h2>
            <p className="text-landing-text-muted max-w-md mx-auto">
              {t('what_it_does_section_subtitle')}
            </p>
          </div>
        </ScrollReveal>

        {/* Bento-grid Feature Rows */}
        <div className="space-y-16">
          {featureConfigs.map((feature, idx) => (
            <StaggerContainer
              key={feature.titleKey}
              className={`relative rounded-3xl bg-gradient-to-br ${feature.gradientFrom} ${feature.gradientTo} border border-black/[0.04] overflow-hidden`}
            >
              {/* Large background number watermark */}
              <div
                className={`absolute top-6 right-8 text-[120px] sm:text-[180px] font-black ${feature.accentColor} leading-none select-none pointer-events-none`}
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {t(feature.numberKey)}
              </div>

              <div
                className={`relative grid md:grid-cols-2 gap-8 lg:gap-12 items-center p-8 sm:p-10 lg:p-14 ${
                  idx % 2 === 1 ? 'md:[direction:rtl]' : ''
                }`}
              >
                {/* Text Column */}
                <StaggerItem className={idx % 2 === 1 ? 'md:[direction:ltr]' : ''}>
                  <div>
                    {/* Number + Badge row */}
                    <div className="flex items-center gap-3 mb-5">
                      <span
                        className="text-3xl sm:text-4xl font-black text-landing-text/10"
                        style={{ fontFamily: 'var(--font-display)' }}
                      >
                        {t(feature.numberKey)}
                      </span>
                      <span
                        className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-medium ${feature.badgeColor}`}
                      >
                        {t(feature.badgeKey)}
                      </span>
                    </div>

                    <h3
                      className="text-xl sm:text-2xl lg:text-3xl font-bold text-landing-text mb-4 tracking-[-0.02em]"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      {t(feature.titleKey)}
                    </h3>
                    <p className="text-[15px] sm:text-base text-landing-text-muted leading-relaxed max-w-md">
                      {t(feature.descKey)}
                    </p>
                  </div>
                </StaggerItem>

                {/* Mockup Column */}
                <StaggerItem className={idx % 2 === 1 ? 'md:[direction:ltr]' : ''}>
                  {feature.mockup}
                </StaggerItem>
              </div>
            </StaggerContainer>
          ))}
        </div>
      </div>
    </section>
  );
}
