'use client';

import { motion } from 'framer-motion';
import { type ReactNode } from 'react';
import { useTranslations } from '@/lib/i18n';
import { ScrollReveal, StaggerContainer, StaggerItem } from './ScrollReveal';

// ─── Mini-mockup frame (dark product preview) ────────────────────────────────
function MiniMockup({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl bg-landing-frame-bg p-3 shadow-lg shadow-black/10 border border-white/[0.06] text-left">
      {children}
    </div>
  );
}

// ─── Step 1: OAuth Connect Mockup ────────────────────────────────────────────
function OAuthMockup({ t }: { t: (key: string) => string }) {
  const accounts = [
    { name: 'Moda Store', connected: true },
    { name: 'Tech Shop', connected: true },
    { name: 'Beauty Brand', connected: false },
  ];

  return (
    <MiniMockup>
      <div className="flex items-center gap-2.5 mb-2.5">
        <div className="w-7 h-7 rounded-lg bg-[#1877F2] flex items-center justify-center shrink-0">
          <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        </div>
        <div>
          <p className="text-[10px] text-white/70 font-medium">Meta Business Suite</p>
          <p className="text-[8px] text-white/35">3 {t('how_step1_account_found')}</p>
        </div>
      </div>
      <div className="space-y-1.5">
        {accounts.map((account) => (
          <div
            key={account.name}
            className="flex items-center gap-2 rounded-md bg-white/[0.04] px-2 py-1.5"
          >
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                account.connected ? 'bg-emerald-400' : 'bg-white/20'
              }`}
            />
            <span className="text-[9px] text-white/60 flex-1">{account.name}</span>
            <span
              className={`text-[8px] ${
                account.connected ? 'text-emerald-400' : 'text-white/30'
              }`}
            >
              {account.connected ? t('how_step1_connected') : t('how_step1_connect')}
            </span>
          </div>
        ))}
      </div>
    </MiniMockup>
  );
}

// ─── Step 2: Rules Configuration Mockup ──────────────────────────────────────
function RulesMockup({ t }: { t: (key: string) => string }) {
  return (
    <MiniMockup>
      <p className="text-[9px] text-white/40 mb-2 font-medium">
        {t('how_step2_rules_title')}
      </p>
      <div className="space-y-2">
        {/* ROAS slider */}
        <div className="rounded-md bg-white/[0.04] px-2.5 py-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] text-white/60">{t('how_step2_min_roas')}</span>
            <span className="text-[10px] text-white/80 font-mono font-semibold">2.0x</span>
          </div>
          <div className="h-1 rounded-full bg-white/[0.08] overflow-hidden">
            <div className="h-full w-[40%] rounded-full bg-accent-primary" />
          </div>
        </div>
        {/* Budget slider */}
        <div className="rounded-md bg-white/[0.04] px-2.5 py-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] text-white/60">{t('how_step2_budget_limit')}</span>
            <span className="text-[10px] text-white/80 font-mono font-semibold">
              ₺5.000
            </span>
          </div>
          <div className="h-1 rounded-full bg-white/[0.08] overflow-hidden">
            <div className="h-full w-[65%] rounded-full bg-violet-400" />
          </div>
        </div>
        {/* CPA toggle */}
        <div className="flex items-center gap-2 rounded-md bg-white/[0.04] px-2.5 py-2">
          <div className="w-3 h-3 rounded bg-emerald-400/20 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-sm bg-emerald-400" />
          </div>
          <span className="text-[9px] text-white/60 flex-1">{t('how_step2_cpa_rule')}</span>
          <span className="text-[8px] text-emerald-400">{t('how_step2_active')}</span>
        </div>
      </div>
    </MiniMockup>
  );
}

// ─── Step 3: Live Activity Mockup ────────────────────────────────────────────
function ActivityMockup({ t }: { t: (key: string) => string }) {
  const activities = [
    {
      action: t('how_step3_paused'),
      campaign: 'Lookalike %1',
      color: 'text-amber-400',
      bg: 'bg-amber-400/10',
      time: '03:42',
    },
    {
      action: t('how_step3_scaled'),
      campaign: 'Retargeting',
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10',
      time: '05:18',
    },
    {
      action: t('how_step3_report'),
      campaign: t('how_step3_daily_summary'),
      color: 'text-blue-400',
      bg: 'bg-blue-400/10',
      time: '06:00',
    },
  ];

  return (
    <MiniMockup>
      <div className="flex items-center gap-1.5 mb-2">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <p className="text-[9px] text-white/40 font-medium">{t('how_step3_live')}</p>
      </div>
      <div className="space-y-1.5">
        {activities.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-md bg-white/[0.04] px-2 py-1.5"
          >
            <span
              className={`text-[7px] font-medium px-1.5 py-0.5 rounded ${item.bg} ${item.color}`}
            >
              {item.action}
            </span>
            <span className="text-[9px] text-white/60 flex-1 truncate">{item.campaign}</span>
            <span className="text-[7px] text-white/25">{item.time}</span>
          </div>
        ))}
      </div>
    </MiniMockup>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function HowItWorks() {
  const t = useTranslations('landing');

  const steps: Array<{
    number: string;
    title: string;
    description: string;
    mockup: ReactNode;
  }> = [
    {
      number: '01',
      title: t('step1_title'),
      description: t('step1_desc'),
      mockup: <OAuthMockup t={t} />,
    },
    {
      number: '02',
      title: t('step2_title'),
      description: t('step2_desc'),
      mockup: <RulesMockup t={t} />,
    },
    {
      number: '03',
      title: t('step3_title'),
      description: t('step3_desc'),
      mockup: <ActivityMockup t={t} />,
    },
  ];

  return (
    <section
      id="how-it-works"
      className="py-24 md:py-32 bg-landing-bg-alt relative overflow-hidden noise-bg scroll-mt-20"
    >
      <div className="relative z-10 mx-auto max-w-5xl px-6">
        {/* Section header */}
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 rounded-full bg-accent-primary/8 text-accent-primary text-xs font-medium mb-4">
              {t('how_it_works_badge')}
            </span>
            <h2
              className="text-[clamp(1.75rem,4vw,2.5rem)] font-bold text-landing-text tracking-[-0.03em] mb-4"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {t('how_it_works_heading')}
            </h2>
          </div>
        </ScrollReveal>

        {/* Step cards */}
        <StaggerContainer className="relative">
          {/* Connecting line between cards — desktop only */}
          <div className="hidden md:block absolute top-[42px] left-[16.67%] right-[16.67%] z-0">
            <motion.div
              className="h-[2px] bg-gradient-to-r from-accent-primary/5 via-accent-primary/25 to-accent-primary/5"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: 0.5, ease: 'easeOut' }}
              style={{ transformOrigin: 'left' }}
            />
          </div>

          <div className="grid md:grid-cols-3 gap-6 relative z-10">
            {steps.map((step, i) => (
              <StaggerItem key={step.number}>
                <motion.div
                  className="group relative bg-landing-card-bg rounded-2xl border border-landing-card-border p-5 hover:border-accent-primary/20 hover:shadow-lg hover:shadow-accent-primary/5 transition-all duration-500"
                  whileHover={{ y: -4 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                >
                  {/* Step number + title header */}
                  <div className="flex items-center gap-3 mb-4">
                    <motion.div
                      className="w-8 h-8 rounded-full bg-accent-primary text-white text-xs font-bold flex items-center justify-center shadow-md shadow-accent-primary/30 shrink-0"
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{
                        delay: 0.4 + i * 0.15,
                        type: 'spring',
                        stiffness: 400,
                        damping: 15,
                      }}
                    >
                      {step.number}
                    </motion.div>
                    <div>
                      <h3
                        className="text-base font-semibold text-landing-text"
                        style={{ fontFamily: 'var(--font-display)' }}
                      >
                        {step.title}
                      </h3>
                      <p className="text-[11px] text-landing-text-muted leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Product mini-mockup */}
                  {step.mockup}
                </motion.div>
              </StaggerItem>
            ))}
          </div>
        </StaggerContainer>
      </div>
    </section>
  );
}
