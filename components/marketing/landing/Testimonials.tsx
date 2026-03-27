'use client';

import { motion, useInView } from 'framer-motion';
import { Star } from 'lucide-react';
import { useRef } from 'react';
import { useTranslations } from '@/lib/i18n';
import { ScrollReveal, StaggerContainer, StaggerItem } from './ScrollReveal';

// ─── Star Rating with staggered animation ────────────────────────────────────

function StarRating({ count = 5 }: { count?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-30px' });

  return (
    <div ref={ref} className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0, rotate: -30 }}
          animate={isInView ? { opacity: 1, scale: 1, rotate: 0 } : { opacity: 0, scale: 0, rotate: -30 }}
          transition={{
            delay: i * 0.08,
            type: 'spring',
            stiffness: 400,
            damping: 15,
          }}
        >
          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
        </motion.div>
      ))}
    </div>
  );
}

// ─── Avatar with initials + ambient pulse ring ──────────────────────────────

function Avatar({
  name,
  color,
  size = 'md',
}: {
  name: string;
  color: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const initials = name
    .split(' ')
    .map((w: string) => w[0])
    .join('');
  const sizeClasses = {
    sm: 'w-10 h-10 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-14 h-14 text-base',
  };

  return (
    <div className="relative">
      {/* Expanding pulse ring */}
      <motion.div
        className={`absolute inset-0 rounded-full ${color}`}
        animate={{
          scale: [1, 1.35, 1.35],
          opacity: [0.3, 0, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeOut',
        }}
        style={{ willChange: 'transform, opacity' }}
      />
      <div
        className={`${sizeClasses[size]} rounded-full ${color} flex items-center justify-center text-white font-bold shadow-lg relative z-10`}
      >
        {initials}
      </div>
    </div>
  );
}

// ─── Testimonial card configs ────────────────────────────────────────────────

const testimonialConfigs = [
  { id: 1, color: 'bg-violet-500', featured: true },
  { id: 2, color: 'bg-cyan-500', featured: false },
  { id: 3, color: 'bg-rose-500', featured: false },
] as const;

// ─── Aggregate stats ─────────────────────────────────────────────────────────

const aggregateStats = [
  { valueKey: 'testimonials_aggregate_rating', labelKey: 'testimonials_aggregate_rating_label', icon: '★' },
  { valueKey: 'testimonials_aggregate_businesses', labelKey: 'testimonials_aggregate_businesses_label', icon: '◆' },
  { valueKey: 'testimonials_aggregate_managed', labelKey: 'testimonials_aggregate_managed_label', icon: '▲' },
] as const;

// ─── Activity Ticker ─────────────────────────────────────────────────────────
// Auto-scrolling marquee showing recent user activity, like social proof.

const activityItems = [
  { nameKey: 'ticker_name_1', resultKey: 'ticker_result_1' },
  { nameKey: 'ticker_name_2', resultKey: 'ticker_result_2' },
  { nameKey: 'ticker_name_3', resultKey: 'ticker_result_3' },
  { nameKey: 'ticker_name_4', resultKey: 'ticker_result_4' },
  { nameKey: 'ticker_name_5', resultKey: 'ticker_result_5' },
  { nameKey: 'ticker_name_6', resultKey: 'ticker_result_6' },
] as const;

function ActivityTicker() {
  const t = useTranslations('landing');

  // Build the ticker items. When a translation key is missing, t() returns
  // the key path itself (e.g. "landing.ticker_name_1"). We detect that to
  // decide whether to use translations or fallback data.
  const items = activityItems.map(({ nameKey, resultKey }) => {
    const name = t(nameKey);
    const result = t(resultKey);
    // If the returned value looks like a key path, the translation is missing
    const nameIsMissing = name.includes('ticker_name_');
    const resultIsMissing = result.includes('ticker_result_');
    if (nameIsMissing || resultIsMissing) return null;
    return { name, result };
  }).filter(Boolean) as { name: string; result: string }[];

  // Fallback ticker data when translation keys don't exist
  const fallbackItems = [
    { name: 'Sarah Chen', result: 'CPA -40%' },
    { name: 'Marcus Webb', result: 'ROAS 5.1x' },
    { name: 'Elif Y\u0131lmaz', result: 'Conv. +120%' },
    { name: 'David Park', result: 'CPA -35%' },
    { name: 'Ay\u015Fe Kaya', result: 'ROAS 4.8x' },
    { name: 'James Miller', result: 'Spend -28%' },
  ];

  const tickerData = items.length >= 3 ? items : fallbackItems;

  // Duplicate for seamless loop
  const doubled = [...tickerData, ...tickerData];

  return (
    <div className="mt-10 overflow-hidden relative" aria-hidden="true">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-landing-bg to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-landing-bg to-transparent z-10 pointer-events-none" />

      <motion.div
        className="flex gap-6 whitespace-nowrap"
        animate={{ x: ['0%', '-50%'] }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: 'loop',
            duration: 25,
            ease: 'linear',
          },
        }}
      >
        {doubled.map((item, i) => (
          <div
            key={i}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-landing-card-bg border border-landing-card-border text-xs shrink-0"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
            <span className="font-medium text-landing-text">{item.name}</span>
            <span className="text-landing-text-muted">&rarr;</span>
            <span className="font-semibold text-emerald-600">{item.result}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function Testimonials() {
  const t = useTranslations('landing');

  const featured = testimonialConfigs[0];
  const secondary = testimonialConfigs.slice(1);

  return (
    <section className="py-24 md:py-32 px-6">
      <div className="mx-auto max-w-6xl">
        {/* Section Header */}
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 rounded-full bg-[#2563EB]/8 text-[#2563EB] text-xs font-medium mb-4">
              {t('testimonials_label')}
            </span>
            <h2
              className="text-[clamp(1.75rem,4vw,2.5rem)] font-bold tracking-tight text-landing-text mb-4"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {t('testimonials_heading')}
            </h2>
          </div>
        </ScrollReveal>

        {/* Featured + Secondary Grid */}
        <StaggerContainer className="grid lg:grid-cols-5 gap-5 mb-12">
          {/* Featured testimonial — spans 3 columns */}
          <StaggerItem className="lg:col-span-3">
            <motion.div
              className="group relative h-full rounded-2xl bg-landing-card-bg border border-landing-card-border p-8 hover:border-[#2563EB]/20 hover:shadow-xl hover:shadow-[#2563EB]/5 transition-all duration-500 overflow-hidden"
              whileHover={{ y: -4 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              {/* Animated shimmer border on featured card */}
              <div
                className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{ padding: '1px' }}
              >
                <div
                  className="absolute inset-[-1px] rounded-2xl animate-[border-shimmer_8s_linear_infinite]"
                  style={{
                    background:
                      'conic-gradient(from var(--shimmer-angle, 0deg), transparent 0%, #2563EB 10%, #7C3AED 20%, transparent 30%)',
                    mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    maskComposite: 'exclude',
                    WebkitMaskComposite: 'xor',
                    padding: '1.5px',
                    opacity: 0.5,
                  }}
                />
              </div>

              {/* Subtle gradient accent at top */}
              <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl bg-gradient-to-r from-[#2563EB] via-[#7C3AED] to-[#2563EB] opacity-60" />

              <div className="flex flex-col h-full">
                {/* Stars — staggered animation */}
                <div className="mb-5">
                  <StarRating />
                </div>

                {/* Large quote — floating rotation */}
                <motion.svg
                  className="w-10 h-10 text-[#2563EB]/10 mb-4 shrink-0"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  animate={{ rotate: [-5, 5, -5] }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  style={{ willChange: 'transform' }}
                >
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11H10v10H0z" />
                </motion.svg>

                <p className="text-base sm:text-lg text-landing-text leading-relaxed mb-6 flex-1">
                  &quot;{t(`testimonial_${featured.id}_quote`)}&quot;
                </p>

                {/* Metric highlight — with ambient glow */}
                <motion.div
                  className="rounded-xl bg-gradient-to-r from-[#EFF6FF] to-[#F5F3FF] border border-[#2563EB]/10 px-5 py-3.5 mb-6"
                  animate={{
                    boxShadow: [
                      '0 0 0px 0px rgba(37, 99, 235, 0)',
                      '0 0 12px 2px rgba(37, 99, 235, 0.12)',
                      '0 0 0px 0px rgba(37, 99, 235, 0)',
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  style={{ willChange: 'box-shadow' }}
                >
                  <p className="text-lg font-bold text-[#2563EB]">
                    {t(`testimonial_${featured.id}_metric`)}
                  </p>
                  <p className="text-xs text-[#2563EB]/60">
                    {t(`testimonial_${featured.id}_metric_label`)}
                  </p>
                </motion.div>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <Avatar name={t(`testimonial_${featured.id}_name`)} color={featured.color} size="lg" />
                  <div>
                    <p className="text-base font-semibold text-landing-text">
                      {t(`testimonial_${featured.id}_name`)}
                    </p>
                    <p className="text-sm text-[#71717A]">
                      {t(`testimonial_${featured.id}_role`)}
                    </p>
                    <p className="text-xs text-[#2563EB]/70 font-medium mt-0.5">
                      {t(`testimonial_${featured.id}_company`)}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </StaggerItem>

          {/* Secondary testimonials — spans 2 columns, stacked */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            {secondary.map(({ id, color }) => (
              <StaggerItem key={id} className="flex-1">
                <motion.div
                  className="group relative h-full rounded-2xl bg-landing-card-bg border border-landing-card-border p-6 hover:border-[#2563EB]/15 hover:shadow-lg hover:shadow-[#2563EB]/5 transition-all duration-500 flex flex-col"
                  whileHover={{ y: -3 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                >
                  {/* Stars — staggered animation */}
                  <div className="mb-3">
                    <StarRating />
                  </div>

                  {/* Quote */}
                  <p className="text-sm text-landing-text-muted leading-relaxed mb-4 flex-1">
                    &quot;{t(`testimonial_${id}_quote`)}&quot;
                  </p>

                  {/* Metric highlight — with ambient glow */}
                  <motion.div
                    className="rounded-lg bg-[#EFF6FF] border border-[#2563EB]/10 px-3 py-2 mb-4"
                    animate={{
                      boxShadow: [
                        '0 0 0px 0px rgba(37, 99, 235, 0)',
                        '0 0 10px 1px rgba(37, 99, 235, 0.1)',
                        '0 0 0px 0px rgba(37, 99, 235, 0)',
                      ],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: id * 0.5,
                    }}
                    style={{ willChange: 'box-shadow' }}
                  >
                    <p className="text-sm font-semibold text-[#2563EB]">
                      {t(`testimonial_${id}_metric`)}
                    </p>
                    <p className="text-[10px] text-[#2563EB]/60">
                      {t(`testimonial_${id}_metric_label`)}
                    </p>
                  </motion.div>

                  {/* Author */}
                  <div className="flex items-center gap-3">
                    <Avatar name={t(`testimonial_${id}_name`)} color={color} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-landing-text">
                        {t(`testimonial_${id}_name`)}
                      </p>
                      <p className="text-[11px] text-[#71717A]">
                        {t(`testimonial_${id}_role`)} &middot; {t(`testimonial_${id}_company`)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </StaggerItem>
            ))}
          </div>
        </StaggerContainer>

        {/* Aggregate metrics strip */}
        <ScrollReveal delay={0.3}>
          <div className="grid grid-cols-3 gap-4 sm:gap-6 rounded-2xl bg-landing-card-bg border border-landing-card-border p-5 sm:p-8">
            {aggregateStats.map(({ valueKey, labelKey, icon }, i) => (
              <div
                key={valueKey}
                className={`text-center ${i < 2 ? 'border-r border-landing-card-border' : ''}`}
              >
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <motion.span
                    className="text-[#2563EB] text-xs"
                    animate={{
                      y: [0, -2, 0],
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      duration: 3,
                      delay: i * 0.4,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    style={{ willChange: 'transform' }}
                  >
                    {icon}
                  </motion.span>
                  <p
                    className="text-lg sm:text-2xl font-bold text-landing-text"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {t(valueKey)}
                  </p>
                </div>
                <p className="text-xs text-landing-text-muted">{t(labelKey)}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Activity ticker — auto-scrolling social proof */}
        <ScrollReveal delay={0.4}>
          <ActivityTicker />
        </ScrollReveal>
      </div>
    </section>
  );
}
