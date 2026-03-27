'use client';

import { useState, useMemo } from 'react';
import {
  Search,
  Shield,
  LogIn,
  LogOut,
  UserPlus,
  Settings,
  CreditCard,
  Trash2,
  Eye,
  Pencil,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

// --- Types ---

interface AuditEntry {
  id: string;
  timestamp: string;
  userName: string;
  userEmail: string;
  action: string;
  actionType: 'login' | 'logout' | 'signup' | 'settings' | 'plan_change' | 'delete' | 'view' | 'edit';
  details: string;
  ip: string;
}

// --- Mock Data ---

const mockAuditLogs: AuditEntry[] = [
  { id: '1', timestamp: '2026-03-27 14:45:12', userName: 'Admin', userEmail: 'admin@megvax.com', action: 'Admin Login', actionType: 'login', details: 'Successful admin panel login', ip: '85.105.22.134' },
  { id: '2', timestamp: '2026-03-27 14:30:00', userName: 'Ahmet Yılmaz', userEmail: 'ahmet@modastore.com', action: 'Plan Change', actionType: 'plan_change', details: 'Upgraded from Starter to Pro plan', ip: '176.234.45.89' },
  { id: '3', timestamp: '2026-03-27 13:15:33', userName: 'Zeynep Kaya', userEmail: 'zeynep@techshop.com', action: 'Login', actionType: 'login', details: 'User login from Chrome/Windows', ip: '94.55.112.67' },
  { id: '4', timestamp: '2026-03-27 12:00:00', userName: 'Gizem Erbaş', userEmail: 'gizem@yogastudio.com', action: 'Signup', actionType: 'signup', details: 'New user registration - Trial plan', ip: '78.172.88.210' },
  { id: '5', timestamp: '2026-03-27 11:22:45', userName: 'Admin', userEmail: 'admin@megvax.com', action: 'Settings Update', actionType: 'settings', details: 'Updated email notification preferences', ip: '85.105.22.134' },
  { id: '6', timestamp: '2026-03-27 10:05:18', userName: 'Can Yıldırım', userEmail: 'can@dijitalajans.com', action: 'Login', actionType: 'login', details: 'User login from Safari/macOS', ip: '31.145.200.45' },
  { id: '7', timestamp: '2026-03-26 18:30:00', userName: 'Elif Arslan', userEmail: 'elif@kozmetikshop.com', action: 'Plan Change', actionType: 'plan_change', details: 'Subscription paused by user', ip: '88.232.55.178' },
  { id: '8', timestamp: '2026-03-26 16:45:22', userName: 'Admin', userEmail: 'admin@megvax.com', action: 'User Edit', actionType: 'edit', details: 'Updated user profile for Elif Arslan', ip: '85.105.22.134' },
  { id: '9', timestamp: '2026-03-26 15:10:00', userName: 'Emre Aksoy', userEmail: 'emre@spormerkezi.com', action: 'Logout', actionType: 'logout', details: 'User session ended', ip: '176.88.34.112' },
  { id: '10', timestamp: '2026-03-26 14:00:33', userName: 'Mehmet Demir', userEmail: 'mehmet@gidatoptanci.com', action: 'Login', actionType: 'login', details: 'User login from Firefox/Linux', ip: '95.70.145.23' },
  { id: '11', timestamp: '2026-03-26 11:30:00', userName: 'Admin', userEmail: 'admin@megvax.com', action: 'Settings Update', actionType: 'settings', details: 'Enabled maintenance mode for 30 minutes', ip: '85.105.22.134' },
  { id: '12', timestamp: '2026-03-26 10:15:45', userName: 'Selin Koç', userEmail: 'selin@modaatelier.com', action: 'Login', actionType: 'login', details: 'User login from Chrome/Android', ip: '212.175.89.56' },
  { id: '13', timestamp: '2026-03-25 17:22:10', userName: 'Admin', userEmail: 'admin@megvax.com', action: 'User Delete', actionType: 'delete', details: 'Deleted inactive user account: test@test.com', ip: '85.105.22.134' },
  { id: '14', timestamp: '2026-03-25 15:00:00', userName: 'Oğuz Tan', userEmail: 'oguz@elektronikmarket.com', action: 'Plan Change', actionType: 'plan_change', details: 'Renewed Business plan subscription', ip: '46.196.78.234' },
  { id: '15', timestamp: '2026-03-25 13:45:30', userName: 'Hakan Polat', userEmail: 'hakan@insaatmalzeme.com', action: 'Login', actionType: 'login', details: 'User login from Edge/Windows', ip: '81.214.56.89' },
  { id: '16', timestamp: '2026-03-25 12:00:00', userName: 'Burak Şahin', userEmail: 'burak@otomotivplus.com', action: 'Signup', actionType: 'signup', details: 'New user registration - Trial plan', ip: '176.42.111.55' },
  { id: '17', timestamp: '2026-03-25 10:30:15', userName: 'Admin', userEmail: 'admin@megvax.com', action: 'View Report', actionType: 'view', details: 'Viewed monthly revenue report', ip: '85.105.22.134' },
  { id: '18', timestamp: '2026-03-24 16:15:00', userName: 'Fatma Özkan', userEmail: 'fatma@mobilyaevi.com', action: 'Login', actionType: 'login', details: 'Failed login attempt (wrong password)', ip: '78.180.45.123' },
  { id: '19', timestamp: '2026-03-24 14:00:22', userName: 'Admin', userEmail: 'admin@megvax.com', action: 'Settings Update', actionType: 'settings', details: 'Updated API keys for Meta integration', ip: '85.105.22.134' },
  { id: '20', timestamp: '2026-03-24 11:30:00', userName: 'Tolga Kara', userEmail: 'tolga@petshopworld.com', action: 'Plan Change', actionType: 'plan_change', details: 'Cancelled Starter plan subscription', ip: '195.174.67.89' },
];

const actionTypeConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  login: { icon: LogIn, color: 'text-blue-600', bg: 'bg-blue-100' },
  logout: { icon: LogOut, color: 'text-gray-600', bg: 'bg-gray-100' },
  signup: { icon: UserPlus, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  settings: { icon: Settings, color: 'text-purple-600', bg: 'bg-purple-100' },
  plan_change: { icon: CreditCard, color: 'text-amber-600', bg: 'bg-amber-100' },
  delete: { icon: Trash2, color: 'text-red-600', bg: 'bg-red-100' },
  view: { icon: Eye, color: 'text-cyan-600', bg: 'bg-cyan-100' },
  edit: { icon: Pencil, color: 'text-indigo-600', bg: 'bg-indigo-100' },
};

const PAGE_SIZE = 10;

export default function AdminAuditPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const uniqueActionTypes = useMemo(() => {
    return Array.from(new Set(mockAuditLogs.map(log => log.actionType)));
  }, []);

  const filteredLogs = useMemo(() => {
    return mockAuditLogs.filter(log => {
      const matchesSearch = !searchQuery ||
        log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.details.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesAction = actionFilter === 'all' || log.actionType === actionFilter;
      return matchesSearch && matchesAction;
    });
  }, [searchQuery, actionFilter]);

  const totalPages = Math.ceil(filteredLogs.length / PAGE_SIZE);
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const formatTimestamp = (ts: string) => {
    const d = new Date(ts.replace(' ', 'T'));
    const date = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    return { date, time };
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Audit Log</h1>
        <p className="text-gray-500 mt-1">Track all system activities, logins, and configuration changes</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by user, action, or details..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
          />
        </div>
        <select
          value={actionFilter}
          onChange={(e) => { setActionFilter(e.target.value); setCurrentPage(1); }}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="all">All Actions</option>
          {uniqueActionTypes.map(type => (
            <option key={type} value={type}>
              {type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </option>
          ))}
        </select>
      </div>

      {/* Log count */}
      <p className="text-sm text-gray-500">{filteredLogs.length} log entries</p>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/70">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Timestamp</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">User</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Action</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3 hidden md:table-cell">Details</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3 hidden lg:table-cell">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedLogs.map((log) => {
                const config = actionTypeConfig[log.actionType];
                const Icon = config.icon;
                const { date, time } = formatTimestamp(log.timestamp);
                return (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-3.5">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{date}</p>
                        <p className="text-xs text-gray-400 font-mono">{time}</p>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${
                          log.userName === 'Admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {log.userName.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{log.userName}</p>
                          <p className="text-xs text-gray-400 truncate">{log.userEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${config.bg}`}>
                          <Icon className={`w-3.5 h-3.5 ${config.color}`} />
                        </div>
                        <span className="text-sm font-medium text-gray-700">{log.action}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 hidden md:table-cell">
                      <p className="text-sm text-gray-500 max-w-xs truncate">{log.details}</p>
                    </td>
                    <td className="px-6 py-3.5 hidden lg:table-cell">
                      <span className="text-sm text-gray-400 font-mono">{log.ip}</span>
                    </td>
                  </tr>
                );
              })}
              {paginatedLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <Shield className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-500">No audit logs found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/30">
            <p className="text-sm text-gray-500">
              Showing {(currentPage - 1) * PAGE_SIZE + 1}-{Math.min(currentPage * PAGE_SIZE, filteredLogs.length)} of {filteredLogs.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                    page === currentPage
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
