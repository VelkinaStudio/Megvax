'use client';

import { useState } from 'react';
import { Search, CreditCard, Calendar, MoreHorizontal, CheckCircle, XCircle } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface Subscription {
  id: string;
  userName: string;
  userEmail: string;
  plan: string;
  status: 'active' | 'paused' | 'archived';
  price: string;
  nextBilling: string;
  startDate: string;
}

const mockSubscriptions: Subscription[] = [
  { id: '1', userName: 'Ahmet Yilmaz', userEmail: 'ahmet@firma.com', plan: 'Pro', status: 'active', price: '₺1.999', nextBilling: '2024-04-15', startDate: '2024-01-15' },
  { id: '2', userName: 'Mehmet Kaya', userEmail: 'mehmet@tekno.com', plan: 'Business', status: 'active', price: '₺4.999', nextBilling: '2024-04-20', startDate: '2024-02-20' },
  { id: '3', userName: 'Ayse Demir', userEmail: 'ayse@dijital.com', plan: 'Starter', status: 'paused', price: '₺499', nextBilling: '-', startDate: '2024-03-10' },
  { id: '4', userName: 'Fatma Sahin', userEmail: 'fatma@reklam.com', plan: 'Pro', status: 'archived', price: '₺1.999', nextBilling: '-', startDate: '2023-12-05' },
];

export default function AdminSubscriptionsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSubscriptions = mockSubscriptions.filter(sub =>
    sub.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.userEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscriptions</h1>
          <p className="text-gray-600 mt-1">Manage all active and inactive subscriptions</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search subscriptions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">User</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Plan</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Price</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Next Billing</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredSubscriptions.map((sub) => (
              <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-gray-900">{sub.userName}</p>
                    <p className="text-sm text-gray-500">{sub.userEmail}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                    {sub.plan}
                  </span>
                </td>
                <td className="px-6 py-4 font-medium text-gray-900">{sub.price}<span className="text-gray-500 text-sm">/ay</span></td>
                <td className="px-6 py-4"><StatusBadge status={sub.status} size="sm" /></td>
                <td className="px-6 py-4 text-sm text-gray-500">{sub.nextBilling}</td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <MoreHorizontal className="w-5 h-5 text-gray-400" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
