'use client';

import Link from 'next/link';
import {
  motion,
  useTransform,
  useInView,
  useScroll,
} from 'framer-motion';
import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { Shield, Play } from 'lucide-react';
import { useTranslations } from '@/lib/i18n';
import { GradientMesh } from './GradientMesh';
import { InteractiveGrid } from './InteractiveGrid';

const spring = {
  type: 'spring' as const,
  stiffness: 100,
  damping: 20,
  mass: 0.8,
};

// ─── Stat Counter (hero-specific) ──────────────────────────────────────────
// Counts up from 0 on scroll-in using requestAnimationFrame.

function HeroStatCounter({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const [display, setDisplay] = useState(text);
  const hasAnimated = useRef(false);

  // Parse the stat value: "3.2x" → number=3.2, suffix="x" | "12 hrs" → number=12, suffix=" hrs" | "150+" → number=150, suffix="+"
  const parsed = useMemo(() => {
    const match = text.match(/^([\d.,]+)\s*(.*)$/);
    if (!match) return null;
    const numStr = match[1].replace(',', '.');
    const num = parseFloat(numStr);
    if (isNaN(num)) return null;
    return { num, suffix: match[2], hasDecimal: numStr.includes('.'), decimalPlaces: numStr.includes('.') ? numStr.split('.')[1].length : 0 };
  }, [text]);

  const animate = useCallback(() => {
    if (hasAnimated.current || !parsed) return;
    hasAnimated.current = true;

    const start = performance.now();
    const durationMs = 1600;
    const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / durationMs, 1);
      const eased = easeOutExpo(progress);
      const current = eased * parsed.num;

      const formatted = parsed.hasDecimal
        ? current.toFixed(parsed.decimalPlaces)
        : Math.round(current).toString();

      setDisplay(`${formatted}${parsed.suffix}`);

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        // Ensure we land on the exact original text
        setDisplay(text);
      }
    };

    requestAnimationFrame(tick);
  }, [parsed, text]);

  useEffect(() => {
    if (isInView && parsed) {
      animate();
    }
  }, [isInView, parsed, animate]);

  // If we can't parse it (e.g. pure text), just show it static
  if (!parsed) {
    return <span ref={ref}>{text}</span>;
  }

  return <span ref={ref}>{display}</span>;
}


// ─── Staggered Word Animation ──────────────────────────────────────────────

function AnimatedHeadline({
  firstPart,
  lastWord,
}: {
  firstPart: string;
  lastWord: string | undefined;
}) {
  const allWords = firstPart.split(' ').filter(Boolean);

  return (
    <h1
      className="text-center text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] max-w-4xl mx-auto"
      style={{ fontFamily: 'var(--font-display)' }}
    >
      {allWords.map((word, i) => (
        <motion.span
          key={i}
          className="inline-block mr-[0.3em]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            ...spring,
            delay: 0.15 + i * 0.06,
          }}
        >
          {word}
        </motion.span>
      ))}
      {lastWord && (
        <motion.span
          className="shimmer-text inline-block bg-gradient-to-r from-[#2563EB] via-[#60A5FA] via-[#7C3AED] to-[#2563EB] bg-clip-text text-transparent"
          style={{ backgroundSize: '200% auto' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            ...spring,
            delay: 0.15 + allWords.length * 0.06,
          }}
        >
          {lastWord}
        </motion.span>
      )}
    </h1>
  );
}

// ─── Hero ──────────────────────────────────────────────────────────────────

export function Hero() {
  const t = useTranslations('landing');
  const sectionRef = useRef<HTMLElement>(null);

  // Split headline for gradient effect on last part
  const title = t('hero_title');
  const titleWords = title.split(' ');
  const lastWord = titleWords.pop();
  const firstPart = titleWords.join(' ');

  const stats = [
    { value: t('hero_stat_roas'), label: t('hero_stat_roas_label') },
    { value: t('hero_stat_time'), label: t('hero_stat_time_label') },
    { value: t('hero_stat_accounts'), label: t('hero_stat_accounts_label') },
  ];

  // Scroll parallax for headline
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const headlineY = useTransform(scrollYProgress, [0, 1], [0, -60]);

  return (
    <section ref={sectionRef} className="relative pt-32 pb-24 px-6 overflow-hidden">
      {/* Layer 1: Interactive dot grid canvas (background) */}
      <InteractiveGrid />

      {/* Layer 2: Gradient aurora mesh (above grid, pointer-events-none) */}
      <GradientMesh />

      {/* Layer 3: Content */}
      <div className="relative z-10 mx-auto max-w-6xl">
        <motion.div style={{ y: headlineY }}>
          {/* Badge — gently floating */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.1 }}
            className="flex justify-center mb-8"
          >
            <motion.span
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-[#2563EB]/10 text-[#2563EB] text-xs font-medium tracking-wide shadow-sm shadow-[#2563EB]/5"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2563EB] opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2563EB]" />
              </span>
              {t('hero_badge')}
            </motion.span>
          </motion.div>

          {/* Headline — staggered word animation */}
          <AnimatedHeadline firstPart={firstPart} lastWord={lastWord} />

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.4 }}
            className="text-center text-lg sm:text-xl text-[#6B7280] max-w-xl mx-auto mt-6 leading-relaxed"
          >
            {t('hero_subtitle')}
          </motion.p>

          {/* CTAs — Primary + Secondary */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.55 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10"
          >
            <Link
              href="/signup"
              className="glow-button inline-flex items-center justify-center px-7 py-3.5 rounded-xl bg-[#2563EB] text-white font-medium text-sm hover:bg-[#1D4ED8] transition-all duration-300 shadow-lg shadow-[#2563EB]/25 hover:shadow-xl hover:shadow-[#2563EB]/30 hover:-translate-y-0.5 w-full sm:w-auto"
            >
              {t('hero_cta')}
            </Link>
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-[#E5E7EB] bg-white/60 backdrop-blur-sm text-[#374151] font-medium text-sm hover:bg-white hover:border-[#D1D5DB] transition-all duration-300 w-full sm:w-auto"
            >
              <Play className="w-4 h-4 fill-current" />
              Demo İzle
            </button>
          </motion.div>

          {/* Trust text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex justify-center mt-4"
          >
            <span className="text-xs text-[#71717A] flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              {t('hero_trust')}
            </span>
          </motion.div>

          {/* Stats strip — numbers count up on scroll */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.7 }}
            className="flex items-center justify-center gap-8 sm:gap-14 mt-12 text-center"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center">
                <span className="text-xl sm:text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                  <HeroStatCounter text={stat.value} />
                </span>
                <span className="text-[11px] text-[#71717A] mt-1">{stat.label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
}
