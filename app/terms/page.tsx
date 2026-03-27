'use client';

import { useTranslations } from '@/lib/i18n';
import { LegalPageLayout } from '@/components/layouts/LegalPageLayout';

export default function TermsPage() {
  const t = useTranslations('legal');

  const sections = [
    { id: 'acceptance',   number: '1', title: t('terms_acceptance_title'),  content: t('terms_acceptance_content') },
    { id: 'services',     number: '2', title: t('terms_service_title'),     content: t('terms_service_content') },
    { id: 'accounts',     number: '3', title: t('terms_accounts_title'),    content: t('terms_accounts_content') },
    { id: 'billing',      number: '4', title: t('terms_payment_title'),     content: t('terms_payment_content') },
    { id: 'ip',           number: '5', title: t('terms_ip_title'),          content: t('terms_ip_content') },
    { id: 'liability',    number: '6', title: t('terms_limitation_title'),  content: t('terms_limitation_content') },
    { id: 'termination',  number: '7', title: t('terms_termination_title'), content: t('terms_termination_content') },
    { id: 'governing',    number: '8', title: t('terms_governing_title'),   content: t('terms_governing_content') },
  ];

  return (
    <LegalPageLayout
      pageTitle={t('terms_title')}
      effectiveDate={t('effective_date_value')}
      lastUpdated="2026-03-27"
      sections={sections}
    />
  );
}
