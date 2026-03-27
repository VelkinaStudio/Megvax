'use client';

import Image from 'next/image';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { useTranslations } from '@/lib/i18n';
import { ScrollReveal } from './ScrollReveal';

export function DashboardPreview() {
  const t = useTranslations('landing');
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [2, -2]), {
    stiffness: 150,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-2, 2]), {
    stiffness: 150,
    damping: 20,
  });

  function handleMouseMove(e: React.MouseEvent) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  // Use translated caption with fallback
  const captionKey = 'dashboard_preview_caption';
  const caption = t(captionKey);
  const displayCaption = caption.includes(captionKey)
    ? 'Ger\u00E7ek panel. Ger\u00E7ek veri.'
    : caption;

  return (
    <section className="py-16 md:py-20 px-6 bg-[#FAFAF8]">
      <div className="mx-auto max-w-5xl">
        <ScrollReveal>
          <motion.div
            ref={ref}
            style={{ rotateX, rotateY, transformPerspective: 1200 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <div className="relative group">
              {/* Hover glow */}
              <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-[#2563EB]/20 via-[#2563EB]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-sm" />

              <div className="relative rounded-2xl overflow-hidden bg-[#0a0b10] shadow-2xl shadow-black/30 border border-white/[0.06]">
                {/* Browser chrome */}
                <div className="flex items-center gap-2 px-4 py-2.5 bg-[#0e0f15] border-b border-white/[0.04]">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="px-3 py-0.5 rounded bg-white/[0.04] text-white/25 text-[10px] font-mono flex items-center gap-1.5">
                      <svg className="w-2.5 h-2.5 text-emerald-500/60" viewBox="0 0 12 12" fill="currentColor">
                        <path d="M6 0a6 6 0 100 12A6 6 0 006 0zm2.8 4.85L5.6 8.05a.5.5 0 01-.7 0L3.2 6.37a.5.5 0 11.7-.7l1.35 1.34L8.1 4.15a.5.5 0 01.7.7z" />
                      </svg>
                      app.megvax.com/dashboard
                    </div>
                  </div>
                </div>

                {/* Dashboard screenshot */}
                <Image
                  src="/images/dashboard-screenshot.png"
                  alt="MegVax Dashboard"
                  width={1920}
                  height={1080}
                  className="w-full h-auto"
                  priority={false}
                />
              </div>
            </div>

            {/* Ambient glow beneath */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[70%] h-[80px] bg-[#2563EB]/6 rounded-full blur-3xl pointer-events-none" />
          </motion.div>

          {/* Caption */}
          <p className="text-center mt-6 text-sm text-[#71717A] font-medium">
            {displayCaption}
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
