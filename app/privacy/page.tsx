'use client';

import { MarketingNav } from '@/components/marketing/MarketingNav';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import { useTranslations } from '@/lib/i18n';

export default function PrivacyPage() {
  const t = useTranslations('legal');

  const sections = [
    { title: t('privacy_collect_title'), content: t('privacy_collect_content') },
    { title: t('privacy_use_title'), content: t('privacy_use_content') },
    { title: t('privacy_share_title'), content: t('privacy_share_content') },
    { title: t('privacy_security_title'), content: t('privacy_security_content') },
    { title: t('privacy_cookies_title'), content: t('privacy_cookies_content') },
    { title: t('privacy_rights_title'), content: t('privacy_rights_content') },
    { title: t('privacy_contact_title'), content: t('privacy_contact_content') },
  ];

  return (
    <main className="min-h-screen bg-white">
      <MarketingNav />
      <div className="container mx-auto px-6 pt-28 pb-20 max-w-3xl">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">{t('privacy_title')}</h1>
        <p className="text-sm text-gray-400 mb-12">{t('last_updated')}: 2025-02-01</p>
        <div className="space-y-10">
          {sections.map((s, i) => (
            <section key={i}>
              <h2 className="text-lg font-bold text-gray-900 mb-3">{s.title}</h2>
              <p className="text-gray-600 leading-relaxed text-[15px]">{s.content}</p>
            </section>
          ))}
        </div>
      </div>
      <MarketingFooter />
    </main>
  );
}
