'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { useTranslations } from '@/lib/i18n';

const testimonials = [
  {
    key: 'testimonial_1',
    avatar: 'EY',
    gradient: 'from-blue-500 to-blue-600',
    metric: '+40% ROAS',
  },
  {
    key: 'testimonial_2',
    avatar: 'SK',
    gradient: 'from-violet-500 to-violet-600',
    metric: '15 accounts',
  },
  {
    key: 'testimonial_3',
    avatar: 'OD',
    gradient: 'from-emerald-500 to-emerald-600',
    metric: '-4h/week',
  },
];

export function SocialProof() {
  const t = useTranslations('landing');

  return (
    <section className="py-20 md:py-28 relative">
      <div className="absolute inset-x-0 top-0 h-px bg-white/[0.04]" />

      <div className="max-w-6xl mx-auto px-6">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          {/* Star rating */}
          <div className="flex items-center justify-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="w-4 h-4 fill-amber-400 text-amber-400"
              />
            ))}
            <span className="text-sm text-white/40 ml-2 font-medium">4.8/5</span>
          </div>

          <h2
            className="text-2xl md:text-3xl font-bold text-white tracking-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {t('social_proof_title')}
          </h2>
          <p className="text-sm text-white/25 mt-3 max-w-lg mx-auto">
            {t('social_proof_subtitle')}
          </p>
        </motion.div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {testimonials.map((item, i) => (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group bg-white/[0.04] border border-white/[0.08] rounded-2xl p-6 hover:bg-white/[0.06] hover:border-white/[0.14] transition-all duration-300"
            >
              {/* Metric badge */}
              <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-[11px] font-semibold mb-4">
                {item.metric}
              </div>

              <p className="text-sm text-white/50 leading-relaxed mb-5">
                &ldquo;{t(`${item.key}_quote`)}&rdquo;
              </p>

              <div className="flex items-center gap-3 pt-4 border-t border-white/[0.05]">
                <div
                  className={`w-8 h-8 rounded-full bg-gradient-to-br ${item.gradient} flex items-center justify-center text-[10px] font-bold text-white`}
                >
                  {item.avatar}
                </div>
                <div>
                  <p className="text-xs font-medium text-white/60">{t(`${item.key}_author`)}</p>
                  <p className="text-[10px] text-white/25">{t(`${item.key}_role`)}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
