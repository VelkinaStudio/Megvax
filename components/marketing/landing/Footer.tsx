'use client';

import Link from 'next/link';
import { useTranslations } from '@/lib/i18n';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';

const columns = [
  {
    titleKey: null,
    title: 'Product',
    links: [
      { href: '/about', key: 'footer_about' },
      { href: '/pricing', label: 'Fiyatlar' },
      { href: '/#ozellikler', label: 'Ürün' },
    ],
  },
  {
    titleKey: null,
    title: 'Support',
    links: [
      { href: '/contact', key: 'footer_contact' },
      { href: '/status', label: 'Durum' },
    ],
  },
  {
    titleKey: null,
    title: 'Legal',
    links: [
      { href: '/privacy', label: 'Gizlilik' },
      { href: '/terms', label: 'Kullanım Şartları' },
      { href: '/cookies', label: 'Çerezler' },
    ],
  },
] as const;

export function Footer() {
  const t = useTranslations('landing');

  return (
    <footer className="relative pt-px">
      {/* Top gradient border */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#2563EB]/40 to-transparent" />

      <div className="max-w-6xl mx-auto px-6 py-16 md:py-20">
        {/* 4-column grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-8">
          {/* Product */}
          <div className="flex flex-col gap-3">
            <span className="text-sm font-semibold text-landing-text mb-1">
              Ürün
            </span>
            {columns[0].links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[14px] text-landing-text-muted hover:text-landing-text transition-colors"
              >
                {'key' in link ? t(link.key as string) : link.label}
              </Link>
            ))}
          </div>

          {/* Support */}
          <div className="flex flex-col gap-3">
            <span className="text-sm font-semibold text-landing-text mb-1">
              Destek
            </span>
            {columns[1].links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[14px] text-landing-text-muted hover:text-landing-text transition-colors"
              >
                {'key' in link ? t(link.key as string) : link.label}
              </Link>
            ))}
          </div>

          {/* Legal */}
          <div className="flex flex-col gap-3">
            <span className="text-sm font-semibold text-landing-text mb-1">
              Yasal
            </span>
            {columns[2].links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[14px] text-landing-text-muted hover:text-landing-text transition-colors"
              >
                {'key' in link ? t(link.key as string) : link.label}
              </Link>
            ))}
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-3">
            <span className="text-sm font-semibold text-landing-text mb-1">
              {t('footer_contact_title')}
            </span>
            <a
              href="mailto:hello@megvax.com"
              className="text-[14px] text-landing-text-muted hover:text-[#2563EB] transition-colors"
            >
              hello@megvax.com
            </a>
            <span className="text-[14px] text-landing-text-muted">
              İstanbul, Türkiye
            </span>
          </div>
        </div>

        {/* Bottom row */}
        <div className="h-px bg-gradient-to-r from-transparent via-landing-card-border to-transparent mt-12 mb-8" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#2563EB] flex items-center justify-center">
              <span
                className="text-white font-bold text-xs"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                M
              </span>
            </div>
            <span
              className="text-sm font-medium text-landing-text"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              MegVax
            </span>
          </div>

          <span className="text-[13px] text-[#71717A]">
            {t('footer_copyright')}
          </span>

          <LanguageSwitcher />
        </div>
      </div>
    </footer>
  );
}
