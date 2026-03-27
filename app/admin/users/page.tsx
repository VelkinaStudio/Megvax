'use client';

import { useState, useMemo } from 'react';
import {
  Search,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  UserX,
  Pencil,
  Building,
} from 'lucide-react';

// --- Types ---

interface User {
  id: string;
  name: string;
  email: string;
  company: string;
  plan: 'Starter' | 'Pro' | 'Business';
  status: 'Active' | 'Inactive' | 'Trial';
  joinedAt: string;
  lastLogin: string;
}

// --- Mock Data ---

const mockUsers: User[] = [
  { id: '1', name: 'Ahmet Yılmaz', email: 'ahmet@modastore.com', company: 'Moda Store', plan: 'Pro', status: 'Active', joinedAt: '2025-09-15', lastLogin: '2026-03-27' },
  { id: '2', name: 'Zeynep Kaya', email: 'zeynep@techshop.com', company: 'TechShop', plan: 'Business', status: 'Active', joinedAt: '2025-10-02', lastLogin: '2026-03-27' },
  { id: '3', name: 'Mehmet Demir', email: 'mehmet@gidatoptanci.com', company: 'Gıda Toptancı', plan: 'Starter', status: 'Trial', joinedAt: '2026-03-20', lastLogin: '2026-03-26' },
  { id: '4', name: 'Ayşe Çelik', email: 'ayse@beautybrand.com', company: 'BeautyBrand', plan: 'Pro', status: 'Active', joinedAt: '2025-08-12', lastLogin: '2026-03-25' },
  { id: '5', name: 'Emre Aksoy', email: 'emre@spormerkezi.com', company: 'Spor Merkezi', plan: 'Pro', status: 'Active', joinedAt: '2025-11-05', lastLogin: '2026-03-27' },
  { id: '6', name: 'Fatma Özkan', email: 'fatma@mobilyaevi.com', company: 'Mobilya Evi', plan: 'Starter', status: 'Inactive', joinedAt: '2025-06-18', lastLogin: '2026-01-15' },
  { id: '7', name: 'Can Yıldırım', email: 'can@dijitalajans.com', company: 'Dijital Ajans', plan: 'Business', status: 'Active', joinedAt: '2025-07-22', lastLogin: '2026-03-27' },
  { id: '8', name: 'Elif Arslan', email: 'elif@kozmetikshop.com', company: 'Kozmetik Shop', plan: 'Pro', status: 'Active', joinedAt: '2025-12-01', lastLogin: '2026-03-26' },
  { id: '9', name: 'Burak Şahin', email: 'burak@otomotivplus.com', company: 'Otomotiv Plus', plan: 'Starter', status: 'Trial', joinedAt: '2026-03-15', lastLogin: '2026-03-24' },
  { id: '10', name: 'Selin Koç', email: 'selin@modaatelier.com', company: 'Moda Atelier', plan: 'Pro', status: 'Active', joinedAt: '2025-10-28', lastLogin: '2026-03-27' },
  { id: '11', name: 'Oğuz Tan', email: 'oguz@elektronikmarket.com', company: 'Elektronik Market', plan: 'Business', status: 'Active', joinedAt: '2025-05-10', lastLogin: '2026-03-26' },
  { id: '12', name: 'Derya Aydın', email: 'derya@cicekonline.com', company: 'Çiçek Online', plan: 'Starter', status: 'Inactive', joinedAt: '2025-09-03', lastLogin: '2025-12-20' },
  { id: '13', name: 'Hakan Polat', email: 'hakan@insaatmalzeme.com', company: 'İnşaat Malzeme', plan: 'Pro', status: 'Active', joinedAt: '2026-01-08', lastLogin: '2026-03-27' },
  { id: '14', name: 'Gizem Erbaş', email: 'gizem@yogastudio.com', company: 'Yoga Studio', plan: 'Starter', status: 'Trial', joinedAt: '2026-03-22', lastLogin: '2026-03-27' },
  { id: '15', name: 'Tolga Kara', email: 'tolga@petshopworld.com', company: 'PetShop World', plan: 'Pro', status: 'Active', joinedAt: '2025-11-15', lastLogin: '2026-03-25' },
];

const planColors: Record<string, string> = {
  Starter: 'bg-gray-100 text-gray-700',
  Pro: 'bg-blue-100 text-blue-700',
  Business: 'bg-purple-100 text-purple-700',
};

const statusColors: Record<string, string> = {
  Active: 'bg-emerald-100 text-emerald-700',
  Inactive: 'bg-gray-100 text-gray-600',
  Trial: 'bg-amber-100 text-amber-700',
};

const PAGE_SIZE = 8;

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [openAction, setOpenAction] = useState<string | null>(null);

  const filteredUsers = useMemo(() => {
    return mockUsers.filter(user => {
      const matchesSearch = !searchQuery ||
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.company.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPlan = planFilter === 'all' || user.plan === planFilter;
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
      return matchesSearch && matchesPlan && matchesStatus;
    });
  }, [searchQuery, planFilter, statusFilter]);

  const totalPages = Math.ceil(filteredUsers.length / PAGE_SIZE);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Users</h1>
        <p className="text-gray-500 mt-1">Manage all registered users and their subscriptions</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or company..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
          />
        </div>
        <select
          value={planFilter}
          onChange={(e) => { setPlanFilter(e.target.value); setCurrentPage(1); }}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="all">All Plans</option>
          <option value="Starter">Starter</option>
          <option value="Pro">Pro</option>
          <option value="Business">Business</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="all">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Trial">Trial</option>
        </select>
      </div>

      {/* Summary */}
      <div className="flex items-center gap-4 text-sm text-gray-500">
        <span>{filteredUsers.length} users found</span>
        <span className="text-gray-300">|</span>
        <span className="text-emerald-600 font-medium">{mockUsers.filter(u => u.status === 'Active').length} active</span>
        <span className="text-amber-600 font-medium">{mockUsers.filter(u => u.status === 'Trial').length} trial</span>
        <span className="text-gray-400 font-medium">{mockUsers.filter(u => u.status === 'Inactive').length} inactive</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/70">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">User</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3 hidden md:table-cell">Company</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Plan</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3 hidden lg:table-cell">Joined</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3 hidden lg:table-cell">Last Login</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-sm font-semibold flex-shrink-0">
                        {user.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                      <Building className="w-3.5 h-3.5 text-gray-400" />
                      {user.company}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-0.5 text-xs font-semibold rounded-full ${planColors[user.plan]}`}>
                      {user.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full ${statusColors[user.status]}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        user.status === 'Active' ? 'bg-emerald-500' :
                        user.status === 'Trial' ? 'bg-amber-500' : 'bg-gray-400'
                      }`} />
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 hidden lg:table-cell whitespace-nowrap">
                    {formatDate(user.joinedAt)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 hidden lg:table-cell whitespace-nowrap">
                    {formatDate(user.lastLogin)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="relative">
                      <button
                        onClick={() => setOpenAction(openAction === user.id ? null : user.id)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <MoreHorizontal className="w-4 h-4 text-gray-400" />
                      </button>
                      {openAction === user.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setOpenAction(null)} />
                          <div className="absolute right-0 top-8 z-20 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-36">
                            <button
                              onClick={() => setOpenAction(null)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              Edit
                            </button>
                            <button
                              onClick={() => setOpenAction(null)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              <UserX className="w-3.5 h-3.5" />
                              Suspend
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/30">
            <p className="text-sm text-gray-500">
              Showing {(currentPage - 1) * PAGE_SIZE + 1}-{Math.min(currentPage * PAGE_SIZE, filteredUsers.length)} of {filteredUsers.length}
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
