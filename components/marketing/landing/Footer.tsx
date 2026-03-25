'use client';

import Link from 'next/link';
import { useTranslations } from '@/lib/i18n';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';

export function Footer() {
  const t = useTranslations('landing');

  const links = [
    { href: '/about', label: 'About' },
    { href: '/privacy', label: 'Privacy' },
    { href: '/terms', label: 'Terms' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <footer className="py-12 border-t border-black/[0.06]">
      <div className="max-w-5xl mx-auto px-6">
        {/* Top row */}
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <span
            className="text-xl font-bold text-[#1A1A1A]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            MegVax
          </span>

          <div className="flex flex-wrap items-center gap-6">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[14px] text-[#6B7280] hover:text-[#1A1A1A] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom row */}
        <div className="flex flex-col md:flex-row items-center justify-between mt-8 pt-8 border-t border-black/[0.04] gap-4">
          <span className="text-[13px] text-[#9CA3AF]">
            {t('footer_copyright')}
          </span>
          <LanguageSwitcher />
        </div>
      </div>
    </footer>
  );
}
