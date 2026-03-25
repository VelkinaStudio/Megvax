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
          <p className="text-center text-[13px] font-medium tracking-widest uppercase text-[#6B7280] mb-10">
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
                  className="text-[52px] font-extrabold text-[#1A1A1A] leading-none"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  <Counter
                    value={m.value}
                    prefix={m.prefix}
                    suffix={m.suffix}
                    decimals={m.decimals}
                  />
                </div>

                {/* Blue accent line */}
                <div className="w-6 h-[2px] bg-[#2563EB] rounded-full mt-3 mb-2 opacity-60" />

                <div className="text-[14px] text-[#6B7280]">
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
