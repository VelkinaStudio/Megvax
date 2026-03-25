'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useTranslations } from '@/lib/i18n';

const brands = ['TrendModa', 'GrowthLab', 'FitShop', 'Modanisa', 'Hepsiburada', 'N11'];

export function SocialProof() {
  const t = useTranslations('landing');
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <section className="py-16">
      <div className="max-w-5xl mx-auto px-6 text-center">
        <motion.div
          ref={ref}
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.3 }}
        >
          <p className="text-[13px] uppercase tracking-widest text-[#9CA3AF] font-medium">
            {t('hero_trusted_by')}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mt-6">
            {brands.map((brand, i) => (
              <span key={brand} className="flex items-center gap-x-8">
                {i > 0 && (
                  <span className="text-[13px] text-[#D1D5DB]">&middot;</span>
                )}
                <span
                  className="text-[13px] font-semibold text-[#D1D5DB] tracking-wide"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {brand}
                </span>
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
