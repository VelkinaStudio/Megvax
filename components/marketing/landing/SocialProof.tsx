'use client';

import { motion } from 'framer-motion';
import { useTranslations } from '@/lib/i18n';

const testimonials = [
  {
    key: 'testimonial_1',
    avatar: 'EY',
    gradient: 'from-blue-500 to-blue-700',
  },
  {
    key: 'testimonial_2',
    avatar: 'SK',
    gradient: 'from-emerald-500 to-emerald-700',
  },
  {
    key: 'testimonial_3',
    avatar: 'OD',
    gradient: 'from-violet-500 to-violet-700',
  },
];

const trustedBy = [
  'E-ticaret markaları',
  'Dijital ajanslar',
  'D2C girişimler',
  'Pazarlama ekipleri',
];

export function SocialProof() {
  const t = useTranslations('landing');

  return (
    <section className="py-16 md:py-24 relative">
      <div className="absolute inset-x-0 top-0 h-px bg-white/[0.04]" />

      <div className="max-w-6xl mx-auto px-6">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2
            className="text-2xl md:text-3xl font-bold text-white tracking-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {t('social_proof_title')}
          </h2>
          <p className="text-sm text-white/30 mt-3 max-w-lg mx-auto">
            {t('social_proof_subtitle')}
          </p>
        </motion.div>

        {/* Trusted by badges */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-wrap items-center justify-center gap-3 mb-14"
        >
          {trustedBy.map((item) => (
            <span
              key={item}
              className="px-4 py-1.5 text-xs text-white/30 border border-white/[0.06] rounded-full bg-white/[0.02]"
            >
              {item}
            </span>
          ))}
        </motion.div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((item, i) => (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6"
            >
              <p className="text-sm text-white/50 leading-relaxed mb-5">
                &ldquo;{t(`${item.key}_quote`)}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-full bg-gradient-to-br ${item.gradient} flex items-center justify-center text-xs font-bold text-white`}
                >
                  {item.avatar}
                </div>
                <div>
                  <p className="text-xs font-medium text-white/70">{t(`${item.key}_author`)}</p>
                  <p className="text-[10px] text-white/30">{t(`${item.key}_role`)}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
