'use client';

import { ReactNode } from 'react';
import { 
  Inbox, 
  Search, 
  BarChart3,
  Zap,
  FolderOpen
} from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from '@/lib/i18n';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ 
  icon, 
  title, 
  description, 
  action,
  secondaryAction 
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && (
        <div className="w-20 h-20 bg-brand-black/5 border-2 border-brand-black rounded-[2px] flex items-center justify-center mb-6">
          {icon}
        </div>
      )}
      <h3 className="text-xl font-bold text-brand-black mb-2">{title}</h3>
      <p className="text-brand-black/60 max-w-md mb-6">{description}</p>
      <div className="flex flex-col sm:flex-row gap-3">
        {action && (
          action.href ? (
            <Link
              href={action.href}
              onClick={action.onClick}
              className="inline-flex items-center justify-center px-6 py-2.5 bg-brand-primary text-brand-white border-2 border-brand-black rounded-[2px] font-bold hover:translate-x-[2px] hover:translate-y-[2px] transition-transform shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              {action.label}
            </Link>
          ) : (
            <button
              onClick={action.onClick}
              className="inline-flex items-center justify-center px-6 py-2.5 bg-brand-primary text-brand-white border-2 border-brand-black rounded-[2px] font-bold hover:translate-x-[2px] hover:translate-y-[2px] transition-transform shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              {action.label}
            </button>
          )
        )}
        {secondaryAction && (
          <button
            onClick={secondaryAction.onClick}
            className="inline-flex items-center justify-center px-6 py-2.5 text-brand-black border-2 border-brand-black rounded-[2px] font-bold hover:bg-brand-black/5 transition-colors"
          >
            {secondaryAction.label}
          </button>
        )}
      </div>
    </div>
  );
}

// Preset empty states
export function EmptyCampaigns({ onCreate }: { onCreate?: () => void }) {
  const t = useTranslations('empty_states');
  return (
    <EmptyState
      icon={<BarChart3 className="w-10 h-10 text-brand-black/40" />}
      title={t('campaigns_title')}
      description={t('campaigns_description')}
      action={{ label: t('create_campaign'), href: '/app/campaigns', onClick: onCreate }}
    />
  );
}

export function EmptyAutomations({ onCreate }: { onCreate?: () => void }) {
  const t = useTranslations('empty_states');
  return (
    <EmptyState
      icon={<Zap className="w-10 h-10 text-brand-black/40" />}
      title={t('automations_title')}
      description={t('automations_description')}
      action={{ label: t('create_rule'), href: '/app/automations', onClick: onCreate }}
    />
  );
}

export function EmptySearch({ onClear }: { onClear: () => void }) {
  const t = useTranslations('empty_states');
  return (
    <EmptyState
      icon={<Search className="w-10 h-10 text-brand-black/40" />}
      title={t('search_title')}
      description={t('search_description')}
      secondaryAction={{ label: t('clear_search'), onClick: onClear }}
    />
  );
}

export function EmptyNotifications() {
  const t = useTranslations('empty_states');
  return (
    <EmptyState
      icon={<Inbox className="w-10 h-10 text-brand-black/40" />}
      title={t('notifications_title')}
      description={t('notifications_description')}
    />
  );
}

export function EmptyFiles() {
  const t = useTranslations('empty_states');
  return (
    <EmptyState
      icon={<FolderOpen className="w-10 h-10 text-brand-black/40" />}
      title={t('files_title')}
      description={t('files_description')}
    />
  );
}

export function EmptyAds({ onCreate }: { onCreate?: () => void }) {
  const t = useTranslations('empty_states');
  return (
    <EmptyState
      icon={<BarChart3 className="w-10 h-10 text-brand-black/40" />}
      title={t('ads_title') || 'No ads found'}
      description={t('ads_description') || 'Start by creating your first ad campaign'}
      action={{ label: t('create_ad') || 'Create Ad', onClick: onCreate }}
    />
  );
}

export function EmptyOptimizations() {
  const t = useTranslations('empty_states');
  return (
    <EmptyState
      icon={<Zap className="w-10 h-10 text-brand-black/40" />}
      title={t('optimizations_title') || 'No optimization strategies'}
      description={t('optimizations_description') || 'Enable optimization strategies to improve campaign performance'}
    />
  );
}

export function EmptySupport() {
  const t = useTranslations('empty_states');
  return (
    <EmptyState
      icon={<Inbox className="w-10 h-10 text-brand-black/40" />}
      title={t('support_title') || 'No support tickets'}
      description={t('support_description') || 'You have no open support tickets'}
    />
  );
}
