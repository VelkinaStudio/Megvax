'use client';

import { motion } from 'framer-motion';

export function GradientMesh() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Primary blue orb — top right */}
      <motion.div
        className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(37,99,235,0.12) 0%, rgba(37,99,235,0.04) 40%, transparent 70%)',
          filter: 'blur(60px)',
        }}
        animate={{
          x: [0, 30, -20, 0],
          y: [0, -25, 15, 0],
          scale: [1, 1.05, 0.97, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Secondary violet orb — left */}
      <motion.div
        className="absolute top-[30%] -left-[15%] w-[500px] h-[500px] rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(124,58,237,0.08) 0%, rgba(124,58,237,0.02) 40%, transparent 70%)',
          filter: 'blur(60px)',
        }}
        animate={{
          x: [0, -20, 25, 0],
          y: [0, 30, -15, 0],
          scale: [1, 0.95, 1.06, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Accent cyan orb — bottom center */}
      <motion.div
        className="absolute -bottom-[10%] left-[30%] w-[400px] h-[400px] rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(6,182,212,0.06) 0%, rgba(6,182,212,0.02) 40%, transparent 70%)',
          filter: 'blur(50px)',
        }}
        animate={{
          x: [0, 25, -15, 0],
          y: [0, -20, 10, 0],
          scale: [1, 1.08, 0.96, 1],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Fine dot grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
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
