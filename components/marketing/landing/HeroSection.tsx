'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Calendar, TrendingUp, Clock, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { useRef, useEffect, useState } from 'react';
import { useTranslations } from '@/lib/i18n';
import { DotGrid } from './DotGrid';

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 2000;
          const startTime = performance.now();
          const tick = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

export function HeroSection() {
  const t = useTranslations('hero');

  const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12 } },
  };
  const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const } },
  };

  const statIcons = [TrendingUp, Clock, BarChart3];

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-[#0a0a0f]">
      {/* Subtle DotGrid Background */}
      <div className="absolute inset-0 z-0 opacity-40">
        <DotGrid
          dotSize={1}
          gap={40}
          baseColor="#ffffff"
          activeColor="#3b82f6"
          proximity={120}
          shockRadius={200}
          shockStrength={8}
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      {/* Minimal gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f]/60 via-transparent to-[#0a0a0f] pointer-events-none z-[1]" />

      {/* Content */}
      <motion.div
        className="relative z-10 container mx-auto px-6 pt-28 pb-20"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge — minimal pill */}
          <motion.div variants={fadeUp} className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] text-[13px] font-medium text-gray-400">
              {t('badge')}
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            className="text-[clamp(2.5rem,6vw,5rem)] font-extrabold leading-[1.08] tracking-[-0.03em] text-white mb-6"
          >
            {t('title')}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-500">
              {t('highlight')}
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            variants={fadeUp}
            className="text-base md:text-lg text-gray-400 max-w-xl mx-auto mb-10 leading-relaxed"
          >
            {t('description')}
          </motion.p>

          {/* CTAs */}
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-6">
            <Link href="/signup">
              <motion.button
                className="group inline-flex items-center gap-2 px-7 py-3.5 bg-blue-600 text-white rounded-lg font-semibold text-[15px] hover:bg-blue-500 transition-all"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                {t('cta_primary')}
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
                {t('cta_secondary')}
              </motion.button>
            </Link>
          </motion.div>

          {/* Trust line */}
          <motion.p variants={fadeUp} className="text-[13px] text-gray-500/70 mb-16">
            {t('benefit_1')} · {t('benefit_2')}
          </motion.p>

          {/* Stats — Clean, minimal */}
          <motion.div
            variants={fadeUp}
            className="grid grid-cols-3 gap-6 max-w-lg mx-auto"
          >
            {[
              { value: 147, suffix: '%', prefix: '+', label: t('stat_roas') },
              { value: 12, suffix: 'hrs', prefix: '', label: t('stat_time') },
              { value: 5000, suffix: '+', prefix: '', label: t('stat_users') },
            ].map((stat, i) => {
              const Icon = statIcons[i];
              return (
                <div key={i} className="text-center">
                  <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white/[0.05] mb-3">
                    <Icon className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-1">
                    {stat.prefix}<AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">{stat.label}</div>
                </div>
              );
            })}
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
