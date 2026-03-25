'use client';

import { Nav } from '@/components/marketing/landing/Nav';
import { Footer } from '@/components/marketing/landing/Footer';
import { useTranslations } from '@/lib/i18n';

export default function CookiesPage() {
  const t = useTranslations('legal');

  const sections = [
    { title: t('cookies_what_title'), content: t('cookies_what_content') },
    { title: t('cookies_types_title'), content: t('cookies_types_content') },
    { title: t('cookies_manage_title'), content: t('cookies_manage_content') },
  ];

  return (
    <main className="min-h-screen bg-[#FAFAF8]">
      <Nav />
      <div className="container mx-auto px-6 pt-28 pb-20 max-w-3xl">
        <h1 className="text-4xl font-extrabold text-[#1A1A1A] mb-3 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>{t('cookies_title')}</h1>
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
