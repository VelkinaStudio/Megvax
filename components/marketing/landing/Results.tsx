'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { useTranslations } from '@/lib/i18n';

const results = [
  {
    key: 'result_1',
    metric: '+40%',
    icon: TrendingUp,
    accent: '#10B981',
  },
  {
    key: 'result_2',
    metric: '-32%',
    icon: TrendingDown,
    accent: '#3B82F6',
  },
  {
    key: 'result_3',
    metric: '4h/week',
    icon: Clock,
    accent: '#8B5CF6',
  },
];

export function Results() {
  const t = useTranslations('landing');

  return (
    <section className="py-20 md:py-28 relative">
      <div className="absolute inset-x-0 top-0 h-px bg-white/[0.04]" />

      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="text-xs font-medium uppercase tracking-widest text-emerald-400/50 mb-3 block">
            {t('results_label')}
          </span>
          <h2
            className="text-2xl md:text-3xl font-bold text-white tracking-[-0.02em]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {t('results_heading')}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {results.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative rounded-2xl bg-white/[0.04] border border-white/[0.08] p-6 text-center overflow-hidden"
              >
                {/* Top glow accent */}
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-px"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${item.accent}50, transparent)`,
                  }}
                />

                <div
                  className="inline-flex items-center justify-center w-10 h-10 rounded-xl mb-4"
                  style={{ backgroundColor: `${item.accent}12` }}
                >
                  <Icon className="w-5 h-5" style={{ color: item.accent }} />
                </div>

                <div
                  className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-2"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {item.metric}
                </div>

                <p className="text-sm text-white/50 font-medium">
                  {t(`${item.key}_label`)}
                </p>
                <p className="text-xs text-white/30 mt-1">
                  {t(`${item.key}_detail`)}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
