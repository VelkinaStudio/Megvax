'use client';

import { useState } from 'react';
import {
  Search,
  Send,
  Archive,
  Inbox,
  ChevronDown,
  ChevronUp,
  Clock,
  AlertCircle,
} from 'lucide-react';

// --- Types ---

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  date: string;
  status: 'New' | 'Read' | 'Replied';
  priority: 'normal' | 'high';
}

// --- Mock Data ---

const mockMessages: Message[] = [
  {
    id: '1',
    name: 'Ahmet Yılmaz',
    email: 'ahmet@modastore.com',
    subject: 'Campaign budget optimization question',
    message: 'Merhaba, Pro plana geçtim ancak kampanya bütçe optimizasyonu özelliğini bulamıyorum. Yardımcı olabilir misiniz? Ayrıca Meta Ads hesabımı bağlamak istiyorum ama bağlantı sırasında hata alıyorum. Detaylı bir yardım dokümantasyonu var mı?',
    date: '27 Mar 2026, 14:32',
    status: 'New',
    priority: 'high',
  },
  {
    id: '2',
    name: 'Zeynep Kaya',
    email: 'zeynep@techshop.com',
    subject: 'Business plan upgrade request',
    message: 'Business plan\'a geçmek istiyoruz. Mevcut kampanyalarımız etkilenir mi? Ayrıca ödeme planında değişiklik yapabilir miyiz? Yıllık ödeme seçeneği var mı?',
    date: '27 Mar 2026, 11:15',
    status: 'New',
    priority: 'normal',
  },
  {
    id: '3',
    name: 'Can Yıldırım',
    email: 'can@dijitalajans.com',
    subject: 'API integration support needed',
    message: 'Ajansımız için API entegrasyonu yapmak istiyoruz. Birden fazla müşteri hesabını tek panelden yönetebilecek miyiz? REST API dokümantasyonunuz var mı?',
    date: '26 Mar 2026, 16:45',
    status: 'Read',
    priority: 'normal',
  },
  {
    id: '4',
    name: 'Elif Arslan',
    email: 'elif@kozmetikshop.com',
    subject: 'Billing issue - double charge',
    message: 'Bu ay iki kez ücret kesilmiş görünüyor. Hesabıma baktığımda iki ayrı fatura görüyorum. Fazla ödememin iade edilmesini talep ediyorum. Acil dönüş yapabilir misiniz?',
    date: '26 Mar 2026, 09:22',
    status: 'Replied',
    priority: 'high',
  },
  {
    id: '5',
    name: 'Mehmet Demir',
    email: 'mehmet@gidatoptanci.com',
    subject: 'Feature request: Google Ads support',
    message: 'Google Ads desteği ne zaman gelecek? Şu anda Meta Ads kullanıyoruz ama Google tarafını da eklemek istiyoruz. Yol haritanızda var mı?',
    date: '25 Mar 2026, 13:10',
    status: 'Read',
    priority: 'normal',
  },
  {
    id: '6',
    name: 'Selin Koç',
    email: 'selin@modaatelier.com',
    subject: 'Great platform - small suggestion',
    message: 'Platformunuzu çok beğeniyoruz! Küçük bir öneri: Kampanya performans raporlarını PDF olarak indirme özelliği ekleyebilir misiniz? Müşterilerimize rapor sunumu yaparken işimize yarar.',
    date: '24 Mar 2026, 17:58',
    status: 'Replied',
    priority: 'normal',
  },
  {
    id: '7',
    name: 'Oğuz Tan',
    email: 'oguz@elektronikmarket.com',
    subject: 'Login issues after password reset',
    message: 'Şifremi sıfırladım ama yeni şifreyle giriş yapamıyorum. E-posta adresim doğru, sıfırlama linki geldi ama giriş ekranında "geçersiz kimlik bilgileri" hatası alıyorum.',
    date: '24 Mar 2026, 10:03',
    status: 'New',
    priority: 'high',
  },
  {
    id: '8',
    name: 'Gizem Erbaş',
    email: 'gizem@yogastudio.com',
    subject: 'Trial period extension request',
    message: 'Deneme süremiz bitmek üzere ama henüz tüm özellikleri test edemedik. Deneme süresini bir hafta daha uzatmanız mümkün mü? Karşılaştırma yapmamız gerekiyor.',
    date: '23 Mar 2026, 15:30',
    status: 'Read',
    priority: 'normal',
  },
];

const statusColors: Record<string, string> = {
  New: 'bg-blue-100 text-blue-700',
  Read: 'bg-gray-100 text-gray-600',
  Replied: 'bg-emerald-100 text-emerald-700',
};

const statusDots: Record<string, string> = {
  New: 'bg-blue-500',
  Read: 'bg-gray-400',
  Replied: 'bg-emerald-500',
};

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredMessages = messages.filter((msg) => {
    const matchesSearch = !searchQuery ||
      msg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || msg.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const newCount = messages.filter(m => m.status === 'New').length;
  const totalCount = messages.length;

  const toggleExpand = (id: string) => {
    // Mark as read when expanding a "New" message
    if (expandedId !== id) {
      setMessages(prev => prev.map(m =>
        m.id === id && m.status === 'New' ? { ...m, status: 'Read' as const } : m
      ));
    }
    setExpandedId(expandedId === id ? null : id);
  };

  const markReplied = (id: string) => {
    setMessages(prev => prev.map(m =>
      m.id === id ? { ...m, status: 'Replied' as const } : m
    ));
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-500 mt-1">
          {newCount} unread of {totalCount} total contact form submissions
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">New</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{messages.filter(m => m.status === 'New').length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Read</p>
          <p className="text-2xl font-bold text-gray-600 mt-1">{messages.filter(m => m.status === 'Read').length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Replied</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{messages.filter(m => m.status === 'Replied').length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
          />
        </div>
        <div className="flex gap-1.5">
          {(['all', 'New', 'Read', 'Replied'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilterStatus(f)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f === 'all' ? 'All' : f}
            </button>
          ))}
        </div>
      </div>

      {/* Message List */}
      <div className="space-y-3">
        {filteredMessages.map((msg) => {
          const isExpanded = expandedId === msg.id;
          return (
            <div
              key={msg.id}
              className={`bg-white border rounded-xl shadow-sm overflow-hidden transition-all ${
                msg.status === 'New' ? 'border-blue-200' : 'border-gray-200'
              }`}
            >
              {/* Collapsed Row */}
              <button
                onClick={() => toggleExpand(msg.id)}
                className="w-full text-left px-6 py-4 hover:bg-gray-50/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-sm font-semibold flex-shrink-0 mt-0.5">
                      {msg.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-sm font-semibold ${msg.status === 'New' ? 'text-gray-900' : 'text-gray-700'}`}>
                          {msg.name}
                        </span>
                        {msg.priority === 'high' && (
                          <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                        )}
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full ${statusColors[msg.status]}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusDots[msg.status]}`} />
                          {msg.status}
                        </span>
                      </div>
                      <p className={`text-sm ${msg.status === 'New' ? 'font-semibold text-gray-900' : 'text-gray-700'} truncate`}>
                        {msg.subject}
                      </p>
                      {!isExpanded && (
                        <p className="text-xs text-gray-400 mt-1 truncate">{msg.message}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      <span className="whitespace-nowrap">{msg.date}</span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </div>
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="px-6 pb-5 border-t border-gray-100">
                  <div className="pt-4 pl-14">
                    <p className="text-xs text-gray-400 mb-1">{msg.email}</p>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                    <div className="flex items-center gap-3 mt-4">
                      {msg.status !== 'Replied' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); markReplied(msg.id); }}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Send className="w-3.5 h-3.5" />
                          Mark as Replied
                        </button>
                      )}
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Archive className="w-3.5 h-3.5" />
                        Archive
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredMessages.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-xl py-16 text-center">
            <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-500">No messages found</p>
            <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
