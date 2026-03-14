'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Check, Calendar } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from '@/lib/i18n';
import { FloatingLinesReactBits } from './FloatingLinesReactBits';

export function CTASection() {
  const t = useTranslations('cta');

  return (
    <section className="relative py-0 overflow-hidden">
      {/* Full-width dark section with WebGL background */}
      <div className="relative bg-gray-950 py-28 md:py-36">
        {/* FloatingLines WebGL Background */}
        <div className="absolute inset-0 z-0 opacity-60">
          <FloatingLinesReactBits
            linesGradient={['#3b82f6', '#8b5cf6', '#06b6d4', '#6366f1']}
            enabledWaves={['top', 'middle', 'bottom']}
            lineCount={[4, 6, 4]}
            lineDistance={[4, 5, 4]}
            animationSpeed={0.6}
            interactive={true}
            bendRadius={4.0}
            bendStrength={-0.4}
            mouseDamping={0.04}
            parallax={true}
            parallaxStrength={0.15}
            className="w-full h-full"
          />
        </div>

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950/60 via-transparent to-gray-950/60 pointer-events-none z-[1]" />

        <div className="relative z-10 container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h2
              className="text-3xl md:text-5xl font-extrabold text-white mb-6 tracking-tight leading-[1.1]"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              {t('title')}
            </motion.h2>

            <motion.p
              className="text-lg text-gray-400 max-w-xl mx-auto mb-8 leading-relaxed"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              viewport={{ once: true }}
            >
              {t('description')}
            </motion.p>

            {/* Trust badges */}
            <motion.div
              className="flex flex-wrap justify-center gap-5 mb-10"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
            >
              {[t('feature_1'), t('feature_2'), t('feature_3')].map((f, i) => (
                <span key={i} className="inline-flex items-center gap-2 text-[13px] text-gray-400">
                  <Check className="w-4 h-4 text-emerald-400" />
                  {f}
                </span>
              ))}
            </motion.div>

            {/* Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              viewport={{ once: true }}
            >
              <Link href="/signup">
                <motion.button
                  className="group inline-flex items-center gap-2 px-7 py-3.5 bg-white text-gray-900 rounded-lg font-semibold text-[15px] hover:bg-gray-100 transition-all"
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {t('button_primary')}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </motion.button>
              </Link>

              <Link href="/book">
                <motion.button
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg font-semibold text-[15px] text-gray-300 border border-white/[0.08] hover:bg-white/[0.04] hover:border-white/[0.15] transition-all"
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Calendar className="w-4 h-4 text-gray-500" />
                  {t('book_meeting')}
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
