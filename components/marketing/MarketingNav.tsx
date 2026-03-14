'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';
import { useTranslations } from '@/lib/i18n';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';

interface MarketingNavProps {
  variant?: 'light' | 'dark';
}

export function MarketingNav({ variant = 'light' }: MarketingNavProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const t = useTranslations('navigation');

  const navLinks = [
    { href: '/#features', label: t('features') },
    { href: '/pricing', label: t('pricing') },
    { href: '/about', label: t('about') },
  ];

  const isDark = variant === 'dark';

  return (
    <nav className={`sticky top-0 z-50 backdrop-blur-md ${
      isDark 
        ? 'bg-gray-900/80 border-b border-white/10' 
        : 'bg-white/80 border-b border-gray-200'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className={`text-xl font-bold transition-colors ${
            isDark 
              ? 'text-white hover:text-blue-400' 
              : 'text-gray-900 hover:text-blue-600'
          }`}>
            MEGVAX
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  isDark 
                    ? 'text-gray-300 hover:text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA + Language */}
          <div className="hidden md:flex items-center gap-4">
            <LanguageSwitcher variant="inline" />
            <Link
              href="/login"
              className={`text-sm font-medium transition-colors ${
                isDark 
                  ? 'text-gray-300 hover:text-white' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t('login')}
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all"
            >
              {t('signup')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden p-2 ${
              isDark 
                ? 'text-gray-300 hover:text-white' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
            aria-label="Menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className={`md:hidden py-4 border-t ${
            isDark ? 'border-white/10' : 'border-gray-100'
          }`}>
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-base font-medium transition-colors ${
                    isDark 
                      ? 'text-gray-300 hover:text-white' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <hr className={isDark ? 'border-white/10' : 'border-gray-100'} />
              <div className="flex items-center justify-between">
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Dil</span>
                <LanguageSwitcher variant="inline" />
              </div>
              <hr className={isDark ? 'border-white/10' : 'border-gray-100'} />
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-base font-medium transition-colors ${
                  isDark 
                    ? 'text-gray-300 hover:text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {t('login')}
              </Link>
              <Link
                href="/signup"
                onClick={() => setIsMobileMenuOpen(false)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-base font-medium rounded-lg hover:bg-blue-700 transition-all"
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
