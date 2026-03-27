'use client';

import { motion } from 'framer-motion';
import { useTranslations } from '@/lib/i18n';
import { ScrollReveal, StaggerContainer, StaggerItem } from './ScrollReveal';

// ─── Constants ──────────────────────────────────────────────────────────────
const SPRING_HOVER = { type: 'spring', stiffness: 300, damping: 25 } as const;
const ACCENT_BAR_BASE = { duration: 0.8, ease: 'easeOut' } as const;

const BEFORE_EMOJIS = ['🔑', '⏰', '📉', '🖥️'];
const AFTER_EMOJIS = ['📊', '🤖', '🛡️', '✨'];

// ─── SVG Icons ──────────────────────────────────────────────────────────────
function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function BoltIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
      />
    </svg>
  );
}

// ─── Component ──────────────────────────────────────────────────────────────
export function BeforeAfter() {
  const t = useTranslations('landing');

  const beforeItems = [t('before_1'), t('before_2'), t('before_3'), t('before_4')];
  const afterItems = [t('after_1'), t('after_2'), t('after_3'), t('after_4')];

  return (
    <section className="py-28 px-6">
      <div className="mx-auto max-w-4xl">
        {/* ── Heading ─────────────────────────────────────────────── */}
        <ScrollReveal>
          <h2
            className="text-2xl sm:text-3xl font-bold tracking-tight text-center mb-4"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-landing-text)' }}
          >
            {t('before_after_heading')}
          </h2>
          <p
            className="text-center max-w-lg mx-auto mb-16 text-[15px]"
            style={{ color: 'var(--color-landing-text-muted)' }}
          >
            {t('before_after_subtitle')}
          </p>
        </ScrollReveal>

        {/* ── Cards Grid ──────────────────────────────────────────── */}
        <StaggerContainer className="grid md:grid-cols-2 gap-5">
          {/* ── Without MegVax ─────────────────────────────────────── */}
          <StaggerItem>
            <motion.div
              className="group relative rounded-2xl p-[1px] h-full"
              whileHover={{ scale: 1.01 }}
              transition={SPRING_HOVER}
            >
              {/* Gradient border */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-red-300 via-red-200/50 to-red-300/30 opacity-60 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative rounded-2xl bg-gradient-to-br from-red-50/80 to-white p-7 h-full backdrop-blur-sm">
                {/* Top accent bar — animates scaleX from 0 */}
                <motion.div
                  className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl bg-gradient-to-r from-red-400 via-red-300 to-rose-300"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ ...ACCENT_BAR_BASE, delay: 0.3 }}
                  style={{ transformOrigin: 'left' }}
                />

                {/* Card header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shadow-sm shadow-red-200/50">
                    <svg
                      className="w-5 h-5 text-red-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-red-700">{t('before_title')}</span>
                    <p className="text-[10px] text-red-400 mt-0.5">{t('before_subtitle')}</p>
                  </div>
                </div>

                {/* Items with emoji icons */}
                <ul className="space-y-3.5">
                  {beforeItems.map((item, i) => (
                    <motion.li
                      key={i}
                      className="flex items-start gap-3 text-sm text-red-900/70"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.4 + i * 0.08, duration: 0.4 }}
                    >
                      <span className="text-sm mt-0.5 shrink-0 grayscale opacity-60">
                        {BEFORE_EMOJIS[i]}
                      </span>
                      {item}
                    </motion.li>
                  ))}
                </ul>

                {/* Bottom callout — clock icon + time/cost stats */}
                <div className="mt-6 pt-4 border-t border-red-200/60">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <ClockIcon className="w-4 h-4 text-red-400" />
                      <span className="text-xs font-semibold text-red-600">
                        {t('before_time_weekly')}
                      </span>
                    </div>
                    <span className="text-[10px] text-red-400">&middot;</span>
                    <span className="text-xs font-medium text-red-500">
                      {t('before_cost_waste')}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </StaggerItem>

          {/* ── With MegVax ───────────────────────────────────────── */}
          <StaggerItem>
            <motion.div
              className="group relative rounded-2xl p-[1px] h-full"
              whileHover={{ scale: 1.01 }}
              transition={SPRING_HOVER}
            >
              {/* Gradient border — uses accent-primary token */}
              <div
                className="absolute inset-0 rounded-2xl opacity-40 group-hover:opacity-80 transition-opacity duration-500"
                style={{
                  background:
                    'linear-gradient(to bottom right, var(--color-accent-primary), rgba(96,165,250,0.5), rgba(139,92,246,0.3))',
                }}
              />

              <div
                className="relative rounded-2xl p-7 h-full backdrop-blur-sm"
                style={{
                  background:
                    'linear-gradient(to bottom right, color-mix(in srgb, var(--color-accent-primary) 8%, white), white)',
                }}
              >
                {/* Top accent bar — animates scaleX from 0 */}
                <motion.div
                  className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl"
                  style={{
                    background:
                      'linear-gradient(to right, var(--color-accent-primary), #60A5FA, #8B5CF6)',
                    transformOrigin: 'left',
                  }}
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ ...ACCENT_BAR_BASE, delay: 0.5 }}
                />

                {/* Card header */}
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
                    style={{
                      backgroundColor:
                        'color-mix(in srgb, var(--color-accent-primary) 10%, transparent)',
                      boxShadow:
                        '0 1px 2px color-mix(in srgb, var(--color-accent-primary) 10%, transparent)',
                    }}
                  >
                    <svg
                      className="w-5 h-5"
                      style={{ color: 'var(--color-accent-primary)' }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <span
                      className="text-sm font-semibold"
                      style={{ color: 'var(--color-accent-primary)' }}
                    >
                      {t('after_title')}
                    </span>
                    <p
                      className="text-[10px] mt-0.5"
                      style={{
                        color:
                          'color-mix(in srgb, var(--color-accent-primary) 60%, transparent)',
                      }}
                    >
                      {t('after_subtitle')}
                    </p>
                  </div>
                </div>

                {/* Items with emoji icons */}
                <ul className="space-y-3.5">
                  {afterItems.map((item, i) => (
                    <motion.li
                      key={i}
                      className="flex items-start gap-3 text-sm"
                      style={{
                        color:
                          'color-mix(in srgb, var(--color-landing-text) 80%, transparent)',
                      }}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 + i * 0.08, duration: 0.4 }}
                    >
                      <span className="text-sm mt-0.5 shrink-0">{AFTER_EMOJIS[i]}</span>
                      {item}
                    </motion.li>
                  ))}
                </ul>

                {/* Bottom callout — bolt icon + time/budget stats */}
                <div
                  className="mt-6 pt-4"
                  style={{
                    borderTop:
                      '1px solid color-mix(in srgb, var(--color-accent-primary) 15%, transparent)',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <BoltIcon className="w-4 h-4 text-emerald-500" />
                      <span className="text-xs font-semibold text-emerald-600">
                        {t('after_time_weekly')}
                      </span>
                    </div>
                    <span
                      className="text-[10px]"
                      style={{
                        color:
                          'color-mix(in srgb, var(--color-accent-primary) 40%, transparent)',
                      }}
                    >
                      &middot;
                    </span>
                    <span
                      className="text-xs font-medium"
                      style={{ color: 'var(--color-accent-primary)' }}
                    >
                      {t('after_budget_safe')}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </StaggerItem>
        </StaggerContainer>
      </div>
    </section>
  );
}
