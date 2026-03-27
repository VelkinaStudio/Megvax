'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { RefreshCw, Home } from 'lucide-react';
import { useTranslations } from '@/lib/i18n';

const spring = { type: 'spring' as const, stiffness: 100, damping: 20 };

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('errors');

  useEffect(() => {
    console.error('[MegVax] Unhandled error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0C0D14] flex items-center justify-center px-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] rounded-full bg-red-500/8 blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-lg w-full text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ...spring }}
          className="mx-auto mb-6 w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center"
        >
          <svg
            className="w-8 h-8 text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
            />
          </svg>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.1 }}
          className="text-2xl font-bold text-white mb-3"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {t('global_title')}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.2 }}
          className="text-white/40 mb-8 leading-relaxed max-w-sm mx-auto"
        >
          {t('global_description')}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <button
            onClick={reset}
            className="glow-button inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-[#2563EB] text-white rounded-xl font-medium text-sm hover:bg-[#1D4ED8] transition-all duration-300 shadow-lg shadow-[#2563EB]/25"
          >
            <RefreshCw className="w-4 h-4" />
            {t('retry')}
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border border-white/10 text-white/60 rounded-xl font-medium text-sm hover:bg-white/5 hover:text-white transition-all duration-300"
          >
            <Home className="w-4 h-4" />
            {t('go_home')}
          </Link>
        </motion.div>

        {error.digest && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-10 text-xs text-white/15 font-mono"
          >
            {t('error_code')}: {error.digest}
          </motion.p>
        )}
      </div>
    </div>
  );
}
