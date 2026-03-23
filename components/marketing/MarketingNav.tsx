'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';
import { useTranslations } from '@/lib/i18n';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';

interface MarketingNavProps {
  variant?: 'light' | 'dark';
}

export function MarketingNav({ variant = 'dark' }: MarketingNavProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const t = useTranslations('navigation');

  const navLinks = [
    { href: '/#features', label: t('features') },
    { href: '/pricing', label: t('pricing') },
    { href: '/about', label: t('about') },
  ];

  const isDark = variant === 'dark';

  return (
    <nav className={`sticky top-0 z-50 backdrop-blur-xl ${
      isDark
        ? 'bg-[#0A0A0F]/80 border-b border-white/[0.06]'
        : 'bg-white/80 border-b border-gray-200'
    }`}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className={`text-lg font-bold tracking-tight transition-colors ${
            isDark ? 'text-white' : 'text-gray-900'
          }`} style={{ fontFamily: 'var(--font-display)' }}>
            MEGVAX
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-[13px] font-medium transition-colors ${
                  isDark
                    ? 'text-white/50 hover:text-white'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-5">
            <LanguageSwitcher variant="inline" />
            <Link
              href="/login"
              className={`text-[13px] font-medium transition-colors ${
                isDark
                  ? 'text-white/50 hover:text-white'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {t('login')}
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#2563EB] text-white text-[13px] font-semibold rounded-lg hover:bg-[#1D4ED8] transition-colors"
            >
              {t('signup')}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden p-2 ${isDark ? 'text-white/60 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
            aria-label="Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className={`md:hidden pb-6 border-t pt-4 ${isDark ? 'border-white/[0.06]' : 'border-gray-100'}`}>
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-sm font-medium transition-colors ${
                    isDark ? 'text-white/60 hover:text-white' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <hr className={isDark ? 'border-white/[0.06]' : 'border-gray-100'} />
              <div className="flex items-center justify-between">
                <span className={`text-sm ${isDark ? 'text-white/30' : 'text-gray-400'}`}>Dil</span>
                <LanguageSwitcher variant="inline" />
              </div>
              <hr className={isDark ? 'border-white/[0.06]' : 'border-gray-100'} />
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-sm font-medium transition-colors ${
                  isDark ? 'text-white/60 hover:text-white' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {t('login')}
              </Link>
              <Link
                href="/signup"
                onClick={() => setIsMobileMenuOpen(false)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#2563EB] text-white text-sm font-semibold rounded-lg hover:bg-[#1D4ED8] transition-colors"
              >
                {t('signup')}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
