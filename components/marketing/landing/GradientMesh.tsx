'use client';

import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useEffect, useRef } from 'react';

export function GradientMesh() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Mouse parallax: orbs shift opposite to mouse direction (2-3% of offset)
  const parallaxX = useTransform(mouseX, (v) => -v * 0.025);
  const parallaxY = useTransform(mouseY, (v) => -v * 0.025);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function handleMouseMove(e: MouseEvent) {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      mouseX.set(e.clientX - centerX);
      mouseY.set(e.clientY - centerY);
    }

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none"
    >
      <motion.div
        className="absolute inset-0"
        style={{ x: parallaxX, y: parallaxY }}
      >
        {/* 1. Large blue blob — top-right, figure-8 drift (20s) */}
        <motion.div
          className="absolute -top-[15%] -right-[8%] w-[500px] h-[500px] rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(37,99,235,0.12) 0%, rgba(37,99,235,0.04) 35%, transparent 70%)',
            filter: 'blur(120px)',
            mixBlendMode: 'screen',
          }}
          animate={{
            x: [0, 60, 0, -60, 0],
            y: [0, -40, 0, 40, 0],
            scale: [1, 1.06, 1, 0.96, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* 2. Violet blob — left, circular orbit (25s) */}
        <motion.div
          className="absolute top-[25%] -left-[12%] w-[400px] h-[400px] rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(124,58,237,0.10) 0%, rgba(124,58,237,0.03) 35%, transparent 70%)',
            filter: 'blur(120px)',
            mixBlendMode: 'screen',
          }}
          animate={{
            x: [0, 40, 0, -40, 0],
            y: [0, -35, 0, 35, 0],
            scale: [1, 1.04, 0.96, 1.02, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* 3. Cyan accent — bottom-center, horizontal oscillation (18s) */}
        <motion.div
          className="absolute -bottom-[8%] left-[30%] w-[300px] h-[300px] rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(6,182,212,0.08) 0%, rgba(6,182,212,0.02) 35%, transparent 70%)',
            filter: 'blur(130px)',
            mixBlendMode: 'screen',
          }}
          animate={{
            x: [0, 80, -80, 0],
            scale: [1, 1.08, 0.95, 1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* 4. Warm pink blob — center-right, fast drift (12s) */}
        <motion.div
          className="absolute top-[40%] right-[15%] w-[200px] h-[200px] rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(236,72,153,0.08) 0%, rgba(236,72,153,0.02) 35%, transparent 70%)',
            filter: 'blur(100px)',
            mixBlendMode: 'screen',
          }}
          animate={{
            x: [0, -30, 40, -20, 0],
            y: [0, 25, -15, 30, 0],
            scale: [1, 1.1, 0.92, 1.05, 1],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* 5. Deep indigo — top-left, slow breathing scale (15s) */}
        <motion.div
          className="absolute top-[5%] left-[8%] w-[350px] h-[350px] rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(67,56,202,0.08) 0%, rgba(67,56,202,0.02) 35%, transparent 70%)',
            filter: 'blur(120px)',
            mixBlendMode: 'screen',
          }}
          animate={{
            scale: [1, 1.15, 0.9, 1.08, 1],
            opacity: [0.8, 1, 0.7, 0.9, 0.8],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>

      {/* Subtle dot grid overlay — 2% opacity */}
      <div
        className="absolute inset-[-50px] opacity-[0.02]"
        style={{
          backgroundImage: 'radial-gradient(circle, #1a1a1a 0.5px, transparent 0.5px)',
          backgroundSize: '20px 20px',
        }}
      />

      {/* Top fade so nav area stays clean */}
      <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-[var(--color-landing-bg)] to-transparent" />
    </div>
  );
}
