'use client';

import { useTranslations } from '@/lib/i18n';
import { Counter } from './Counter';
import { ScrollReveal } from './ScrollReveal';

const metrics = [
  { value: 2, prefix: '₺', suffix: 'M+', key: 'spend', decimals: 0 },
  { value: 150, prefix: '', suffix: '+', key: 'accounts', decimals: 0 },
  { value: 3.2, prefix: '', suffix: 'x', key: 'roas', decimals: 1 },
] as const;

export function MetricsStrip() {
  const t = useTranslations('landing');

  return (
    <section className="relative py-16 md:py-20 bg-[#0C0C14]">
      {/* Top / bottom subtle borders */}
      <div className="absolute inset-x-0 top-0 h-px bg-white/[0.04]" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-white/[0.04]" />

      <div className="max-w-4xl mx-auto px-6">
        <ScrollReveal>
          <div className="grid grid-cols-3 gap-6 md:gap-12 text-center">
            {metrics.map((m) => (
              <div key={m.key}>
                <div
                  className="text-3xl md:text-[48px] font-extrabold text-white tracking-[-0.03em] leading-none"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  <Counter
                    value={m.value}
                    prefix={m.prefix}
                    suffix={m.suffix}
                    decimals={m.decimals}
                    duration={2.5}
                  />
                </div>
                <p className="text-xs md:text-sm text-white/30 mt-2">
                  {t(`metric_${m.key}`)}
                </p>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
