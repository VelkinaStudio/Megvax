'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Plus, Minus, Shield, ShieldCheck, Zap, ArrowRight } from 'lucide-react';
import { Nav } from '@/components/marketing/landing/Nav';
import { Footer } from '@/components/marketing/landing/Footer';
import { useTranslations } from '@/lib/i18n';

/* ─── Plan Data ──────────────────────────────────────────────── */

interface PlanTier {
  key: 'starter' | 'pro' | 'business';
  monthlyPrice: string;
  annualPrice: string;
  annualSavings: string;
  descriptionKey: string;
  features: { key: string; tooltip?: string }[];
  ctaKey: string;
  ctaHref: string;
  popular: boolean;
  tag?: string;
}

const plans: PlanTier[] = [
  {
    key: 'starter',
    monthlyPrice: '499',
    annualPrice: '399',
    annualSavings: '1.200',
    descriptionKey: 'starter_desc',
    features: [
      { key: 'starter_f1' },
      { key: 'starter_f2', tooltip: 'starter_f2_tip' },
      { key: 'starter_f3' },
      { key: 'starter_f4' },
      { key: 'starter_f5' },
    ],
    ctaKey: 'cta_get_started',
    ctaHref: '/signup',
    popular: false,
  },
  {
    key: 'pro',
    monthlyPrice: '1.999',
    annualPrice: '1.599',
    annualSavings: '4.800',
    descriptionKey: 'pro_desc',
    features: [
      { key: 'pro_f1' },
      { key: 'pro_f2', tooltip: 'pro_f2_tip' },
      { key: 'pro_f3' },
      { key: 'pro_f4' },
      { key: 'pro_f5' },
      { key: 'pro_f6', tooltip: 'pro_f6_tip' },
      { key: 'pro_f7', tooltip: 'pro_f7_tip' },
    ],
    ctaKey: 'cta_free_trial',
    ctaHref: '/signup',
    popular: true,
  },
  {
    key: 'business',
    monthlyPrice: '4.999',
    annualPrice: '3.999',
    annualSavings: '12.000',
    descriptionKey: 'business_desc',
    features: [
      { key: 'business_f1' },
      { key: 'business_f2', tooltip: 'business_f2_tip' },
      { key: 'business_f3' },
      { key: 'business_f4' },
      { key: 'business_f5' },
      { key: 'business_f6', tooltip: 'business_f6_tip' },
      { key: 'business_f7' },
      { key: 'business_f8', tooltip: 'business_f8_tip' },
    ],
    ctaKey: 'cta_talk_to_sales',
    ctaHref: '/contact',
    popular: false,
    tag: 'tag_agencies',
  },
];

/* ─── Feature Comparison Data ────────────────────────────────── */

type CellValue = boolean | string;

interface ComparisonRow {
  labelKey: string;
  starter: CellValue;
  pro: CellValue;
  business: CellValue;
}

const comparisonRows: ComparisonRow[] = [
  { labelKey: 'cmp_ad_accounts', starter: '3', pro: '10', business: 'cmp_unlimited' },
  { labelKey: 'cmp_users', starter: '1', pro: '5', business: 'cmp_unlimited' },
  { labelKey: 'cmp_automation', starter: 'cmp_basic', pro: 'cmp_advanced', business: 'cmp_custom' },
  { labelKey: 'cmp_reports', starter: 'cmp_daily', pro: 'cmp_realtime', business: 'cmp_realtime_custom' },
  { labelKey: 'cmp_ai_suggestions', starter: false, pro: true, business: true },
  { labelKey: 'cmp_ab_testing', starter: false, pro: true, business: true },
  { labelKey: 'cmp_api_access', starter: false, pro: false, business: true },
  { labelKey: 'cmp_custom_integrations', starter: false, pro: false, business: true },
  { labelKey: 'cmp_priority_support', starter: false, pro: true, business: true },
  { labelKey: 'cmp_dedicated_manager', starter: false, pro: false, business: true },
];

/* ─── FAQ Data ───────────────────────────────────────────────── */

const faqKeys = ['faq_1', 'faq_2', 'faq_3', 'faq_4', 'faq_5', 'faq_6'] as const;

/* ─── Animation Variants ─────────────────────────────────────── */

const smoothEase = [0.25, 0.46, 0.45, 0.94] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: smoothEase as unknown as [number, number, number, number] },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 32, scale: 0.97 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, delay: i * 0.12, ease: smoothEase as unknown as [number, number, number, number] },
  }),
};

/* ─── Animated Price Counter (count up/down on toggle) ───────── */

function AnimatedPrice({ value, className }: { value: string; className?: string }) {
  const numericValue = parseInt(value.replace(/\./g, ''), 10);
  const [display, setDisplay] = useState(value);
  const prevValue = useRef(numericValue);

  const formatTurkish = useCallback((n: number) => {
    return n.toLocaleString('tr-TR');
  }, []);

  useEffect(() => {
    const from = prevValue.current;
    const to = numericValue;
    prevValue.current = to;

    if (from === to) return;

    const duration = 400;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(from + (to - from) * eased);
      setDisplay(formatTurkish(current));
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [numericValue, formatTurkish]);

  return <span className={className}>{display}</span>;
}

/* ─── Breathing Gradient Glow for Pro card ───────────────────── */

function BreathingGlow() {
  return (
    <motion.div
      className="absolute -inset-[1px] rounded-2xl -z-10"
      style={{
        background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #3b82f6 100%)',
        filter: 'blur(2px)',
      }}
      animate={{ opacity: [1, 0.6, 1] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

/* ─── Components ─────────────────────────────────────────────── */

function BillingToggle({
  isAnnual,
  onToggle,
  t,
}: {
  isAnnual: boolean;
  onToggle: () => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}) {
  return (
    <div className="flex items-center justify-center gap-3 mt-8">
      <span className={`text-sm font-medium transition-colors ${!isAnnual ? 'text-[#1A1A1A]' : 'text-[#6B7280]'}`}>
        {t('billing_monthly')}
      </span>
      <button
        onClick={onToggle}
        className="relative w-14 h-7 rounded-full bg-[#2563EB] transition-colors focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50 focus:ring-offset-2"
        aria-label="Toggle billing period"
      >
        <motion.div
          className="absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md"
          animate={{ left: isAnnual ? 30 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </button>
      <span className={`text-sm font-medium transition-colors ${isAnnual ? 'text-[#1A1A1A]' : 'text-[#6B7280]'}`}>
        {t('billing_annual')}
      </span>
      <AnimatePresence>
        {isAnnual && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8, x: -8 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: -8 }}
            className="ml-1 inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-600/20"
          >
            {t('save_20')}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

function PricingCard({
  plan,
  isAnnual,
  t,
  index,
}: {
  plan: PlanTier;
  isAnnual: boolean;
  t: (key: string, params?: Record<string, string | number>) => string;
  index: number;
}) {
  const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
  const isPro = plan.popular;
  const isBusiness = plan.key === 'business';

  return (
    <motion.div
      custom={index}
      variants={cardVariant}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      className={`relative flex flex-col rounded-2xl p-8 transition-shadow duration-300 ${
        isPro
          ? 'md:scale-[1.02] z-10 order-first md:order-none'
          : isBusiness
            ? 'order-last md:order-none'
            : ''
      } ${
        isPro
          ? 'bg-gradient-to-b from-[#1e3a8a] to-[#1e40af] text-white shadow-2xl shadow-blue-900/25'
          : 'bg-white border border-black/[0.06] hover:border-black/[0.12] hover:shadow-lg'
      }`}
    >
      {/* Gradient glow border for Pro — breathing animation */}
      {isPro && <BreathingGlow />}

      {/* Badges */}
      {isPro && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-md">
            <Zap className="w-3.5 h-3.5" />
            {t('most_popular')}
          </span>
        </div>
      )}
      {plan.tag && !isPro && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center bg-[#1A1A1A] text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
            {t(plan.tag)}
          </span>
        </div>
      )}

      {/* Plan Name */}
      <div className="text-center mb-6 pt-2">
        <h3
          className={`text-xl font-bold mb-1.5 ${isPro ? 'text-white' : 'text-[#1A1A1A]'}`}
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {t(`plan_${plan.key}`)}
        </h3>
        <p className={`text-sm ${isPro ? 'text-blue-200' : 'text-[#6B7280]'}`}>
          {t(plan.descriptionKey)}
        </p>
      </div>

      {/* Price — animated counter on toggle */}
      <div className="text-center mb-6">
        <div className="flex items-baseline justify-center gap-1">
          <span className={`text-4xl font-extrabold tracking-tight ${isPro ? 'text-white' : 'text-[#1A1A1A]'}`}>
            ₺<AnimatedPrice value={price} />
          </span>
          <span className={`text-sm ${isPro ? 'text-blue-200' : 'text-[#6B7280]'}`}>{t('per_month')}</span>
        </div>
        <AnimatePresence mode="wait">
          {isAnnual && (
            <motion.p
              key="savings"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`text-xs mt-1.5 ${isPro ? 'text-blue-200' : 'text-emerald-600'}`}
            >
              {t('annual_savings', { amount: plan.annualSavings })}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Divider */}
      <div className={`h-px mb-6 ${isPro ? 'bg-white/15' : 'bg-black/[0.06]'}`} />

      {/* Features — hover micro-interactions */}
      <ul className="space-y-3.5 mb-8 flex-1">
        {plan.features.map((feature) => (
          <motion.li
            key={feature.key}
            className={`flex items-start gap-2.5 rounded-lg px-2 py-1 -mx-2 cursor-default transition-colors duration-200 ${
              isPro ? 'hover:bg-white/[0.06]' : 'hover:bg-[#F3F4F6]'
            }`}
            title={feature.tooltip ? t(feature.tooltip) : undefined}
            whileHover={{ x: 4 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <Check
              className={`w-4.5 h-4.5 mt-0.5 shrink-0 ${isPro ? 'text-emerald-300' : 'text-emerald-500'}`}
              strokeWidth={2.5}
            />
            <span className={`text-sm leading-snug ${isPro ? 'text-blue-100' : 'text-[#4B5563]'}`}>
              {t(feature.key)}
            </span>
          </motion.li>
        ))}
      </ul>

      {/* CTA */}
      <Link
        href={plan.ctaHref}
        className={`group block w-full py-3 px-4 rounded-xl font-semibold text-center text-sm transition-all duration-200 ${
          isPro
            ? 'bg-white text-[#1e40af] hover:bg-blue-50 shadow-lg shadow-blue-900/20'
            : isBusiness
              ? 'bg-[#1A1A1A] text-white hover:bg-[#2d2d2d]'
              : 'border-2 border-[#2563EB] text-[#2563EB] hover:bg-[#2563EB] hover:text-white'
        }`}
      >
        <span className="inline-flex items-center gap-1.5">
          {t(plan.ctaKey)}
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </Link>
    </motion.div>
  );
}

function ComparisonCell({ value, t }: { value: CellValue; t: (key: string, params?: Record<string, string | number>) => string }) {
  if (typeof value === 'boolean') {
    return value ? (
      <Check className="w-5 h-5 text-emerald-500 mx-auto" strokeWidth={2.5} />
    ) : (
      <X className="w-5 h-5 text-[#D1D5DB] mx-auto" />
    );
  }
  return <span className="text-sm font-medium text-[#1A1A1A]">{t(value)}</span>;
}

function FAQItem({ questionKey, answerKey, t }: { questionKey: string; answerKey: string; t: (key: string, params?: Record<string, string | number>) => string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-black/[0.06] shadow-sm overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-5 px-6 text-left group"
        aria-expanded={isOpen}
      >
        <span className="text-[15px] font-semibold text-[#1A1A1A] pr-4 group-hover:text-[#2563EB] transition-colors">
          {t(questionKey)}
        </span>
        <span className="shrink-0 w-8 h-8 rounded-full bg-[#F3F4F6] flex items-center justify-center transition-colors group-hover:bg-[#DBEAFE]">
          {isOpen ? <Minus className="w-4 h-4 text-[#2563EB]" /> : <Plus className="w-4 h-4 text-[#6B7280]" />}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <p className="pb-5 px-6 text-sm leading-relaxed text-[#6B7280] max-w-2xl">{t(answerKey)}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────── */

export default function PricingPage() {
  const t = useTranslations('pricing');
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <main className="min-h-screen bg-[--color-landing-bg]">
      <Nav />

      {/* ── Hero Section ──────────────────────────────────────── */}
      <section className="pt-28 pb-4 md:pt-32 md:pb-6">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center rounded-full bg-[#EFF6FF] px-3.5 py-1 text-xs font-semibold text-[#2563EB] ring-1 ring-[#2563EB]/10 mb-5">
              {t('badge')}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="text-4xl md:text-5xl lg:text-[3.25rem] font-bold text-[--color-landing-text] leading-tight tracking-tight mb-4"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {t('title')}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="text-lg text-[--color-landing-text-muted] max-w-xl mx-auto"
          >
            {t('subtitle')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
          >
            <BillingToggle isAnnual={isAnnual} onToggle={() => setIsAnnual(!isAnnual)} t={t} />
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.35 }}
            className="text-xs text-[--color-landing-text-faint] mt-3"
          >
            {t('trust_text')}
          </motion.p>
        </div>
      </section>

      {/* ── Pricing Cards ─────────────────────────────────────── */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-[#FAFAF8] to-[#F0EFEC]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-5 items-start">
            {plans.map((plan, i) => (
              <PricingCard key={plan.key} plan={plan} isAnnual={isAnnual} t={t} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust Strip ───────────────────────────────────────── */}
      <motion.section
        variants={fadeUp}
        custom={0}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="py-10"
      >
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10">
            <p className="text-sm font-medium text-[--color-landing-text-muted]">{t('trusted_by')}</p>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-[#6B7280]" title="SOC 2 Compliant">
                <ShieldCheck className="w-5 h-5" />
                <span className="text-xs font-semibold uppercase tracking-wide">SOC 2</span>
              </div>
              <div className="h-4 w-px bg-[#D1D5DB]" />
              <div className="flex items-center gap-2 text-[#6B7280]" title="GDPR Compliant">
                <Shield className="w-5 h-5" />
                <span className="text-xs font-semibold uppercase tracking-wide">GDPR</span>
              </div>
              <div className="h-4 w-px bg-[#D1D5DB]" />
              <div className="flex items-center gap-2 text-[#6B7280]" title="Meta Business Partner">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"
                    fill="currentColor"
                  />
                </svg>
                <span className="text-xs font-semibold uppercase tracking-wide">Meta Partner</span>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── Feature Comparison Table ──────────────────────────── */}
      <section className="py-16 md:py-20 bg-[#F3F2EF]">
        <div className="max-w-5xl mx-auto px-4">
          <motion.div
            variants={fadeUp}
            custom={0}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-flex items-center rounded-full bg-white px-3.5 py-1 text-xs font-semibold text-[#2563EB] ring-1 ring-[#2563EB]/10 mb-5">
              {t('cmp_feature')}
            </span>
            <h2
              className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-3"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {t('comparison_title')}
            </h2>
            <p className="text-[#6B7280] text-lg">{t('comparison_subtitle')}</p>
          </motion.div>

          <motion.div
            variants={fadeUp}
            custom={1}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="overflow-x-auto -mx-4 px-4"
          >
            <div className="bg-white rounded-2xl border border-black/[0.08] shadow-sm overflow-hidden">
              <table className="w-full min-w-[640px] border-collapse">
                <thead>
                  <tr className="border-b border-black/[0.08] bg-[#FAFAF8]">
                    <th className="text-left py-4 px-6 text-sm font-semibold text-[#6B7280] w-[40%]">
                      {t('cmp_feature')}
                    </th>
                    <th className="text-center py-4 px-3 text-sm font-semibold text-[#1A1A1A] w-[20%]">
                      {t('plan_starter')}
                    </th>
                    <th className="text-center py-4 px-3 w-[20%]">
                      <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[#2563EB]">
                        {t('plan_pro')}
                        <Zap className="w-3.5 h-3.5" />
                      </span>
                    </th>
                    <th className="text-center py-4 px-3 text-sm font-semibold text-[#1A1A1A] w-[20%]">
                      {t('plan_business')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, i) => (
                    <tr key={row.labelKey} className={`border-b border-black/[0.04] last:border-b-0 ${i % 2 === 0 ? 'bg-white' : 'bg-[#FAFAF8]'}`}>
                      <td className="py-3.5 px-6 text-sm text-[#4B5563] font-medium">{t(row.labelKey)}</td>
                      <td className="py-3.5 px-3 text-center">
                        <ComparisonCell value={row.starter} t={t} />
                      </td>
                      <td className="py-3.5 px-3 text-center bg-blue-50/40">
                        <ComparisonCell value={row.pro} t={t} />
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <ComparisonCell value={row.business} t={t} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FAQ Section ───────────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-2xl mx-auto px-4">
          <motion.div
            variants={fadeUp}
            custom={0}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-flex items-center rounded-full bg-[#EFF6FF] px-3.5 py-1 text-xs font-semibold text-[#2563EB] ring-1 ring-[#2563EB]/10 mb-5">
              FAQ
            </span>
            <h2
              className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-3"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {t('faq_title')}
            </h2>
            <p className="text-[#6B7280] text-lg">{t('faq_subtitle')}</p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-3"
          >
            {faqKeys.map((faqKey) => (
              <motion.div key={faqKey} variants={fadeUp} custom={0}>
                <FAQItem questionKey={`${faqKey}_q`} answerKey={`${faqKey}_a`} t={t} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Bottom CTA ────────────────────────────────────────── */}
      <section className="py-20 md:py-24 bg-[#0C0D14]">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <motion.div
            variants={fadeUp}
            custom={0}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2
              className="text-3xl md:text-4xl font-bold text-white mb-4"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {t('bottom_cta_title')}
            </h2>
            <p className="text-[#9CA3AF] mb-8 max-w-lg mx-auto">
              {t('bottom_cta_subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="group inline-flex items-center gap-2 bg-[#2563EB] text-white px-7 py-3.5 rounded-xl font-semibold text-sm hover:bg-[#3B82F6] transition-colors shadow-lg shadow-blue-600/30"
              >
                {t('bottom_cta_trial')}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 border-2 border-white/15 text-white px-7 py-3.5 rounded-xl font-semibold text-sm hover:border-white/30 hover:bg-white/5 transition-colors"
              >
                {t('bottom_cta_talk')}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
