'use client';

import { useState, useEffect } from 'react';
import { X, Cookie } from 'lucide-react';
import { useTranslations } from '@/lib/i18n';
import Link from 'next/link';

const COOKIE_CONSENT_KEY = 'megvax_cookie_consent';

export function CookieConsent() {
  const t = useTranslations('cookies');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Small delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 1000);
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

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-xl shadow-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="hidden sm:flex w-12 h-12 bg-blue-100 rounded-lg items-center justify-center flex-shrink-0">
            <Cookie className="w-6 h-6 text-blue-600" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('title')}
            </h3>
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              {t('description')}{' '}
              <Link href="/privacy" className="text-blue-600 hover:text-blue-700 underline">
                {t('privacy_link')}
              </Link>
              {' '}{t('and')}{' '}
              <Link href="/cookies" className="text-blue-600 hover:text-blue-700 underline">
                {t('cookie_link')}
              </Link>.
            </p>
            
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleAccept}
                className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t('accept_all')}
              </button>
              <button
                onClick={handleDecline}
                className="px-5 py-2.5 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200 transition-colors"
              >
                {t('decline_optional')}
              </button>
            </div>
          </div>

          <button
            onClick={handleDecline}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            aria-label={t('close')}
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
