'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface StatItem {
  id: string;
  label: string;
  value: string | number;
  formattedValue: string;
  change?: number;
  changeLabel?: string;
  prefix?: string;
  suffix?: string;
}

interface StatsSummaryBarProps {
  stats: StatItem[];
  expandable?: boolean;
  className?: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- expandable reserved for collapsible bar feature
export function StatsSummaryBar({ stats, expandable = false, className = '' }: StatsSummaryBarProps) {
  return (
    <div className={`relative overflow-hidden rounded-2xl ${className}`}>
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 opacity-95" />
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/10 via-transparent to-blue-600/5" />
      
      {/* Content */}
      <div className="relative">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px bg-slate-700/20">
          {stats.map((stat) => (
            <div
              key={stat.id}
              className="group relative bg-slate-900/40 backdrop-blur-xl px-5 py-4 hover:bg-slate-800/60 transition-all duration-300 cursor-pointer"
            >
              {/* Hover glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/10 group-hover:to-blue-500/10 transition-all duration-300 rounded-lg" />
              
              <div className="relative">
                <p className="text-xs text-slate-400 font-semibold mb-2 uppercase tracking-wider">{stat.label}</p>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-2xl font-bold text-white tabular-nums group-hover:text-blue-300 transition-colors">
                    {stat.prefix}{stat.formattedValue}{stat.suffix}
                  </span>
                </div>
                {stat.change !== undefined && (
                  <div className="flex items-center gap-1.5">
                    <span className={`flex items-center text-xs font-bold px-2 py-0.5 rounded-full ${
                      stat.change > 0 
                        ? 'text-emerald-300 bg-emerald-500/20' 
                        : stat.change < 0 
                        ? 'text-red-300 bg-red-500/20' 
                        : 'text-slate-400 bg-slate-500/20'
                    }`}>
                      {stat.change > 0 ? (
                        <TrendingUp className="w-3 h-3 mr-0.5" />
                      ) : stat.change < 0 ? (
                        <TrendingDown className="w-3 h-3 mr-0.5" />
                      ) : (
                        <Minus className="w-3 h-3 mr-0.5" />
                      )}
                      {stat.change > 0 ? '+' : ''}{stat.change}%
                    </span>
                  </div>
                )}
                {stat.changeLabel && (
                  <p className="text-xs text-slate-500 mt-1">{stat.changeLabel}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface CompactStatProps {
  label: string;
  value: string;
  change?: number;
  size?: 'sm' | 'md';
}

export function CompactStat({ label, value, change, size = 'md' }: CompactStatProps) {
  return (
    <div className={`${size === 'sm' ? 'px-3 py-2' : 'px-4 py-3'}`}>
      <p className={`text-gray-500 font-medium ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>{label}</p>
      <div className="flex items-baseline gap-2 mt-0.5">
        <span className={`font-bold text-gray-900 ${size === 'sm' ? 'text-base' : 'text-xl'}`}>
          {value}
        </span>
        {change !== undefined && (
          <span className={`flex items-center font-medium ${
            change > 0 ? 'text-emerald-600' : change < 0 ? 'text-red-600' : 'text-gray-400'
          } ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
            {change > 0 ? (
              <TrendingUp className="w-3 h-3 mr-0.5" />
            ) : change < 0 ? (
              <TrendingDown className="w-3 h-3 mr-0.5" />
            ) : null}
            {change > 0 ? '+' : ''}{change}%
          </span>
        )}
      </div>
    </div>
  );
}

export default StatsSummaryBar;
