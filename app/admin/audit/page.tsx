'use client';

import { useState } from 'react';
import { Search, FileText, User, Calendar, Filter } from 'lucide-react';
import { useTranslations } from '@/lib/i18n';

interface AuditLog {
  id: string;
  action: string;
  userName: string;
  userEmail: string;
  entityType: string;
  entityId: string;
  details: string;
  timestamp: string;
  ipAddress: string;
}

const mockAuditLogs: AuditLog[] = [
  { id: '1', action: 'Campaign Create', userName: 'Ahmet Yilmaz', userEmail: 'ahmet@firma.com', entityType: 'Campaign', entityId: 'camp_123', details: 'New campaign created: "Summer Sale"', timestamp: '2024-03-15 14:32:15', ipAddress: '192.168.1.1' },
  { id: '2', action: 'User Login', userName: 'Mehmet Kaya', userEmail: 'mehmet@tekno.com', entityType: 'User', entityId: 'user_456', details: 'Successful login', timestamp: '2024-03-15 13:45:22', ipAddress: '192.168.1.2' },
  { id: '3', action: 'Subscription Update', userName: 'Ayse Demir', userEmail: 'ayse@dijital.com', entityType: 'Subscription', entityId: 'sub_789', details: 'Plan upgrade: Starter → Pro', timestamp: '2024-03-15 12:18:45', ipAddress: '192.168.1.3' },
  { id: '4', action: 'Invoice Payment', userName: 'Fatma Sahin', userEmail: 'fatma@reklam.com', entityType: 'Invoice', entityId: 'inv_321', details: 'Invoice payment successful: ₺1.999', timestamp: '2024-03-15 11:05:33', ipAddress: '192.168.1.4' },
  { id: '5', action: 'Campaign Pause', userName: 'Ali Yildiz', userEmail: 'ali@pazarlama.com', entityType: 'Campaign', entityId: 'camp_567', details: 'Campaign paused: "Winter Campaign"', timestamp: '2024-03-15 10:22:18', ipAddress: '192.168.1.5' },
];

export default function AdminAuditPage() {
  const t = useTranslations('admin');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const filteredLogs = mockAuditLogs.filter(log => {
    const matchesSearch = log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.details.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  const uniqueActions = Array.from(new Set(mockAuditLogs.map(log => log.action)));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('audit_title')}</h1>
          <p className="text-gray-600 mt-1">{t('audit_desc')}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={t('search_messages')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">{t('users_all_statuses')}</option>
          {uniqueActions.map(action => (
            <option key={action} value={action}>{action}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">{t('audit_col_action')}</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">{t('audit_col_user')}</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">{t('audit_col_details')}</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">{t('audit_col_date')}</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">{t('audit_col_ip')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <span className="inline-flex px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                    {log.action}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-gray-900">{log.userName}</p>
                    <p className="text-sm text-gray-500">{log.userEmail}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700 max-w-md">{log.details}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{log.timestamp}</td>
                <td className="px-6 py-4 text-sm text-gray-500 font-mono">{log.ipAddress}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
