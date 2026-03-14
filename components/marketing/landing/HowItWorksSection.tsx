'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { Link2, Cpu, Rocket, ArrowRight, Check } from 'lucide-react';
import { useRef } from 'react';
import { useTranslations } from '@/lib/i18n';
import Link from 'next/link';

const stepGradients = [
  'from-blue-500 to-cyan-500',
  'from-purple-500 to-blue-500',
  'from-cyan-500 to-emerald-500',
];

export function HowItWorksSection() {
  const t = useTranslations('how_it_works');
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });
  const lineScaleX = useTransform(scrollYProgress, [0.2, 0.8], [0, 1]);

  const steps = [
    {
      number: '01',
      icon: Link2,
      title: t('step_1_title'),
      description: t('step_1_desc'),
      features: [t('step_1_f1'), t('step_1_f2'), t('step_1_f3')],
    },
    {
      number: '02',
      icon: Cpu,
      title: t('step_2_title'),
      description: t('step_2_desc'),
      features: [t('step_2_f1'), t('step_2_f2'), t('step_2_f3')],
    },
    {
      number: '03',
      icon: Rocket,
      title: t('step_3_title'),
      description: t('step_3_desc'),
      features: [t('step_3_f1'), t('step_3_f2'), t('step_3_f3')],
    },
  ];

  return (
    <section ref={containerRef} className="relative py-24 md:py-32 bg-[#f8f9fb] overflow-hidden">
      <div className="container mx-auto px-6">
        {/* Header — Bolder */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-20"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <span className="inline-block text-[13px] font-bold text-blue-600 uppercase tracking-[0.15em] mb-5">
            {t('badge')}
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-5 tracking-tight leading-[1.1]">
            {t('title')}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500">
              {t('title_highlight')}
            </span>
          </h2>
          <p className="text-lg text-gray-500 leading-relaxed">{t('subtitle')}</p>
        </motion.div>

        {/* Steps — Horizontal on desktop with animated connector */}
        <div className="relative max-w-5xl mx-auto">
          {/* Horizontal animated line (desktop only) */}
          <div className="hidden lg:block absolute top-[72px] left-[10%] right-[10%] h-px bg-gray-200">
            <motion.div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 origin-left"
              style={{ scaleX: lineScaleX, width: '100%' }}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                className="relative"
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                viewport={{ once: true, margin: '-60px' }}
              >
                {/* Giant watermark number */}
                <div className={`absolute -top-4 -left-2 text-[140px] font-black leading-none text-transparent bg-clip-text bg-gradient-to-b ${stepGradients[i]} opacity-[0.06] select-none pointer-events-none`}>
                  {step.number}
                </div>

                {/* Step card */}
                <div className="relative group">
                  {/* Gradient icon circle */}
                  <div className={`relative z-10 w-14 h-14 rounded-2xl bg-gradient-to-br ${stepGradients[i]} flex items-center justify-center mb-6 shadow-lg shadow-gray-900/5 group-hover:shadow-xl group-hover:scale-105 transition-all duration-300`}>
                    <step.icon className="w-6 h-6 text-white" />
                  </div>

                  <div className="p-6 md:p-7 rounded-2xl border border-gray-200/60 bg-white/80 backdrop-blur-sm hover:border-gray-300/80 hover:shadow-xl hover:shadow-gray-200/40 transition-all duration-500">
                    <h3 className="text-lg font-bold text-gray-900 mb-3 tracking-tight">{step.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed mb-5">{step.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {step.features.map((f, j) => (
                        <span
                          key={j}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-50 border border-gray-100 text-[12px] text-gray-500 font-medium"
                        >
                          <Check className="w-3 h-3 text-emerald-500" />
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Link href="/signup">
            <motion.button
              className="group inline-flex items-center gap-2 px-7 py-3.5 bg-blue-600 text-white rounded-lg font-semibold text-[15px] hover:bg-blue-500 transition-all"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              {t('cta_button')}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
