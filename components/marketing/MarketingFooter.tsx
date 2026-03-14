'use client';

import Link from 'next/link';
import { Twitter, Linkedin, Github, Mail } from 'lucide-react';
import { useTranslations } from '@/lib/i18n';

const socialLinks = [
  { href: 'https://twitter.com/megvax', icon: Twitter, label: 'Twitter' },
  { href: 'https://linkedin.com/company/megvax', icon: Linkedin, label: 'LinkedIn' },
  { href: 'https://github.com/megvax', icon: Github, label: 'GitHub' },
];

export function MarketingFooter() {
  const t = useTranslations('footer');

  const footerLinks = {
    product: [
      { href: '/#features', label: t('features') },
      { href: '/pricing', label: t('pricing') },
      { href: '/about', label: t('about') },
    ],
    support: [
      { href: '/book', label: t('help_center') },
      { href: '/contact', label: t('contact') },
      { href: '/status', label: t('system_status') },
    ],
    legal: [
      { href: '/privacy', label: t('privacy') },
      { href: '/terms', label: t('terms') },
      { href: '/cookies', label: t('cookies') },
    ],
  };

  return (
    <footer className="bg-white text-gray-500 border-t border-gray-100 relative overflow-hidden">
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-12">
          {/* Brand */}
          <div className="lg:col-span-4">
            <Link href="/" className="inline-block text-xl font-bold text-gray-900 mb-4">
              MEGVAX<span className="text-blue-600">.</span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-6 max-w-sm">
              {t('description')}
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 transition-all duration-200"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Grid */}
          <div className="lg:col-span-2 lg:col-start-6">
            <h4 className="text-gray-900 font-semibold mb-4 text-sm">{t('product')}</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-400 hover:text-blue-600 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-gray-900 font-semibold mb-4 text-sm">{t('support_title')}</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-400 hover:text-blue-600 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-gray-900 font-semibold mb-4 text-sm">{t('legal_title')}</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-400 hover:text-blue-600 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} Megvax Inc. {t('rights')}
          </p>
          <div className="flex items-center gap-6">
            <a
              href="mailto:hello@megvax.com"
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-blue-600 transition-colors"
            >
              <Mail className="w-3 h-3" />
              hello@megvax.com
            </a>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-xs text-gray-400">{t('systems_normal')}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
