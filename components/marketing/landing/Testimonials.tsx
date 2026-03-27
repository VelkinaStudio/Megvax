'use client';

import { motion } from 'framer-motion';
import { useTranslations } from '@/lib/i18n';
import { ScrollReveal, StaggerContainer, StaggerItem } from './ScrollReveal';

const testimonialConfigs = [
  { id: 1, color: 'bg-violet-500' },
  { id: 2, color: 'bg-cyan-500' },
  { id: 3, color: 'bg-rose-500' },
] as const;

export function Testimonials() {
  const t = useTranslations('landing');

  return (
    <section className="py-28 px-6">
      <div className="mx-auto max-w-5xl">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 rounded-full bg-[#2563EB]/8 text-[#2563EB] text-xs font-medium mb-4">
              {t('testimonials_label')}
            </span>
            <h2
              className="text-2xl sm:text-3xl font-bold tracking-tight mb-4"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {t('testimonials_heading')}
            </h2>
          </div>
        </ScrollReveal>

        <StaggerContainer className="grid md:grid-cols-3 gap-5">
          {testimonialConfigs.map(({ id, color }) => {
            const name = t(`testimonial_${id}_name`);
            const initials = name
              .split(' ')
              .map((w: string) => w[0])
              .join('');

            return (
              <StaggerItem key={id}>
                <motion.div
                  className="group relative h-full rounded-2xl bg-landing-card-bg border border-landing-card-border p-6 hover:border-[#2563EB]/15 hover:shadow-lg hover:shadow-[#2563EB]/5 transition-all duration-500 flex flex-col"
                  whileHover={{ y: -3 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                >
                  {/* Quote mark */}
                  <svg
                    className="w-8 h-8 text-[#2563EB]/15 mb-4 shrink-0"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11H10v10H0z" />
                  </svg>

                  {/* Quote text */}
                  <p className="text-sm text-landing-text-muted leading-relaxed mb-6 flex-1">
                    &quot;{t(`testimonial_${id}_quote`)}&quot;
                  </p>

                  {/* Metric highlight */}
                  <div className="rounded-lg bg-[#EFF6FF] border border-[#2563EB]/10 px-3 py-2 mb-5">
                    <p className="text-sm font-semibold text-[#2563EB]">
                      {t(`testimonial_${id}_metric`)}
                    </p>
                    <p className="text-[10px] text-[#2563EB]/60">
                      {t(`testimonial_${id}_metric_label`)}
                    </p>
                  </div>

                  {/* Author */}
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full ${color} flex items-center justify-center text-white text-xs font-bold shadow-md`}
                    >
                      {initials}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-landing-text">
                        {name}
                      </p>
                      <p className="text-[11px] text-[#71717A]">
                        {t(`testimonial_${id}_role`)} &middot;{' '}
                        {t(`testimonial_${id}_company`)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
