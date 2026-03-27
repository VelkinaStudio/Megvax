'use client';

import { motion } from 'framer-motion';
import { type ReactNode } from 'react';
import { useTranslations } from '@/lib/i18n';
import { Counter } from './Counter';
import { ScrollReveal, StaggerContainer, StaggerItem } from './ScrollReveal';

/* ─── Mini Visualizations ─────────────────────────────── */

function MiniBarChart() {
  const bars = [35, 48, 42, 65, 55, 72, 80];
  return (
    <div className="flex items-end gap-[3px] h-10 mb-5 justify-center">
      {bars.map((h, i) => (
        <motion.div
          key={i}
          className="w-[6px] rounded-t-sm bg-accent-primary/70"
          style={{ height: `${h}%`, transformOrigin: 'bottom' }}
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 + i * 0.06, duration: 0.5, ease: 'backOut' }}
        />
      ))}
    </div>
  );
}

function MiniAvatarGrid() {
  const colors = [
    'bg-violet-400',
    'bg-cyan-400',
    'bg-rose-400',
    'bg-amber-400',
    'bg-emerald-400',
    'bg-blue-400',
    'bg-pink-400',
    'bg-teal-400',
    'bg-orange-400',
    'bg-indigo-400',
    'bg-lime-400',
    'bg-fuchsia-400',
  ];
  return (
    <div className="flex flex-wrap gap-1 justify-center mb-5 max-w-[100px] mx-auto">
      {colors.map((c, i) => (
        <motion.div
          key={i}
          className={`w-[18px] h-[18px] rounded-full ${c} opacity-70`}
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{
            delay: 0.2 + i * 0.04,
            type: 'spring',
            stiffness: 400,
            damping: 15,
          }}
        />
      ))}
    </div>
  );
}

function MiniTrendLine() {
  return (
    <div className="flex justify-center mb-5">
      <svg
        width="80"
        height="40"
        viewBox="0 0 80 40"
        fill="none"
        className="overflow-visible"
      >
        <motion.path
          d="M0 35 Q10 30 20 28 T40 20 T60 12 T80 4"
          stroke="url(#metricsStripTrendGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 1.2, ease: 'easeOut' }}
        />
        <motion.circle
          cx="80"
          cy="4"
          r="3.5"
          fill="#10B981"
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1.4, type: 'spring', stiffness: 400 }}
        />
        <defs>
          <linearGradient
            id="metricsStripTrendGrad"
            x1="0"
            y1="0"
            x2="80"
            y2="0"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#6B7280" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

/* ─── MetricsStrip ────────────────────────────────────── */

export function MetricsStrip() {
  const t = useTranslations('landing');

  const metrics: {
    visual: ReactNode;
    value: ReactNode;
    label: string;
  }[] = [
    {
      visual: <MiniBarChart />,
      value: <Counter value={2} prefix="₺" suffix="M+" />,
      label: t('metric_spend'),
    },
    {
      visual: <MiniAvatarGrid />,
      value: <Counter value={150} suffix="+" />,
      label: t('metric_accounts'),
    },
    {
      visual: <MiniTrendLine />,
      value: (
        <span>
          <Counter value={3} suffix="" />
          .2x
        </span>
      ),
      label: t('metric_roas'),
    },
  ];

  return (
    <section className="py-28 px-6 bg-landing-bg-alt relative overflow-hidden noise-bg">
      <div className="relative z-10 mx-auto max-w-4xl">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 rounded-full bg-accent-primary/8 text-accent-primary text-xs font-medium mb-4">
              {t('metrics_label')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight font-[family-name:var(--font-display)] mb-4">
              {t('metrics_heading')}
            </h2>
          </div>
        </ScrollReveal>

        <StaggerContainer className="grid sm:grid-cols-3 gap-5">
          {metrics.map((metric) => (
            <StaggerItem key={metric.label}>
              <motion.div
                className="group relative text-center rounded-2xl bg-landing-card-bg border border-landing-card-border p-8 hover:border-accent-primary/15 transition-all duration-500"
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              >
                {metric.visual}

                <div className="text-3xl sm:text-4xl font-bold tracking-tight font-[family-name:var(--font-display)] text-foreground mb-2">
                  {metric.value}
                </div>
                <p className="text-sm font-medium text-foreground/70">
                  {metric.label}
                </p>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
