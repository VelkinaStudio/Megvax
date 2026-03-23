'use client';

import Link from 'next/link';
import { Mail } from 'lucide-react';
import { useTranslations } from '@/lib/i18n';

export function MarketingFooter() {
  const t = useTranslations('footer');

  const links = [
    { href: '/about', label: t('about') },
    { href: '/privacy', label: t('privacy') },
    { href: '/terms', label: t('terms') },
    { href: '/contact', label: t('contact') },
    { href: '/status', label: t('system_status') },
  ];

  return (
    <footer className="bg-[#0A0A0F] border-t border-white/[0.06]">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span
              className="text-sm font-bold text-white/60"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              MEGVAX
            </span>
            <span className="text-xs text-white/20">
              © {new Date().getFullYear()} MegVax. {t('rights')}
            </span>
          </div>

          <div className="flex items-center gap-6 flex-wrap justify-center">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs text-white/25 hover:text-white/50 transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
            <a
              href="mailto:hello@megvax.com"
              className="flex items-center gap-1.5 text-xs text-white/25 hover:text-white/50 transition-colors"
            >
              <Mail className="w-3 h-3" />
              hello@megvax.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
