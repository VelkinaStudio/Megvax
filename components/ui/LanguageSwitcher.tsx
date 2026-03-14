'use client';

import { useState } from 'react';
import { Globe, Check } from 'lucide-react';
import { useTranslations, useLocale, useSetLocale } from '@/lib/i18n';

interface LanguageSwitcherProps {
  variant?: 'dropdown' | 'inline';
  className?: string;
}

const languageLabels: Record<string, string> = {
  tr: 'TR',
  en: 'EN'
};

const languageNames: Record<string, string> = {
  tr: 'Türkçe',
  en: 'English'
};

const locales = ['tr', 'en'] as const;
type Locale = typeof locales[number];

export function LanguageSwitcher({ variant = 'dropdown', className = '' }: LanguageSwitcherProps) {
  const t = useTranslations('language');
  const currentLocale = useLocale();
  const setLocale = useSetLocale();
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = (newLocale: Locale) => {
    if (newLocale === currentLocale) {
      setIsOpen(false);
      return;
    }
    
    setLocale(newLocale);
    setIsOpen(false);
  };

  if (variant === 'inline') {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        {locales.map((locale) => (
          <button
            key={locale}
            onClick={() => handleLanguageChange(locale)}
            className={`px-2 py-1 text-sm font-medium rounded transition-colors ${
              currentLocale === locale
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
            aria-label={locale === 'tr' ? t('turkish') : t('english')}
            aria-current={currentLocale === locale ? 'true' : undefined}
          >
            {languageLabels[locale]}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={t('title')}
      >
        <Globe className="w-4 h-4" />
        <span>{languageLabels[currentLocale]}</span>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <ul
            className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
            role="listbox"
            aria-label={t('title')}
          >
            {locales.map((locale) => (
              <li key={locale}>
                <button
                  onClick={() => handleLanguageChange(locale)}
                  className={`w-full flex items-center justify-between px-4 py-2 text-sm text-left hover:bg-gray-50 transition-colors ${
                    currentLocale === locale
                      ? 'text-blue-600 font-medium'
                      : 'text-gray-700'
                  }`}
                  role="option"
                  aria-selected={currentLocale === locale}
                >
                  <span>{languageNames[locale]}</span>
                  {currentLocale === locale && (
                    <Check className="w-4 h-4" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
