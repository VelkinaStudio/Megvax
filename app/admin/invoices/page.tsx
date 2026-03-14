'use client';

import { useState } from 'react';
import { Search, Receipt, Download, Calendar, CheckCircle, Clock } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface Invoice {
  id: string;
  invoiceNumber: string;
  userName: string;
  userEmail: string;
  amount: string;
  status: 'active' | 'paused' | 'archived' | 'learning' | 'error' | 'pending';
  date: string;
  dueDate: string;
}

const mockInvoices: Invoice[] = [
  { id: '1', invoiceNumber: 'INV-2024-001', userName: 'Ahmet Yilmaz', userEmail: 'ahmet@firma.com', amount: '₺1.999', status: 'active', date: '2024-03-15', dueDate: '2024-03-22' },
  { id: '2', invoiceNumber: 'INV-2024-002', userName: 'Mehmet Kaya', userEmail: 'mehmet@tekno.com', amount: '₺4.999', status: 'active', date: '2024-03-20', dueDate: '2024-03-27' },
  { id: '3', invoiceNumber: 'INV-2024-003', userName: 'Ayse Demir', userEmail: 'ayse@dijital.com', amount: '₺499', status: 'pending', date: '2024-03-10', dueDate: '2024-03-17' },
  { id: '4', invoiceNumber: 'INV-2024-004', userName: 'Fatma Sahin', userEmail: 'fatma@reklam.com', amount: '₺1.999', status: 'error', date: '2024-02-05', dueDate: '2024-02-12' },
];

export default function AdminInvoicesPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredInvoices = mockInvoices.filter(inv =>
    inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-600 mt-1">View and manage all invoices</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search invoices..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Invoice No</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Customer</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredInvoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">{inv.invoiceNumber}</td>
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-gray-900">{inv.userName}</p>
                    <p className="text-sm text-gray-500">{inv.userEmail}</p>
                  </div>
                </td>
                <td className="px-6 py-4 font-medium text-gray-900">{inv.amount}</td>
                <td className="px-6 py-4"><StatusBadge status={inv.status} size="sm" /></td>
                <td className="px-6 py-4 text-sm text-gray-500">{inv.date}</td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Download className="w-5 h-5 text-gray-400" />
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
