'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useEffect, useRef } from 'react';

interface GlowingOrbProps {
  size?: number;
  color?: string;
  glowColor?: string;
  className?: string;
  intensity?: number;
  pulseSpeed?: number;
}

export function GlowingOrb({
  size = 400,
  color = '#4F46E5',
  glowColor = '#7C3AED',
  className = '',
  intensity = 30,
  pulseSpeed = 4,
}: GlowingOrbProps) {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 100, damping: 30 };
  const x = useSpring(useTransform(mouseX, [-500, 500], [-intensity, intensity]), springConfig);
  const y = useSpring(useTransform(mouseY, [-500, 500], [-intensity, intensity]), springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      mouseX.set(e.clientX - centerX);
      mouseY.set(e.clientY - centerY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      ref={ref}
      className={`relative ${className}`}
      style={{ x, y, width: size, height: size }}
    >
      {/* Outer glow */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, ${glowColor}40 0%, transparent 70%)`,
          filter: 'blur(60px)',
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: pulseSpeed,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      {/* Inner orb */}
      <motion.div
        className="absolute inset-[15%] rounded-full"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${color}80, ${glowColor}60, transparent)`,
          boxShadow: `
            inset 0 0 60px ${color}40,
            0 0 80px ${glowColor}30,
            0 0 120px ${color}20
          `,
        }}
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: pulseSpeed * 0.8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Highlight */}
      <div
        className="absolute top-[20%] left-[25%] w-[20%] h-[15%] rounded-full"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.4), transparent)',
          filter: 'blur(8px)',
        }}
      />
    </motion.div>
  );
}
