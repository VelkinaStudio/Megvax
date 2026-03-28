'use client';

import {
  TrendingUp,
  ArrowRight,
  Globe,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// --- Mock Data ---

const trafficData = Array.from({ length: 30 }, (_, i) => {
  const date = new Date(2026, 2, i + 1); // March 2026
  const dayStr = `${date.getDate()} Mar`;
  const base = 800 + Math.floor(Math.random() * 400);
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
  return {
    date: dayStr,
    pageviews: isWeekend ? Math.floor(base * 0.6) : base,
    uniqueVisitors: isWeekend ? Math.floor(base * 0.4) : Math.floor(base * 0.65),
  };
});

const topPages = [
  { path: '/', title: 'Homepage', views: 12450, unique: 8320, bounce: '42%' },
  { path: '/pricing', title: 'Pricing', views: 8230, unique: 6180, bounce: '28%' },
  { path: '/features', title: 'Features', views: 5120, unique: 3940, bounce: '35%' },
  { path: '/login', title: 'Login', views: 4890, unique: 4100, bounce: '15%' },
  { path: '/about', title: 'About', views: 3210, unique: 2540, bounce: '51%' },
  { path: '/blog', title: 'Blog', views: 2780, unique: 2100, bounce: '55%' },
  { path: '/contact', title: 'Contact', views: 1950, unique: 1620, bounce: '38%' },
  { path: '/signup', title: 'Signup', views: 1840, unique: 1680, bounce: '12%' },
];

const funnelSteps = [
  { stage: 'Visitors', count: 8320, pct: 100 },
  { stage: 'Signups', count: 1680, pct: 20.2 },
  { stage: 'Trial Started', count: 892, pct: 10.7 },
  { stage: 'Paid Conversion', count: 247, pct: 3.0 },
];

const userGrowthData = [
  { month: 'Eki 25', users: 68 },
  { month: 'Kas 25', users: 102 },
  { month: 'Ara 25', users: 138 },
  { month: 'Oca 26', users: 172 },
  { month: 'Şub 26', users: 215 },
  { month: 'Mar 26', users: 247 },
];

// --- Component ---

function TrafficTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-lg">
        <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-sm text-gray-600">{entry.name}:</span>
            <span className="text-sm font-semibold text-gray-900">{entry.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

function GrowthTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-lg">
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <p className="text-sm font-bold text-gray-900">{payload[0].value} users</p>
      </div>
    );
  }
  return null;
}

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 mt-1">Website traffic, conversion metrics, and user growth</p>
      </div>

      {/* Traffic Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Website Traffic</h3>
            <p className="text-sm text-gray-500 mt-0.5">Daily pageviews and unique visitors — March 2026</p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 rounded bg-blue-500" />
              <span className="text-gray-500">Pageviews</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 rounded bg-emerald-500" />
              <span className="text-gray-500">Unique Visitors</span>
            </div>
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trafficData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#9CA3AF' }}
                tickLine={false}
                axisLine={false}
                interval={4}
              />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
              <Tooltip content={<TrafficTooltip />} />
              <Line
                type="monotone"
                dataKey="pageviews"
                name="Pageviews"
                stroke="#2563EB"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#2563EB', stroke: '#fff', strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="uniqueVisitors"
                name="Unique Visitors"
                stroke="#10B981"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#10B981', stroke: '#fff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Column: Top Pages + Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Top Pages</h3>
            <p className="text-sm text-gray-500 mt-0.5">Most visited pages this month</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/70">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-2.5">Page</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-2.5">Views</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-2.5 hidden sm:table-cell">Unique</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-2.5 hidden sm:table-cell">Bounce</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {topPages.map((page) => (
                  <tr key={page.path} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <Globe className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{page.title}</p>
                          <p className="text-xs text-gray-400 font-mono">{page.path}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-right text-sm font-semibold text-gray-900">{page.views.toLocaleString()}</td>
                    <td className="px-6 py-3 text-right text-sm text-gray-500 hidden sm:table-cell">{page.unique.toLocaleString()}</td>
                    <td className="px-6 py-3 text-right text-sm text-gray-500 hidden sm:table-cell">{page.bounce}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">Conversion Funnel</h3>
          <p className="text-sm text-gray-500 mt-0.5 mb-6">Visitor to paid customer journey</p>
          <div className="space-y-4">
            {funnelSteps.map((step, idx) => (
              <div key={step.stage}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    {idx > 0 && <ArrowRight className="w-3 h-3 text-gray-300" />}
                    <span className="text-sm font-medium text-gray-900">{step.stage}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-gray-900">{step.count.toLocaleString()}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      idx === 0 ? 'bg-blue-100 text-blue-700' :
                      idx === funnelSteps.length - 1 ? 'bg-emerald-100 text-emerald-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {step.pct}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-700 ${
                      idx === 0 ? 'bg-blue-500' :
                      idx === 1 ? 'bg-blue-400' :
                      idx === 2 ? 'bg-blue-300' :
                      'bg-emerald-500'
                    }`}
                    style={{ width: `${step.pct}%` }}
                  />
                </div>
                {idx < funnelSteps.length - 1 && (
                  <p className="text-xs text-gray-400 mt-1">
                    {((funnelSteps[idx + 1].count / step.count) * 100).toFixed(1)}% conversion to next step
                  </p>
                )}
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Overall conversion rate</span>
              <span className="text-lg font-bold text-emerald-600">3.0%</span>
            </div>
          </div>
        </div>
      </div>

      {/* User Growth Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">User Growth</h3>
            <p className="text-sm text-gray-500 mt-0.5">Total registered users over the last 6 months</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-emerald-600 font-semibold bg-emerald-50 px-3 py-1.5 rounded-lg">
            <TrendingUp className="w-4 h-4" />
            +263% growth
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={userGrowthData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
              <Tooltip content={<GrowthTooltip />} />
              <Bar
                dataKey="users"
                fill="#2563EB"
                radius={[6, 6, 0, 0]}
                maxBarSize={48}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
