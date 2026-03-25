'use client';

import { Nav } from '@/components/marketing/landing/Nav';
import { Footer } from '@/components/marketing/landing/Footer';
import { useTranslations } from '@/lib/i18n';

export default function TermsPage() {
  const t = useTranslations('legal');

  const sections = [
    { title: t('terms_acceptance_title'), content: t('terms_acceptance_content') },
    { title: t('terms_service_title'), content: t('terms_service_content') },
    { title: t('terms_accounts_title'), content: t('terms_accounts_content') },
    { title: t('terms_payment_title'), content: t('terms_payment_content') },
    { title: t('terms_ip_title'), content: t('terms_ip_content') },
    { title: t('terms_limitation_title'), content: t('terms_limitation_content') },
    { title: t('terms_termination_title'), content: t('terms_termination_content') },
    { title: t('terms_governing_title'), content: t('terms_governing_content') },
  ];

  return (
    <main className="min-h-screen bg-[#FAFAF8]">
      <Nav />
      <div className="container mx-auto px-6 pt-28 pb-20 max-w-3xl">
        <h1 className="text-4xl font-extrabold text-[#1A1A1A] mb-3 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>{t('terms_title')}</h1>
        <p className="text-sm text-[#9CA3AF] mb-12">{t('last_updated')}: 2025-02-01</p>
        <div className="space-y-10">
          {sections.map((s, i) => (
            <section key={i}>
              <h2 className="text-lg font-bold text-[#1A1A1A] mb-3">{s.title}</h2>
              <p className="text-[#6B7280] leading-relaxed text-[15px]">{s.content}</p>
            </section>
          ))}
        </div>
      </div>
      <Footer />
    </main>
  );
}
