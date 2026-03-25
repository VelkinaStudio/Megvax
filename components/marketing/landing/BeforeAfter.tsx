'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useTranslations } from '@/lib/i18n';
import { X, Check } from 'lucide-react';

const ease = [0.22, 1, 0.36, 1] as const;

export function BeforeAfter() {
  const t = useTranslations('landing');
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  const beforeItems = [
    t('before_1'),
    t('before_2'),
    t('before_3'),
    t('before_4'),
  ];

  const afterItems = [
    t('after_1'),
    t('after_2'),
    t('after_3'),
    t('after_4'),
  ];

  return (
    <section className="py-20 md:py-28">
      <div className="max-w-4xl mx-auto px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-black/[0.06] to-transparent mb-16 md:mb-20" />

        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease }}
        >
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {/* Before */}
            <div className="rounded-2xl border border-black/[0.06] bg-white p-6 md:p-8">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center">
                  <X className="w-3.5 h-3.5 text-red-400" strokeWidth={2.5} />
                </div>
                <h3
                  className="text-[17px] font-semibold text-[#1A1A1A]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {t('before_title')}
                </h3>
              </div>
              <div className="space-y-3.5">
                {beforeItems.map((item, i) => (
                  <motion.div
                    key={i}
                    className="flex items-start gap-3"
                    initial={{ opacity: 0, x: -10 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.2 + i * 0.08, ease }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-red-300 mt-2 shrink-0" />
                    <span className="text-[15px] text-[#6B7280] leading-snug">{item}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* After */}
            <div className="rounded-2xl border border-[#2563EB]/10 bg-[#2563EB]/[0.02] p-6 md:p-8">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-7 h-7 rounded-lg bg-[#2563EB]/10 flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-[#2563EB]" strokeWidth={2.5} />
                </div>
                <h3
                  className="text-[17px] font-semibold text-[#1A1A1A]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {t('after_title')}
                </h3>
              </div>
              <div className="space-y-3.5">
                {afterItems.map((item, i) => (
                  <motion.div
                    key={i}
                    className="flex items-start gap-3"
                    initial={{ opacity: 0, x: -10 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.4 + i * 0.08, ease }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-[#2563EB] mt-2 shrink-0" />
                    <span className="text-[15px] text-[#1A1A1A] leading-snug font-medium">{item}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
