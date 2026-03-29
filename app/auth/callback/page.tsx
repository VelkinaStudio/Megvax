'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api, setAccessToken } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

export default function AuthCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('code');
    const provider = searchParams.get('provider');

    if (!code) {
      setError('Giriş başarısız — yetkilendirme kodu alınamadı.');
      return;
    }

    // Exchange the short-lived code for tokens via POST
    api<{ accessToken: string }>('/auth/oauth/exchange', {
      method: 'POST',
      body: { code },
      skipAuth: true,
    })
      .then((data) => {
        setAccessToken(data.accessToken);
        return refreshUser();
      })
      .then(() => {
        router.replace('/app/dashboard');
      })
      .catch(() => {
        setError(`${provider || 'OAuth'} ile giriş başarısız oldu.`);
      });
  }, [searchParams, router, refreshUser]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <a href="/login" className="text-blue-600 hover:underline">Giriş sayfasına dön</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Giriş yapılıyor...</p>
      </div>
    </div>
  );
}
