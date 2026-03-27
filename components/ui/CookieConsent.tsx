'use client';

import { useState, useEffect } from 'react';
import { X, Cookie } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from '@/lib/i18n';
import Link from 'next/link';

const COOKIE_CONSENT_KEY = 'megvax_cookie_consent';

export function CookieConsent() {
  const t = useTranslations('cookies');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
      accepted: true,
      timestamp: new Date().toISOString(),
      preferences: {
        necessary: true,
        analytics: true,
        marketing: true,
      }
    }));
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
      accepted: false,
      timestamp: new Date().toISOString(),
      preferences: {
        necessary: true,
        analytics: false,
        marketing: false,
      }
    }));
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
        >
          <div className="max-w-3xl mx-auto bg-white border border-black/[0.08] rounded-2xl shadow-xl shadow-black/10 p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="hidden sm:flex w-10 h-10 bg-[#EFF6FF] rounded-xl items-center justify-center flex-shrink-0 border border-[#2563EB]/10">
                <Cookie className="w-5 h-5 text-[#2563EB]" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-[#1A1A1A] mb-1.5" style={{ fontFamily: 'var(--font-display)' }}>
                  {t('title')}
                </h3>
                <p className="text-sm text-[#6B7280] mb-4 leading-relaxed">
                  {t('description')}{' '}
                  <Link href="/privacy" className="text-[#2563EB] hover:text-[#1D4ED8] underline underline-offset-2">
                    {t('privacy_link')}
                  </Link>
                  {' '}{t('and')}{' '}
                  <Link href="/cookies" className="text-[#2563EB] hover:text-[#1D4ED8] underline underline-offset-2">
                    {t('cookie_link')}
                  </Link>.
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleAccept}
                    className="px-5 py-2.5 bg-[#2563EB] text-white text-sm font-semibold rounded-xl hover:bg-[#1D4ED8] transition-all duration-200 hover:shadow-lg hover:shadow-[#2563EB]/20"
                  >
                    {t('accept_all')}
                  </button>
                  <button
                    onClick={handleDecline}
                    className="px-5 py-2.5 bg-[#F3F2EF] text-[#374151] text-sm font-semibold rounded-xl hover:bg-[#E8E7E3] transition-all duration-200"
                  >
                    {t('decline_optional')}
                  </button>
                </div>
              </div>

              <button
                onClick={handleDecline}
                className="p-2 text-[#9CA3AF] hover:text-[#6B7280] hover:bg-[#F3F2EF] rounded-lg transition-colors flex-shrink-0"
                aria-label={t('close')}
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
