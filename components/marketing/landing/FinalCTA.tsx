'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useTranslations } from '@/lib/i18n';
import { ScrollReveal } from './ScrollReveal';

const checks = [
  '✓ Kurulum 2 dakika',
  '✓ Kredi kartı gerekmez',
  '✓ İstediğin zaman iptal',
];

export function FinalCTA() {
  const t = useTranslations('landing');

  return (
    <section
      className="py-32"
      style={{
        background:
          'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(37,99,235,0.03), transparent)',
      }}
    >
      <div className="max-w-2xl mx-auto px-6 text-center">
        <ScrollReveal>
          <h2
            className="text-[36px] font-bold text-[#1A1A1A]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {t('cta_heading')}
          </h2>

          <p className="mt-4 text-[15px] text-[#6B7280] max-w-md mx-auto">
            {t('cta_subtitle')}
          </p>

          <Link
            href="/signup"
            className="mt-8 inline-flex items-center gap-2.5 px-9 py-4 bg-[#2563EB] text-white text-[16px] font-semibold rounded-xl shadow-[0_4px_24px_rgba(37,99,235,0.25)] hover:bg-[#1D4ED8] hover:shadow-[0_8px_32px_rgba(37,99,235,0.35)] transition-all duration-200"
          >
            {t('cta_button')}
            <ArrowRight className="w-4.5 h-4.5" />
          </Link>

          <p className="mt-4 text-[13px] text-[#71717A]">
            {t('cta_trust')}
          </p>

          <div className="mt-6 flex items-center justify-center gap-6 text-[13px] text-[#6B7280]">
            {checks.map((c) => (
              <span key={c}>{c}</span>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
