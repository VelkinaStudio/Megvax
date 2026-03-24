'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';
import { useTranslations } from '@/lib/i18n';

export function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const t = useTranslations('navigation');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { href: '/#features', label: t('features') },
    { href: '/pricing', label: t('pricing') },
    { href: '/about', label: t('about') },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#0A0A0F]/90 backdrop-blur-xl border-b border-white/[0.06]'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="text-lg font-bold tracking-tight text-white"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            MEGVAX
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[13px] font-medium text-white/40 hover:text-white/80 transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-5">
            <Link
              href="/login"
              className="text-[13px] font-medium text-white/40 hover:text-white/80 transition-colors duration-200"
            >
              {t('login')}
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#2563EB] text-white text-[13px] font-semibold rounded-lg hover:bg-[#1D4ED8] transition-colors duration-200"
            >
              {t('signup')}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 text-white/60 hover:text-white"
            aria-label="Menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {open && (
          <div className="md:hidden pb-6 border-t border-white/[0.06] pt-4 bg-[#0A0A0F]/95 backdrop-blur-xl">
            <div className="flex flex-col gap-4">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="text-sm font-medium text-white/60 hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <hr className="border-white/[0.06]" />
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-white/60 hover:text-white transition-colors"
              >
                {t('login')}
              </Link>
              <Link
                href="/signup"
                onClick={() => setOpen(false)}
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
