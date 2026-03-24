'use client';

import Link from 'next/link';
import { useTranslations } from '@/lib/i18n';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';

export function Footer() {
  const t = useTranslations('landing');

  const productLinks = [
    { href: '/#features', label: t('footer_features') },
    { href: '/pricing', label: t('footer_pricing') },
    { href: '/book', label: t('footer_demo') },
  ];

  const companyLinks = [
    { href: '/about', label: t('footer_about') },
    { href: '/contact', label: t('footer_contact') },
    { href: '/status', label: t('footer_status') },
  ];

  const legalLinks = [
    { href: '/privacy', label: t('footer_privacy') },
    { href: '/terms', label: t('footer_terms') },
  ];

  return (
    <footer className="border-t border-white/[0.05]">
      <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2">
            <span
              className="text-base font-bold text-white/70"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              MEGVAX
            </span>
            <p className="mt-3 text-xs text-white/30 max-w-xs leading-relaxed">
              {t('footer_tagline')}
            </p>
            <div className="mt-4">
              <LanguageSwitcher variant="inline" />
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">
              {t('footer_product_heading')}
            </h4>
            <ul className="space-y-2">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs text-white/35 hover:text-white/60 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">
              {t('footer_company_heading')}
            </h4>
            <ul className="space-y-2">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs text-white/35 hover:text-white/60 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">
              {t('footer_legal_heading')}
            </h4>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs text-white/35 hover:text-white/60 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-white/[0.04] flex flex-col md:flex-row items-center justify-between gap-3">
          <span className="text-[11px] text-white/15">
            {t('footer_copyright')}
          </span>
          <a
            href="mailto:hello@megvax.com"
            className="text-[11px] text-white/15 hover:text-white/30 transition-colors"
          >
            hello@megvax.com
          </a>
        </div>
      </div>
    </footer>
  );
}
