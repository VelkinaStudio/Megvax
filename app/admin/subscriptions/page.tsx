'use client';

import { useState } from 'react';
import { Search, CreditCard, MoreHorizontal } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';

// --- Types ---

interface Subscription {
  id: string;
  userName: string;
  userEmail: string;
  plan: 'Starter' | 'Pro' | 'Business';
  status: 'Active' | 'Paused' | 'Cancelled';
  amount: string;
  startDate: string;
  nextBilling: string;
}

// --- Mock Data ---

const mockSubscriptions: Subscription[] = [
  { id: '1', userName: 'Ahmet Yılmaz', userEmail: 'ahmet@modastore.com', plan: 'Pro', status: 'Active', amount: '₺1.990', startDate: '2025-09-15', nextBilling: '2026-04-15' },
  { id: '2', userName: 'Zeynep Kaya', userEmail: 'zeynep@techshop.com', plan: 'Business', status: 'Active', amount: '₺4.990', startDate: '2025-10-02', nextBilling: '2026-04-02' },
  { id: '3', userName: 'Emre Aksoy', userEmail: 'emre@spormerkezi.com', plan: 'Pro', status: 'Active', amount: '₺1.990', startDate: '2025-11-05', nextBilling: '2026-04-05' },
  { id: '4', userName: 'Ayşe Çelik', userEmail: 'ayse@beautybrand.com', plan: 'Pro', status: 'Active', amount: '₺1.990', startDate: '2025-08-12', nextBilling: '2026-04-12' },
  { id: '5', userName: 'Can Yıldırım', userEmail: 'can@dijitalajans.com', plan: 'Business', status: 'Active', amount: '₺4.990', startDate: '2025-07-22', nextBilling: '2026-04-22' },
  { id: '6', userName: 'Elif Arslan', userEmail: 'elif@kozmetikshop.com', plan: 'Pro', status: 'Paused', amount: '₺1.990', startDate: '2025-12-01', nextBilling: '—' },
  { id: '7', userName: 'Selin Koç', userEmail: 'selin@modaatelier.com', plan: 'Pro', status: 'Active', amount: '₺1.990', startDate: '2025-10-28', nextBilling: '2026-04-28' },
  { id: '8', userName: 'Oğuz Tan', userEmail: 'oguz@elektronikmarket.com', plan: 'Business', status: 'Active', amount: '₺4.990', startDate: '2025-05-10', nextBilling: '2026-04-10' },
  { id: '9', userName: 'Hakan Polat', userEmail: 'hakan@insaatmalzeme.com', plan: 'Pro', status: 'Active', amount: '₺1.990', startDate: '2026-01-08', nextBilling: '2026-04-08' },
  { id: '10', userName: 'Tolga Kara', userEmail: 'tolga@petshopworld.com', plan: 'Starter', status: 'Cancelled', amount: '₺790', startDate: '2025-11-15', nextBilling: '—' },
];

const planDistribution = [
  { name: 'Starter', value: 40, fill: '#9CA3AF' },
  { name: 'Pro', value: 45, fill: '#2563EB' },
  { name: 'Business', value: 15, fill: '#7C3AED' },
];

const PIE_COLORS = ['#9CA3AF', '#2563EB', '#7C3AED'];

const planColors: Record<string, string> = {
  Starter: 'bg-gray-100 text-gray-700',
  Pro: 'bg-blue-100 text-blue-700',
  Business: 'bg-purple-100 text-purple-700',
};

const statusColors: Record<string, string> = {
  Active: 'bg-emerald-100 text-emerald-700',
  Paused: 'bg-amber-100 text-amber-700',
  Cancelled: 'bg-red-100 text-red-700',
};

export default function AdminSubscriptionsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSubscriptions = mockSubscriptions.filter(sub =>
    sub.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.plan.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateStr: string) => {
    if (dateStr === '—') return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const activeCount = mockSubscriptions.filter(s => s.status === 'Active').length;
  const pausedCount = mockSubscriptions.filter(s => s.status === 'Paused').length;
  const cancelledCount = mockSubscriptions.filter(s => s.status === 'Cancelled').length;

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Subscriptions</h1>
        <p className="text-gray-500 mt-1">Manage active and inactive subscriptions</p>
      </div>

      {/* Summary + Chart Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stats Cards */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Subscriptions</p>
            <p className="text-3xl font-bold text-emerald-600 mt-1">{activeCount}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Paused</p>
            <p className="text-3xl font-bold text-amber-600 mt-1">{pausedCount}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Cancelled</p>
            <p className="text-3xl font-bold text-red-600 mt-1">{cancelledCount}</p>
          </div>
        </div>

        {/* Plan Distribution Chart */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Plan Distribution</h3>
          <p className="text-sm text-gray-500 mb-4">Active subscriptions by plan type</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={planDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={2}
                  stroke="#fff"
                >
                  {planDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-lg">
                          <p className="text-sm font-semibold text-gray-900">{payload[0].name}</p>
                          <p className="text-sm text-gray-500">{payload[0].value}%</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value: string) => (
                    <span className="text-sm text-gray-600">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search subscriptions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/70">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">User</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Plan</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Started</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Next Billing</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Amount</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Status</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredSubscriptions.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-sm font-semibold flex-shrink-0">
                        {sub.userName.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{sub.userName}</p>
                        <p className="text-xs text-gray-500 truncate">{sub.userEmail}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-0.5 text-xs font-semibold rounded-full ${planColors[sub.plan]}`}>
                      {sub.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{formatDate(sub.startDate)}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{formatDate(sub.nextBilling)}</td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-gray-900">{sub.amount}</span>
                    <span className="text-xs text-gray-400">/ay</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full ${statusColors[sub.status]}`}>
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                      <MoreHorizontal className="w-4 h-4 text-gray-400" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredSubscriptions.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <CreditCard className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-500">No subscriptions found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
