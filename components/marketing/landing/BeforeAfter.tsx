'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { useTranslations } from '@/lib/i18n';
import { ScrollReveal, StaggerContainer, StaggerItem } from './ScrollReveal';

// ─── Constants ──────────────────────────────────────────────────────────────
const SPRING_HOVER = { type: 'spring', stiffness: 300, damping: 25 } as const;

// ─── Stat Counter (counts up numbers found in translated text) ─────────────
function AnimatedStat({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-30px' });
  const [display, setDisplay] = useState(text);
  const hasAnimated = useRef(false);

  // Try to extract a leading number: "20+ saat" → 20, "+40% ..." → 40
  const parsed = useMemo(() => {
    const match = text.match(/([\d.,]+)/);
    if (!match) return null;
    const numStr = match[1].replace(',', '.');
    const num = parseFloat(numStr);
    if (isNaN(num)) return null;
    const idx = text.indexOf(match[1]);
    return {
      num,
      before: text.slice(0, idx),
      after: text.slice(idx + match[1].length),
      hasDecimal: numStr.includes('.'),
      decimalPlaces: numStr.includes('.') ? numStr.split('.')[1].length : 0,
      original: match[1],
    };
  }, [text]);

  const animate = useCallback(() => {
    if (hasAnimated.current || !parsed) return;
    hasAnimated.current = true;

    const start = performance.now();
    const durationMs = 1400;
    const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / durationMs, 1);
      const eased = easeOutExpo(progress);
      const current = eased * parsed.num;
      const formatted = parsed.hasDecimal
        ? current.toFixed(parsed.decimalPlaces)
        : Math.round(current).toString();
      setDisplay(`${parsed.before}${formatted}${parsed.after}`);
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        setDisplay(text);
      }
    };
    requestAnimationFrame(tick);
  }, [parsed, text]);

  useEffect(() => {
    if (isInView && parsed) animate();
  }, [isInView, parsed, animate]);

  return <span ref={ref}>{display}</span>;
}

// ─── Before mockup elements (messy, broken feel + glitch animation) ────────
function BeforeMockupVisual() {
  // Memoize random offsets for glitch effect
  const glitchOffsets = useMemo(
    () => [
      { x: [-1, 2, -1, 0], dur: 2.8 },
      { x: [0, -2, 1, 0], dur: 3.2 },
      { x: [1, -1, 2, 0], dur: 2.5 },
      { x: [0, 1, -2, 0], dur: 3.5 },
    ],
    []
  );

  return (
    <div className="rounded-xl bg-red-950/90 border border-red-500/20 p-4 shadow-inner">
      {/* Fake broken UI header — glitching */}
      <motion.div
        className="flex items-center gap-2 mb-3"
        animate={{ x: glitchOffsets[0].x }}
        transition={{ duration: glitchOffsets[0].dur, repeat: Infinity, ease: 'easeInOut' }}
        style={{ willChange: 'transform' }}
      >
        <div className="w-2 h-2 rounded-full bg-red-400" />
        <div className="h-2 w-20 rounded bg-red-800/50" />
        <div className="ml-auto h-2 w-8 rounded bg-red-800/30" />
      </motion.div>
      {/* Fake table rows — messy, inconsistent, glitching */}
      <div className="space-y-1.5">
        {[0.7, 0.5, 0.3, 0.6].map((opacity, i) => (
          <motion.div
            key={i}
            className="flex items-center gap-2"
            animate={{ x: glitchOffsets[i].x }}
            transition={{
              duration: glitchOffsets[i].dur,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.3,
            }}
            style={{ willChange: 'transform' }}
          >
            <div className="w-3 h-3 rounded bg-red-700/40" />
            <div
              className="h-2 rounded bg-red-800/40"
              style={{ width: `${40 + i * 15}%`, opacity }}
            />
            <div className="ml-auto">
              <div className="h-2 w-6 rounded bg-red-500/30" />
            </div>
          </motion.div>
        ))}
      </div>
      {/* Error message bar — glitching */}
      <motion.div
        className="mt-3 px-2 py-1.5 rounded bg-red-500/10 border border-red-500/20 flex items-center gap-2"
        animate={{ x: glitchOffsets[2].x }}
        transition={{ duration: glitchOffsets[2].dur, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        style={{ willChange: 'transform' }}
      >
        <svg className="w-3 h-3 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
        <div className="h-1.5 w-24 rounded bg-red-400/30" />
      </motion.div>
    </div>
  );
}

// ─── After mockup elements (clean, polished + gentle float) ─────────────────
function AfterMockupVisual() {
  return (
    <div className="rounded-xl bg-[#0C0D14] border border-[#2563EB]/20 p-4 shadow-lg shadow-[#2563EB]/5">
      {/* Clean UI header — gentle float */}
      <motion.div
        className="flex items-center gap-2 mb-3"
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        style={{ willChange: 'transform' }}
      >
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <div className="h-2 w-16 rounded bg-white/15" />
        <div className="ml-auto flex gap-1">
          <div className="h-2 w-8 rounded bg-[#2563EB]/30" />
          <div className="h-2 w-6 rounded bg-white/10" />
        </div>
      </motion.div>
      {/* Clean data rows — gentle float with stagger */}
      <div className="space-y-1.5">
        {[
          { w: '65%', accent: true },
          { w: '50%', accent: false },
          { w: '80%', accent: true },
          { w: '40%', accent: false },
        ].map((row, i) => (
          <motion.div
            key={i}
            className="flex items-center gap-2"
            animate={{ y: [0, -3, 0] }}
            transition={{
              duration: 4,
              delay: i * 0.3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{ willChange: 'transform' }}
          >
            <div className="w-3 h-3 rounded bg-[#2563EB]/20" />
            <div
              className="h-2 rounded bg-white/10"
              style={{ width: row.w }}
            />
            <div className="ml-auto">
              <div
                className={`h-2 w-8 rounded ${row.accent ? 'bg-emerald-400/40' : 'bg-white/10'}`}
              />
            </div>
          </motion.div>
        ))}
      </div>
      {/* Success bar — gentle float */}
      <motion.div
        className="mt-3 px-2 py-1.5 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2"
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 4, delay: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        style={{ willChange: 'transform' }}
      >
        <svg className="w-3 h-3 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div className="h-1.5 w-20 rounded bg-emerald-400/30" />
      </motion.div>
    </div>
  );
}

// ─── VS Divider with pulsing + rotating badge ───────────────────────────────
function VSDivider() {
  return (
    <div className="flex md:flex-col items-center justify-center py-6 md:py-0 md:px-4 relative">
      {/* Vertical line (desktop) / horizontal line (mobile) */}
      <motion.div
        className="hidden md:block absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px"
        style={{
          background: 'linear-gradient(to bottom, transparent, rgba(37, 99, 235, 0.2) 30%, rgba(37, 99, 235, 0.2) 70%, transparent)',
        }}
        initial={{ scaleY: 0 }}
        whileInView={{ scaleY: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2 }}
      />
      <motion.div
        className="md:hidden absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px"
        style={{
          background: 'linear-gradient(to right, transparent, rgba(37, 99, 235, 0.2) 30%, rgba(37, 99, 235, 0.2) 70%, transparent)',
        }}
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2 }}
      />

      {/* Pulsing + slowly rotating VS badge */}
      <motion.div
        className="relative z-10 flex items-center justify-center w-12 h-12 rounded-full bg-landing-card-bg border-2 border-[#2563EB]/20 shadow-lg shadow-[#2563EB]/10"
        animate={{
          scale: [1, 1.08, 1],
          rotate: [0, 360],
          boxShadow: [
            '0 4px 6px -1px rgba(37, 99, 235, 0.1)',
            '0 10px 20px -3px rgba(37, 99, 235, 0.25)',
            '0 4px 6px -1px rgba(37, 99, 235, 0.1)',
          ],
        }}
        transition={{
          scale: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
          rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
          boxShadow: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
        }}
        style={{ willChange: 'transform, box-shadow' }}
      >
        <span
          className="text-xs font-bold tracking-wider"
          style={{ color: 'var(--color-accent-primary)' }}
        >
          VS
        </span>
      </motion.div>
    </div>
  );
}

// ─── Scroll-triggered shake wrapper ─────────────────────────────────────────
function ShakeOnView({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <div ref={ref} className={isInView ? 'animate-shake' : ''}>
      {children}
    </div>
  );
}

// ─── Animated gradient border wrapper ───────────────────────────────────────
function AnimatedGradientBorder({
  children,
  colors,
}: {
  children: React.ReactNode;
  colors: string;
}) {
  return (
    <div className="relative rounded-2xl p-[1px] h-full overflow-hidden">
      {/* Rotating gradient border */}
      <motion.div
        className="absolute inset-[-50%] rounded-2xl"
        style={{
          background: `conic-gradient(from 135deg, ${colors})`,
        }}
        animate={{ rotate: [0, 360] }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      {/* Inner content mask */}
      <div className="relative rounded-2xl h-full">
        {children}
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function BeforeAfter() {
  const t = useTranslations('landing');

  const beforeItems = [t('before_1'), t('before_2'), t('before_3'), t('before_4')];
  const afterItems = [t('after_1'), t('after_2'), t('after_3'), t('after_4')];

  return (
    <section className="py-24 md:py-32 px-6">
      <div className="mx-auto max-w-5xl">
        {/* Heading */}
        <ScrollReveal>
          <div className="text-center mb-6">
            <span className="inline-block px-3 py-1 rounded-full bg-[#2563EB]/8 text-[#2563EB] text-xs font-medium mb-4">
              {t('before_after_badge')}
            </span>
          </div>
          <h2
            className="text-[clamp(1.75rem,4vw,2.5rem)] font-bold tracking-tight text-center mb-4"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-landing-text)' }}
          >
            {t('before_after_heading')}
          </h2>
          <p
            className="text-center max-w-lg mx-auto mb-16 text-[15px]"
            style={{ color: 'var(--color-landing-text-muted)' }}
          >
            {t('before_after_subtitle')}
          </p>
        </ScrollReveal>

        {/* Cards + VS Divider layout */}
        <StaggerContainer className="flex flex-col md:flex-row md:items-stretch gap-2 md:gap-0">
          {/* ── Without MegVax ─────────────────────────────────────── */}
          <StaggerItem className="flex-1">
            <ShakeOnView>
              <motion.div
                className="group relative rounded-2xl p-[1px] h-full"
                whileHover={{ scale: 1.01 }}
                transition={SPRING_HOVER}
              >
                {/* Red gradient border — animated rotation */}
                <AnimatedGradientBorder colors="rgba(239,68,68,0.6), rgba(252,165,165,0.4), rgba(239,68,68,0.2), rgba(239,68,68,0.6)">
                  <div className="relative rounded-2xl bg-gradient-to-br from-red-50/90 to-white p-7 sm:p-8 h-full">
                    {/* Top accent bar */}
                    <motion.div
                      className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl bg-gradient-to-r from-red-500 via-red-400 to-rose-400"
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
                      style={{ transformOrigin: 'left' }}
                    />

                    {/* Card header */}
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-11 h-11 rounded-xl bg-red-100 flex items-center justify-center shadow-sm shadow-red-200/50">
                        <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-red-700">{t('before_title')}</span>
                        <p className="text-[10px] text-red-400 mt-0.5">{t('before_subtitle')}</p>
                      </div>
                    </div>

                    {/* Broken mockup visual — with glitch */}
                    <div className="mb-6">
                      <BeforeMockupVisual />
                    </div>

                    {/* Pain items */}
                    <ul className="space-y-3">
                      {beforeItems.map((item, i) => (
                        <motion.li
                          key={i}
                          className="flex items-start gap-3 text-sm text-red-900/70"
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.4 + i * 0.08, duration: 0.4 }}
                        >
                          <svg className="w-4 h-4 text-red-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          {item}
                        </motion.li>
                      ))}
                    </ul>

                    {/* Bottom stats with animated numbers */}
                    <div className="mt-6 pt-4 border-t border-red-200/60">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-xs font-semibold text-red-600">
                            <AnimatedStat text={t('before_time_weekly')} />
                          </span>
                        </div>
                        <span className="text-[10px] text-red-400">&middot;</span>
                        <span className="text-xs font-medium text-red-500">
                          <AnimatedStat text={t('before_cost_waste')} />
                        </span>
                      </div>
                    </div>
                  </div>
                </AnimatedGradientBorder>
              </motion.div>
            </ShakeOnView>
          </StaggerItem>

          {/* ── VS Divider ──────────────────────────────────────────── */}
          <VSDivider />

          {/* ── With MegVax ───────────────────────────────────────── */}
          <StaggerItem className="flex-1">
            <motion.div
              className="group relative rounded-2xl p-[1px] h-full animate-glow-pulse"
              whileHover={{ scale: 1.01 }}
              transition={SPRING_HOVER}
            >
              {/* Blue gradient border — animated rotation */}
              <AnimatedGradientBorder colors="rgba(37,99,235,0.8), rgba(96,165,250,0.5), rgba(139,92,246,0.3), rgba(37,99,235,0.8)">
                <div
                  className="relative rounded-2xl p-7 sm:p-8 h-full"
                  style={{
                    background: 'linear-gradient(to bottom right, color-mix(in srgb, var(--color-accent-primary) 6%, white), white)',
                  }}
                >
                  {/* Top accent bar */}
                  <motion.div
                    className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl"
                    style={{
                      background: 'linear-gradient(to right, var(--color-accent-primary), #60A5FA, #8B5CF6)',
                      transformOrigin: 'left',
                    }}
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
                  />

                  {/* Card header */}
                  <div className="flex items-center gap-3 mb-5">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center shadow-sm"
                      style={{
                        backgroundColor: 'color-mix(in srgb, var(--color-accent-primary) 10%, transparent)',
                        boxShadow: '0 1px 2px color-mix(in srgb, var(--color-accent-primary) 10%, transparent)',
                      }}
                    >
                      <svg className="w-5 h-5" style={{ color: 'var(--color-accent-primary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-sm font-semibold" style={{ color: 'var(--color-accent-primary)' }}>
                        {t('after_title')}
                      </span>
                      <p className="text-[10px] mt-0.5" style={{ color: 'color-mix(in srgb, var(--color-accent-primary) 60%, transparent)' }}>
                        {t('after_subtitle')}
                      </p>
                    </div>
                  </div>

                  {/* Clean mockup visual — with gentle float */}
                  <div className="mb-6">
                    <AfterMockupVisual />
                  </div>

                  {/* Gain items */}
                  <ul className="space-y-3">
                    {afterItems.map((item, i) => (
                      <motion.li
                        key={i}
                        className="flex items-start gap-3 text-sm"
                        style={{ color: 'color-mix(in srgb, var(--color-landing-text) 80%, transparent)' }}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 + i * 0.08, duration: 0.4 }}
                      >
                        <svg className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        {item}
                      </motion.li>
                    ))}
                  </ul>

                  {/* Bottom stats with animated numbers */}
                  <div className="mt-6 pt-4" style={{ borderTop: '1px solid color-mix(in srgb, var(--color-accent-primary) 15%, transparent)' }}>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                        </svg>
                        <span className="text-xs font-semibold text-emerald-600">
                          <AnimatedStat text={t('after_time_weekly')} />
                        </span>
                      </div>
                      <span className="text-[10px]" style={{ color: 'color-mix(in srgb, var(--color-accent-primary) 40%, transparent)' }}>
                        &middot;
                      </span>
                      <span className="text-xs font-medium" style={{ color: 'var(--color-accent-primary)' }}>
                        <AnimatedStat text={t('after_budget_safe')} />
                      </span>
                    </div>
                  </div>
                </div>
              </AnimatedGradientBorder>
            </motion.div>
          </StaggerItem>
        </StaggerContainer>
      </div>
    </section>
  );
}
