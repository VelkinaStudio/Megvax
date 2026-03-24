'use client';

import { useState } from 'react';
import { useTranslations } from '@/lib/i18n';
import { CalendarDays, Video, Clock, Search, X } from 'lucide-react';

interface AdminMeeting {
  id: string;
  userName: string;
  userEmail: string;
  date: string;
  time: string;
  topic: string;
  notes: string;
  status: 'confirmed' | 'cancelled' | 'completed';
}

const initialAdminMeetings: AdminMeeting[] = [];

export default function AdminMeetingsPage() {
  const t = useTranslations('admin');
  const [meetings, setMeetings] = useState<AdminMeeting[]>(initialAdminMeetings);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'completed' | 'cancelled'>('all');

  const filtered = meetings.filter(m => {
    const matchesSearch = !search ||
      m.userName.toLowerCase().includes(search.toLowerCase()) ||
      m.userEmail.toLowerCase().includes(search.toLowerCase()) ||
      m.topic.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || m.status === filter;
    return matchesSearch && matchesFilter;
  });

  const counts = {
    total: meetings.length,
    upcoming: meetings.filter(m => m.status === 'confirmed').length,
    completed: meetings.filter(m => m.status === 'completed').length,
    cancelled: meetings.filter(m => m.status === 'cancelled').length,
  };

  const handleCancel = (id: string) => {
    setMeetings(prev => prev.map(m => m.id === id ? { ...m, status: 'cancelled' as const } : m));
  };

  const statusBadge = (status: AdminMeeting['status']) => {
    switch (status) {
      case 'confirmed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-green-50 text-green-700">{t('meetings_confirmed')}</span>;
      case 'completed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-gray-100 text-gray-600">{t('meetings_completed')}</span>;
      case 'cancelled':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-red-50 text-red-600">{t('meetings_cancelled')}</span>;
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('meetings_title')}</h1>
        <p className="text-sm text-gray-500 mt-1">{t('meetings_description')}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: t('meetings_total'), value: counts.total, color: 'bg-blue-50 text-blue-700' },
          { label: t('meetings_upcoming'), value: counts.upcoming, color: 'bg-green-50 text-green-700' },
          { label: t('meetings_completed'), value: counts.completed, color: 'bg-gray-100 text-gray-700' },
          { label: t('meetings_cancelled'), value: counts.cancelled, color: 'bg-red-50 text-red-700' },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{stat.label}</p>
            <p className={`text-2xl font-bold mt-1 ${stat.color.split(' ')[1]}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or topic..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
        <div className="flex gap-1">
          {(['all', 'confirmed', 'completed', 'cancelled'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f === 'all' ? 'All' : t(`meetings_${f}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">{t('meetings_user')}</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">{t('meetings_date')}</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">{t('meetings_topic')}</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">{t('meetings_status')}</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length > 0 ? (
                filtered.map((meeting) => (
                  <tr key={meeting.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{meeting.userName}</p>
                        <p className="text-xs text-gray-500">{meeting.userEmail}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
                        {formatDate(meeting.date)}
                        <span className="text-gray-400">·</span>
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        {meeting.time}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Video className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-sm text-gray-700">{meeting.topic}</span>
                      </div>
                      {meeting.notes && (
                        <p className="text-xs text-gray-400 mt-0.5 ml-5.5">{meeting.notes}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {statusBadge(meeting.status)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {meeting.status === 'confirmed' && (
                        <button
                          onClick={() => handleCancel(meeting.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                          {t('meetings_cancel')}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <CalendarDays className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">{t('meetings_no_data')}</p>
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
