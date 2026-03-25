'use client';

import Link from 'next/link';
import { Mail } from 'lucide-react';
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
    <footer className="relative pt-px">
      {/* Gradient top border */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#2563EB]/40 to-transparent" />

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Top row */}
        <div className="flex flex-col md:flex-row gap-8 md:gap-0 md:items-start justify-between">
          {/* Brand column */}
          <div className="flex flex-col gap-3">
            <span
              className="text-xl font-bold text-[#1A1A1A]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              MegVax
            </span>
            <p className="text-[13px] text-[#6B7280] max-w-[260px] leading-relaxed">
              Meta reklamlarınız için AI destekli yönetim platformu
            </p>
          </div>

          {/* Links column */}
          <div className="flex flex-col gap-3">
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

          {/* Contact column */}
          <div className="flex flex-col gap-3">
            <span className="text-[14px] font-medium text-[#1A1A1A]">Bize Ulaşın</span>
            <a
              href="mailto:hello@megvax.com"
              className="flex items-center gap-2 text-[14px] text-[#6B7280] hover:text-[#2563EB] transition-colors"
            >
              <Mail className="w-4 h-4" />
              hello@megvax.com
            </a>
          </div>
        </div>

        {/* Bottom row */}
        <div className="flex flex-col md:flex-row items-center justify-between mt-10 pt-6 border-t border-black/[0.04] gap-4">
          <span className="text-[13px] text-[#9CA3AF]">
            {t('footer_copyright')}
          </span>
          <LanguageSwitcher />
        </div>
      </div>
    </footer>
  );
}
