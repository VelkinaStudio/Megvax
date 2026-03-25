'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useTranslations } from '@/lib/i18n';
import { ScrollReveal } from './ScrollReveal';

export function FinalCTA() {
  const t = useTranslations('landing');

  return (
    <section className="py-32">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <ScrollReveal>
          <h2
            className="text-[36px] font-bold text-[#1A1A1A]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {t('cta_heading')}
          </h2>

          <Link
            href="/signup"
            className="mt-8 inline-flex items-center gap-2.5 px-7 py-3.5 bg-[#2563EB] text-white text-[15px] font-semibold rounded-xl hover:bg-[#1D4ED8] hover:shadow-[0_0_30px_rgba(37,99,235,0.2)] transition-all duration-200"
          >
            {t('cta_button')}
            <ArrowRight className="w-4 h-4" />
          </Link>

          <p className="mt-4 text-[13px] text-[#71717A]">
            {t('cta_trust')}
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
