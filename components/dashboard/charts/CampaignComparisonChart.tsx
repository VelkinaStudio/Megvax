'use client';

import { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import type { CampaignMetric } from '@/lib/mock-chart-data';

interface CampaignComparisonChartProps {
  data: CampaignMetric[];
}

type MetricKey = 'spend' | 'roas';

const COLORS = ['#3B82F6', '#6366F1', '#8B5CF6', '#A78BFA', '#C4B5FD'];

function formatCurrency(value: number): string {
  if (value >= 1000) return `₺${(value / 1000).toFixed(1)}K`;
  return `₺${value}`;
}

export function CampaignComparisonChart({ data }: CampaignComparisonChartProps) {
  const [metric, setMetric] = useState<MetricKey>('spend');

  const chartData = useMemo(
    () =>
      data.map((c) => ({
        name: c.name.length > 22 ? `${c.name.slice(0, 20)}...` : c.name,
        fullName: c.name,
        value: metric === 'spend' ? c.spend : c.roas,
      })),
    [data, metric],
  );

  const formatValue = metric === 'spend'
    ? (v: number) => `₺${v.toLocaleString('tr-TR')}`
    : (v: number) => `${v.toFixed(2)}x`;

  const tooltipLabel = metric === 'spend' ? 'Harcama' : 'ROAS';

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <button
          type="button"
          onClick={() => setMetric('spend')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            metric === 'spend'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Harcama
        </button>
        <button
          type="button"
          onClick={() => setMetric('roas')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            metric === 'roas'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          ROAS
        </button>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 4, right: 16, left: 4, bottom: 4 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
          <XAxis
            type="number"
            tickFormatter={metric === 'spend' ? formatCurrency : (v: number) => `${v}x`}
            tick={{ fontSize: 11, fill: '#6B7280' }}
            tickLine={false}
            axisLine={{ stroke: '#E5E7EB' }}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 11, fill: '#374151' }}
            tickLine={false}
            axisLine={false}
            width={140}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
              fontSize: 13,
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            }}
            formatter={(value) => [formatValue(Number(value)), tooltipLabel]}
            labelFormatter={(_, payload) => {
              const item = payload?.[0]?.payload;
              return item?.fullName ?? '';
            }}
          />
          <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={28}>
            {chartData.map((_, idx) => (
              <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
