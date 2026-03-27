'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from 'framer-motion';
import { useTranslations } from '@/lib/i18n';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';

export function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const t = useTranslations('navigation');

  const { scrollY } = useScroll();
  const bgOpacity = useTransform(scrollY, [0, 100], [0, 0.8]);
  const borderOpacity = useTransform(scrollY, [0, 100], [0, 0.05]);

  const links = [
    { href: '#features', label: t('features') },
    { href: '/pricing', label: t('pricing') },
    { href: '/contact', label: t('contact') },
  ];

  return (
    <>
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md"
        style={{
          backgroundColor: useTransform(bgOpacity, (v) => `rgba(250, 250, 248, ${v})`),
          borderBottom: useTransform(borderOpacity, (v) => `1px solid rgba(0, 0, 0, ${v})`),
        }}
      >
        <div className="mx-auto max-w-6xl px-6 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            {/* M logo with infinite glow pulse */}
            <motion.div
              className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center"
              animate={{
                boxShadow: [
                  '0 0 6px 0px rgba(37,99,235,0.25)',
                  '0 0 16px 4px rgba(37,99,235,0.45)',
                  '0 0 6px 0px rgba(37,99,235,0.25)',
                ],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              style={{ willChange: 'box-shadow' }}
            >
              <span className="text-white font-bold text-sm" style={{ fontFamily: 'var(--font-display)' }}>M</span>
            </motion.div>
            <span className="text-lg font-semibold tracking-tight text-[#1A1A1A]" style={{ fontFamily: 'var(--font-display)' }}>MegVax</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm text-[#6B7280]">
            {links.map((link) =>
              link.href.startsWith('#') ? (
                <a key={link.href} href={link.href} className="relative py-1 hover:text-[#1A1A1A] transition-colors duration-200 group">
                  {link.label}
                  <span className="absolute bottom-0 left-0 w-0 h-px bg-[#2563EB] group-hover:w-full transition-all duration-300" />
                </a>
              ) : (
                <Link key={link.href} href={link.href} className="relative py-1 hover:text-[#1A1A1A] transition-colors duration-200 group">
                  {link.label}
                  <span className="absolute bottom-0 left-0 w-0 h-px bg-[#2563EB] group-hover:w-full transition-all duration-300" />
                </Link>
              ),
            )}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <LanguageSwitcher variant="inline" />
            <Link href="/login" className="text-sm font-medium text-[#1A1A1A] hover:text-[#2563EB] transition-colors duration-200">
              {t('login')}
            </Link>
            <Link href="/signup" className="glow-button glow-button-always inline-flex items-center px-5 py-2 rounded-full bg-[#2563EB] text-white text-sm font-medium hover:bg-[#1D4ED8] shadow-sm hover:shadow-md hover:-translate-y-px transition-all duration-200">
              {t('signup')}
            </Link>
          </div>

          <button className="md:hidden flex flex-col gap-1.5 w-8 h-8 items-center justify-center" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
            <motion.span className="w-5 h-0.5 bg-[#1A1A1A] rounded-full block" animate={mobileOpen ? { rotate: 45, y: 4 } : { rotate: 0, y: 0 }} transition={{ duration: 0.2 }} />
            <motion.span className="w-5 h-0.5 bg-[#1A1A1A] rounded-full block" animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }} transition={{ duration: 0.2 }} />
            <motion.span className="w-5 h-0.5 bg-[#1A1A1A] rounded-full block" animate={mobileOpen ? { rotate: -45, y: -4 } : { rotate: 0, y: 0 }} transition={{ duration: 0.2 }} />
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div className="fixed inset-0 z-40 pt-16 bg-[#FAFAF8]/95 backdrop-blur-lg md:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <div className="flex flex-col items-center gap-6 pt-10">
              {links.map((link, i) =>
                link.href.startsWith('#') ? (
                  <motion.a key={link.href} href={link.href} className="text-lg font-medium text-[#1A1A1A]" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, duration: 0.3 }} onClick={() => setMobileOpen(false)}>
                    {link.label}
                  </motion.a>
                ) : (
                  <motion.div key={link.href} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, duration: 0.3 }}>
                    <Link href={link.href} className="text-lg font-medium text-[#1A1A1A]" onClick={() => setMobileOpen(false)}>{link.label}</Link>
                  </motion.div>
                ),
              )}
              <motion.div className="flex flex-col items-center gap-4 mt-4" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.3 }}>
                <LanguageSwitcher variant="inline" />
                <Link href="/login" className="text-sm font-medium text-[#1A1A1A]" onClick={() => setMobileOpen(false)}>{t('login')}</Link>
                <Link href="/signup" className="inline-flex items-center px-6 py-3 rounded-full bg-[#2563EB] text-white text-sm font-medium hover:bg-[#1D4ED8] transition-colors" onClick={() => setMobileOpen(false)}>{t('signup')}</Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
