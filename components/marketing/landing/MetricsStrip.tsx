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
    <section className="bg-[#FAFAF8]">
      {/* Top gradient border */}
      <div className="h-px bg-gradient-to-r from-transparent via-black/[0.06] to-transparent" />

      <div className="max-w-3xl mx-auto px-6 py-24 md:py-32">
        <ScrollReveal>
          <p className="text-center text-[11px] font-medium tracking-[0.15em] uppercase text-[#9CA3AF] mb-12">
            {t('metrics_label')}
          </p>

          <div className="grid md:grid-cols-3 gap-10 text-center">
            {metrics.map((m, i) => (
              <div
                key={i}
                className="relative flex flex-col items-center"
              >
                {/* Gradient vertical divider */}
                {i > 0 && (
                  <div
                    className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 w-px h-16"
                    style={{
                      background:
                        'linear-gradient(to bottom, transparent, rgba(0,0,0,0.08) 30%, rgba(0,0,0,0.08) 70%, transparent)',
                    }}
                  />
                )}

                <div
                  className="bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] bg-clip-text text-transparent font-extrabold tracking-[-0.03em] leading-none"
                  style={{
                    fontSize: 'clamp(3rem, 5vw, 4rem)',
                    fontFamily: 'var(--font-display)',
                  }}
                >
                  <Counter
                    value={m.value}
                    prefix={m.prefix}
                    suffix={m.suffix}
                    decimals={m.decimals}
                  />
                </div>

                <div className="text-[15px] text-[#6B7280] mt-3">
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
