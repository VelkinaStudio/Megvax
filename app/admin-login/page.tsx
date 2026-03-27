'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Mail, Lock, Eye, EyeOff, Copy, Check, ShieldCheck } from 'lucide-react';
import { Card, Button } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import { useTranslations } from '@/lib/i18n';
import { useAuth } from '@/lib/auth-context';
import { ApiError } from '@/lib/api';

export default function AdminLoginPage() {
  const router = useRouter();
  const toast = useToast();
  const t = useTranslations('auth');
  const { login, isAuthenticated, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState<'email' | 'password' | null>(null);

  // Redirect if already authenticated as admin
  useEffect(() => {
    if (isAuthenticated && user?.isAdmin) {
      router.replace('/admin');
    }
  }, [isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      toast.success(t('admin_login_success'));
      router.push('/admin');
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error(t('admin_login_invalid'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = useCallback((text: string, field: 'email' | 'password') => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 1500);
  }, []);

  const fillCredentials = useCallback(() => {
    setEmail('admin@megvax.com');
    setPassword('admin123');
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Login</h1>
          <p className="text-gray-500 mt-2">Sign in to access the Megvax admin panel</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('email')}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@megvax.com"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('password')}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={isLoading}
          >
            Sign In
          </Button>
        </form>

        {/* Demo Admin Credential */}
        <div className="mt-6 border border-gray-200 bg-gray-50 rounded-lg p-4">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2.5">
            {t('demo_accounts_title')}
          </p>
          <div className="flex items-start gap-3 p-2 rounded-md hover:bg-gray-100 transition-colors group">
            <div className="w-7 h-7 rounded-full bg-gray-200 group-hover:bg-white flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors">
              <ShieldCheck className="w-3.5 h-3.5 text-gray-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-600 mb-1">{t('demo_admin_label')}</p>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 font-mono">
                <span className="truncate">admin@megvax.com</span>
                <button
                  type="button"
                  onClick={() => handleCopy('admin@megvax.com', 'email')}
                  className="flex-shrink-0 p-0.5 rounded hover:bg-gray-200 transition-colors"
                >
                  {copied === 'email' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-gray-400" />}
                </button>
                <span className="text-gray-300">/</span>
                <span>admin123</span>
                <button
                  type="button"
                  onClick={() => handleCopy('admin123', 'password')}
                  className="flex-shrink-0 p-0.5 rounded hover:bg-gray-200 transition-colors"
                >
                  {copied === 'password' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-gray-400" />}
                </button>
              </div>
              <button
                type="button"
                onClick={fillCredentials}
                className="mt-1 text-[10px] text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                {t('click_to_fill')}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <a href="/login" className="text-sm text-blue-600 hover:text-blue-700">
            &larr; Back to user panel
          </a>
        </div>
      </Card>
    </div>
  );
}
