'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { useTranslations } from '@/lib/i18n';
import { ScrollReveal, StaggerContainer, StaggerItem } from './ScrollReveal';

// ─── Star Rating ─────────────────────────────────────────────────────────────

function StarRating({ count = 5 }: { count?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
      ))}
    </div>
  );
}

// ─── Avatar with initials ────────────────────────────────────────────────────

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
    <div
      className={`${sizeClasses[size]} rounded-full ${color} flex items-center justify-center text-white font-bold shadow-lg`}
    >
      {initials}
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
              className="group relative h-full rounded-2xl bg-landing-card-bg border border-landing-card-border p-8 hover:border-[#2563EB]/20 hover:shadow-xl hover:shadow-[#2563EB]/5 transition-all duration-500"
              whileHover={{ y: -4 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              {/* Subtle gradient accent at top */}
              <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl bg-gradient-to-r from-[#2563EB] via-[#7C3AED] to-[#2563EB] opacity-60" />

              <div className="flex flex-col h-full">
                {/* Stars */}
                <div className="mb-5">
                  <StarRating />
                </div>

                {/* Large quote */}
                <svg
                  className="w-10 h-10 text-[#2563EB]/10 mb-4 shrink-0"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11H10v10H0z" />
                </svg>

                <p className="text-base sm:text-lg text-landing-text leading-relaxed mb-6 flex-1">
                  &quot;{t(`testimonial_${featured.id}_quote`)}&quot;
                </p>

                {/* Metric highlight — larger for featured */}
                <div className="rounded-xl bg-gradient-to-r from-[#EFF6FF] to-[#F5F3FF] border border-[#2563EB]/10 px-5 py-3.5 mb-6">
                  <p className="text-lg font-bold text-[#2563EB]">
                    {t(`testimonial_${featured.id}_metric`)}
                  </p>
                  <p className="text-xs text-[#2563EB]/60">
                    {t(`testimonial_${featured.id}_metric_label`)}
                  </p>
                </div>

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
                  {/* Stars */}
                  <div className="mb-3">
                    <StarRating />
                  </div>

                  {/* Quote */}
                  <p className="text-sm text-landing-text-muted leading-relaxed mb-4 flex-1">
                    &quot;{t(`testimonial_${id}_quote`)}&quot;
                  </p>

                  {/* Metric highlight */}
                  <div className="rounded-lg bg-[#EFF6FF] border border-[#2563EB]/10 px-3 py-2 mb-4">
                    <p className="text-sm font-semibold text-[#2563EB]">
                      {t(`testimonial_${id}_metric`)}
                    </p>
                    <p className="text-[10px] text-[#2563EB]/60">
                      {t(`testimonial_${id}_metric_label`)}
                    </p>
                  </div>

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
                  <span className="text-[#2563EB] text-xs">{icon}</span>
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
      </div>
    </section>
  );
}
