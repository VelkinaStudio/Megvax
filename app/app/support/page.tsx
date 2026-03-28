'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from '@/lib/i18n';
import {
  MessageSquare,
  Bug,
  Lightbulb,
  Send,
  Loader2,
  CheckCircle,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { Card } from '@/components/ui';
import { PageHeader } from '@/components/dashboard';
import { useToast } from '@/components/ui/Toast';

// --- Types ---

type TabType = 'messages' | 'bugs' | 'features';

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

// --- Helpers ---

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function getStorageItems<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setStorageItems<T>(key: string, items: T[]): void {
  localStorage.setItem(key, JSON.stringify(items));
}

const statusConfig: Record<SubmissionStatus, { color: string; icon: typeof CheckCircle }> = {
  'new': { color: 'bg-blue-100 text-blue-700', icon: Clock },
  'in-review': { color: 'bg-amber-100 text-amber-700', icon: AlertTriangle },
  'resolved': { color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
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

// --- Tab Config ---

const tabs: { key: TabType; icon: typeof MessageSquare; labelKey: string }[] = [
  { key: 'messages', icon: MessageSquare, labelKey: 'tab_messages' },
  { key: 'bugs', icon: Bug, labelKey: 'tab_bugs' },
  { key: 'features', icon: Lightbulb, labelKey: 'tab_features' },
];

// --- Component ---

export default function SupportPage() {
  const t = useTranslations('support');
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<TabType>('messages');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Message form state
  const [msgSubject, setMsgSubject] = useState('');
  const [msgBody, setMsgBody] = useState('');

  // Bug form state
  const [bugTitle, setBugTitle] = useState('');
  const [bugDescription, setBugDescription] = useState('');
  const [bugSteps, setBugSteps] = useState('');
  const [bugSeverity, setBugSeverity] = useState<BugReport['severity']>('medium');
  const [bugScreenshot, setBugScreenshot] = useState('');

  // Feature form state
  const [featTitle, setFeatTitle] = useState('');
  const [featDescription, setFeatDescription] = useState('');
  const [featUseCase, setFeatUseCase] = useState('');
  const [featPriority, setFeatPriority] = useState<FeatureRequest['priority']>('important');

  // Stored submissions (for showing history)
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [bugs, setBugs] = useState<BugReport[]>([]);
  const [features, setFeatures] = useState<FeatureRequest[]>([]);

  useEffect(() => {
    setMessages(getStorageItems<SupportMessage>('megvax_support_messages'));
    setBugs(getStorageItems<BugReport>('megvax_bug_reports'));
    setFeatures(getStorageItems<FeatureRequest>('megvax_feature_requests'));
  }, []);

  const getUserEmail = useCallback((): string => {
    if (typeof window === 'undefined') return 'user@example.com';
    try {
      const authData = localStorage.getItem('megvax_auth');
      if (authData) {
        const parsed = JSON.parse(authData);
        return parsed.email || 'user@megvax.com';
      }
    } catch { /* ignore */ }
    return 'demo@megvax.com';
  }, []);

  const handleSubmitMessage = async () => {
    if (!msgSubject.trim() || !msgBody.trim()) return;
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 600));

    const entry: SupportMessage = {
      id: generateId(),
      type: 'message',
      subject: msgSubject.trim(),
      description: msgBody.trim(),
      status: 'new',
      createdAt: new Date().toISOString(),
      userEmail: getUserEmail(),
    };

    const updated = [entry, ...messages];
    setMessages(updated);
    setStorageItems('megvax_support_messages', updated);
    setMsgSubject('');
    setMsgBody('');
    setIsSubmitting(false);
    toast.success(t('submit_success'));
  };

  const handleSubmitBug = async () => {
    if (!bugTitle.trim() || !bugDescription.trim()) return;
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 600));

    const entry: BugReport = {
      id: generateId(),
      type: 'bug',
      title: bugTitle.trim(),
      description: bugDescription.trim(),
      stepsToReproduce: bugSteps.trim(),
      severity: bugSeverity,
      screenshotUrl: bugScreenshot.trim(),
      status: 'new',
      createdAt: new Date().toISOString(),
      userEmail: getUserEmail(),
    };

    const updated = [entry, ...bugs];
    setBugs(updated);
    setStorageItems('megvax_bug_reports', updated);
    setBugTitle('');
    setBugDescription('');
    setBugSteps('');
    setBugSeverity('medium');
    setBugScreenshot('');
    setIsSubmitting(false);
    toast.success(t('submit_success'));
  };

  const handleSubmitFeature = async () => {
    if (!featTitle.trim() || !featDescription.trim()) return;
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 600));

    const entry: FeatureRequest = {
      id: generateId(),
      type: 'feature',
      title: featTitle.trim(),
      description: featDescription.trim(),
      useCase: featUseCase.trim(),
      priority: featPriority,
      status: 'new',
      createdAt: new Date().toISOString(),
      userEmail: getUserEmail(),
    };

    const updated = [entry, ...features];
    setFeatures(updated);
    setStorageItems('megvax_feature_requests', updated);
    setFeatTitle('');
    setFeatDescription('');
    setFeatUseCase('');
    setFeatPriority('important');
    setIsSubmitting(false);
    toast.success(t('submit_success'));
  };

  const inputStyles = 'w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors';
  const selectStyles = 'w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors';
  const textareaStyles = `${inputStyles} resize-vertical`;
  const labelStyles = 'block text-sm font-medium text-gray-700 mb-1.5';

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title={t('title')}
        description={t('description')}
      />

      {/* Tab Bar */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-150
                ${isActive
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              {t(tab.labelKey)}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Form */}
        <div className="lg:col-span-3">
          <Card className="p-6">
            {/* Messages Tab */}
            {activeTab === 'messages' && (
              <form onSubmit={(e) => { e.preventDefault(); handleSubmitMessage(); }} className="space-y-4">
                <div>
                  <label className={labelStyles}>{t('msg_subject')}</label>
                  <input
                    type="text"
                    value={msgSubject}
                    onChange={(e) => setMsgSubject(e.target.value)}
                    placeholder={t('msg_subject_placeholder')}
                    className={inputStyles}
                    required
                  />
                </div>
                <div>
                  <label className={labelStyles}>{t('msg_body')}</label>
                  <textarea
                    value={msgBody}
                    onChange={(e) => setMsgBody(e.target.value)}
                    placeholder={t('msg_body_placeholder')}
                    rows={5}
                    className={textareaStyles}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting || !msgSubject.trim() || !msgBody.trim()}
                  className="w-full py-2.5 px-4 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />{t('sending')}</>
                  ) : (
                    <><Send className="w-4 h-4" />{t('send')}</>
                  )}
                </button>
              </form>
            )}

            {/* Bug Report Tab */}
            {activeTab === 'bugs' && (
              <form onSubmit={(e) => { e.preventDefault(); handleSubmitBug(); }} className="space-y-4">
                <div>
                  <label className={labelStyles}>{t('bug_title')}</label>
                  <input
                    type="text"
                    value={bugTitle}
                    onChange={(e) => setBugTitle(e.target.value)}
                    placeholder={t('bug_title_placeholder')}
                    className={inputStyles}
                    required
                  />
                </div>
                <div>
                  <label className={labelStyles}>{t('bug_description')}</label>
                  <textarea
                    value={bugDescription}
                    onChange={(e) => setBugDescription(e.target.value)}
                    placeholder={t('bug_description_placeholder')}
                    rows={4}
                    className={textareaStyles}
                    required
                  />
                </div>
                <div>
                  <label className={labelStyles}>{t('bug_steps')}</label>
                  <textarea
                    value={bugSteps}
                    onChange={(e) => setBugSteps(e.target.value)}
                    placeholder={t('bug_steps_placeholder')}
                    rows={3}
                    className={textareaStyles}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelStyles}>{t('bug_severity')}</label>
                    <select
                      value={bugSeverity}
                      onChange={(e) => setBugSeverity(e.target.value as BugReport['severity'])}
                      className={selectStyles}
                    >
                      <option value="low">{t('severity_low')}</option>
                      <option value="medium">{t('severity_medium')}</option>
                      <option value="high">{t('severity_high')}</option>
                      <option value="critical">{t('severity_critical')}</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelStyles}>{t('bug_screenshot')}</label>
                    <input
                      type="url"
                      value={bugScreenshot}
                      onChange={(e) => setBugScreenshot(e.target.value)}
                      placeholder={t('bug_screenshot_placeholder')}
                      className={inputStyles}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting || !bugTitle.trim() || !bugDescription.trim()}
                  className="w-full py-2.5 px-4 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />{t('sending')}</>
                  ) : (
                    <><Bug className="w-4 h-4" />{t('submit_bug')}</>
                  )}
                </button>
              </form>
            )}

            {/* Feature Request Tab */}
            {activeTab === 'features' && (
              <form onSubmit={(e) => { e.preventDefault(); handleSubmitFeature(); }} className="space-y-4">
                <div>
                  <label className={labelStyles}>{t('feat_title')}</label>
                  <input
                    type="text"
                    value={featTitle}
                    onChange={(e) => setFeatTitle(e.target.value)}
                    placeholder={t('feat_title_placeholder')}
                    className={inputStyles}
                    required
                  />
                </div>
                <div>
                  <label className={labelStyles}>{t('feat_description')}</label>
                  <textarea
                    value={featDescription}
                    onChange={(e) => setFeatDescription(e.target.value)}
                    placeholder={t('feat_description_placeholder')}
                    rows={4}
                    className={textareaStyles}
                    required
                  />
                </div>
                <div>
                  <label className={labelStyles}>{t('feat_use_case')}</label>
                  <textarea
                    value={featUseCase}
                    onChange={(e) => setFeatUseCase(e.target.value)}
                    placeholder={t('feat_use_case_placeholder')}
                    rows={3}
                    className={textareaStyles}
                  />
                </div>
                <div>
                  <label className={labelStyles}>{t('feat_priority')}</label>
                  <select
                    value={featPriority}
                    onChange={(e) => setFeatPriority(e.target.value as FeatureRequest['priority'])}
                    className={selectStyles}
                  >
                    <option value="nice-to-have">{t('priority_nice')}</option>
                    <option value="important">{t('priority_important')}</option>
                    <option value="critical">{t('priority_critical')}</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting || !featTitle.trim() || !featDescription.trim()}
                  className="w-full py-2.5 px-4 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />{t('sending')}</>
                  ) : (
                    <><Lightbulb className="w-4 h-4" />{t('submit_feature')}</>
                  )}
                </button>
              </form>
            )}
          </Card>
        </div>

        {/* Right: History */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{t('previous_requests')}</h3>

          {activeTab === 'messages' && (
            messages.length === 0 ? (
              <EmptyHistory icon={MessageSquare} text={t('no_messages')} />
            ) : (
              <div className="space-y-2">
                {messages.map((m) => (
                  <HistoryItem key={m.id} title={m.subject} description={m.description} status={m.status} date={m.createdAt} t={t} />
                ))}
              </div>
            )
          )}

          {activeTab === 'bugs' && (
            bugs.length === 0 ? (
              <EmptyHistory icon={Bug} text={t('no_bugs')} />
            ) : (
              <div className="space-y-2">
                {bugs.map((b) => (
                  <HistoryItem key={b.id} title={b.title} description={b.description} status={b.status} date={b.createdAt} t={t} badge={
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${severityColors[b.severity]}`}>
                      {t(`severity_${b.severity}`)}
                    </span>
                  } />
                ))}
              </div>
            )
          )}

          {activeTab === 'features' && (
            features.length === 0 ? (
              <EmptyHistory icon={Lightbulb} text={t('no_features')} />
            ) : (
              <div className="space-y-2">
                {features.map((f) => (
                  <HistoryItem key={f.id} title={f.title} description={f.description} status={f.status} date={f.createdAt} t={t} badge={
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${priorityColors[f.priority]}`}>
                      {t(`priority_${f.priority === 'nice-to-have' ? 'nice' : f.priority}`)}
                    </span>
                  } />
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

// --- Sub-components ---

function EmptyHistory({ icon: Icon, text }: { icon: typeof MessageSquare; text: string }) {
  return (
    <div className="bg-gray-50 rounded-xl p-8 text-center">
      <Icon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
      <p className="text-sm text-gray-400">{text}</p>
    </div>
  );
}

function HistoryItem({ title, description, status, date, t, badge }: {
  title: string;
  description: string;
  status: SubmissionStatus;
  date: string;
  t: (key: string) => string;
  badge?: React.ReactNode;
}) {
  const cfg = statusConfig[status];
  const StatusIcon = cfg.icon;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-start justify-between gap-2 mb-1">
        <h4 className="text-sm font-medium text-gray-900 truncate flex-1">{title}</h4>
        <div className="flex items-center gap-2 flex-shrink-0">
          {badge}
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
            <StatusIcon className="w-3 h-3" />
            {t(`status_${status}`)}
          </span>
        </div>
      </div>
      <p className="text-xs text-gray-500 line-clamp-2 mb-2">{description}</p>
      <p className="text-xs text-gray-400">
        {new Date(date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
      </p>
    </div>
  );
}
