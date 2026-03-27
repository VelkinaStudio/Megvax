'use client';

import { useTranslations } from '@/lib/i18n';
import { LegalPageLayout } from '@/components/layouts/LegalPageLayout';

export default function PrivacyPage() {
  const t = useTranslations('legal');

  const sections = [
    { id: 'collection', number: '1', title: t('privacy_collect_title'),  content: t('privacy_collect_content') },
    { id: 'usage',      number: '2', title: t('privacy_use_title'),      content: t('privacy_use_content') },
    { id: 'sharing',    number: '3', title: t('privacy_share_title'),    content: t('privacy_share_content') },
    { id: 'retention',  number: '4', title: t('privacy_retention_title'), content: t('privacy_retention_content') },
    { id: 'security',   number: '5', title: t('privacy_security_title'), content: t('privacy_security_content') },
    { id: 'rights',     number: '6', title: t('privacy_rights_title'),   content: t('privacy_rights_content') },
    { id: 'cookies',    number: '7', title: t('privacy_cookies_title'),  content: t('privacy_cookies_content') },
    { id: 'contact',    number: '8', title: t('privacy_contact_title'),  content: t('privacy_contact_content') },
  ];

  return (
    <LegalPageLayout
      pageTitle={t('privacy_title')}
      effectiveDate={t('effective_date_value')}
      lastUpdated="2026-03-27"
      sections={sections}
    />
  );
}
