'use client';

import React, { useId, useState } from 'react';

export interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  showArea?: boolean;
  strokeWidth?: number;
  className?: string;
  interactive?: boolean;
}

export function Sparkline({
  data,
  width = 80,
  height = 24,
  color = '#4F46E5',
  showArea = true,
  strokeWidth = 2,
  className,
  interactive = true,
}: SparklineProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return { x, y, value };
  });

  const linePath = points.reduce((path, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    return `${path} L ${point.x} ${point.y}`;
  }, '');

  const areaPath = showArea
    ? `${linePath} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`
    : '';

  // Create gradient for area fill
  const gradientId = `sparkline-gradient-${useId()}`;

  return (
    <div className="relative inline-block group">
      <svg
        width={width}
        height={height}
        className={`${className} transition-transform duration-200 ${interactive ? 'group-hover:scale-105' : ''}`}
        style={{ overflow: 'visible' }}
        onMouseLeave={() => setHoveredIndex(null)}
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.05" />
          </linearGradient>
        </defs>
        
        {showArea && (
          <path
            d={areaPath}
            fill={`url(#${gradientId})`}
            stroke="none"
            className="transition-opacity duration-200"
          />
        )}
        
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-all duration-200"
          style={{
            filter: interactive && hoveredIndex !== null ? 'drop-shadow(0 0 4px rgba(79, 70, 229, 0.5))' : 'none'
          }}
        />
        
        {/* Interactive hover points */}
        {interactive && points.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r={hoveredIndex === index ? 4 : 0}
            fill={color}
            className="transition-all duration-150"
            style={{
              filter: hoveredIndex === index ? 'drop-shadow(0 0 6px rgba(79, 70, 229, 0.8))' : 'none'
            }}
          />
        ))}
        
        {/* Invisible hover areas */}
        {interactive && points.map((point, index) => (
          <rect
            key={`hover-${index}`}
            x={point.x - width / (data.length * 2)}
            y={0}
            width={width / (data.length - 1)}
            height={height}
            fill="transparent"
            onMouseEnter={() => setHoveredIndex(index)}
            style={{ cursor: 'pointer' }}
          />
        ))}
      </svg>
      
      {/* Tooltip */}
      {interactive && hoveredIndex !== null && (
        <div 
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded shadow-lg whitespace-nowrap z-10 animate-fadeIn"
          style={{
            left: `${(hoveredIndex / (data.length - 1)) * 100}%`
          }}
        >
          {points[hoveredIndex].value.toFixed(2)}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900" />
        </div>
      )}
    </div>
  );
}

// Sparkline with tooltip and value
export interface SparklineMetricProps {
  data: number[];
  value: number;
  format: 'currency' | 'percentage' | 'number';
  label?: string;
  trend?: number;
  className?: string;
}

function formatValue(value: number, format: string): string {
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    case 'percentage':
      return `%${value.toFixed(2)}`;
    default:
      return new Intl.NumberFormat('tr-TR').format(value);
  }
}

export function SparklineMetric({
  data,
  value,
  format,
  label,
  trend,
  className,
}: SparklineMetricProps) {
  const trendColor = trend && trend > 0 ? '#10B981' : trend && trend < 0 ? '#EF4444' : '#6B7280';
  const formattedValue = formatValue(value, format);
  const formattedTrend = trend ? `${trend > 0 ? '+' : ''}${trend.toFixed(1)}%` : null;

  return (
    <div className={`${className} group`}>
      <div className="flex items-baseline gap-2">
        <span className="text-base font-semibold text-gray-900 tabular-nums group-hover:text-blue-600 transition-colors">
          {formattedValue}
        </span>
        {formattedTrend && (
          <span
            className="text-sm font-medium transition-all duration-200"
            style={{ color: trendColor }}
          >
            {formattedTrend}
          </span>
        )}
      </div>
      {label && (
        <p className="text-xs text-gray-600 mt-0.5 font-medium">{label}</p>
      )}
      <div className="mt-2">
        <Sparkline 
          data={data} 
          color={trendColor} 
          height={32} 
          width={120} 
          showArea 
          interactive
        />
      </div>
    </div>
  );
}
