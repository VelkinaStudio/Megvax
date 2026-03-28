'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart2,
  Users,
  CreditCard,
  Receipt,
  ScrollText,
  Menu,
  X,
  LogOut,
  Shield,
  Settings,
  Mail,
  TrendingUp,
  CalendarDays,
} from 'lucide-react';
import { ToastProvider } from '@/components/ui/ToastContext';
import { useTranslations } from '@/lib/i18n';
import { useAuth } from '@/lib/auth-context';

const navItemDefs = [
  { key: 'nav_overview', href: '/admin/overview', icon: BarChart2 },
  { key: 'nav_users', href: '/admin/users', icon: Users },
  { key: 'nav_analytics', href: '/admin/analytics', icon: TrendingUp },
  { key: 'nav_subscriptions', href: '/admin/subscriptions', icon: CreditCard },
  { key: 'nav_invoices', href: '/admin/invoices', icon: Receipt },
  { key: 'nav_messages', href: '/admin/messages', icon: Mail },
  { key: 'nav_meetings', href: '/admin/meetings', icon: CalendarDays },
  { key: 'nav_settings', href: '/admin/settings', icon: Settings },
  { key: 'nav_audit', href: '/admin/audit', icon: ScrollText },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations('admin');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();

  useEffect(() => {
    if (auth.isLoading) return;
    if (!auth.isAuthenticated || !auth.user?.isAdmin) {
      router.replace('/admin-login');
    }
  }, [auth.isLoading, auth.isAuthenticated, auth.user, router]);

  const handleLogout = async () => {
    await auth.logout();
    router.push('/admin-login');
  };

  const isLoading = auth.isLoading;
  const isAuthenticated = auth.isAuthenticated && auth.user?.isAdmin;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <aside
          className={`
            w-64 bg-white border-r border-gray-200 flex-shrink-0 flex flex-col h-screen fixed left-0 top-0 z-50 shadow-sm transition-transform duration-300 ease-in-out
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            md:translate-x-0
          `}
        >
          <div className="p-6 pb-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-xl font-black text-gray-900 tracking-tighter">MEGVAX</h1>
                <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full uppercase tracking-widest border border-blue-200">
                  Admin
                </span>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="md:hidden p-1 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <p className="text-xs font-medium text-gray-500 uppercase">Mode</p>
              <p className="text-sm font-semibold text-gray-900 mt-1">Internal Dashboard</p>
              <p className="text-xs text-gray-500 mt-1">Stripe + Analytics</p>
            </div>
          </div>

          <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
            {navItemDefs.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300
                    ${isActive
                      ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-blue-600'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                  <span>{t(item.key)}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-200 space-y-2">
            <Link
              href="/app/dashboard"
              className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all border border-transparent hover:border-gray-100"
            >
              <Settings className="w-5 h-5" />
              {t('nav_user_dashboard')}
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all w-full border border-transparent hover:border-red-100"
            >
              <LogOut className="w-5 h-5" />
              {t('logout')}
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col w-full md:ml-64">
          {/* Top Bar */}
          <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 md:px-6 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="flex-1 md:flex-none" />
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">Admin</p>
                  <p className="text-xs font-medium text-gray-400 tracking-tight">admin@megvax.com</p>
                </div>
                <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-6 md:p-8 overflow-x-hidden">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>

        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </div>
    </ToastProvider>
  );
}
