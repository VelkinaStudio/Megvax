'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ReactNode, useRef, useEffect } from 'react';

interface FloatingElementProps {
  children: ReactNode;
  className?: string;
  intensity?: number;
  rotationIntensity?: number;
  floatAmplitude?: number;
  floatDuration?: number;
  delay?: number;
}

export function FloatingElement({
  children,
  className = '',
  intensity = 20,
  rotationIntensity = 5,
  floatAmplitude = 10,
  floatDuration = 6,
  delay = 0,
}: FloatingElementProps) {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 150, damping: 20 };
  const x = useSpring(useTransform(mouseX, [-500, 500], [-intensity, intensity]), springConfig);
  const y = useSpring(useTransform(mouseY, [-500, 500], [-intensity, intensity]), springConfig);
  const rotateX = useSpring(useTransform(mouseY, [-500, 500], [rotationIntensity, -rotationIntensity]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-500, 500], [-rotationIntensity, rotationIntensity]), springConfig);

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
      className={className}
      style={{
        x,
        y,
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        perspective: 1000,
      }}
      animate={{
        y: [0, -floatAmplitude, 0],
      }}
      transition={{
        y: {
          duration: floatDuration,
          repeat: Infinity,
          ease: 'easeInOut',
          delay,
        },
      }}
    >
      {children}
    </motion.div>
  );
}
