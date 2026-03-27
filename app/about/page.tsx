'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Target,
  Zap,
  Users,
  Shield,
  Rocket,
  Eye,
  Calendar,
  Sparkles,
  Bot,
  ArrowRight,
} from 'lucide-react';
import { Nav } from '@/components/marketing/landing/Nav';
import { Footer } from '@/components/marketing/landing/Footer';
import { useTranslations } from '@/lib/i18n';
import { GradientMesh } from '@/components/marketing/landing/GradientMesh';
import { Counter } from '@/components/marketing/landing/Counter';
import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
} from '@/components/marketing/landing/ScrollReveal';

/* ─── Timeline data ─── */
const timelineMilestones = [
  { dateKey: 'timeline_1_date', titleKey: 'timeline_1_title', descKey: 'timeline_1_desc', icon: Calendar },
  { dateKey: 'timeline_2_date', titleKey: 'timeline_2_title', descKey: 'timeline_2_desc', icon: Users },
  { dateKey: 'timeline_3_date', titleKey: 'timeline_3_title', descKey: 'timeline_3_desc', icon: Bot },
  { dateKey: 'timeline_4_date', titleKey: 'timeline_4_title', descKey: 'timeline_4_desc', icon: Sparkles },
];

/* ─── Values data ─── */
const valuesData = [
  { icon: Target, titleKey: 'value_1_title', descKey: 'value_1_desc', gradient: 'from-blue-500/20 to-blue-600/5' },
  { icon: Zap, titleKey: 'value_2_title', descKey: 'value_2_desc', gradient: 'from-amber-500/20 to-amber-600/5' },
  { icon: Users, titleKey: 'value_3_title', descKey: 'value_3_desc', gradient: 'from-emerald-500/20 to-emerald-600/5' },
  { icon: Shield, titleKey: 'value_4_title', descKey: 'value_4_desc', gradient: 'from-violet-500/20 to-violet-600/5' },
];

/* ─── Team data ─── */
const teamMembers = [
  { nameKey: 'team_1_name', roleKey: 'team_1_role', bioKey: 'team_1_bio', initials: 'NA', color: 'from-[#2563EB] to-blue-400' },
  { nameKey: 'team_2_name', roleKey: 'team_2_role', bioKey: 'team_2_bio', initials: 'BT', color: 'from-violet-600 to-violet-400' },
  { nameKey: 'team_3_name', roleKey: 'team_3_role', bioKey: 'team_3_bio', initials: 'AI', color: 'from-emerald-600 to-emerald-400' },
];

/* ─── Stats data ─── */
const statsData = [
  { value: 2000000, prefix: '₺', suffix: '+', labelKey: 'stats_budget', decimals: 0, display: '2M' },
  { value: 150, prefix: '', suffix: '+', labelKey: 'stats_users', decimals: 0 },
  { value: 3.2, prefix: '', suffix: 'x', labelKey: 'stats_roas', decimals: 1 },
  { value: 2, prefix: '<', suffix: 'min', labelKey: 'stats_setup', decimals: 0 },
];

export default function AboutPage() {
  const t = useTranslations('about');

  return (
    <main className="min-h-screen bg-landing-bg">
      <Nav />

      {/* ━━━ 1. HERO ━━━ */}
      <section className="relative pt-32 pb-28 px-6 overflow-hidden">
        <GradientMesh />

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.1 }}
            className="flex justify-center mb-8"
          >
            <span className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-[#2563EB]/10 text-[#2563EB] text-xs font-medium tracking-wide shadow-sm shadow-[#2563EB]/5">
              <Rocket className="w-3.5 h-3.5" />
              {t('hero_badge')}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 80, damping: 20, delay: 0.2 }}
            className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold tracking-tight leading-[1.1]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {t('hero_title_1')}{' '}
            <span className="bg-gradient-to-r from-[#2563EB] via-blue-500 to-violet-500 bg-clip-text text-transparent">
              {t('hero_title_accent')}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 80, damping: 20, delay: 0.35 }}
            className="text-lg sm:text-xl text-landing-text-muted max-w-2xl mx-auto mt-6 leading-relaxed"
          >
            {t('hero_description')}
          </motion.p>
        </div>
      </section>

      {/* ━━━ 2. MISSION / VISION CARDS ━━━ */}
      <section className="py-24 px-6 bg-landing-bg">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mission */}
            <ScrollReveal direction="left" delay={0}>
              <div className="relative overflow-hidden rounded-2xl border border-landing-card-border bg-gradient-to-br from-white via-white to-blue-50/50 p-8 sm:p-10 h-full">
                <div className="absolute top-0 right-0 w-[200px] h-[200px] rounded-full bg-[#2563EB]/[0.04] blur-[60px] translate-x-1/3 -translate-y-1/3" />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-[#2563EB]/10 flex items-center justify-center mb-5">
                    <Rocket className="w-6 h-6 text-[#2563EB]" />
                  </div>
                  <h3
                    className="text-2xl font-bold text-landing-text mb-3"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {t('mission_title')}
                  </h3>
                  <p className="text-landing-text-muted leading-relaxed">
                    {t('mission_desc')}
                  </p>
                </div>
              </div>
            </ScrollReveal>

            {/* Vision */}
            <ScrollReveal direction="right" delay={0.1}>
              <div className="relative overflow-hidden rounded-2xl border border-landing-card-border bg-gradient-to-br from-white via-white to-violet-50/50 p-8 sm:p-10 h-full">
                <div className="absolute top-0 right-0 w-[200px] h-[200px] rounded-full bg-violet-500/[0.04] blur-[60px] translate-x-1/3 -translate-y-1/3" />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center mb-5">
                    <Eye className="w-6 h-6 text-violet-600" />
                  </div>
                  <h3
                    className="text-2xl font-bold text-landing-text mb-3"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {t('vision_title')}
                  </h3>
                  <p className="text-landing-text-muted leading-relaxed">
                    {t('vision_desc')}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ━━━ 3. STATS STRIP ━━━ */}
      <section className="py-20 px-6 bg-landing-frame-bg">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {statsData.map((stat) => (
              <ScrollReveal key={stat.labelKey} direction="up" delay={0}>
                <div>
                  <p
                    className="text-3xl sm:text-4xl font-bold text-white"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {stat.display ? (
                      /* For the ₺2M+ stat, show static to avoid confusing large number animation */
                      <span>{stat.prefix}{stat.display}{stat.suffix}</span>
                    ) : (
                      <Counter
                        value={stat.value}
                        prefix={stat.prefix}
                        suffix={stat.suffix}
                        decimals={stat.decimals}
                        className="text-3xl sm:text-4xl font-bold text-white"
                        duration={2}
                      />
                    )}
                  </p>
                  <p className="text-white/50 text-sm mt-2">{t(stat.labelKey)}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ 4. STORY TIMELINE ━━━ */}
      <section className="py-28 px-6 bg-landing-bg-alt">
        <div className="mx-auto max-w-3xl">
          <ScrollReveal>
            <h2
              className="text-3xl sm:text-4xl font-bold text-center text-landing-text mb-4"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {t('story_title')}
            </h2>
            <p className="text-center text-landing-text-muted max-w-xl mx-auto mb-16">
              {t('story_subtitle')}
            </p>
          </ScrollReveal>

          {/* Timeline */}
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[#2563EB]/30 via-[#2563EB]/15 to-transparent md:-translate-x-px" />

            {timelineMilestones.map((milestone, idx) => {
              const Icon = milestone.icon;
              const isLeft = idx % 2 === 0;

              return (
                <ScrollReveal
                  key={milestone.titleKey}
                  direction={isLeft ? 'left' : 'right'}
                  delay={idx * 0.1}
                >
                  <div className="relative flex items-start mb-12 last:mb-0">
                    {/* Desktop: alternating sides */}
                    <div className="hidden md:grid md:grid-cols-[1fr_48px_1fr] md:gap-4 w-full items-start">
                      {/* Left content */}
                      <div className={`${isLeft ? '' : 'order-3'}`}>
                        {isLeft ? (
                          <div className="text-right pr-4">
                            <span className="inline-block text-xs font-semibold text-[#2563EB] bg-[#2563EB]/10 px-2.5 py-1 rounded-full mb-2">
                              {t(milestone.dateKey)}
                            </span>
                            <h4
                              className="text-lg font-bold text-landing-text"
                              style={{ fontFamily: 'var(--font-display)' }}
                            >
                              {t(milestone.titleKey)}
                            </h4>
                            <p className="text-sm text-landing-text-muted mt-1 leading-relaxed">
                              {t(milestone.descKey)}
                            </p>
                          </div>
                        ) : (
                          <div />
                        )}
                      </div>

                      {/* Center dot */}
                      <div className="flex justify-center order-2">
                        <div className="w-10 h-10 rounded-full bg-white border-2 border-[#2563EB]/30 flex items-center justify-center shadow-sm z-10">
                          <Icon className="w-4 h-4 text-[#2563EB]" />
                        </div>
                      </div>

                      {/* Right content */}
                      <div className={`${isLeft ? 'order-3' : ''}`}>
                        {!isLeft ? (
                          <div className="pl-4">
                            <span className="inline-block text-xs font-semibold text-[#2563EB] bg-[#2563EB]/10 px-2.5 py-1 rounded-full mb-2">
                              {t(milestone.dateKey)}
                            </span>
                            <h4
                              className="text-lg font-bold text-landing-text"
                              style={{ fontFamily: 'var(--font-display)' }}
                            >
                              {t(milestone.titleKey)}
                            </h4>
                            <p className="text-sm text-landing-text-muted mt-1 leading-relaxed">
                              {t(milestone.descKey)}
                            </p>
                          </div>
                        ) : (
                          <div />
                        )}
                      </div>
                    </div>

                    {/* Mobile: left-aligned */}
                    <div className="flex items-start gap-4 md:hidden w-full">
                      <div className="shrink-0 w-12 h-10 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-white border-2 border-[#2563EB]/30 flex items-center justify-center shadow-sm z-10">
                          <Icon className="w-4 h-4 text-[#2563EB]" />
                        </div>
                      </div>
                      <div className="pt-1">
                        <span className="inline-block text-xs font-semibold text-[#2563EB] bg-[#2563EB]/10 px-2.5 py-1 rounded-full mb-2">
                          {t(milestone.dateKey)}
                        </span>
                        <h4
                          className="text-lg font-bold text-landing-text"
                          style={{ fontFamily: 'var(--font-display)' }}
                        >
                          {t(milestone.titleKey)}
                        </h4>
                        <p className="text-sm text-landing-text-muted mt-1 leading-relaxed">
                          {t(milestone.descKey)}
                        </p>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ━━━ 5. VALUES GRID ━━━ */}
      <section className="py-28 px-6 bg-landing-bg">
        <div className="mx-auto max-w-5xl">
          <ScrollReveal>
            <h2
              className="text-3xl sm:text-4xl font-bold text-center text-landing-text mb-4"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {t('values_title')}
            </h2>
            <p className="text-center text-landing-text-muted max-w-xl mx-auto mb-16">
              {t('values_subtitle')}
            </p>
          </ScrollReveal>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6" stagger={0.1}>
            {valuesData.map((val) => {
              const Icon = val.icon;
              return (
                <StaggerItem key={val.titleKey}>
                  <motion.div
                    className="group relative overflow-hidden rounded-2xl border border-landing-card-border bg-landing-card-bg p-8 transition-all duration-300 hover:border-[#2563EB]/20 hover:shadow-lg hover:shadow-[#2563EB]/5 cursor-default"
                    whileHover={{ y: -4 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${val.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-7 h-7 text-[#2563EB]" />
                    </div>
                    <h3
                      className="text-xl font-bold text-landing-text mb-2"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      {t(val.titleKey)}
                    </h3>
                    <p className="text-landing-text-muted leading-relaxed">
                      {t(val.descKey)}
                    </p>
                  </motion.div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* ━━━ 6. TEAM SECTION ━━━ */}
      <section className="py-28 px-6 bg-landing-bg-alt">
        <div className="mx-auto max-w-5xl">
          <ScrollReveal>
            <h2
              className="text-3xl sm:text-4xl font-bold text-center text-landing-text mb-4"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {t('team_title')}
            </h2>
            <p className="text-center text-landing-text-muted max-w-xl mx-auto mb-16">
              {t('team_subtitle')}
            </p>
          </ScrollReveal>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" stagger={0.12}>
            {teamMembers.map((member) => (
              <StaggerItem key={member.nameKey}>
                <motion.div
                  className="group relative overflow-hidden rounded-2xl border border-landing-card-border bg-landing-card-bg p-8 text-center transition-all duration-300 hover:border-[#2563EB]/15 hover:shadow-lg hover:shadow-black/5"
                  whileHover={{ y: -4 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  {/* Avatar circle with initials */}
                  <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${member.color} flex items-center justify-center mx-auto mb-5 shadow-lg group-hover:scale-105 transition-transform duration-300`}>
                    <span className="text-white text-xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                      {member.initials}
                    </span>
                  </div>

                  <h3
                    className="text-lg font-bold text-landing-text"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {t(member.nameKey)}
                  </h3>
                  <p className="text-sm font-medium text-[#2563EB] mt-1">
                    {t(member.roleKey)}
                  </p>
                  <p className="text-sm text-landing-text-muted mt-3 leading-relaxed">
                    {t(member.bioKey)}
                  </p>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ━━━ 7. CTA SECTION ━━━ */}
      <section className="py-28 px-6">
        <div className="mx-auto max-w-4xl">
          <ScrollReveal>
            <div className="relative overflow-hidden rounded-3xl bg-landing-frame-bg p-10 sm:p-16 text-center">
              {/* Gradient orbs */}
              <div className="absolute top-0 left-0 w-[400px] h-[400px] rounded-full bg-[#2563EB]/15 blur-[100px] -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-[300px] h-[300px] rounded-full bg-violet-500/10 blur-[80px] translate-x-1/3 translate-y-1/3" />

              {/* Dot grid overlay */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                }}
              />

              {/* Content */}
              <div className="relative z-10">
                <h2
                  className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white mb-5 leading-tight"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {t('cta_title')}
                </h2>

                <p className="text-white/50 max-w-lg mx-auto mb-10 text-sm sm:text-base leading-relaxed">
                  {t('cta_description')}
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                    <Link
                      href="/signup"
                      className="group inline-flex items-center justify-center px-8 py-4 rounded-xl bg-white text-landing-frame-bg font-semibold text-sm hover:bg-white/90 transition-all duration-300 shadow-xl shadow-black/20"
                    >
                      {t('cta_button_start')}
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                    <Link
                      href="/contact"
                      className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-white/[0.08] border border-white/[0.1] text-white font-semibold text-sm hover:bg-white/[0.12] transition-all duration-300"
                    >
                      {t('cta_button_demo')}
                    </Link>
                  </motion.div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <Footer />
    </main>
  );
}
