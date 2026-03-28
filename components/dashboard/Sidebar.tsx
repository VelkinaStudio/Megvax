'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Zap, Megaphone, Users, Settings, X, Wand2, Split, CreditCard, BarChart3, LifeBuoy, Shield, LogOut } from 'lucide-react';
import { useTranslations } from '@/lib/i18n';
import { usePlatform } from '@/components/dashboard/PlatformContext';
import { useDashboardQuery } from '@/components/dashboard/useDashboardQuery';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';

// Navigation items are defined inside the component (translated)

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { platform, setPlatform } = usePlatform();
  const { withQuery } = useDashboardQuery();
  const t = useTranslations('navigation');

  const handleLogout = () => {
    // Clear any auth tokens/session data
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      sessionStorage.clear();
    }
    // Redirect to login page
    router.push('/login');
  };

  const navItems = [
    { label: t('dashboard'), href: '/app/dashboard', icon: LayoutDashboard },
    { label: t('optimizations'), href: '/app/optimizations', icon: Zap },
    { label: t('automations'), href: '/app/automations', icon: Split },
    { label: 'AI Kreatif', href: '/app/ai-creative', icon: Wand2 },
    { label: t('campaigns'), href: '/app/campaigns', icon: Megaphone },
    { label: t('insights'), href: '/app/insights', icon: BarChart3 },
    { label: t('finance'), href: '/app/finance', icon: CreditCard },
    { label: t('accounts'), href: '/app/accounts', icon: Users },
    { label: t('support'), href: '/app/support', icon: LifeBuoy },
    { label: 'Admin', href: '/app/admin', icon: Shield },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          w-64 bg-white border-r border-gray-200 flex-shrink-0 flex flex-col h-screen fixed left-0 top-0 z-50 transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
      >
        {/* Header & Platform Switcher */}
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-gray-900">MEGVAX</h1>
              <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md uppercase tracking-wide">
                Beta
              </span>
            </div>
            <button onClick={onClose} className="md:hidden text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>

          {/* Language Switcher */}
          <div className="mb-4">
            <LanguageSwitcher variant="inline" className="w-full justify-center" />
          </div>

          {/* Platform Toggle */}
          <div className="bg-gray-100 p-1 rounded-lg flex">
            <button
              onClick={() => setPlatform('meta')}
              className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-md transition-all ${
                platform === 'meta'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Meta
            </button>
            <button
              type="button"
              disabled
              title="Coming Soon"
              className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-md transition-all cursor-not-allowed opacity-60 ${
                platform === 'google'
                  ? 'bg-white text-red-600 shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              Google
              <span className="text-xs text-gray-400">Soon</span>
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={withQuery(item.href)}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200
                  ${isActive 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                `}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile / Settings */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <Link
            href={withQuery('/app/settings')}
            onClick={onClose}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group"
          >
             <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">
               MD
             </div>
             <div className="flex-1 min-w-0">
               <p className="text-sm font-semibold text-gray-900 truncate">Megvax Demo Inc.</p>
               <p className="text-xs text-gray-500 truncate group-hover:text-blue-600 transition-colors">{t('settings')}</p>
             </div>
             <Settings size={16} className="text-gray-400 group-hover:text-gray-600" />
          </Link>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={18} />
            <span>{t('logout')}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
