'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useTranslations } from '@/lib/i18n';
import { Clock, Shield, Zap } from 'lucide-react';

const ease = [0.22, 1, 0.36, 1] as const;

export function SocialProof() {
  const t = useTranslations('landing');
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  const signals = [
    { icon: Clock, text: t('trust_setup') },
    { icon: Shield, text: t('trust_secure') },
    { icon: Zap, text: t('trust_meta_partner') },
  ];

  return (
    <section className="py-16 md:py-20">
      <div className="max-w-4xl mx-auto px-6">
        {/* Gradient line separator */}
        <div className="h-px bg-gradient-to-r from-transparent via-black/[0.06] to-transparent mb-16" />

        <motion.div
          ref={ref}
          className="flex flex-col items-center gap-8"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease }}
        >
          {/* Label */}
          <p className="text-[11px] font-medium tracking-[0.15em] uppercase text-[#9CA3AF]">
            {t('hero_trusted_by')}
          </p>

          {/* Trust signals */}
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {signals.map((signal, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-2.5"
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.15 + i * 0.1, ease }}
              >
                <div className="w-8 h-8 rounded-lg bg-[#F3F2EF] flex items-center justify-center">
                  <signal.icon className="w-4 h-4 text-[#6B7280]" strokeWidth={1.8} />
                </div>
                <span className="text-[14px] text-[#6B7280] font-medium">
                  {signal.text}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bottom gradient line */}
        <div className="h-px bg-gradient-to-r from-transparent via-black/[0.06] to-transparent mt-16" />
      </div>
    </section>
  );
}
