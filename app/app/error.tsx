'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { RefreshCw, LayoutDashboard } from 'lucide-react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[MegVax Dashboard] Hata:', error);
  }, [error]);

  return (
    <div className="flex-1 flex items-center justify-center px-6 py-16">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mx-auto mb-5 w-14 h-14 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center">
          <svg
            className="w-7 h-7 text-red-500"
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
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Bir sorun oluştu
        </h2>
        <p className="text-gray-500 mb-6 text-sm leading-relaxed">
          Bu sayfayı yüklerken beklenmeyen bir hata meydana geldi.
          Aşağıdaki butona tıklayarak tekrar deneyebilirsiniz.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Tekrar Dene
          </button>
          <Link
            href="/app/dashboard"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" />
            Panele Dön
          </Link>
        </div>

        {error.digest && (
          <p className="mt-6 text-xs text-gray-300 font-mono">
            Hata kodu: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
