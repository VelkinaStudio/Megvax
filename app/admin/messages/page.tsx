'use client';

import { useState } from 'react';
import { useTranslations } from '@/lib/i18n';
import { Search, Mail, Send, Trash2, Archive, AlertCircle, Inbox } from 'lucide-react';
import { Card, Button, Input } from '@/components/ui';
import { PageHeader } from '@/components/dashboard';

interface Message {
  id: string;
  subject: string;
  content: string;
  from: string;
  fromEmail: string;
  to: string;
  status: 'unread' | 'read' | 'replied' | 'archived';
  priority: 'low' | 'normal' | 'high';
  category: 'support' | 'bug' | 'feature' | 'general';
  createdAt: string;
}

const initialMessages: Message[] = [];

export default function AdminMessagesPage() {
  const t = useTranslations('admin');
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'unread' | 'replied' | 'archived'>('all');
  const [replyText, setReplyText] = useState('');

  const filteredMessages = messages.filter((msg) => {
    const matchesSearch = 
      msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || msg.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const unreadCount = messages.filter(m => m.status === 'unread').length;
  const totalCount = messages.length;

  const handleMarkAsRead = (id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, status: 'read' as const } : m));
  };

  const handleArchive = (id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, status: 'archived' as const } : m));
    if (selectedMessage?.id === id) setSelectedMessage(null);
  };

  const handleSendReply = () => {
    if (!selectedMessage || !replyText.trim()) return;
    setMessages(prev => prev.map(m => m.id === selectedMessage.id ? { ...m, status: 'replied' as const } : m));
    setReplyText('');
    alert(t('reply_sent'));
  };

  const getCategoryLabel = (category: Message['category']) => {
    switch (category) {
      case 'support': return t('category_support');
      case 'bug': return t('category_bug');
      case 'feature': return t('category_feature');
      default: return t('category_general');
    }
  };

  const getCategoryColor = (category: Message['category']) => {
    switch (category) {
      case 'bug': return 'bg-red-100 text-red-700';
      case 'feature': return 'bg-blue-100 text-blue-700';
      case 'support': return 'bg-amber-100 text-amber-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('messages_title')}
        description={`${unreadCount} ${t('messages_description')} ${totalCount}`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Message List */}
        <Card className="lg:col-span-1 overflow-hidden">
          {/* Filters */}
          <div className="p-4 border-b border-gray-200 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder={t('search_messages')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'unread', 'replied', 'archived'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                    filterStatus === status
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {status === 'all' ? t('all') : 
                   status === 'unread' ? t('unread') : 
                   status === 'replied' ? t('replied') : t('archived')}
                </button>
              ))}
            </div>
          </div>

          {/* Message List */}
          <div className="max-h-[500px] overflow-y-auto">
            {filteredMessages.length === 0 ? (
              <div className="p-8 text-center">
                <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">{t('no_messages')}</p>
              </div>
            ) : (
              filteredMessages.map((message) => (
                <button
                  key={message.id}
                  onClick={() => {
                    setSelectedMessage(message);
                    if (message.status === 'unread') handleMarkAsRead(message.id);
                  }}
                  className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    selectedMessage?.id === message.id ? 'bg-blue-50' : ''
                  } ${message.status === 'unread' ? 'bg-blue-50/30' : ''}`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <span className="font-medium text-gray-900 truncate pr-2">
                      {message.status === 'unread' && (
                        <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mr-2" />
                      )}
                      {message.from}
                    </span>
                    <span className="text-xs text-gray-400 flex-shrink-0">{message.createdAt}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-800 mb-1 truncate">{message.subject}</p>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-2">{message.content}</p>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(message.category)}`}>
                      {getCategoryLabel(message.category)}
                    </span>
                    {message.priority === 'high' && (
                      <AlertCircle className="w-3 h-3 text-red-500" />
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </Card>

        {/* Message Detail */}
        <Card className="lg:col-span-2">
          {selectedMessage ? (
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">{selectedMessage.subject}</h3>
                    <p className="text-sm text-gray-500">{selectedMessage.from} ({selectedMessage.fromEmail})</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleArchive(selectedMessage.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title={t('archive')}
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleArchive(selectedMessage.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title={t('delete')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(selectedMessage.category)}`}>
                    {getCategoryLabel(selectedMessage.category)}
                  </span>
                  <span className="text-xs text-gray-400">{selectedMessage.createdAt}</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 flex-1">
                <p className="text-gray-700 whitespace-pre-wrap">{selectedMessage.content}</p>
              </div>

              {/* Reply */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex gap-2">
                  <Input
                    placeholder={t('reply')}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    variant="primary" 
                    icon={<Send className="w-4 h-4" />}
                    onClick={handleSendReply}
                    disabled={!replyText.trim()}
                  >
                    {t('send')}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-12">
              <div className="text-center">
                <Mail className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-500">{t('select_message')}</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
