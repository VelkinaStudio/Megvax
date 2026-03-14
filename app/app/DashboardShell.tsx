'use client';

import type { ReactNode } from 'react';
import { AppShell } from '@/components/layouts';
import { ToastProvider } from '@/components/ui/Toast';
import { PlatformProvider } from '@/components/dashboard/PlatformContext';
import { useTranslations } from '@/lib/i18n';

export default function DashboardShell({ children }: { children: ReactNode }) {
  const t = useTranslations('aria');
  
  return (
    <PlatformProvider>
      <ToastProvider>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-brand-primary focus:text-brand-white focus:border-2 focus:border-brand-black focus:rounded-[2px]"
        >
          {t('skip_to_content')}
        </a>
        <AppShell>{children}</AppShell>
      </ToastProvider>
    </PlatformProvider>
  );
}
