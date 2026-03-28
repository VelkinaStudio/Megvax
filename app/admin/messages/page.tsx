'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Send,
  Archive,
  Inbox,
  ChevronDown,
  ChevronUp,
  Clock,
  AlertCircle,
  MessageSquare,
  Bug,
  Lightbulb,
  Globe,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';

// --- Types ---

type AdminTab = 'contact' | 'support' | 'bugs' | 'features' | 'landing';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  date: string;
  status: 'New' | 'Read' | 'Replied';
  priority: 'normal' | 'high';
}

type SubmissionStatus = 'new' | 'in-review' | 'resolved';

interface SupportMessage {
  id: string;
  type: 'message';
  subject: string;
  description: string;
  status: SubmissionStatus;
  createdAt: string;
  userEmail: string;
}

interface BugReport {
  id: string;
  type: 'bug';
  title: string;
  description: string;
  stepsToReproduce: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  screenshotUrl: string;
  status: SubmissionStatus;
  createdAt: string;
  userEmail: string;
}

interface FeatureRequest {
  id: string;
  type: 'feature';
  title: string;
  description: string;
  useCase: string;
  priority: 'nice-to-have' | 'important' | 'critical';
  status: SubmissionStatus;
  createdAt: string;
  userEmail: string;
}

interface LandingFeedback {
  id: string;
  type: 'landing';
  name: string;
  email: string;
  message: string;
  category: 'feedback' | 'bug' | 'feature';
  status: SubmissionStatus;
  createdAt: string;
}

// --- Mock Data Seeds ---

const mockSupportMessages: SupportMessage[] = [
  {
    id: 'sm-1',
    type: 'message',
    subject: 'Campaign budget not updating',
    description: 'I changed my daily budget from $50 to $100 but the dashboard still shows $50. Tried refreshing multiple times.',
    status: 'new',
    createdAt: '2026-03-27T10:30:00Z',
    userEmail: 'ahmet@modastore.com',
  },
  {
    id: 'sm-2',
    type: 'message',
    subject: 'How to connect multiple ad accounts?',
    description: 'We have 3 Meta ad accounts for different brands. Can we connect all of them to one MegVax dashboard?',
    status: 'in-review',
    createdAt: '2026-03-26T14:15:00Z',
    userEmail: 'zeynep@techshop.com',
  },
  {
    id: 'sm-3',
    type: 'message',
    subject: 'Invoice request for March',
    description: 'Can you send me the invoice for March 2026? I need it for our accounting department. Account ID: MV-4521.',
    status: 'resolved',
    createdAt: '2026-03-25T09:00:00Z',
    userEmail: 'can@dijitalajans.com',
  },
  {
    id: 'sm-4',
    type: 'message',
    subject: 'Automation rule not triggering',
    description: 'I set up a rule to pause campaigns with ROAS below 2.0 but it has not triggered even though some campaigns qualify.',
    status: 'new',
    createdAt: '2026-03-27T08:45:00Z',
    userEmail: 'elif@kozmetikshop.com',
  },
];

const mockBugReports: BugReport[] = [
  {
    id: 'br-1',
    type: 'bug',
    title: 'Dashboard chart not rendering on Firefox',
    description: 'The performance chart on the main dashboard shows a blank white area on Firefox 125. Works fine on Chrome.',
    stepsToReproduce: '1. Open dashboard in Firefox\n2. Look at the performance chart section\n3. See blank area instead of chart',
    severity: 'high',
    screenshotUrl: '',
    status: 'new',
    createdAt: '2026-03-27T11:00:00Z',
    userEmail: 'oguz@elektronikmarket.com',
  },
  {
    id: 'br-2',
    type: 'bug',
    title: 'Export CSV generates empty file',
    description: 'When I try to export campaign data as CSV, the downloaded file is empty (0 bytes).',
    stepsToReproduce: '1. Go to Campaigns page\n2. Select campaigns\n3. Click Export CSV\n4. Downloaded file is 0 bytes',
    severity: 'critical',
    screenshotUrl: 'https://i.imgur.com/example.png',
    status: 'in-review',
    createdAt: '2026-03-26T16:30:00Z',
    userEmail: 'mehmet@gidatoptanci.com',
  },
  {
    id: 'br-3',
    type: 'bug',
    title: 'Date picker shows wrong timezone',
    description: 'Campaign date picker shows UTC time instead of local timezone (UTC+3). Causes confusion with scheduling.',
    stepsToReproduce: '1. Create new campaign\n2. Set start date/time\n3. Saved time is 3 hours off',
    severity: 'medium',
    screenshotUrl: '',
    status: 'resolved',
    createdAt: '2026-03-24T13:20:00Z',
    userEmail: 'selin@modaatelier.com',
  },
];

const mockFeatureRequests: FeatureRequest[] = [
  {
    id: 'fr-1',
    type: 'feature',
    title: 'Google Ads integration',
    description: 'We run campaigns on both Meta and Google. Would be great to manage everything from one place.',
    useCase: 'Cross-platform campaign management without switching between tools.',
    priority: 'critical',
    status: 'in-review',
    createdAt: '2026-03-27T09:15:00Z',
    userEmail: 'mehmet@gidatoptanci.com',
  },
  {
    id: 'fr-2',
    type: 'feature',
    title: 'PDF report export',
    description: 'Ability to export campaign performance reports as branded PDF documents.',
    useCase: 'Presenting results to clients in agency meetings.',
    priority: 'important',
    status: 'new',
    createdAt: '2026-03-26T10:00:00Z',
    userEmail: 'selin@modaatelier.com',
  },
  {
    id: 'fr-3',
    type: 'feature',
    title: 'Dark mode',
    description: 'Please add a dark mode option. Working late at night and the white interface is too bright.',
    useCase: 'Better UX for users who work in low-light environments.',
    priority: 'nice-to-have',
    status: 'new',
    createdAt: '2026-03-25T22:30:00Z',
    userEmail: 'gizem@yogastudio.com',
  },
  {
    id: 'fr-4',
    type: 'feature',
    title: 'Slack notifications',
    description: 'Send optimization suggestions and alerts to a Slack channel instead of just email.',
    useCase: 'Our team lives in Slack. Email notifications get lost.',
    priority: 'important',
    status: 'new',
    createdAt: '2026-03-25T14:45:00Z',
    userEmail: 'can@dijitalajans.com',
  },
];

const mockLandingFeedback: LandingFeedback[] = [
  {
    id: 'lf-1',
    type: 'landing',
    name: 'Burak Ozturk',
    email: 'burak@startup.io',
    message: 'Love the concept! How does the AI optimization actually work behind the scenes?',
    category: 'feedback',
    status: 'new',
    createdAt: '2026-03-27T12:00:00Z',
  },
  {
    id: 'lf-2',
    type: 'landing',
    name: 'Deniz Yilmaz',
    email: 'deniz@ecommerce.co',
    message: 'The pricing page link in the footer leads to a 404 on mobile.',
    category: 'bug',
    status: 'new',
    createdAt: '2026-03-26T18:20:00Z',
  },
  {
    id: 'lf-3',
    type: 'landing',
    name: 'Ayse Kara',
    email: 'ayse@agency.com',
    message: 'Would be great if you had an agency plan with white-label reporting.',
    category: 'feature',
    status: 'in-review',
    createdAt: '2026-03-25T11:40:00Z',
  },
];

// --- Helpers ---

function getStorageItems<T>(key: string, fallback: T[]): T[] {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      // Seed with mock data
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    const parsed = JSON.parse(raw);
    return parsed.length > 0 ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function setStorageItems<T>(key: string, items: T[]): void {
  localStorage.setItem(key, JSON.stringify(items));
}

// --- Mock Contact Messages ---

const mockContactMessages: ContactMessage[] = [
  {
    id: '1',
    name: 'Ahmet Yilmaz',
    email: 'ahmet@modastore.com',
    subject: 'Campaign budget optimization question',
    message: 'Merhaba, Pro plana gectim ancak kampanya butce optimizasyonu ozelligini bulamiyorum. Yardimci olabilir misiniz?',
    date: '27 Mar 2026, 14:32',
    status: 'New',
    priority: 'high',
  },
  {
    id: '2',
    name: 'Zeynep Kaya',
    email: 'zeynep@techshop.com',
    subject: 'Business plan upgrade request',
    message: 'Business plana gecmek istiyoruz. Mevcut kampanyalarimiz etkilenir mi?',
    date: '27 Mar 2026, 11:15',
    status: 'New',
    priority: 'normal',
  },
  {
    id: '3',
    name: 'Can Yildirim',
    email: 'can@dijitalajans.com',
    subject: 'API integration support needed',
    message: 'Ajansimiz icin API entegrasyonu yapmak istiyoruz. REST API dokumantasyonunuz var mi?',
    date: '26 Mar 2026, 16:45',
    status: 'Read',
    priority: 'normal',
  },
  {
    id: '4',
    name: 'Elif Arslan',
    email: 'elif@kozmetikshop.com',
    subject: 'Billing issue - double charge',
    message: 'Bu ay iki kez ucret kesilmis gorunuyor. Fazla odememin iade edilmesini talep ediyorum.',
    date: '26 Mar 2026, 09:22',
    status: 'Replied',
    priority: 'high',
  },
  {
    id: '5',
    name: 'Mehmet Demir',
    email: 'mehmet@gidatoptanci.com',
    subject: 'Feature request: Google Ads support',
    message: 'Google Ads destegi ne zaman gelecek? Su anda Meta Ads kullaniyoruz ama Google tarafini da eklemek istiyoruz.',
    date: '25 Mar 2026, 13:10',
    status: 'Read',
    priority: 'normal',
  },
];

// --- Status Colors ---

const contactStatusColors: Record<string, string> = {
  New: 'bg-blue-100 text-blue-700',
  Read: 'bg-gray-100 text-gray-600',
  Replied: 'bg-emerald-100 text-emerald-700',
};

const contactStatusDots: Record<string, string> = {
  New: 'bg-blue-500',
  Read: 'bg-gray-400',
  Replied: 'bg-emerald-500',
};

const submissionStatusColors: Record<SubmissionStatus, string> = {
  'new': 'bg-blue-100 text-blue-700',
  'in-review': 'bg-amber-100 text-amber-700',
  'resolved': 'bg-emerald-100 text-emerald-700',
};

const severityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};

const priorityColors: Record<string, string> = {
  'nice-to-have': 'bg-gray-100 text-gray-600',
  'important': 'bg-blue-100 text-blue-700',
  'critical': 'bg-red-100 text-red-700',
};

const feedbackCategoryColors: Record<string, string> = {
  feedback: 'bg-blue-100 text-blue-700',
  bug: 'bg-red-100 text-red-700',
  feature: 'bg-purple-100 text-purple-700',
};

// --- Tab Config ---

const adminTabs: { key: AdminTab; icon: typeof MessageSquare; label: string }[] = [
  { key: 'contact', icon: Inbox, label: 'Contact Messages' },
  { key: 'support', icon: MessageSquare, label: 'Support Messages' },
  { key: 'bugs', icon: Bug, label: 'Bug Reports' },
  { key: 'features', icon: Lightbulb, label: 'Feature Requests' },
  { key: 'landing', icon: Globe, label: 'Landing Feedback' },
];

// --- Component ---

export default function AdminMessagesPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('contact');

  // Contact messages (in-memory)
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>(mockContactMessages);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // localStorage-backed data
  const [supportMessages, setSupportMessages] = useState<SupportMessage[]>([]);
  const [bugReports, setBugReports] = useState<BugReport[]>([]);
  const [featureRequests, setFeatureRequests] = useState<FeatureRequest[]>([]);
  const [landingFeedback, setLandingFeedback] = useState<LandingFeedback[]>([]);

  useEffect(() => {
    setSupportMessages(getStorageItems<SupportMessage>('megvax_support_messages', mockSupportMessages));
    setBugReports(getStorageItems<BugReport>('megvax_bug_reports', mockBugReports));
    setFeatureRequests(getStorageItems<FeatureRequest>('megvax_feature_requests', mockFeatureRequests));
    setLandingFeedback(getStorageItems<LandingFeedback>('megvax_landing_feedback', mockLandingFeedback));
  }, []);

  // --- Contact messages logic ---

  const filteredContactMessages = contactMessages.filter((msg) => {
    const matchesSearch = !searchQuery ||
      msg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || msg.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const newContactCount = contactMessages.filter(m => m.status === 'New').length;

  const toggleExpand = (id: string) => {
    if (expandedId !== id) {
      setContactMessages(prev => prev.map(m =>
        m.id === id && m.status === 'New' ? { ...m, status: 'Read' as const } : m
      ));
    }
    setExpandedId(expandedId === id ? null : id);
  };

  const markReplied = (id: string) => {
    setContactMessages(prev => prev.map(m =>
      m.id === id ? { ...m, status: 'Replied' as const } : m
    ));
  };

  // --- Status update handlers for localStorage items ---

  const updateSupportStatus = useCallback((id: string, status: SubmissionStatus) => {
    setSupportMessages(prev => {
      const updated = prev.map(m => m.id === id ? { ...m, status } : m);
      setStorageItems('megvax_support_messages', updated);
      return updated;
    });
  }, []);

  const updateBugStatus = useCallback((id: string, status: SubmissionStatus) => {
    setBugReports(prev => {
      const updated = prev.map(m => m.id === id ? { ...m, status } : m);
      setStorageItems('megvax_bug_reports', updated);
      return updated;
    });
  }, []);

  const updateFeatureStatus = useCallback((id: string, status: SubmissionStatus) => {
    setFeatureRequests(prev => {
      const updated = prev.map(m => m.id === id ? { ...m, status } : m);
      setStorageItems('megvax_feature_requests', updated);
      return updated;
    });
  }, []);

  const updateLandingStatus = useCallback((id: string, status: SubmissionStatus) => {
    setLandingFeedback(prev => {
      const updated = prev.map(m => m.id === id ? { ...m, status } : m);
      setStorageItems('megvax_landing_feedback', updated);
      return updated;
    });
  }, []);

  // --- Tab counts ---

  const tabCounts: Record<AdminTab, number> = {
    contact: contactMessages.filter(m => m.status === 'New').length,
    support: supportMessages.filter(m => m.status === 'new').length,
    bugs: bugReports.filter(m => m.status === 'new').length,
    features: featureRequests.filter(m => m.status === 'new').length,
    landing: landingFeedback.filter(m => m.status === 'new').length,
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-500 mt-1">
          Manage all incoming messages, bug reports, feature requests, and feedback
        </p>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 overflow-x-auto bg-gray-100 p-1 rounded-lg">
        {adminTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          const count = tabCounts[tab.key];
          return (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setExpandedId(null); }}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-150 whitespace-nowrap
                ${isActive
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {count > 0 && (
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${isActive ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Contact Messages Tab */}
      {activeTab === 'contact' && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">New</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{contactMessages.filter(m => m.status === 'New').length}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Read</p>
              <p className="text-2xl font-bold text-gray-600 mt-1">{contactMessages.filter(m => m.status === 'Read').length}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Replied</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{contactMessages.filter(m => m.status === 'Replied').length}</p>
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

          {/* Contact Message List */}
          <div className="space-y-3">
            {filteredContactMessages.map((msg) => {
              const isExpanded = expandedId === msg.id;
              return (
                <div
                  key={msg.id}
                  className={`bg-white border rounded-xl shadow-sm overflow-hidden transition-all ${
                    msg.status === 'New' ? 'border-blue-200' : 'border-gray-200'
                  }`}
                >
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
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full ${contactStatusColors[msg.status]}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${contactStatusDots[msg.status]}`} />
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

            {filteredContactMessages.length === 0 && (
              <EmptyState />
            )}
          </div>
        </>
      )}

      {/* Support Messages Tab */}
      {activeTab === 'support' && (
        <SubmissionList
          items={supportMessages}
          renderItem={(item) => (
            <SubmissionCard
              key={item.id}
              id={item.id}
              title={item.subject}
              description={item.description}
              email={item.userEmail}
              date={item.createdAt}
              status={item.status}
              onStatusChange={updateSupportStatus}
              expandedId={expandedId}
              onToggle={setExpandedId}
            />
          )}
        />
      )}

      {/* Bug Reports Tab */}
      {activeTab === 'bugs' && (
        <SubmissionList
          items={bugReports}
          renderItem={(item) => (
            <SubmissionCard
              key={item.id}
              id={item.id}
              title={item.title}
              description={item.description}
              email={item.userEmail}
              date={item.createdAt}
              status={item.status}
              onStatusChange={updateBugStatus}
              expandedId={expandedId}
              onToggle={setExpandedId}
              badges={
                <>
                  <span className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full ${severityColors[item.severity]}`}>
                    {item.severity.charAt(0).toUpperCase() + item.severity.slice(1)}
                  </span>
                </>
              }
              extraContent={
                <>
                  {item.stepsToReproduce && (
                    <div className="mt-3">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Steps to Reproduce</p>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">{item.stepsToReproduce}</p>
                    </div>
                  )}
                  {item.screenshotUrl && (
                    <div className="mt-3">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Screenshot</p>
                      <a href={item.screenshotUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline break-all">
                        {item.screenshotUrl}
                      </a>
                    </div>
                  )}
                </>
              }
            />
          )}
        />
      )}

      {/* Feature Requests Tab */}
      {activeTab === 'features' && (
        <SubmissionList
          items={featureRequests}
          renderItem={(item) => (
            <SubmissionCard
              key={item.id}
              id={item.id}
              title={item.title}
              description={item.description}
              email={item.userEmail}
              date={item.createdAt}
              status={item.status}
              onStatusChange={updateFeatureStatus}
              expandedId={expandedId}
              onToggle={setExpandedId}
              badges={
                <span className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full ${priorityColors[item.priority]}`}>
                  {item.priority === 'nice-to-have' ? 'Nice to Have' : item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}
                </span>
              }
              extraContent={
                item.useCase ? (
                  <div className="mt-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Use Case</p>
                    <p className="text-sm text-gray-600">{item.useCase}</p>
                  </div>
                ) : null
              }
            />
          )}
        />
      )}

      {/* Landing Feedback Tab */}
      {activeTab === 'landing' && (
        <SubmissionList
          items={landingFeedback}
          renderItem={(item) => (
            <SubmissionCard
              key={item.id}
              id={item.id}
              title={`${item.name} - ${item.category}`}
              description={item.message}
              email={item.email}
              date={item.createdAt}
              status={item.status}
              onStatusChange={updateLandingStatus}
              expandedId={expandedId}
              onToggle={setExpandedId}
              badges={
                <span className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full ${feedbackCategoryColors[item.category]}`}>
                  {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                </span>
              }
            />
          )}
        />
      )}
    </div>
  );
}

// --- Sub-components ---

function EmptyState() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl py-16 text-center">
      <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-3" />
      <p className="text-sm font-medium text-gray-500">No items found</p>
      <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filters</p>
    </div>
  );
}

function SubmissionList<T>({ items, renderItem }: { items: T[]; renderItem: (item: T) => React.ReactNode }) {
  if (items.length === 0) {
    return <EmptyState />;
  }
  return <div className="space-y-3">{items.map(renderItem)}</div>;
}

const statusCycle: SubmissionStatus[] = ['new', 'in-review', 'resolved'];

const statusLabels: Record<SubmissionStatus, string> = {
  'new': 'New',
  'in-review': 'In Review',
  'resolved': 'Resolved',
};

const statusIcons: Record<SubmissionStatus, typeof Clock> = {
  'new': Clock,
  'in-review': AlertTriangle,
  'resolved': CheckCircle,
};

function SubmissionCard({
  id,
  title,
  description,
  email,
  date,
  status,
  onStatusChange,
  expandedId,
  onToggle,
  badges,
  extraContent,
}: {
  id: string;
  title: string;
  description: string;
  email: string;
  date: string;
  status: SubmissionStatus;
  onStatusChange: (id: string, status: SubmissionStatus) => void;
  expandedId: string | null;
  onToggle: (id: string | null) => void;
  badges?: React.ReactNode;
  extraContent?: React.ReactNode;
}) {
  const isExpanded = expandedId === id;
  const StatusIcon = statusIcons[status];

  const cycleStatus = () => {
    const currentIndex = statusCycle.indexOf(status);
    const nextIndex = (currentIndex + 1) % statusCycle.length;
    onStatusChange(id, statusCycle[nextIndex]);
  };

  return (
    <div className={`bg-white border rounded-xl shadow-sm overflow-hidden transition-all ${status === 'new' ? 'border-blue-200' : 'border-gray-200'}`}>
      <button
        onClick={() => onToggle(isExpanded ? null : id)}
        className="w-full text-left px-6 py-4 hover:bg-gray-50/50 transition-colors"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 text-sm font-semibold flex-shrink-0 mt-0.5">
              {email.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <span className="text-sm font-semibold text-gray-900 truncate">{title}</span>
                {badges}
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full ${submissionStatusColors[status]}`}>
                  <StatusIcon className="w-3 h-3" />
                  {statusLabels[status]}
                </span>
              </div>
              {!isExpanded && (
                <p className="text-xs text-gray-400 mt-1 truncate">{description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Clock className="w-3 h-3" />
              <span className="whitespace-nowrap">
                {new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="px-6 pb-5 border-t border-gray-100">
          <div className="pt-4 pl-14">
            <p className="text-xs text-gray-400 mb-1">{email}</p>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{description}</p>
            {extraContent}
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={(e) => { e.stopPropagation(); cycleStatus(); }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                {status === 'new' ? 'Mark In Review' : status === 'in-review' ? 'Mark Resolved' : 'Reopen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
