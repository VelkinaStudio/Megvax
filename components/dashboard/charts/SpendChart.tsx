'use client';

import { useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import type { DailyMetric } from '@/lib/mock-chart-data';

interface SpendChartProps {
  data: DailyMetric[];
}

function formatCurrency(value: number): string {
  if (value >= 1000) return `₺${(value / 1000).toFixed(1)}K`;
  return `₺${value}`;
}

export function SpendChart({ data }: SpendChartProps) {
  const chartData = useMemo(
    () => data.map((d) => ({ name: d.dateLabel, spend: d.spend, date: d.date })),
    [data],
  );

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: '#6B7280' }}
          tickLine={false}
          axisLine={{ stroke: '#E5E7EB' }}
          interval="preserveStartEnd"
        />
        <YAxis
          tickFormatter={formatCurrency}
          tick={{ fontSize: 11, fill: '#6B7280' }}
          tickLine={false}
          axisLine={false}
          width={52}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #E5E7EB',
            borderRadius: '12px',
            fontSize: 13,
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          }}
          formatter={(value) => [`₺${Number(value).toLocaleString('tr-TR')}`, 'Harcama']}
          labelStyle={{ fontWeight: 600, color: '#111827' }}
        />
        <Area
          type="monotone"
          dataKey="spend"
          stroke="#3B82F6"
          strokeWidth={2.5}
          fill="url(#spendGradient)"
          dot={false}
          activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
