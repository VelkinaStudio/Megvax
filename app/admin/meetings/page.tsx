'use client';

import { useState } from 'react';
import {
  CalendarDays,
  Clock,
  Search,
  X,
  List,
  LayoutGrid,
  Building,
  StickyNote,
} from 'lucide-react';

// --- Types ---

interface Meeting {
  id: string;
  name: string;
  email: string;
  company: string;
  date: string;
  time: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  notes: string;
}

// --- Mock Data ---

const mockMeetings: Meeting[] = [
  { id: '1', name: 'Ahmet Yılmaz', email: 'ahmet@modastore.com', company: 'Moda Store', date: '2026-03-28', time: '10:00', status: 'Pending', notes: 'Initial onboarding call' },
  { id: '2', name: 'Zeynep Kaya', email: 'zeynep@techshop.com', company: 'TechShop', date: '2026-03-28', time: '14:00', status: 'Confirmed', notes: 'Upgrade to Business plan discussion' },
  { id: '3', name: 'Can Yıldırım', email: 'can@dijitalajans.com', company: 'Dijital Ajans', date: '2026-03-27', time: '11:00', status: 'Completed', notes: 'Campaign strategy review' },
  { id: '4', name: 'Elif Arslan', email: 'elif@kozmetikshop.com', company: 'Kozmetik Shop', date: '2026-03-26', time: '15:30', status: 'Completed', notes: 'Monthly performance review' },
  { id: '5', name: 'Mehmet Demir', email: 'mehmet@gidatoptanci.com', company: 'Gıda Toptancı', date: '2026-03-25', time: '09:00', status: 'Cancelled', notes: 'Client requested reschedule' },
  { id: '6', name: 'Selin Koç', email: 'selin@modaatelier.com', company: 'Moda Atelier', date: '2026-03-29', time: '16:00', status: 'Pending', notes: 'New feature walkthrough' },
  { id: '7', name: 'Oğuz Tan', email: 'oguz@elektronikmarket.com', company: 'Elektronik Market', date: '2026-03-29', time: '10:30', status: 'Confirmed', notes: 'Budget optimization session' },
  { id: '8', name: 'Hakan Polat', email: 'hakan@insaatmalzeme.com', company: 'İnşaat Malzeme', date: '2026-03-24', time: '13:00', status: 'Completed', notes: 'Quarterly business review' },
  { id: '9', name: 'Gizem Erbaş', email: 'gizem@yogastudio.com', company: 'Yoga Studio', date: '2026-03-30', time: '11:30', status: 'Pending', notes: 'Trial period check-in' },
  { id: '10', name: 'Tolga Kara', email: 'tolga@petshopworld.com', company: 'PetShop World', date: '2026-03-23', time: '14:30', status: 'Completed', notes: 'Automation setup review' },
];

const statusColors: Record<string, string> = {
  Pending: 'bg-amber-100 text-amber-700',
  Confirmed: 'bg-blue-100 text-blue-700',
  Completed: 'bg-emerald-100 text-emerald-700',
  Cancelled: 'bg-red-100 text-red-700',
};

const statusDot: Record<string, string> = {
  Pending: 'bg-amber-500',
  Confirmed: 'bg-blue-500',
  Completed: 'bg-emerald-500',
  Cancelled: 'bg-red-500',
};

export default function AdminMeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>(mockMeetings);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [view, setView] = useState<'list' | 'cards'>('list');

  const filtered = meetings.filter(m => {
    const matchesSearch = !search ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      m.company.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || m.status === filter;
    return matchesSearch && matchesFilter;
  });

  const counts = {
    total: meetings.length,
    pending: meetings.filter(m => m.status === 'Pending').length,
    confirmed: meetings.filter(m => m.status === 'Confirmed').length,
    completed: meetings.filter(m => m.status === 'Completed').length,
    cancelled: meetings.filter(m => m.status === 'Cancelled').length,
  };

  const handleCancel = (id: string) => {
    setMeetings(prev => prev.map(m => m.id === id ? { ...m, status: 'Cancelled' as const } : m));
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Meetings</h1>
        <p className="text-gray-500 mt-1">View and manage all scheduled meetings</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total', value: counts.total, color: 'text-gray-900' },
          { label: 'Pending', value: counts.pending, color: 'text-amber-600' },
          { label: 'Confirmed', value: counts.confirmed, color: 'text-blue-600' },
          { label: 'Completed', value: counts.completed, color: 'text-emerald-600' },
          { label: 'Cancelled', value: counts.cancelled, color: 'text-red-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{stat.label}</p>
            <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or company..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
          />
        </div>
        <div className="flex gap-1.5">
          {(['all', 'Pending', 'Confirmed', 'Completed', 'Cancelled'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f === 'all' ? 'All' : f}
            </button>
          ))}
        </div>
        <div className="flex gap-1 ml-auto">
          <button
            onClick={() => setView('list')}
            className={`p-2 rounded-lg transition-colors ${view === 'list' ? 'bg-gray-200 text-gray-900' : 'text-gray-400 hover:bg-gray-100'}`}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView('cards')}
            className={`p-2 rounded-lg transition-colors ${view === 'cards' ? 'bg-gray-200 text-gray-900' : 'text-gray-400 hover:bg-gray-100'}`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      {view === 'list' ? (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/70">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Contact</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Date & Time</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3 hidden lg:table-cell">Company</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3 hidden md:table-cell">Notes</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((meeting) => (
                  <tr key={meeting.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{meeting.name}</p>
                      <p className="text-xs text-gray-500">{meeting.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <CalendarDays className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <span className="whitespace-nowrap">{formatDate(meeting.date)}</span>
                        <span className="text-gray-300">|</span>
                        <Clock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <span>{meeting.time}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <Building className="w-3.5 h-3.5 text-gray-400" />
                        {meeting.company}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full ${statusColors[meeting.status]}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusDot[meeting.status]}`} />
                        {meeting.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <p className="text-sm text-gray-500 max-w-xs truncate">{meeting.notes}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {(meeting.status === 'Pending' || meeting.status === 'Confirmed') && (
                        <button
                          onClick={() => handleCancel(meeting.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <CalendarDays className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm font-medium text-gray-500">No meetings found</p>
                      <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filters</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Card View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((meeting) => (
            <div key={meeting.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{meeting.name}</p>
                  <p className="text-xs text-gray-500">{meeting.email}</p>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full ${statusColors[meeting.status]}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusDot[meeting.status]}`} />
                  {meeting.status}
                </span>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Building className="w-3.5 h-3.5 text-gray-400" />
                  {meeting.company}
                </div>
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
                  {formatDate(meeting.date)} at {meeting.time}
                </div>
                <div className="flex items-start gap-2">
                  <StickyNote className="w-3.5 h-3.5 text-gray-400 mt-0.5" />
                  <span className="text-gray-500">{meeting.notes}</span>
                </div>
              </div>
              {(meeting.status === 'Pending' || meeting.status === 'Confirmed') && (
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => handleCancel(meeting.id)}
                    className="text-xs font-medium text-red-600 hover:text-red-700 transition-colors"
                  >
                    Cancel Meeting
                  </button>
                </div>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full py-16 text-center">
              <CalendarDays className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-500">No meetings found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
