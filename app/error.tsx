'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { RefreshCw, Home } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[MegVax] Unhandled error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center px-6">
      {/* Background glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 40%, #1E1B2E 0%, #0A0A0F 70%)',
        }}
      />

      <div className="relative z-10 max-w-lg w-full text-center">
        {/* Icon */}
        <div className="mx-auto mb-6 w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
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
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">
          Bir sorun oluştu
        </h1>
        <p className="text-white/50 mb-8 leading-relaxed">
          Beklenmeyen bir hata meydana geldi. Sayfayı yenileyerek tekrar
          deneyebilirsiniz. Sorun devam ederse bizimle iletişime geçin.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#2563EB] text-white text-[15px] font-semibold rounded-xl hover:bg-[#1D4ED8] transition-all duration-200 hover:shadow-[0_0_40px_rgba(37,99,235,0.25)]"
          >
            <RefreshCw className="w-4 h-4" />
            Tekrar Dene
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-white/10 text-white/70 text-[15px] font-medium rounded-xl hover:bg-white/5 hover:text-white transition-all duration-200"
          >
            <Home className="w-4 h-4" />
            Ana Sayfa
          </Link>
        </div>

        {error.digest && (
          <p className="mt-8 text-xs text-white/20 font-mono">
            Hata kodu: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
