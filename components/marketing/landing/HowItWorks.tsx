'use client';

import { motion, useInView, useAnimation } from 'framer-motion';
import { useEffect, useRef, useCallback } from 'react';
import { useTranslations } from '@/lib/i18n';
import { ScrollReveal } from './ScrollReveal';
import { Link2, SlidersHorizontal, Zap } from 'lucide-react';

// ─── Shared constants ───────────────────────────────────────────────────────
const EXPO_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];
const BLUE = '#2563EB';
const BLUE_LIGHT = '#EFF6FF';

// ─── Timing ─────────────────────────────────────────────────────────────────
const CIRCLE_DRAW_MS = 600;
const NUMBER_FADE_MS = 300;
const LINE_DRAW_MS = 500;
const CONTENT_FADE_MS = 400;
const STAGGER_MS = 200;

// Total time per step: circle draw + number fade overlap = ~700ms
// Between steps: line draw = 500ms
// Full sequence: step1(700) + line(500) + step2(700) + line(500) + step3(700) ≈ 3100ms

// ─── Animated Step Circle (SVG border draw + number fade) ───────────────────
function AnimatedCircle({
  num,
  icon: Icon,
  delay,
  onComplete,
}: {
  num: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  delay: number;
  onComplete?: () => void;
}) {
  const controls = useAnimation();
  const numberControls = useAnimation();
  const iconControls = useAnimation();

  const animate = useCallback(async () => {
    // Draw the circle border
    await controls.start({
      strokeDashoffset: 0,
      transition: {
        duration: CIRCLE_DRAW_MS / 1000,
        ease: EXPO_OUT,
        delay: delay / 1000,
      },
    });

    // Fade in the number and icon together
    await Promise.all([
      numberControls.start({
        opacity: 1,
        scale: 1,
        transition: {
          duration: NUMBER_FADE_MS / 1000,
          ease: EXPO_OUT,
        },
      }),
      iconControls.start({
        opacity: 1,
        y: 0,
        transition: {
          duration: NUMBER_FADE_MS / 1000,
          ease: EXPO_OUT,
        },
      }),
    ]);

    onComplete?.();
  }, [controls, numberControls, iconControls, delay, onComplete]);

  useEffect(() => {
    animate();
  }, [animate]);

  const circumference = 2 * Math.PI * 18; // radius=18 for a 44px circle

  return (
    <div className="relative flex flex-col items-center">
      {/* Icon above circle */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={iconControls}
        className="mb-2"
      >
        <Icon size={18} strokeWidth={1.8} className="text-[#2563EB]" />
      </motion.div>

      {/* Circle with SVG border animation */}
      <div className="relative w-11 h-11 flex items-center justify-center">
        {/* Background fill */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: BLUE_LIGHT }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            duration: CIRCLE_DRAW_MS / 1000,
            ease: EXPO_OUT,
            delay: delay / 1000,
          }}
        />

        {/* SVG stroke animation */}
        <svg
          className="absolute inset-0"
          width="44"
          height="44"
          viewBox="0 0 44 44"
          fill="none"
        >
          <motion.circle
            cx="22"
            cy="22"
            r="18"
            stroke={BLUE}
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={controls}
            style={{
              transformOrigin: '50% 50%',
              rotate: '-90deg',
            }}
          />
        </svg>

        {/* Number */}
        <motion.span
          className="relative z-10 font-mono text-sm font-semibold select-none"
          style={{ color: BLUE }}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={numberControls}
        >
          {num}
        </motion.span>
      </div>
    </div>
  );
}

// ─── Step Content (title + description) ─────────────────────────────────────
function StepContent({
  title,
  desc,
  delay,
}: {
  title: string;
  desc: string;
  delay: number;
}) {
  const transition = {
    duration: CONTENT_FADE_MS / 1000,
    ease: EXPO_OUT,
    delay: delay / 1000,
  };

  return (
    <>
      <motion.h3
        className="mt-3 text-[18px] font-semibold text-[#1A1A1A]"
        style={{ fontFamily: 'var(--font-display)' }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={transition}
      >
        {title}
      </motion.h3>
      <motion.p
        className="mt-1 text-[14px] text-[#6B7280] max-w-[200px] mx-auto"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...transition, delay: (delay + 100) / 1000 }}
      >
        {desc}
      </motion.p>
    </>
  );
}

// ─── Desktop Layout (Horizontal) ───────────────────────────────────────────
function DesktopSteps({
  steps,
  isInView,
}: {
  steps: Array<{ num: string; title: string; desc: string; icon: typeof Link2 }>;
  isInView: boolean;
}) {
  if (!isInView) return null;

  // Calculate timing for sequential animation
  const stepDuration = CIRCLE_DRAW_MS + NUMBER_FADE_MS;
  const step1Start = 0;
  const line1Start = step1Start + stepDuration + STAGGER_MS;
  const step2Start = line1Start + LINE_DRAW_MS + STAGGER_MS;
  const line2Start = step2Start + stepDuration + STAGGER_MS;
  const step3Start = line2Start + LINE_DRAW_MS + STAGGER_MS;
  const dotStart = step3Start + stepDuration + 400;

  // Content appears slightly after circle completes
  const content1Start = step1Start + CIRCLE_DRAW_MS;
  const content2Start = step2Start + CIRCLE_DRAW_MS;
  const content3Start = step3Start + CIRCLE_DRAW_MS;

  return (
    <div className="hidden md:block relative">
      <div className="grid grid-cols-3 gap-0">
        {/* Step 1 */}
        <div className="text-center relative">
          <AnimatedCircle num="1" icon={steps[0].icon} delay={step1Start} />
          <StepContent title={steps[0].title} desc={steps[0].desc} delay={content1Start} />
        </div>

        {/* Step 2 */}
        <div className="text-center relative">
          <AnimatedCircle num="2" icon={steps[1].icon} delay={step2Start} />
          <StepContent title={steps[1].title} desc={steps[1].desc} delay={content2Start} />
        </div>

        {/* Step 3 */}
        <div className="text-center relative">
          <AnimatedCircle num="3" icon={steps[2].icon} delay={step3Start} />
          <StepContent title={steps[2].title} desc={steps[2].desc} delay={content3Start} />
        </div>
      </div>

      {/* Connector Lines — positioned between step columns */}
      {/* Line 1: from step 1 to step 2 */}
      <div
        className="absolute"
        style={{
          top: 0,
          left: 'calc(33.33% - 2px)',
          width: 'calc(33.33% + 4px)',
          height: '100%',
          pointerEvents: 'none',
        }}
      >
        <svg
          className="absolute"
          style={{
            top: 72,
            left: '10%',
            width: '80%',
            height: 4,
            overflow: 'visible',
          }}
        >
          <motion.line
            x1="0"
            y1="2"
            x2="100%"
            y2="2"
            stroke={BLUE}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeOpacity={0.3}
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              duration: LINE_DRAW_MS / 1000,
              ease: EXPO_OUT,
              delay: line1Start / 1000,
            }}
          />
        </svg>
      </div>

      {/* Line 2: from step 2 to step 3 */}
      <div
        className="absolute"
        style={{
          top: 0,
          left: 'calc(66.66% - 2px)',
          width: 'calc(33.33% + 4px)',
          height: '100%',
          pointerEvents: 'none',
        }}
      >
        <svg
          className="absolute"
          style={{
            top: 72,
            left: '10%',
            width: '80%',
            height: 4,
            overflow: 'visible',
          }}
        >
          <motion.line
            x1="0"
            y1="2"
            x2="100%"
            y2="2"
            stroke={BLUE}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeOpacity={0.3}
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              duration: LINE_DRAW_MS / 1000,
              ease: EXPO_OUT,
              delay: line2Start / 1000,
            }}
          />
        </svg>
      </div>

      {/* Flowing dot across the full path */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: 0,
          left: 'calc(16.66%)',
          width: 'calc(66.66%)',
          height: '100%',
        }}
      >
        <motion.div
          style={{
            position: 'absolute',
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: BLUE,
            boxShadow: `0 0 10px 3px ${BLUE}40, 0 0 20px 6px ${BLUE}15`,
            top: 69,
          }}
          initial={{ left: '0%', opacity: 0 }}
          animate={{
            left: ['0%', '50%', '100%'],
            opacity: [0, 1, 1, 1, 0],
          }}
          transition={{
            duration: 2.8,
            ease: 'easeInOut',
            repeat: Infinity,
            repeatDelay: 1,
            delay: dotStart / 1000,
            times: [0, 0.45, 1],
          }}
        />
      </div>
    </div>
  );
}

// ─── Mobile Layout (Vertical) ───────────────────────────────────────────────
function MobileSteps({
  steps,
  isInView,
}: {
  steps: Array<{ num: string; title: string; desc: string; icon: typeof Link2 }>;
  isInView: boolean;
}) {
  if (!isInView) return null;

  const stepDuration = CIRCLE_DRAW_MS + NUMBER_FADE_MS;
  const step1Start = 0;
  const line1Start = step1Start + stepDuration + STAGGER_MS;
  const step2Start = line1Start + LINE_DRAW_MS + STAGGER_MS;
  const line2Start = step2Start + stepDuration + STAGGER_MS;
  const step3Start = line2Start + LINE_DRAW_MS + STAGGER_MS;
  const dotStart = step3Start + stepDuration + 400;

  const content1Start = step1Start + CIRCLE_DRAW_MS;
  const content2Start = step2Start + CIRCLE_DRAW_MS;
  const content3Start = step3Start + CIRCLE_DRAW_MS;

  const lineDelay1 = line1Start;
  const lineDelay2 = line2Start;

  return (
    <div className="md:hidden relative flex flex-col items-center gap-0">
      {/* Step 1 */}
      <div className="text-center">
        <AnimatedCircle num="1" icon={steps[0].icon} delay={step1Start} />
        <StepContent title={steps[0].title} desc={steps[0].desc} delay={content1Start} />
      </div>

      {/* Vertical connector 1 */}
      <div className="my-3">
        <svg width="4" height="40" style={{ overflow: 'visible' }}>
          <motion.line
            x1="2"
            y1="0"
            x2="2"
            y2="40"
            stroke={BLUE}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeOpacity={0.3}
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              duration: LINE_DRAW_MS / 1000,
              ease: EXPO_OUT,
              delay: lineDelay1 / 1000,
            }}
          />
        </svg>
      </div>

      {/* Step 2 */}
      <div className="text-center">
        <AnimatedCircle num="2" icon={steps[1].icon} delay={step2Start} />
        <StepContent title={steps[1].title} desc={steps[1].desc} delay={content2Start} />
      </div>

      {/* Vertical connector 2 */}
      <div className="my-3">
        <svg width="4" height="40" style={{ overflow: 'visible' }}>
          <motion.line
            x1="2"
            y1="0"
            x2="2"
            y2="40"
            stroke={BLUE}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeOpacity={0.3}
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              duration: LINE_DRAW_MS / 1000,
              ease: EXPO_OUT,
              delay: lineDelay2 / 1000,
            }}
          />
        </svg>
      </div>

      {/* Step 3 */}
      <div className="text-center">
        <AnimatedCircle num="3" icon={steps[2].icon} delay={step3Start} />
        <StepContent title={steps[2].title} desc={steps[2].desc} delay={content3Start} />
      </div>

      {/* Flowing dot (vertical) */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          backgroundColor: BLUE,
          boxShadow: `0 0 10px 3px ${BLUE}40, 0 0 20px 6px ${BLUE}15`,
          left: '50%',
          marginLeft: -3,
          zIndex: 20,
        }}
        initial={{ top: '5%', opacity: 0 }}
        animate={{
          top: ['5%', '48%', '92%'],
          opacity: [0, 1, 1, 1, 0],
        }}
        transition={{
          duration: 2.8,
          ease: 'easeInOut',
          repeat: Infinity,
          repeatDelay: 1,
          delay: dotStart / 1000,
          times: [0, 0.45, 1],
        }}
      />
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────
export function HowItWorks() {
  const t = useTranslations('landing');
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  const steps = [
    { num: '1', title: t('step1_title'), desc: t('step1_desc'), icon: Link2 },
    { num: '2', title: t('step2_title'), desc: t('step2_desc'), icon: SlidersHorizontal },
    { num: '3', title: t('step3_title'), desc: t('step3_desc'), icon: Zap },
  ];

  return (
    <section className="py-24 md:py-32">
      <div className="max-w-4xl mx-auto px-6">
        <ScrollReveal>
          <h2
            className="text-[clamp(2rem,4vw,2.75rem)] font-bold text-[#1A1A1A] text-center mb-16 md:mb-20 tracking-[-0.03em]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {t('how_it_works_heading')}
          </h2>
        </ScrollReveal>

        <div ref={ref}>
          <DesktopSteps steps={steps} isInView={isInView} />
          <MobileSteps steps={steps} isInView={isInView} />
        </div>
      </div>
    </section>
  );
}
