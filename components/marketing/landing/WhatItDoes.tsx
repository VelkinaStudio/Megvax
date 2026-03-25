'use client';

import { motion, useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from '@/lib/i18n';
import { ScrollReveal, StaggerContainer, StaggerItem } from './ScrollReveal';

// ─── Shared constants ───────────────────────────────────────────────────────
const EXPO_OUT = [0.22, 1, 0.36, 1] as const;
const BLUE = '#2563EB';
const GREEN = '#10B981';
const RED = '#EF4444';
const GRAY = '#9CA3AF';
const GRAY_LIGHT = '#E5E7EB';
const CHARCOAL = '#1A1A1A';

// ─── 1. Autopilot Illustration ──────────────────────────────────────────────
function AutopilotAnimation() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, amount: 0.5 });
  const [phase, setPhase] = useState(0);
  // Phases: 0=idle, 1=analyzing, 2=action, 3=settled, then reset

  useEffect(() => {
    if (!isInView) {
      setPhase(0);
      return;
    }

    const durations = [1200, 1000, 1200, 2200];
    let timeout: ReturnType<typeof setTimeout>;

    const advance = (current: number) => {
      const next = (current + 1) % 4;
      setPhase(next);
      timeout = setTimeout(() => advance(next), durations[next]);
    };

    timeout = setTimeout(() => advance(0), durations[0]);
    return () => clearTimeout(timeout);
  }, [isInView]);

  const bars: Array<{
    label: string;
    idle: number;
    final: number;
    winner: boolean;
    loser: boolean;
  }> = [
    { label: 'Ad A', idle: 60, final: 85, winner: true, loser: false },
    { label: 'Ad B', idle: 45, final: 18, winner: false, loser: true },
    { label: 'Ad C', idle: 70, final: 95, winner: true, loser: false },
    { label: 'Ad D', idle: 35, final: 12, winner: false, loser: true },
  ];

  const getBarHeight = (bar: typeof bars[0]) => {
    if (phase <= 1) return bar.idle;
    return bar.final;
  };

  const getBarColor = (bar: typeof bars[0]) => {
    if (phase === 0) return GRAY_LIGHT;
    if (phase === 1) return GRAY;
    if (bar.winner) return GREEN;
    if (bar.loser) return RED;
    return GRAY;
  };

  const getBarOpacity = (bar: typeof bars[0]) => {
    if (phase >= 2 && bar.loser) return 0.5;
    return 1;
  };

  return (
    <div ref={ref} className="relative w-full h-[168px] flex items-end justify-center gap-5 px-6 pb-2 pt-4">
      {/* Scanning line */}
      <motion.div
        className="absolute left-6 right-6 h-[1px]"
        style={{ backgroundColor: BLUE }}
        initial={{ opacity: 0, top: '15%' }}
        animate={
          phase === 1
            ? { opacity: [0, 0.6, 0.6, 0], top: ['15%', '85%'] }
            : { opacity: 0 }
        }
        transition={
          phase === 1
            ? { duration: 1, ease: 'linear' }
            : { duration: 0.3 }
        }
      />

      {bars.map((bar, i) => (
        <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
          {/* Status indicator */}
          <motion.div
            className="flex items-center justify-center"
            initial={{ opacity: 0, scale: 0 }}
            animate={
              phase >= 2
                ? { opacity: 1, scale: 1 }
                : { opacity: 0, scale: 0 }
            }
            transition={{ duration: 0.4, delay: i * 0.08, ease: EXPO_OUT }}
          >
            {bar.winner ? (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 2L8.5 5.5L12 6L9.5 8.5L10 12L7 10.5L4 12L4.5 8.5L2 6L5.5 5.5L7 2Z" fill={GREEN} opacity={0.8} />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="3" y="6" width="8" height="2" rx="1" fill={RED} opacity={0.7} />
              </svg>
            )}
          </motion.div>

          {/* Bar */}
          <div className="w-full flex justify-center">
            <motion.div
              className="rounded-md w-full max-w-[36px]"
              style={{ originY: 1 }}
              initial={{ height: 0, backgroundColor: GRAY_LIGHT }}
              animate={{
                height: getBarHeight(bar),
                backgroundColor: getBarColor(bar),
                opacity: getBarOpacity(bar),
              }}
              transition={{
                height: { duration: 0.7, ease: EXPO_OUT },
                backgroundColor: { duration: 0.5 },
                opacity: { duration: 0.4 },
              }}
            />
          </div>

          {/* Label */}
          <span
            className="text-[10px] font-medium select-none"
            style={{ color: GRAY }}
          >
            {bar.label}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── 2. Smart Suggestions Illustration ──────────────────────────────────────
function SuggestionsAnimation() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, amount: 0.5 });
  const [phase, setPhase] = useState(0);
  // 0=idle, 1=card slides in, 2=button appears, 3=button clicked + ripple, 4=success, then reset

  useEffect(() => {
    if (!isInView) {
      setPhase(0);
      return;
    }

    const durations = [800, 800, 600, 500, 2000];
    let timeout: ReturnType<typeof setTimeout>;

    const advance = (current: number) => {
      const next = (current + 1) % 5;
      setPhase(next);
      timeout = setTimeout(() => advance(next), durations[next]);
    };

    timeout = setTimeout(() => advance(0), durations[0]);
    return () => clearTimeout(timeout);
  }, [isInView]);

  return (
    <div ref={ref} className="relative w-full h-[168px] flex items-center justify-center overflow-hidden px-4">
      {/* Suggestion card */}
      <motion.div
        className="relative rounded-xl border border-black/[0.08] bg-[#FAFAF8] shadow-[0_1px_3px_rgba(0,0,0,0.04)] w-full max-w-[240px]"
        initial={{ x: 60, opacity: 0 }}
        animate={
          phase >= 1
            ? { x: 0, opacity: 1 }
            : { x: 60, opacity: 0 }
        }
        transition={{ duration: 0.55, ease: EXPO_OUT }}
      >
        <div className="p-3.5">
          {/* Header row */}
          <div className="flex items-center gap-2 mb-2.5">
            {/* Star icon */}
            <motion.div
              className="flex items-center justify-center w-6 h-6 rounded-md"
              style={{ backgroundColor: `${BLUE}12` }}
              animate={
                phase >= 1
                  ? { rotate: [0, 15, -10, 0], scale: [1, 1.1, 1] }
                  : {}
              }
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <span className="text-[11px]" style={{ color: BLUE }}>&#10022;</span>
            </motion.div>
            <span
              className="text-[11px] font-semibold tracking-tight"
              style={{ color: CHARCOAL }}
            >
              AI Öneri
            </span>
          </div>

          {/* Text lines */}
          <div className="flex flex-col gap-1.5 mb-3">
            <motion.div
              className="flex items-center gap-1.5"
              initial={{ opacity: 0 }}
              animate={phase >= 1 ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 1L7 4.5L10.5 5L7.5 7.5L8.5 11L6 9L3.5 11L4.5 7.5L1.5 5L5 4.5L6 1Z" fill={BLUE} opacity={0.2} />
              </svg>
              <span className="text-[11px]" style={{ color: '#6B7280' }}>
                Bütçeyi %20 artır
              </span>
            </motion.div>
            <motion.div
              className="h-[3px] rounded-full"
              style={{ backgroundColor: GRAY_LIGHT, width: '70%' }}
              initial={{ opacity: 0 }}
              animate={phase >= 1 ? { opacity: 0.5 } : { opacity: 0 }}
              transition={{ delay: 0.35, duration: 0.3 }}
            />
          </div>

          {/* Approve button */}
          <motion.div
            className="relative overflow-hidden"
            initial={{ opacity: 0, y: 6 }}
            animate={
              phase >= 2
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 6 }
            }
            transition={{ duration: 0.35, ease: EXPO_OUT }}
          >
            <motion.button
              className="relative w-full h-[30px] rounded-lg text-[11px] font-medium flex items-center justify-center gap-1.5 cursor-default overflow-hidden"
              style={{
                backgroundColor: phase >= 3 ? BLUE : '#F3F4F6',
                color: phase >= 3 ? '#FFFFFF' : '#6B7280',
                border: phase >= 3 ? 'none' : '1px solid rgba(0,0,0,0.06)',
              }}
              animate={{
                backgroundColor: phase >= 3 ? BLUE : '#F3F4F6',
                color: phase >= 3 ? '#FFFFFF' : '#6B7280',
              }}
              transition={{ duration: 0.3, ease: EXPO_OUT }}
            >
              {/* Checkmark */}
              <motion.svg
                width="13"
                height="13"
                viewBox="0 0 13 13"
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={
                  phase >= 3
                    ? { pathLength: 1, opacity: 1 }
                    : { pathLength: 0, opacity: 0 }
                }
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <motion.path
                  d="M3 6.5L5.5 9L10 4"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={phase >= 3 ? { pathLength: 1 } : { pathLength: 0 }}
                  transition={{ duration: 0.4, delay: 0.15 }}
                />
              </motion.svg>

              <span>
                {phase >= 4 ? 'Uygulandı' : phase >= 3 ? 'Onaylandı' : 'Onayla'}
              </span>

              {/* Ripple effect */}
              {phase === 3 && (
                <motion.div
                  className="absolute inset-0 rounded-lg"
                  style={{ backgroundColor: BLUE }}
                  initial={{ scale: 0, opacity: 0.3 }}
                  animate={{ scale: 2.5, opacity: 0 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              )}
            </motion.button>
          </motion.div>
        </div>

        {/* Success glow */}
        <motion.div
          className="absolute -inset-[1px] rounded-xl pointer-events-none"
          style={{ border: `2px solid ${GREEN}` }}
          initial={{ opacity: 0 }}
          animate={phase >= 4 ? { opacity: [0, 0.6, 0] } : { opacity: 0 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </motion.div>
    </div>
  );
}

// ─── 3. Dashboard Consolidation Illustration ────────────────────────────────
const TILE_COLORS = ['#3B82F6', '#8B5CF6', '#F59E0B', '#10B981', '#EF4444'];

interface TilePosition {
  x: number;
  y: number;
  rotate: number;
  scale: number;
}

const SCATTERED_POSITIONS: TilePosition[] = [
  { x: -30, y: -22, rotate: -12, scale: 0.95 },
  { x: 32, y: -18, rotate: 8, scale: 0.9 },
  { x: -20, y: 20, rotate: 5, scale: 0.88 },
  { x: 28, y: 24, rotate: -7, scale: 0.92 },
  { x: 5, y: 0, rotate: 3, scale: 0.85 },
];

const GRID_POSITIONS: TilePosition[] = [
  { x: -26, y: -24, rotate: 0, scale: 1 },
  { x: 26, y: -24, rotate: 0, scale: 1 },
  { x: -26, y: 24, rotate: 0, scale: 1 },
  { x: 26, y: 24, rotate: 0, scale: 1 },
  { x: 0, y: 0, rotate: 0, scale: 0 }, // 5th tile fades out to show clean 2x2
];

function DashboardAnimation() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, amount: 0.5 });
  const [organized, setOrganized] = useState(false);

  useEffect(() => {
    if (!isInView) {
      setOrganized(false);
      return;
    }

    let timeout: ReturnType<typeof setTimeout>;

    const toggle = (value: boolean) => {
      setOrganized(value);
      timeout = setTimeout(() => toggle(!value), value ? 2800 : 1600);
    };

    timeout = setTimeout(() => toggle(true), 1000);
    return () => clearTimeout(timeout);
  }, [isInView]);

  return (
    <div ref={ref} className="relative w-full h-[168px] flex items-center justify-center">
      {/* Container frame hint */}
      <motion.div
        className="absolute rounded-xl border-dashed"
        style={{
          width: 100,
          height: 92,
          borderWidth: 1.5,
          borderColor: organized ? `${BLUE}30` : 'transparent',
        }}
        animate={{
          borderColor: organized ? `${BLUE}25` : 'transparent',
          opacity: organized ? 1 : 0,
        }}
        transition={{ duration: 0.6, ease: EXPO_OUT }}
      />

      {/* Tiles */}
      {TILE_COLORS.map((color, i) => {
        const pos = organized ? GRID_POSITIONS[i] : SCATTERED_POSITIONS[i];

        return (
          <motion.div
            key={i}
            className="absolute rounded-lg shadow-sm"
            style={{
              width: 42,
              height: 36,
              backgroundColor: color,
              zIndex: organized ? 1 : 5 - i,
            }}
            initial={{
              x: SCATTERED_POSITIONS[i].x,
              y: SCATTERED_POSITIONS[i].y,
              rotate: SCATTERED_POSITIONS[i].rotate,
              scale: SCATTERED_POSITIONS[i].scale,
              opacity: 0,
            }}
            animate={{
              x: pos.x,
              y: pos.y,
              rotate: pos.rotate,
              scale: pos.scale,
              opacity: i === 4 && organized ? 0 : 1,
            }}
            transition={{
              duration: 0.8,
              delay: organized ? i * 0.06 : i * 0.04,
              ease: EXPO_OUT,
            }}
          >
            {/* Mini content lines inside tile */}
            <div className="p-1.5 flex flex-col gap-1">
              <div
                className="h-[3px] rounded-full"
                style={{ backgroundColor: 'rgba(255,255,255,0.6)', width: '70%' }}
              />
              <div
                className="h-[2px] rounded-full"
                style={{ backgroundColor: 'rgba(255,255,255,0.35)', width: '50%' }}
              />
              <div
                className="h-[2px] rounded-full"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)', width: '85%' }}
              />
            </div>
          </motion.div>
        );
      })}

      {/* "Unified" label */}
      <motion.div
        className="absolute bottom-3 text-[10px] font-medium tracking-wide select-none"
        style={{ color: BLUE }}
        initial={{ opacity: 0, y: 4 }}
        animate={
          organized
            ? { opacity: 0.7, y: 0 }
            : { opacity: 0, y: 4 }
        }
        transition={{ duration: 0.4, delay: 0.5, ease: EXPO_OUT }}
      >
        &#10003; Birleştirildi
      </motion.div>
    </div>
  );
}

// ─── Feature Card Wrapper ───────────────────────────────────────────────────
interface FeatureCardProps {
  illustration: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ illustration, title, description }: FeatureCardProps) {
  return (
    <div className="bg-white border border-black/[0.04] rounded-2xl overflow-hidden transition-all duration-300 hover:border-black/[0.08] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
      {/* Illustration area */}
      <div className="border-b border-black/[0.04]">
        {illustration}
      </div>

      {/* Text content */}
      <div className="p-6 pt-5">
        <h3
          className="text-[20px] font-semibold text-[#1A1A1A] mb-2"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {title}
        </h3>
        <p className="text-[15px] text-[#6B7280] leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────
export function WhatItDoes() {
  const t = useTranslations('landing');

  return (
    <section id="features" className="py-24 md:py-32 scroll-mt-20">
      <div className="max-w-5xl mx-auto px-6">
        <ScrollReveal>
          <h2
            className="text-[clamp(2rem,4vw,2.75rem)] font-bold text-[#1A1A1A] text-center mb-12 tracking-[-0.03em]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {t('features_heading')}
          </h2>
        </ScrollReveal>

        <StaggerContainer className="grid md:grid-cols-3 gap-8">
          <StaggerItem>
            <FeatureCard
              illustration={<AutopilotAnimation />}
              title={t('feature_autopilot_title')}
              description={t('feature_autopilot_desc')}
            />
          </StaggerItem>

          <StaggerItem>
            <FeatureCard
              illustration={<SuggestionsAnimation />}
              title={t('feature_suggestions_title')}
              description={t('feature_suggestions_desc')}
            />
          </StaggerItem>

          <StaggerItem>
            <FeatureCard
              illustration={<DashboardAnimation />}
              title={t('feature_dashboard_title')}
              description={t('feature_dashboard_desc')}
            />
          </StaggerItem>
        </StaggerContainer>
      </div>
    </section>
  );
}
