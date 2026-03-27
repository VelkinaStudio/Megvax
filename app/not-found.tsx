'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslations } from '@/lib/i18n';
import { Home, ArrowLeft } from 'lucide-react';

const spring = { type: 'spring' as const, stiffness: 100, damping: 20 };

export default function NotFound() {
  const t = useTranslations('not_found');

  return (
    <div className="min-h-screen bg-[#0C0D14] flex items-center justify-center px-6 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-[#2563EB]/8 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-lg w-full text-center">
        {/* Glitched 404 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ...spring, delay: 0.1 }}
          className="relative mb-6"
        >
          <span className="text-[120px] sm:text-[160px] font-bold tracking-tighter leading-none bg-gradient-to-b from-white/15 to-white/[0.03] bg-clip-text text-transparent select-none" style={{ fontFamily: 'var(--font-display)' }}>
            404
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.2 }}
          className="text-xl sm:text-2xl font-bold text-white mb-3"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {t('title')}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.3 }}
          className="text-white/40 mb-10 max-w-sm mx-auto leading-relaxed"
        >
          {t('description')}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Link
            href="/"
            className="glow-button inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-[#2563EB] text-white rounded-xl font-medium text-sm hover:bg-[#1D4ED8] transition-all duration-300 shadow-lg shadow-[#2563EB]/25"
          >
            <Home className="w-4 h-4" />
            {t('go_home')}
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border border-white/10 text-white/60 rounded-xl font-medium text-sm hover:bg-white/5 hover:text-white transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('go_back')}
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-14 pt-8 border-t border-white/[0.06]"
        >
          <p className="text-xs text-white/25 mb-4">{t('looking_for')}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center text-sm">
            <Link href="/app/dashboard" className="text-[#2563EB] hover:text-[#3B82F6] transition-colors">{t('link_dashboard')}</Link>
            <Link href="/pricing" className="text-[#2563EB] hover:text-[#3B82F6] transition-colors">{t('link_pricing')}</Link>
            <Link href="/contact" className="text-[#2563EB] hover:text-[#3B82F6] transition-colors">{t('link_contact')}</Link>
            <Link href="/status" className="text-[#2563EB] hover:text-[#3B82F6] transition-colors">{t('link_status')}</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
