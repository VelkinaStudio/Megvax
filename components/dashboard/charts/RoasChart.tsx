'use client';

import { useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import type { DailyMetric } from '@/types/dashboard';

interface RoasChartProps {
  data: DailyMetric[];
  targetRoas?: number;
}

export function RoasChart({ data, targetRoas = 2.0 }: RoasChartProps) {
  const chartData = useMemo(
    () => data.map((d) => ({ name: d.dateLabel, roas: d.roas, date: d.date })),
    [data],
  );

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: '#6B7280' }}
          tickLine={false}
          axisLine={{ stroke: '#E5E7EB' }}
          interval="preserveStartEnd"
        />
        <YAxis
          tickFormatter={(v: number) => `${v.toFixed(1)}x`}
          tick={{ fontSize: 11, fill: '#6B7280' }}
          tickLine={false}
          axisLine={false}
          width={48}
          domain={['auto', 'auto']}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #E5E7EB',
            borderRadius: '12px',
            fontSize: 13,
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          }}
          formatter={(value) => [`${Number(value).toFixed(2)}x`, 'ROAS']}
          labelStyle={{ fontWeight: 600, color: '#111827' }}
        />
        <ReferenceLine
          y={targetRoas}
          stroke="#EF4444"
          strokeDasharray="6 4"
          strokeWidth={1.5}
          label={{
            value: `Hedef ${targetRoas}x`,
            position: 'insideTopRight',
            fill: '#EF4444',
            fontSize: 11,
            fontWeight: 600,
          }}
        />
        <Line
          type="monotone"
          dataKey="roas"
          stroke="#10B981"
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff', fill: '#10B981' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
