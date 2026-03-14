'use client';

import Link from 'next/link';
import { useTranslations } from '@/lib/i18n';
import { Home, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  const t = useTranslations('not_found');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="text-8xl font-black text-gray-200 mb-4">404</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {t('title')}
        </h1>
        <p className="text-gray-600 mb-8">
          {t('description')}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
          >
            <Home className="w-4 h-4" />
            {t('go_home')}
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border-2 border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('go_back')}
          </button>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-3">{t('looking_for')}</p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Link href="/app/dashboard" className="text-sm text-blue-600 hover:underline">{t('link_dashboard')}</Link>
            <span className="text-gray-300">·</span>
            <Link href="/pricing" className="text-sm text-blue-600 hover:underline">{t('link_pricing')}</Link>
            <span className="text-gray-300">·</span>
            <Link href="/contact" className="text-sm text-blue-600 hover:underline">{t('link_contact')}</Link>
            <span className="text-gray-300">·</span>
            <Link href="/status" className="text-sm text-blue-600 hover:underline">{t('link_status')}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
