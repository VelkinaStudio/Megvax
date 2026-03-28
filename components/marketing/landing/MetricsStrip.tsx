'use client';

import { motion, useInView } from 'framer-motion';
import { type ReactNode, useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslations } from '@/lib/i18n';
import { ScrollReveal, StaggerContainer, StaggerItem } from './ScrollReveal';

/* ─── Odometer Digit ─────────────────────────────────────── */
// Each digit rolls in from below like a slot machine.

function OdometerDigit({ digit, delay }: { digit: string; delay: number }) {
  const isNumber = /\d/.test(digit);

  if (!isNumber) {
    // Static character (comma, dot, prefix, suffix)
    return (
      <motion.span
        className="inline-block"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.1, duration: 0.3 }}
      >
        {digit}
      </motion.span>
    );
  }

  return (
    <span className="inline-block overflow-hidden relative" style={{ height: '1.15em' }}>
      <motion.span
        className="inline-block"
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: '0%', opacity: 1 }}
        transition={{
          delay,
          duration: 0.5,
          ease: [0.22, 1, 0.36, 1],
        }}
        style={{ willChange: 'transform' }}
      >
        {digit}
      </motion.span>
    </span>
  );
}

/* ─── Odometer Counter ───────────────────────────────────── */
// Animates each digit rolling in sequentially for a slot-machine feel.
// After all digits are in place, fires a particle burst.

interface OdometerCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  onComplete?: () => void;
}

function OdometerCounter({ value, prefix = '', suffix = '', onComplete }: OdometerCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const [displayChars, setDisplayChars] = useState<string[]>([]);
  const [, setShowFinal] = useState(false);
  const hasAnimated = useRef(false);

  const fullText = `${prefix}${value}${suffix}`;
  const chars = fullText.split('');

  useEffect(() => {
    if (!isInView || hasAnimated.current) return;
    hasAnimated.current = true;

    // Set chars via requestAnimationFrame to avoid synchronous setState in effect
    const rafId = requestAnimationFrame(() => {
      setDisplayChars(chars);
    });

    // Fire completion after all digits have rolled in
    const totalDelay = chars.length * 0.07 + 0.5; // stagger + duration
    const timer = setTimeout(() => {
      setShowFinal(true);
      onComplete?.();
    }, totalDelay * 1000);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timer);
    };
  }, [isInView, chars, onComplete]);

  if (!isInView && displayChars.length === 0) {
    // Before scroll-in, show placeholder to prevent layout shift
    return (
      <span ref={ref} className="inline-flex">
        {chars.map((c, i) => (
          <span key={i} className="invisible">{c}</span>
        ))}
      </span>
    );
  }

  return (
    <span ref={ref} className="inline-flex">
      {displayChars.map((char, i) => (
        <OdometerDigit key={`${char}-${i}`} digit={char} delay={i * 0.07} />
      ))}
    </span>
  );
}

/* ─── Particle Burst ─────────────────────────────────────── */
// Small dots that expand outward and fade when counter completes.

function ParticleBurst({ active }: { active: boolean }) {
  if (!active) return null;

  // 5 particles at different angles
  const particles = [
    { angle: -60, distance: 20, size: 4 },
    { angle: -20, distance: 25, size: 3 },
    { angle: 15, distance: 22, size: 4 },
    { angle: 50, distance: 18, size: 3 },
    { angle: 80, distance: 24, size: 3.5 },
  ];

  return (
    <span className="absolute inset-0 pointer-events-none" aria-hidden="true">
      {particles.map((p, i) => {
        const rad = (p.angle * Math.PI) / 180;
        const tx = Math.cos(rad) * p.distance;
        const ty = Math.sin(rad) * p.distance;

        return (
          <motion.span
            key={i}
            className="absolute left-1/2 top-1/2 rounded-full bg-accent-primary"
            style={{
              width: p.size,
              height: p.size,
              marginLeft: -p.size / 2,
              marginTop: -p.size / 2,
            }}
            initial={{ opacity: 0.8, x: 0, y: 0, scale: 1 }}
            animate={{ opacity: 0, x: tx, y: ty, scale: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: i * 0.04 }}
          />
        );
      })}
    </span>
  );
}

/* ─── Mini Visualizations ─────────────────────────────────── */

function MiniBarChart() {
  const bars = [35, 48, 42, 65, 55, 72, 80];
  return (
    <div className="flex items-end gap-[3px] h-10 mb-5 justify-center">
      {bars.map((h, i) => {
        // Each bar enters from 0, then breathes between 0.9 and 1.1
        const breathMin = 1 - (i % 2 === 0 ? 0.1 : 0.08);
        const breathMax = 1 + (i % 2 === 0 ? 0.08 : 0.1);
        return (
          <motion.div
            key={i}
            className="w-[6px] rounded-t-sm bg-accent-primary/70"
            style={{
              height: `${h}%`,
              transformOrigin: 'bottom',
              willChange: 'transform',
            }}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: [0, 1, breathMax, breathMin, 1, breathMax, breathMin, 1] }}
            transition={{
              delay: 0.3 + i * 0.06,
              duration: 8,
              ease: 'easeInOut',
              repeat: Infinity,
              times: [0, 0.08, 0.2, 0.4, 0.55, 0.7, 0.85, 1],
            }}
          />
        );
      })}
    </div>
  );
}

function MiniAvatarGrid() {
  const baseColors = useMemo(
    () => [
      'bg-violet-400',
      'bg-cyan-400',
      'bg-rose-400',
      'bg-amber-400',
      'bg-emerald-400',
      'bg-blue-400',
      'bg-pink-400',
      'bg-teal-400',
      'bg-orange-400',
      'bg-indigo-400',
      'bg-lime-400',
      'bg-fuchsia-400',
    ],
    [],
  );

  // All possible colors for cycling
  const allColors = useMemo(
    () => [
      'bg-violet-400',
      'bg-cyan-400',
      'bg-rose-400',
      'bg-amber-400',
      'bg-emerald-400',
      'bg-blue-400',
      'bg-pink-400',
      'bg-teal-400',
      'bg-orange-400',
      'bg-indigo-400',
      'bg-lime-400',
      'bg-fuchsia-400',
      'bg-red-400',
      'bg-sky-400',
      'bg-yellow-400',
      'bg-purple-400',
    ],
    [],
  );

  const [colors, setColors] = useState(baseColors);

  useEffect(() => {
    const interval = setInterval(() => {
      setColors((prev) => {
        const next = [...prev];
        // Rotate 2 random avatars to new colors
        const idx1 = Math.floor(Math.random() * next.length);
        const idx2 = Math.floor(Math.random() * next.length);
        next[idx1] = allColors[Math.floor(Math.random() * allColors.length)];
        next[idx2] = allColors[Math.floor(Math.random() * allColors.length)];
        return next;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [allColors]);

  return (
    <div className="flex flex-wrap gap-1 justify-center mb-5 max-w-[100px] mx-auto">
      {colors.map((c, i) => (
        <motion.div
          key={i}
          className={`w-[18px] h-[18px] rounded-full ${c} opacity-70`}
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{
            delay: 0.2 + i * 0.04,
            type: 'spring',
            stiffness: 400,
            damping: 15,
          }}
          // Smooth color transition
          layout
          style={{ willChange: 'transform' }}
        />
      ))}
    </div>
  );
}

function MiniTrendLine() {
  return (
    <div className="flex justify-center mb-5">
      <svg
        width="80"
        height="40"
        viewBox="0 0 80 40"
        fill="none"
        className="overflow-visible"
      >
        <motion.path
          d="M0 35 Q10 30 20 28 T40 20 T60 12 T80 4"
          stroke="url(#metricsStripTrendGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 1.2, ease: 'easeOut' }}
        />
        {/* Endpoint dot */}
        <motion.circle
          cx="80"
          cy="4"
          r="3.5"
          fill="#10B981"
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1.4, type: 'spring', stiffness: 400 }}
        />
        {/* Pulsing glow ring around the endpoint */}
        <motion.circle
          cx="80"
          cy="4"
          r="3.5"
          fill="none"
          stroke="#10B981"
          strokeWidth="1.5"
          animate={{
            r: [3.5, 8, 3.5],
            opacity: [0.6, 0, 0.6],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{ willChange: 'r, opacity' }}
        />
        <defs>
          <linearGradient
            id="metricsStripTrendGrad"
            x1="0"
            y1="0"
            x2="80"
            y2="0"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#6B7280" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

/* ─── MetricsStrip ────────────────────────────────────────── */

export function MetricsStrip() {
  const t = useTranslations('landing');

  // Track burst states per metric
  const [bursts, setBursts] = useState([false, false, false]);
  const triggerBurst = useCallback((index: number) => {
    setBursts((prev) => {
      const next = [...prev];
      next[index] = true;
      return next;
    });
  }, []);

  const metrics: {
    visual: ReactNode;
    value: ReactNode;
    label: string;
  }[] = [
    {
      visual: <MiniBarChart />,
      value: (
        <span className="relative inline-flex">
          <OdometerCounter value={2} prefix="₺" suffix="M+" onComplete={() => triggerBurst(0)} />
          <ParticleBurst active={bursts[0]} />
        </span>
      ),
      label: t('metric_spend'),
    },
    {
      visual: <MiniAvatarGrid />,
      value: (
        <span className="relative inline-flex">
          <OdometerCounter value={150} suffix="+" onComplete={() => triggerBurst(1)} />
          <ParticleBurst active={bursts[1]} />
        </span>
      ),
      label: t('metric_accounts'),
    },
    {
      visual: <MiniTrendLine />,
      value: (
        <span className="relative inline-flex">
          <OdometerCounter value={3} suffix="" onComplete={() => triggerBurst(2)} />
          <span>.2x</span>
          <ParticleBurst active={bursts[2]} />
        </span>
      ),
      label: t('metric_roas'),
    },
  ];

  return (
    <section className="py-28 px-6 bg-landing-bg-alt relative overflow-hidden noise-bg">
      <div className="relative z-10 mx-auto max-w-4xl">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 rounded-full bg-accent-primary/8 text-accent-primary text-xs font-medium mb-4">
              {t('metrics_label')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight font-[family-name:var(--font-display)] mb-4">
              {t('metrics_heading')}
            </h2>
          </div>
        </ScrollReveal>

        <StaggerContainer className="grid sm:grid-cols-3 gap-5">
          {metrics.map((metric) => (
            <StaggerItem key={metric.label}>
              <motion.div
                className="group relative text-center rounded-2xl bg-landing-card-bg border border-landing-card-border p-8 shadow-lg shadow-black/[0.06] hover:border-accent-primary/15 hover:shadow-xl transition-all duration-500 overflow-hidden"
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              >
                {/* Top gradient accent line */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#2563EB] via-[#60A5FA] to-[#7C3AED]" />

                {metric.visual}

                <div className="text-4xl sm:text-5xl font-bold tracking-tight font-[family-name:var(--font-display)] text-foreground mb-2">
                  {metric.value}
                </div>
                <p className="text-sm font-medium text-foreground/70">
                  {metric.label}
                </p>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
