'use client';

import { motion, useInView } from 'framer-motion';
import { ReactNode, useRef } from 'react';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  index?: number;
  gradient?: string;
  className?: string;
  children?: ReactNode;
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  index = 0,
  gradient = 'from-blue-500 to-purple-500',
  className = '',
  children,
}: FeatureCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.div
      ref={ref}
      className={`group relative ${className}`}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ delay: index * 0.1, duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
    >
      {/* Card */}
      <div className="relative h-full p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:bg-white/10 hover:border-white/20">
        {/* Gradient glow on hover */}
        <div
          className={`absolute -inset-px rounded-2xl bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-xl`}
        />

        {/* Icon */}
        <div
          className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-5`}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>

        {/* Content */}
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400 leading-relaxed text-sm">{description}</p>

        {/* Optional children for custom content */}
        {children && <div className="mt-6">{children}</div>}

      </div>
    </motion.div>
  );
}

interface BentoCardProps {
  title: string;
  description?: string;
  className?: string;
  children?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  gradient?: string;
  index?: number;
}

export function BentoCard({
  title,
  description,
  className = '',
  children,
  size = 'md',
  gradient = 'from-blue-500 to-purple-500',
  index = 0,
}: BentoCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  const sizeClasses = {
    sm: 'p-6',
    md: 'p-8',
    lg: 'p-10',
  };

  return (
    <motion.div
      ref={ref}
      className={`group relative rounded-3xl bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/[0.08] backdrop-blur-sm overflow-hidden ${sizeClasses[size]} ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
    >
      {/* Shine effect */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
        style={{
          background:
            'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.05) 45%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 55%, transparent 60%)',
          backgroundSize: '200% 100%',
        }}
        animate={{
          backgroundPosition: ['200% 0', '-200% 0'],
        }}
        transition={{
          duration: 1.5,
          ease: 'linear',
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        {description && <p className="text-sm text-gray-400 mb-4">{description}</p>}
        {children}
      </div>

      {/* Corner gradient */}
      <div
        className={`absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-gradient-to-r ${gradient} opacity-10 blur-3xl`}
      />
    </motion.div>
  );
}
