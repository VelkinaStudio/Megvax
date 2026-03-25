'use client';

import { motion, useInView } from 'framer-motion';
import { Fragment, useRef } from 'react';
import { useTranslations } from '@/lib/i18n';
import { Shield, Zap, Clock } from 'lucide-react';

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
    <section className="py-12">
      <div className="max-w-3xl mx-auto px-6">
        <motion.div
          ref={ref}
          className="flex flex-wrap items-center justify-center gap-x-3 gap-y-3"
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease }}
        >
          {signals.map((signal, i) => (
            <Fragment key={i}>
              {i > 0 && (
                <div className="h-4 w-px bg-black/[0.08] shrink-0" />
              )}
              <motion.div
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-black/[0.04]"
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : {}}
                transition={{ duration: 0.4, delay: i * 0.1, ease }}
              >
                <signal.icon className="w-3.5 h-3.5 text-[#6B7280]" strokeWidth={1.8} />
                <span className="text-[13px] text-[#6B7280] font-medium">
                  {signal.text}
                </span>
              </motion.div>
            </Fragment>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
