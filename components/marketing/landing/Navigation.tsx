'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useTranslations } from '@/lib/i18n';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';

export function Navigation() {
  const t = useTranslations('navigation');
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { label: t('features'), href: '#features' },
    { label: t('pricing'), href: '/pricing' },
    { label: t('about'), href: '/about' },
  ];
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-[#06060e]/70 backdrop-blur-2xl border-b border-white/[0.04]'
            : 'bg-transparent'
        }`}
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="relative z-10 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                <span className="text-white font-extrabold text-sm">M</span>
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                MEGVAX
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="px-4 py-2 text-[14px] font-medium text-gray-400 hover:text-white transition-colors rounded-lg"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3">
              <LanguageSwitcher />
              <Link
                href="/login"
                className="px-4 py-2 text-[14px] font-medium text-gray-400 hover:text-white transition-colors"
              >
                {t('login')}
              </Link>
              <Link href="/signup">
                <motion.button
                  className="px-5 py-2 text-[14px] font-semibold text-white bg-white/[0.08] border border-white/[0.1] rounded-lg hover:bg-white/[0.14] hover:border-white/[0.18] transition-all"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {t('signup')}
                </motion.button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="absolute inset-0 bg-[#06060e]/95 backdrop-blur-2xl" />
            <motion.nav
              className="relative flex flex-col items-center justify-center h-full gap-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
            >
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.label}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + i * 0.05 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="text-2xl font-semibold text-white hover:text-indigo-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <div className="flex flex-col items-center gap-4 mt-6">
                <LanguageSwitcher />
                <Link href="/login" onClick={() => setIsOpen(false)}>
                  <span className="text-gray-400 font-medium">{t('login')}</span>
                </Link>
                <Link href="/signup" onClick={() => setIsOpen(false)}>
                  <span className="px-6 py-3 bg-white/[0.08] border border-white/[0.1] rounded-xl text-white font-semibold inline-block">
                    {t('signup')}
                  </span>
                </Link>
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
