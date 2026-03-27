'use client';

import { useState } from 'react';
import {
  Search,
  Receipt,
  Download,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
} from 'lucide-react';

// --- Types ---

interface Invoice {
  id: string;
  invoiceNumber: string;
  userName: string;
  userEmail: string;
  amount: string;
  amountRaw: number;
  status: 'Paid' | 'Pending' | 'Overdue';
  date: string;
  dueDate: string;
}

// --- Mock Data ---

const mockInvoices: Invoice[] = [
  { id: '1', invoiceNumber: 'INV-2026-001', userName: 'Ahmet Yılmaz', userEmail: 'ahmet@modastore.com', amount: '₺1.990', amountRaw: 1990, status: 'Paid', date: '2026-03-01', dueDate: '2026-03-15' },
  { id: '2', invoiceNumber: 'INV-2026-002', userName: 'Zeynep Kaya', userEmail: 'zeynep@techshop.com', amount: '₺4.990', amountRaw: 4990, status: 'Paid', date: '2026-03-01', dueDate: '2026-03-15' },
  { id: '3', invoiceNumber: 'INV-2026-003', userName: 'Can Yıldırım', userEmail: 'can@dijitalajans.com', amount: '₺4.990', amountRaw: 4990, status: 'Paid', date: '2026-03-01', dueDate: '2026-03-15' },
  { id: '4', invoiceNumber: 'INV-2026-004', userName: 'Emre Aksoy', userEmail: 'emre@spormerkezi.com', amount: '₺1.990', amountRaw: 1990, status: 'Pending', date: '2026-03-15', dueDate: '2026-03-30' },
  { id: '5', invoiceNumber: 'INV-2026-005', userName: 'Selin Koç', userEmail: 'selin@modaatelier.com', amount: '₺1.990', amountRaw: 1990, status: 'Paid', date: '2026-03-01', dueDate: '2026-03-15' },
  { id: '6', invoiceNumber: 'INV-2026-006', userName: 'Oğuz Tan', userEmail: 'oguz@elektronikmarket.com', amount: '₺4.990', amountRaw: 4990, status: 'Paid', date: '2026-03-01', dueDate: '2026-03-15' },
  { id: '7', invoiceNumber: 'INV-2026-007', userName: 'Elif Arslan', userEmail: 'elif@kozmetikshop.com', amount: '₺1.990', amountRaw: 1990, status: 'Overdue', date: '2026-02-15', dueDate: '2026-03-01' },
  { id: '8', invoiceNumber: 'INV-2026-008', userName: 'Hakan Polat', userEmail: 'hakan@insaatmalzeme.com', amount: '₺1.990', amountRaw: 1990, status: 'Paid', date: '2026-03-01', dueDate: '2026-03-15' },
  { id: '9', invoiceNumber: 'INV-2026-009', userName: 'Ayşe Çelik', userEmail: 'ayse@beautybrand.com', amount: '₺1.990', amountRaw: 1990, status: 'Pending', date: '2026-03-15', dueDate: '2026-03-30' },
  { id: '10', invoiceNumber: 'INV-2026-010', userName: 'Tolga Kara', userEmail: 'tolga@petshopworld.com', amount: '₺790', amountRaw: 790, status: 'Overdue', date: '2026-02-15', dueDate: '2026-03-01' },
  { id: '11', invoiceNumber: 'INV-2026-011', userName: 'Derya Aydın', userEmail: 'derya@cicekonline.com', amount: '₺790', amountRaw: 790, status: 'Paid', date: '2026-03-01', dueDate: '2026-03-15' },
  { id: '12', invoiceNumber: 'INV-2026-012', userName: 'Gizem Erbaş', userEmail: 'gizem@yogastudio.com', amount: '₺790', amountRaw: 790, status: 'Pending', date: '2026-03-20', dueDate: '2026-04-05' },
];

const statusConfig: Record<string, { color: string; dotColor: string; icon: React.ElementType }> = {
  Paid: { color: 'bg-emerald-100 text-emerald-700', dotColor: 'bg-emerald-500', icon: CheckCircle },
  Pending: { color: 'bg-amber-100 text-amber-700', dotColor: 'bg-amber-500', icon: Clock },
  Overdue: { color: 'bg-red-100 text-red-700', dotColor: 'bg-red-500', icon: AlertTriangle },
};

export default function AdminInvoicesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredInvoices = mockInvoices.filter(inv => {
    const matchesSearch = !searchQuery ||
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.userEmail.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Summary calculations
  const totalRevenue = mockInvoices.filter(i => i.status === 'Paid').reduce((sum, i) => sum + i.amountRaw, 0);
  const pendingAmount = mockInvoices.filter(i => i.status === 'Pending').reduce((sum, i) => sum + i.amountRaw, 0);
  const overdueAmount = mockInvoices.filter(i => i.status === 'Overdue').reduce((sum, i) => sum + i.amountRaw, 0);

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
        <p className="text-gray-500 mt-1">View and manage all invoices</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">₺{totalRevenue.toLocaleString('tr-TR')}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending</p>
              <p className="text-2xl font-bold text-amber-600">₺{pendingAmount.toLocaleString('tr-TR')}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Overdue</p>
              <p className="text-2xl font-bold text-red-600">₺{overdueAmount.toLocaleString('tr-TR')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search invoices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
          />
        </div>
        <div className="flex gap-1.5">
          {(['all', 'Paid', 'Pending', 'Overdue'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f === 'all' ? 'All' : f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/70">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Invoice</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Customer</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Amount</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Date</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3 hidden md:table-cell">Due Date</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Status</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-gray-900 font-mono">{inv.invoiceNumber}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{inv.userName}</p>
                      <p className="text-xs text-gray-500 truncate">{inv.userEmail}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-gray-900">{inv.amount}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{formatDate(inv.date)}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap hidden md:table-cell">{formatDate(inv.dueDate)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full ${statusConfig[inv.status].color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[inv.status].dotColor}`} />
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title="View">
                        <Eye className="w-4 h-4 text-gray-400" />
                      </button>
                      <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title="Download">
                        <Download className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <Receipt className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-500">No invoices found</p>
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
