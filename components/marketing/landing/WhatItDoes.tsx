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
      <div
        className={`absolute -inset-3 rounded-3xl ${glowColor} opacity-0 group-hover/mockup:opacity-100 blur-xl transition-opacity duration-700`}
      />
      <div className="relative">{children}</div>
    </motion.div>
  );
}

// ─── Autopilot Mockup — Activity Feed ───────────────────────────────────────
function AutopilotMockup() {
  const items = [
    {
      action: 'Durduruldu',
      campaign: 'Lookalike %1',
      reason: 'ROAS 0.8x → hedef altı',
      color: 'text-amber-400',
      bg: 'bg-amber-400/10',
      saved: '₺2.100',
      time: '03:42',
    },
    {
      action: 'Ölçeklendi',
      campaign: 'Retargeting - Sepet',
      reason: 'ROAS 5.1x → bütçe +40%',
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10',
      saved: null,
      time: '05:18',
    },
    {
      action: 'Durduruldu',
      campaign: 'Geniş Hedefleme',
      reason: 'CPA ₺52 → limit üstü',
      color: 'text-amber-400',
      bg: 'bg-amber-400/10',
      saved: '₺2.100',
      time: '06:55',
    },
  ];

  return (
    <MockupFrame glowColor="bg-amber-500/8">
      <div className="rounded-2xl bg-landing-frame-bg p-5 shadow-xl shadow-black/15 border border-white/[0.06]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] text-white/50 font-medium">
              Otopilot Aktif
            </span>
          </div>
          <span className="text-[10px] text-white/30">Son 8 saat</span>
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
          <span className="text-[10px] text-white/30">3 işlem tamamlandı</span>
          <span className="text-[11px] text-emerald-400 font-semibold">
            ₺4.200 kurtarıldı
          </span>
        </div>
      </div>
    </MockupFrame>
  );
}

// ─── Smart Suggestions Mockup — Suggestion Card ─────────────────────────────
function SuggestionsMockup() {
  return (
    <MockupFrame glowColor="bg-violet-500/8">
      <div className="rounded-2xl bg-landing-frame-bg p-5 shadow-xl shadow-black/15 border border-white/[0.06]">
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
                  Bütçe Artırma Önerisi
                </p>
                <span className="px-1.5 py-0.5 rounded text-[9px] bg-violet-500/15 text-violet-400">
                  Yüksek güven
                </span>
              </div>
              <p className="text-[11px] text-white/50 leading-relaxed">
                &quot;Yaz Koleksiyonu&quot; son 3 günde 4.2x ROAS. Bütçeyi ₺500
                → ₺750 artırmanızı öneriyoruz.
              </p>
            </div>
          </div>
          <div className="rounded-lg bg-white/[0.03] p-3 mb-4">
            <p className="text-[10px] text-white/30 mb-2">Tahmini etki</p>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-xs font-semibold text-white/80">+₺5.250</p>
                <p className="text-[9px] text-white/30">Ek gelir/hafta</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-violet-400">4.2x</p>
                <p className="text-[9px] text-white/30">Beklenen ROAS</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-white/80">₺22</p>
                <p className="text-[9px] text-white/30">Beklenen CPA</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="flex-1 px-3 py-2 rounded-lg bg-violet-500 text-white text-[11px] font-medium hover:bg-violet-600 transition-colors">
              ✓ Onayla
            </button>
            <button className="px-4 py-2 rounded-lg bg-white/[0.06] text-white/50 text-[11px] hover:bg-white/[0.1] transition-colors">
              Reddet
            </button>
          </div>
        </div>
        <div className="flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
          <span className="text-[10px] text-white/30">
            2 öneri daha bekliyor
          </span>
        </div>
      </div>
    </MockupFrame>
  );
}

// ─── Dashboard Mockup — Multi-Account List ──────────────────────────────────
function DashboardMockup() {
  const accounts = [
    {
      name: 'Moda Store',
      spend: '₺42.500',
      roas: '3.8x',
      campaigns: 5,
      color: 'bg-violet-500',
    },
    {
      name: 'Tech Shop',
      spend: '₺28.200',
      roas: '4.1x',
      campaigns: 3,
      color: 'bg-cyan-500',
    },
    {
      name: 'Beauty Brand',
      spend: '₺18.900',
      roas: '2.9x',
      campaigns: 4,
      color: 'bg-rose-500',
    },
  ];

  return (
    <MockupFrame glowColor="bg-teal-500/8">
      <div className="rounded-2xl bg-landing-frame-bg p-5 shadow-xl shadow-black/15 border border-white/[0.06]">
        <div className="flex gap-1 mb-4 p-1 rounded-lg bg-white/[0.04]">
          <div className="px-3 py-1.5 rounded-md bg-white/[0.08] text-[10px] text-white/80 font-medium">
            Tüm Hesaplar
          </div>
          <div className="px-3 py-1.5 rounded-md text-[10px] text-white/30">
            Kampanyalar
          </div>
          <div className="px-3 py-1.5 rounded-md text-[10px] text-white/30">
            Raporlar
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
                {account.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white/85">
                  {account.name}
                </p>
                <p className="text-[10px] text-white/35">
                  {account.campaigns} aktif kampanya
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-mono text-white/70 font-medium">
                  {account.spend}
                </p>
                <p className="text-[10px] text-emerald-400 font-medium">
                  {account.roas} ROAS
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
            3 hesap · 12 kampanya
          </span>
          <span className="text-[11px] text-white/60 font-medium">
            Toplam: ₺89.600
          </span>
        </div>
      </div>
    </MockupFrame>
  );
}

// ─── Feature Data ───────────────────────────────────────────────────────────
interface Feature {
  badge: string;
  badgeColor: string;
  titleKey: string;
  descKey: string;
  glowColor: string;
  visual: ReactNode;
}

const features: Feature[] = [
  {
    badge: 'Otomasyon',
    badgeColor: 'bg-amber-500/10 text-amber-600',
    titleKey: 'feature_autopilot_title',
    descKey: 'feature_autopilot_desc',
    glowColor: 'bg-amber-500/8',
    visual: <AutopilotMockup />,
  },
  {
    badge: 'Yapay Zeka',
    badgeColor: 'bg-violet-500/10 text-violet-600',
    titleKey: 'feature_suggestions_title',
    descKey: 'feature_suggestions_desc',
    glowColor: 'bg-violet-500/8',
    visual: <SuggestionsMockup />,
  },
  {
    badge: 'Tek Panel',
    badgeColor: 'bg-teal-500/10 text-teal-600',
    titleKey: 'feature_dashboard_title',
    descKey: 'feature_dashboard_desc',
    glowColor: 'bg-teal-500/8',
    visual: <DashboardMockup />,
  },
];

// ─── Main Component ─────────────────────────────────────────────────────────
export function WhatItDoes() {
  const t = useTranslations('landing');

  return (
    <section id="features" className="py-24 md:py-32 scroll-mt-20">
      <div className="mx-auto max-w-5xl px-6">
        {/* Section Header */}
        <ScrollReveal>
          <div className="text-center mb-20">
            <span className="inline-block px-3 py-1 rounded-full bg-accent-primary/8 text-accent-primary text-xs font-medium mb-4">
              {t('features_badge')}
            </span>
            <h2
              className="text-[clamp(1.75rem,4vw,2.5rem)] font-bold text-landing-text tracking-[-0.03em] mb-4"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {t('features_heading')}
            </h2>
            <p className="text-landing-text-muted max-w-md mx-auto">
              Her özellik bir sorunu çözer. Süsleme yok, sonuç var.
            </p>
          </div>
        </ScrollReveal>

        {/* Alternating Feature Rows */}
        <div className="space-y-24">
          {features.map((feature, idx) => (
            <StaggerContainer
              key={feature.titleKey}
              className={`grid md:grid-cols-2 gap-10 lg:gap-14 items-center ${
                idx % 2 === 1 ? 'md:[grid-auto-flow:dense]' : ''
              }`}
            >
              {/* Text Column */}
              <StaggerItem
                className={idx % 2 === 1 ? 'md:col-start-2' : ''}
              >
                <div>
                  <span
                    className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-medium mb-4 ${feature.badgeColor}`}
                  >
                    {feature.badge}
                  </span>
                  <h3
                    className="text-xl sm:text-2xl font-semibold text-landing-text mb-4"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {t(feature.titleKey)}
                  </h3>
                  <p className="text-[15px] text-landing-text-muted leading-relaxed">
                    {t(feature.descKey)}
                  </p>
                </div>
              </StaggerItem>

              {/* Mockup Column */}
              <StaggerItem
                className={idx % 2 === 1 ? 'md:col-start-1' : ''}
              >
                {feature.visual}
              </StaggerItem>
            </StaggerContainer>
          ))}
        </div>
      </div>
    </section>
  );
}
