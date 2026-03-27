'use client';

import { useState } from 'react';
import {
  BarChart3,
  Users,
  CreditCard,
  Receipt,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  ArrowUpRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// --- Mock Data ---

const revenueData = [
  { month: 'Nis 25', revenue: 142000 },
  { month: 'May 25', revenue: 158000 },
  { month: 'Haz 25', revenue: 175000 },
  { month: 'Tem 25', revenue: 168000 },
  { month: 'Ağu 25', revenue: 192000 },
  { month: 'Eyl 25', revenue: 205000 },
  { month: 'Eki 25', revenue: 218000 },
  { month: 'Kas 25', revenue: 235000 },
  { month: 'Ara 25', revenue: 248000 },
  { month: 'Oca 26', revenue: 256000 },
  { month: 'Şub 26', revenue: 271000 },
  { month: 'Mar 26', revenue: 285000 },
];

const recentSignups = [
  { name: 'Ahmet Yılmaz', email: 'ahmet@modastore.com', plan: 'Pro', date: '27 Mar 2026' },
  { name: 'Zeynep Kaya', email: 'zeynep@techshop.com', plan: 'Business', date: '26 Mar 2026' },
  { name: 'Mehmet Demir', email: 'mehmet@gidatoptanci.com', plan: 'Starter', date: '26 Mar 2026' },
  { name: 'Ayşe Çelik', email: 'ayse@beautybrand.com', plan: 'Pro', date: '25 Mar 2026' },
  { name: 'Emre Aksoy', email: 'emre@spormerkezi.com', plan: 'Pro', date: '25 Mar 2026' },
  { name: 'Fatma Özkan', email: 'fatma@mobilyaevi.com', plan: 'Starter', date: '24 Mar 2026' },
  { name: 'Can Yıldırım', email: 'can@dijitalajans.com', plan: 'Business', date: '24 Mar 2026' },
  { name: 'Elif Arslan', email: 'elif@kozmetikshop.com', plan: 'Pro', date: '23 Mar 2026' },
  { name: 'Burak Şahin', email: 'burak@otomotivplus.com', plan: 'Starter', date: '23 Mar 2026' },
  { name: 'Selin Koç', email: 'selin@modaatelier.com', plan: 'Pro', date: '22 Mar 2026' },
];

const recentMeetings = [
  { name: 'Ahmet Yılmaz', company: 'Moda Store', date: '28 Mar 2026, 10:00', status: 'pending' as const },
  { name: 'Zeynep Kaya', company: 'TechShop', date: '28 Mar 2026, 14:00', status: 'confirmed' as const },
  { name: 'Can Yıldırım', company: 'Dijital Ajans', date: '27 Mar 2026, 11:00', status: 'completed' as const },
  { name: 'Elif Arslan', company: 'Kozmetik Shop', date: '26 Mar 2026, 15:30', status: 'completed' as const },
  { name: 'Mehmet Demir', company: 'Gıda Toptancı', date: '25 Mar 2026, 09:00', status: 'cancelled' as const },
];

const meetingStatusColors = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  completed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
};

const planColors: Record<string, string> = {
  Starter: 'bg-gray-100 text-gray-700',
  Pro: 'bg-blue-100 text-blue-700',
  Business: 'bg-purple-100 text-purple-700',
};

// --- Components ---

interface KpiCardProps {
  label: string;
  value: string;
  change: number;
  changeLabel: string;
  icon: React.ElementType;
}

function KpiCard({ label, value, change, changeLabel, icon: Icon }: KpiCardProps) {
  const isPositive = change >= 0;
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2 tracking-tight">{value}</p>
          <div className="flex items-center gap-1.5 mt-3">
            {isPositive ? (
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
            <span className={`text-sm font-semibold ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
              {isPositive ? '+' : ''}{change}%
            </span>
            <span className="text-xs text-gray-400">{changeLabel}</span>
          </div>
        </div>
        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
      </div>
    </div>
  );
}

function formatCurrency(value: number) {
  return `₺${(value / 1000).toFixed(0)}K`;
}

// Custom tooltip for recharts
function RevenueTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-lg">
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <p className="text-sm font-bold text-gray-900">₺{payload[0].value.toLocaleString('tr-TR')}</p>
      </div>
    );
  }
  return null;
}

export default function AdminOverviewPage() {
  const [dateRange, setDateRange] = useState('30');

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full text-blue-600 text-xs font-semibold uppercase tracking-wider mb-3 border border-blue-100">
            <BarChart3 className="w-3.5 h-3.5" />
            System Report
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Overview</h1>
          <p className="text-gray-500 mt-1">Platform metrics and financial overview</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last 1 year</option>
          </select>
          <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
          label="Total Users"
          value="247"
          change={12.5}
          changeLabel="vs last month"
          icon={Users}
        />
        <KpiCard
          label="Active Subscriptions"
          value="183"
          change={8.2}
          changeLabel="vs last month"
          icon={CreditCard}
        />
        <KpiCard
          label="MRR"
          value="₺285K"
          change={15.3}
          changeLabel="vs last month"
          icon={BarChart3}
        />
        <KpiCard
          label="Meetings This Week"
          value="12"
          change={-5.1}
          changeLabel="vs last week"
          icon={Calendar}
        />
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
            <p className="text-sm text-gray-500 mt-0.5">Monthly recurring revenue over the last 12 months</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-gray-400 uppercase tracking-wider bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
            <Calendar className="w-3.5 h-3.5" />
            Last 12 months
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} tickLine={false} axisLine={false} tickFormatter={formatCurrency} />
              <Tooltip content={<RevenueTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#2563EB"
                strokeWidth={2.5}
                fill="url(#colorRevenue)"
                dot={false}
                activeDot={{ r: 5, fill: '#2563EB', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Signups */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Recent Signups</h3>
            <a href="/admin/users" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">User</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Plan</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentSignups.map((user, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-sm font-semibold flex-shrink-0">
                          {user.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex px-2.5 py-0.5 text-xs font-semibold rounded-full ${planColors[user.plan]}`}>
                        {user.plan}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-500 whitespace-nowrap">{user.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Meetings */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Recent Meetings</h3>
            <a href="/admin/meetings" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Contact</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Date</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentMeetings.map((meeting, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-3">
                      <p className="text-sm font-medium text-gray-900">{meeting.name}</p>
                      <p className="text-xs text-gray-500">{meeting.company}</p>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-500 whitespace-nowrap">{meeting.date}</td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex px-2.5 py-0.5 text-xs font-semibold rounded-full capitalize ${meetingStatusColors[meeting.status]}`}>
                        {meeting.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
