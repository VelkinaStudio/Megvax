'use client';

import { useTranslations } from '@/lib/i18n';
import { LegalPageLayout } from '@/components/layouts/LegalPageLayout';

export default function CookiesPage() {
  const t = useTranslations('legal');

  const sections = [
    { id: 'what',       number: '1', title: t('cookies_what_title'),      content: t('cookies_what_content') },
    { id: 'types',      number: '2', title: t('cookies_types_title'),     content: t('cookies_types_content') },
    { id: 'purpose',    number: '3', title: t('cookies_purpose_title'),   content: t('cookies_purpose_content') },
    { id: 'management', number: '4', title: t('cookies_manage_title'),    content: t('cookies_manage_content') },
    { id: 'thirdparty', number: '5', title: t('cookies_thirdparty_title'), content: t('cookies_thirdparty_content') },
  ];

  return (
    <LegalPageLayout
      pageTitle={t('cookies_title')}
      effectiveDate={t('effective_date_value')}
      lastUpdated="2026-03-27"
      sections={sections}
    />
  );
}
