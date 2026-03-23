'use client';

import Link from 'next/link';
import { useTranslations } from '@/lib/i18n';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';

export function Footer() {
  const t = useTranslations('landing');

  const links = [
    { href: '/about', label: t('footer_about') },
    { href: '/privacy', label: t('footer_privacy') },
    { href: '/terms', label: t('footer_terms') },
    { href: '/contact', label: t('footer_contact') },
  ];

  return (
    <footer className="border-t border-white/[0.06]">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo + copyright */}
          <div className="flex items-center gap-3">
            <span
              className="text-sm font-bold text-white/60"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              MEGVAX
            </span>
            <span className="text-xs text-white/20">
              {t('footer_copyright')}
            </span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs text-white/25 hover:text-white/50 transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
            <LanguageSwitcher variant="inline" />
          </div>
        </div>
      </div>
    </footer>
  );
}
