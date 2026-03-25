'use client';

import { useTranslations } from '@/lib/i18n';
import { Counter } from './Counter';
import { ScrollReveal } from './ScrollReveal';

export function MetricsStrip() {
  const t = useTranslations('landing');

  const metrics = [
    { value: 2, suffix: 'M+', prefix: '₺', label: t('metric_spend') },
    { value: 150, suffix: '+', label: t('metric_accounts') },
    { value: 3.2, suffix: 'x', decimals: 1, label: t('metric_roas') },
  ];

  return (
    <section className="py-20 bg-[#F3F2EF]">
      <div className="max-w-4xl mx-auto px-6">
        <ScrollReveal>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {metrics.map((m, i) => (
              <div
                key={i}
                className={
                  i < 2 ? 'md:border-r md:border-black/[0.06]' : undefined
                }
              >
                <div
                  className="text-[48px] font-extrabold text-[#1A1A1A]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  <Counter
                    value={m.value}
                    prefix={m.prefix}
                    suffix={m.suffix}
                    decimals={m.decimals}
                  />
                </div>
                <div className="text-[14px] text-[#6B7280] mt-1">
                  {m.label}
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
