'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';

interface MotionGraphProps {
  data?: number[];
  height?: number;
  className?: string;
  color?: string;
  gradientFrom?: string;
  gradientTo?: string;
  showDots?: boolean;
  animated?: boolean;
  label?: string;
  value?: string;
  change?: string;
  changePositive?: boolean;
}

export function MotionGraph({
  data = [30, 45, 35, 60, 50, 75, 65, 85, 70, 95],
  height = 120,
  className = '',
  color = '#4F46E5',
  gradientFrom = '#4F46E5',
  gradientTo = '#7C3AED',
  showDots = true,
  animated = true,
  label,
  value,
  change,
  changePositive = true,
}: MotionGraphProps) {
  const ref = useRef<SVGSVGElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const [pathLength, setPathLength] = useState(0);

  const width = 300;
  const padding = 10;
  const graphWidth = width - padding * 2;
  const graphHeight = height - padding * 2;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => ({
    x: padding + (index / (data.length - 1)) * graphWidth,
    y: padding + graphHeight - ((value - min) / range) * graphHeight,
  }));

  const pathD = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${padding} ${height - padding} Z`;

  const gradientId = `gradient-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`relative ${className}`}>
      {(label || value) && (
        <div className="flex items-center justify-between mb-4">
          {label && (
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              {label}
            </span>
          )}
          {value && (
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white">{value}</span>
              {change && (
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    changePositive
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {changePositive ? '+' : ''}{change}
                </span>
              )}
            </div>
          )}
        </div>
      )}
      
      <svg
        ref={ref}
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto"
        style={{ height }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={gradientFrom} stopOpacity="0.3" />
            <stop offset="100%" stopColor={gradientTo} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Area fill */}
        <motion.path
          d={areaD}
          fill={`url(#${gradientId})`}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        />

        {/* Line */}
        <motion.path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={isInView ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />

        {/* Dots */}
        {showDots &&
          points.map((point, index) => (
            <motion.circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="4"
              fill={color}
              initial={{ scale: 0, opacity: 0 }}
              animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
              transition={{ delay: 0.1 * index + 0.5, duration: 0.3 }}
              className="drop-shadow-lg"
            />
          ))}

        {/* Glow effect on last dot */}
        {showDots && points.length > 0 && (
          <motion.circle
            cx={points[points.length - 1].x}
            cy={points[points.length - 1].y}
            r="8"
            fill={color}
            initial={{ scale: 0, opacity: 0 }}
            animate={
              isInView
                ? { scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }
                : { scale: 0, opacity: 0 }
            }
            transition={{
              delay: 1.5,
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}
      </svg>
    </div>
  );
}

interface BarGraphProps {
  data?: { label: string; value: number; color?: string }[];
  height?: number;
  className?: string;
  showLabels?: boolean;
}

export function BarGraph({
  data = [
    { label: 'Mon', value: 65 },
    { label: 'Tue', value: 80 },
    { label: 'Wed', value: 45 },
    { label: 'Thu', value: 90 },
    { label: 'Fri', value: 70 },
    { label: 'Sat', value: 85 },
    { label: 'Sun', value: 95 },
  ],
  height = 150,
  className = '',
  showLabels = true,
}: BarGraphProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  const max = Math.max(...data.map((d) => d.value));

  return (
    <div ref={ref} className={`flex items-end gap-2 ${className}`} style={{ height }}>
      {data.map((item, index) => (
        <div key={index} className="flex-1 flex flex-col items-center gap-2">
          <motion.div
            className="w-full rounded-t-lg relative overflow-hidden"
            style={{
              background: item.color || 'linear-gradient(to top, #4F46E5, #7C3AED)',
            }}
            initial={{ height: 0 }}
            animate={isInView ? { height: `${(item.value / max) * (height - 30)}px` } : { height: 0 }}
            transition={{ delay: index * 0.1, duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
          >
            <motion.div
              className="absolute inset-0 bg-white/20"
              initial={{ y: '100%' }}
              animate={isInView ? { y: '-100%' } : { y: '100%' }}
              transition={{ delay: index * 0.1 + 0.3, duration: 0.6 }}
            />
          </motion.div>
          {showLabels && (
            <span className="text-[10px] text-gray-500 font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </div>
  );
}
