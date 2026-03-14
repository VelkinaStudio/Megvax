'use client';

import { useMemo, useState } from 'react';
import type { InsightsBreakdownKey, InsightsSingleResponse } from '@/types/dashboard';
import { Card } from '@/components/ui';

function formatCurrencyTRY(value: number) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2 }).format(value);
}

function formatPercent(value: number) {
  return `${formatNumber(value)}%`;
}

export function InsightsView({ insights }: { insights: InsightsSingleResponse }) {
  const [breakdownKey, setBreakdownKey] = useState<InsightsBreakdownKey>('placement');

  const breakdownRows = useMemo(() => insights.breakdowns[breakdownKey] ?? [], [insights, breakdownKey]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Card padding="md" className="p-3">
          <p className="text-xs font-semibold text-gray-500 uppercase">Spend</p>
          <p className="font-mono font-semibold text-sm mt-1 text-gray-900">{formatCurrencyTRY(insights.summary.spend)}</p>
        </Card>
        <Card padding="md" className="p-3">
          <p className="text-xs font-semibold text-gray-500 uppercase">ROAS</p>
          <p className="font-mono font-semibold text-sm mt-1 text-blue-600">{formatNumber(insights.summary.roas)}</p>
        </Card>
        <Card padding="md" className="p-3">
          <p className="text-xs font-semibold text-gray-500 uppercase">Conversions</p>
          <p className="font-mono font-semibold text-sm mt-1 text-gray-900">{formatNumber(insights.summary.conversions)}</p>
        </Card>
        <Card padding="md" className="p-3">
          <p className="text-xs font-semibold text-gray-500 uppercase">CTR</p>
          <p className="font-mono font-semibold text-sm mt-1 text-gray-900">{formatPercent(insights.summary.ctr)}</p>
        </Card>
        <Card padding="md" className="p-3">
          <p className="text-xs font-semibold text-gray-500 uppercase">CPC</p>
          <p className="font-mono font-semibold text-sm mt-1 text-gray-900">{formatCurrencyTRY(insights.summary.cpc)}</p>
        </Card>
        <Card padding="md" className="p-3">
          <p className="text-xs font-semibold text-gray-500 uppercase">CPM</p>
          <p className="font-mono font-semibold text-sm mt-1 text-gray-900">{formatCurrencyTRY(insights.summary.cpm)}</p>
        </Card>
      </div>

      <Card padding="none" className="overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <p className="text-sm font-semibold text-gray-900">Trend (Last 7 Days)</p>
          <p className="text-xs text-gray-500 mt-0.5">Table view is used instead of charts in this version.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-600 bg-gray-50 border-b border-gray-200">
                <th className="p-3 font-medium text-xs uppercase tracking-wider">Date</th>
                <th className="p-3 font-medium text-xs uppercase tracking-wider text-right">Spend</th>
                <th className="p-3 font-medium text-xs uppercase tracking-wider text-right">ROAS</th>
                <th className="p-3 font-medium text-xs uppercase tracking-wider text-right">Conversions</th>
                <th className="p-3 font-medium text-xs uppercase tracking-wider text-right">CTR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {insights.timeseries.map((p) => (
                <tr key={p.date} className="hover:bg-gray-50 transition-colors">
                  <td className="p-3 font-mono text-xs text-gray-500">{p.date}</td>
                  <td className="p-3 text-right font-mono text-xs text-gray-600">{formatCurrencyTRY(p.spend)}</td>
                  <td className="p-3 text-right font-mono text-xs font-semibold text-blue-600">{formatNumber(p.roas)}</td>
                  <td className="p-3 text-right font-mono text-xs text-gray-600">{formatNumber(p.conversions)}</td>
                  <td className="p-3 text-right font-mono text-xs text-gray-600">{formatPercent(p.ctr)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card padding="none" className="overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-gray-900">Breakdown</p>
            <p className="text-xs text-gray-500 mt-0.5">Simple breakdown. More breakdowns in P2.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setBreakdownKey('placement')}
              className={`px-3 py-2 text-xs font-medium rounded-md transition-colors ${breakdownKey === 'placement' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
            >
              Placement
            </button>
            <button
              type="button"
              onClick={() => setBreakdownKey('age')}
              className={`px-3 py-2 text-xs font-medium rounded-md transition-colors ${breakdownKey === 'age' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
            >
              Age
            </button>
            <button
              type="button"
              onClick={() => setBreakdownKey('gender')}
              className={`px-3 py-2 text-xs font-medium rounded-md transition-colors ${breakdownKey === 'gender' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
            >
              Gender
            </button>
            <button
              type="button"
              onClick={() => setBreakdownKey('device')}
              className={`px-3 py-2 text-xs font-medium rounded-md transition-colors ${breakdownKey === 'device' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
            >
              Device
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-600 bg-gray-50 border-b border-gray-200">
                <th className="p-3 font-medium text-xs uppercase tracking-wider">Breakdown</th>
                <th className="p-3 font-medium text-xs uppercase tracking-wider text-right">Spend</th>
                <th className="p-3 font-medium text-xs uppercase tracking-wider text-right">ROAS</th>
                <th className="p-3 font-medium text-xs uppercase tracking-wider text-right">Conversions</th>
                <th className="p-3 font-medium text-xs uppercase tracking-wider text-right">CTR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {breakdownRows.map((r) => (
                <tr key={r.key} className="hover:bg-gray-50 transition-colors">
                  <td className="p-3 text-sm font-semibold text-gray-900">{r.label}</td>
                  <td className="p-3 text-right font-mono text-xs text-gray-600">{formatCurrencyTRY(r.spend)}</td>
                  <td className="p-3 text-right font-mono text-xs font-semibold text-blue-600">{formatNumber(r.roas)}</td>
                  <td className="p-3 text-right font-mono text-xs text-gray-600">{formatNumber(r.conversions)}</td>
                  <td className="p-3 text-right font-mono text-xs text-gray-600">{formatPercent(r.ctr)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
