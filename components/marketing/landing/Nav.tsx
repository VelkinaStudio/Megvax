'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslations } from '@/lib/i18n';

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const t = useTranslations('navigation');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { href: '/#features', label: t('features') },
    { href: '/pricing', label: t('pricing') },
    { href: '/contact', label: t('contact') },
  ];

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#FAFAF8]/70 backdrop-blur-xl saturate-[1.8] border-b border-black/[0.04]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="text-xl font-bold text-[#1A1A1A] tracking-[-0.02em]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            MegVax
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-[#6B7280] hover:text-[#1A1A1A] transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-[#1A1A1A]"
            >
              {t('login')}
            </Link>
            <Link
              href="/signup"
              className="bg-[#2563EB] text-white rounded-full px-5 py-2 text-sm font-medium hover:bg-[#1D4ED8] shadow-sm hover:shadow-md hover:-translate-y-px transition-all duration-200"
            >
              {t('signup')}
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-[#1A1A1A]"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden bg-[#FAFAF8] border-b border-black/[0.06]"
          >
            <div className="max-w-5xl mx-auto px-6 py-4 flex flex-col gap-4">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm text-[#6B7280] hover:text-[#1A1A1A] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <hr className="border-black/[0.06]" />
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="text-sm font-medium text-[#1A1A1A]"
              >
                {t('login')}
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileOpen(false)}
                className="bg-[#2563EB] text-white rounded-full px-5 py-2 text-sm font-medium hover:bg-[#1D4ED8] transition-colors text-center"
              >
                {t('signup')}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
