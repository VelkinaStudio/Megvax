'use client';

import { motion, useInView, useSpring, useTransform } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

interface CounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
  decimals?: number;
}

export function Counter({
  value,
  suffix = '',
  prefix = '',
  duration = 2,
  className = '',
  decimals = 0,
}: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [displayValue, setDisplayValue] = useState(0);

  const springValue = useSpring(0, {
    stiffness: 50,
    damping: 30,
    duration: duration * 1000,
  });

  useEffect(() => {
    if (isInView) {
      springValue.set(value);
    }
  }, [isInView, value, springValue]);

  useEffect(() => {
    const unsubscribe = springValue.on('change', (latest) => {
      setDisplayValue(Number(latest.toFixed(decimals)));
    });
    return unsubscribe;
  }, [springValue, decimals]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  );
}

interface StatCardProps {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  gradient?: string;
  index?: number;
}

export function StatCard({
  value,
  suffix = '',
  prefix = '',
  label,
  description,
  icon,
  gradient = 'from-blue-500 to-purple-500',
  index = 0,
}: StatCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      className="relative group"
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <div className="relative p-8 rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm overflow-hidden hover:bg-white/[0.06] transition-colors duration-300">
        {/* Icon */}
        {icon && (
          <div
            className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-6`}
          >
            {icon}
          </div>
        )}

        {/* Value */}
        <div className="mb-2">
          <span className={`text-5xl font-black bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
            <Counter value={value} suffix={suffix} prefix={prefix} />
          </span>
        </div>

        {/* Label */}
        <div className="text-lg font-semibold text-white mb-1">{label}</div>
        {description && <div className="text-sm text-gray-400">{description}</div>}

        {/* Decorative */}
        <div
          className={`absolute -bottom-16 -right-16 w-32 h-32 rounded-full bg-gradient-to-r ${gradient} opacity-10 blur-3xl group-hover:opacity-20 transition-opacity duration-500`}
        />
      </div>
    </motion.div>
  );
}
