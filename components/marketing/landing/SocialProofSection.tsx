'use client';

import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { useTranslations } from '@/lib/i18n';

const logos = ['META', 'GOOGLE', 'TIKTOK', 'AMAZON', 'LINKEDIN', 'TWITTER', 'SHOPIFY', 'HUBSPOT'];

const statGradients = [
  'from-blue-600 to-cyan-500',
  'from-purple-600 to-blue-500',
  'from-cyan-500 to-emerald-500',
  'from-amber-500 to-orange-500',
];

export function SocialProofSection() {
  const t = useTranslations('social_proof');

  const testimonials = [
    { quote: t('t1_quote'), author: t('t1_author'), role: t('t1_role'), avatar: 'SC' },
    { quote: t('t2_quote'), author: t('t2_author'), role: t('t2_role'), avatar: 'MW' },
    { quote: t('t3_quote'), author: t('t3_author'), role: t('t3_role'), avatar: 'EV' },
  ];

  const stats = [
    { value: t('stat_spend_value'), label: t('stat_spend') },
    { value: t('stat_roi_value'), label: t('stat_roi') },
    { value: t('stat_time_value'), label: t('stat_time') },
    { value: t('stat_rating_value'), label: t('stat_rating') },
  ];

  return (
    <section className="relative py-24 md:py-32 bg-white overflow-hidden">
      <div className="container mx-auto px-6">
        {/* Animated Logo Marquee */}
        <motion.div
          className="mb-24"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <p className="text-center text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-10">
            {t('trusted_by')}
          </p>
          <div className="relative overflow-hidden">
            {/* Fade edges */}
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
            {/* Scrolling track */}
            <div className="flex animate-marquee">
              {[...logos, ...logos].map((logo, i) => (
                <span
                  key={`${logo}-${i}`}
                  className="flex-shrink-0 mx-10 text-xl font-extrabold tracking-[0.15em] text-gray-200 hover:text-gray-400 transition-colors duration-300 select-none cursor-default"
                >
                  {logo}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Featured Testimonial — Big & Bold */}
        <motion.div
          className="max-w-4xl mx-auto mb-16"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="relative p-10 md:p-14 rounded-3xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 overflow-hidden">
            {/* Decorative quote mark */}
            <Quote className="absolute top-6 left-8 w-16 h-16 text-blue-500/[0.07] rotate-180" />
            <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-gradient-to-br from-blue-500/[0.04] to-purple-500/[0.04] rounded-full blur-3xl" />

            <div className="relative z-10">
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>

              <p className="text-xl md:text-2xl text-gray-700 leading-relaxed mb-8 font-medium">
                &ldquo;{testimonials[0].quote}&rdquo;
              </p>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-blue-500/20">
                  {testimonials[0].avatar}
                </div>
                <div>
                  <div className="text-base font-bold text-gray-900">{testimonials[0].author}</div>
                  <div className="text-sm text-gray-400">{testimonials[0].role}</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Secondary Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto mb-24">
          {testimonials.slice(1).map((item, i) => (
            <motion.div
              key={i}
              className="group p-7 rounded-2xl border border-gray-100 bg-white hover:border-gray-200 hover:shadow-lg hover:shadow-gray-100/60 transition-all duration-400"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              whileHover={{ y: -4 }}
            >
              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>

              <p className="text-sm text-gray-600 leading-relaxed mb-6">
                &ldquo;{item.quote}&rdquo;
              </p>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-[10px] font-bold text-white">
                  {item.avatar}
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">{item.author}</div>
                  <div className="text-xs text-gray-400">{item.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats — Bold gradient numbers */}
        <motion.div
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <div className={`text-4xl md:text-5xl font-extrabold tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r ${statGradients[i]}`}>
                  {stat.value}
                </div>
                <div className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
