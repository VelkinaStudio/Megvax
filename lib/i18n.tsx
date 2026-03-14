'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import trMessages from '@/messages/tr.json';
import enMessages from '@/messages/en.json';

const messages = {
  tr: trMessages,
  en: enMessages,
};

type Locale = 'tr' | 'en';
type Messages = Record<string, unknown>;

interface I18nContextType {
  locale: Locale;
  messages: Messages;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split('.');
  let value: unknown = obj;

  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = (value as Record<string, unknown>)[key];
    } else {
      return path; // Return key if not found
    }
  }

  return typeof value === 'string' ? value : path;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window === 'undefined') return 'tr';
    const saved = localStorage.getItem('megvax-locale') as Locale;
    if (saved === 'tr' || saved === 'en') return saved;
    const browserLang = navigator.language || '';
    if (browserLang.toLowerCase().startsWith('en')) return 'en';
    return 'tr';
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('megvax-locale')) {
      localStorage.setItem('megvax-locale', locale);
    }
    setMounted(true);
  }, [locale]);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('megvax-locale', newLocale);
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    let value = getNestedValue(messages[locale] as unknown as Record<string, unknown>, key);

    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        value = value.replace(new RegExp(`{${k}}`, 'g'), String(v));
      });
    }

    return value;
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <I18nContext.Provider
        value={{
          locale: 'tr',
          messages: messages.tr,
          setLocale,
          t: (key: string, params?: Record<string, string | number>) => {
            let value = getNestedValue(messages.tr as unknown as Record<string, unknown>, key);
            if (params) {
              Object.entries(params).forEach(([k, v]) => {
                value = value.replace(new RegExp(`{${k}}`, 'g'), String(v));
              });
            }
            return value;
          }
        }}
      >
        {children}
      </I18nContext.Provider>
    );
  }

  return (
    <I18nContext.Provider value={{ locale, messages: messages[locale] as unknown as Messages, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslations(namespace?: string) {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error('useTranslations must be used within I18nProvider');
  }

  return (key: string, params?: Record<string, string | number>): string => {
    const fullKey = namespace ? `${namespace}.${key}` : key;
    return context.t(fullKey, params);
  };
}

export function useLocale() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error('useLocale must be used within I18nProvider');
  }

  return context.locale;
}

export function useSetLocale() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error('useSetLocale must be used within I18nProvider');
  }

  return context.setLocale;
}
