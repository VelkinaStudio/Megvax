'use client';

import { useState } from 'react';
import { Search, Filter, MoreHorizontal, Mail, Building, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useTranslations } from '@/lib/i18n';

interface User {
  id: string;
  name: string;
  email: string;
  company: string;
  plan: string;
  status: 'active' | 'paused' | 'archived' | 'learning' | 'error' | 'pending';
  joinedAt: string;
  lastActive: string;
}

const mockUsers: User[] = [
  { id: '1', name: 'Ahmet Yilmaz', email: 'ahmet@firma.com', company: 'Firma Inc.', plan: 'Pro', status: 'active', joinedAt: '2024-01-15', lastActive: '2h ago' },
  { id: '2', name: 'Mehmet Kaya', email: 'mehmet@tekno.com', company: 'Tekno Ltd.', plan: 'Business', status: 'active', joinedAt: '2024-02-20', lastActive: '5m ago' },
  { id: '3', name: 'Ayse Demir', email: 'ayse@dijital.com', company: 'Digital Agency', plan: 'Starter', status: 'learning', joinedAt: '2024-03-10', lastActive: '-' },
  { id: '4', name: 'Fatma Sahin', email: 'fatma@reklam.com', company: 'Ad Group', plan: 'Pro', status: 'paused', joinedAt: '2023-12-05', lastActive: '2w ago' },
  { id: '5', name: 'Ali Yildiz', email: 'ali@pazarlama.com', company: 'Marketing Inc.', plan: 'Business', status: 'active', joinedAt: '2024-01-28', lastActive: '1d ago' },
];

export default function AdminUsersPage() {
  const t = useTranslations('admin');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'pending'>('all');

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('user_management_title')}</h1>
          <p className="text-gray-600 mt-1">{t('user_management_desc')}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={t('search_users_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">{t('users_all_statuses')}</option>
          <option value="active">{t('users_active')}</option>
          <option value="inactive">{t('users_inactive')}</option>
          <option value="pending">{t('users_pending')}</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">{t('audit_col_user')}</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">{t('meetings_topic')}</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Plan</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">{t('meetings_status')}</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">{t('recent_activity')}</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">{t('actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Building className="w-4 h-4 text-gray-400" />
                    {user.company}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                    {user.plan}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={user.status} size="sm" />
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{user.lastActive}</td>
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
