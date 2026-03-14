'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from '@/lib/i18n';
import {
  LayoutDashboard,
  Target,
  Sparkles,
  PieChart,
  CreditCard,
  Users,
  HelpCircle,
  Menu,
  X,
  ChevronLeft,
  Lightbulb,
  Layers,
  Settings,
  LogOut,
  CalendarDays,
} from 'lucide-react';
import { Badge } from '@/components/ui';

interface NavItem {
  labelKey: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  descriptionKey?: string;
}

const navigationItems: NavItem[] = [
  {
    labelKey: 'dashboard',
    href: '/app/dashboard',
    icon: LayoutDashboard,
    descriptionKey: 'dashboard_desc',
  },
  {
    labelKey: 'campaigns',
    href: '/app/campaigns',
    icon: Target,
    descriptionKey: 'campaigns_desc',
  },
  {
    labelKey: 'optimizations',
    href: '/app/optimizations',
    icon: Lightbulb,
    badge: 3,
    descriptionKey: 'optimizations_desc',
  },
  {
    labelKey: 'all_ads',
    href: '/app/all-ads',
    icon: Layers,
    descriptionKey: 'all_ads_desc',
  },
  {
    labelKey: 'insights',
    href: '/app/insights',
    icon: PieChart,
    descriptionKey: 'insights_desc',
  },
  {
    labelKey: 'accounts',
    href: '/app/accounts',
    icon: Users,
    descriptionKey: 'accounts_desc',
  },
  {
    labelKey: 'finance',
    href: '/app/finance',
    icon: CreditCard,
    descriptionKey: 'finance_desc',
  },
  {
    labelKey: 'meetings',
    href: '/app/meetings',
    icon: CalendarDays,
    descriptionKey: 'meetings_desc',
  },
  {
    labelKey: 'support',
    href: '/app/support',
    icon: HelpCircle,
    descriptionKey: 'support_desc',
  },
  {
    labelKey: 'settings',
    href: '/app/settings',
    icon: Settings,
    descriptionKey: 'settings_desc',
  },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('navigation');

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      sessionStorage.clear();
    }
    router.push('/login');
  };

  return (
    <aside
      className={`
        fixed left-0 top-0 h-full
        bg-white border-r border-gray-200
        transition-all duration-300 ease-out
        flex flex-col
        z-40
        ${collapsed ? 'w-20' : 'w-64'}
      `}
    >
      {/* Logo & Toggle */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        {!collapsed && (
          <h1 className="text-xl font-bold text-gray-900">
            Mega<span className="text-accent-primary">Vax</span>
          </h1>
        )}
        {collapsed && (
          <div className="w-full flex justify-center">
            <span className="text-xl font-bold text-accent-primary">M</span>
          </div>
        )}
        {onToggle && (
          <button
            onClick={onToggle}
            className="
              p-1.5 rounded-md
              text-gray-400 hover:text-gray-600 hover:bg-gray-100
              transition-colors duration-150
            "
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeft
              className={`w-5 h-5 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''
                }`}
            />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg
                    transition-all duration-150
                    group relative
                    ${isActive
                      ? 'bg-accent-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />

                  {!collapsed && (
                    <>
                      <span className="flex-1 font-medium text-sm">
                        {t(item.labelKey)}
                      </span>
                      {item.badge && (
                        <Badge
                          variant={isActive ? 'neutral' : 'info'}
                          size="sm"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}

                  {/* Tooltip for collapsed state */}
                  {collapsed && (
                    <div
                      className="
                        absolute left-full ml-2 px-3 py-2
                        bg-gray-900 text-white text-sm rounded-md
                        opacity-0 invisible group-hover:opacity-100 group-hover:visible
                        transition-all duration-150
                        whitespace-nowrap z-50
                        pointer-events-none
                      "
                    >
                      {t(item.labelKey)}
                      {item.badge && (
                        <span className="ml-2 text-accent-info">
                          ({item.badge})
                        </span>
                      )}
                    </div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer with Logout */}
      <div className="p-4 border-t border-gray-200 space-y-3">
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className={`
            w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
            text-red-600 hover:bg-red-50 transition-colors
            ${collapsed ? 'justify-center' : ''}
          `}
          title={collapsed ? t('logout') : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && (
            <span className="font-medium text-sm">{t('logout')}</span>
          )}
        </button>
        
        {!collapsed ? (
          <div className="text-xs text-gray-500 text-center">
            <p>MegaVax v2.0</p>
            <p className="mt-1">© 2026</p>
          </div>
        ) : (
          <div className="text-xs text-gray-400 text-center">v2</div>
        )}
      </div>
    </aside>
  );
}

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('navigation');

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      sessionStorage.clear();
    }
    router.push('/login');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        className="
          fixed left-0 top-0 h-full w-64
          bg-white
          z-50 lg:hidden
          animate-in slide-in-from-left duration-300
        "
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">
            Mega<span className="text-accent-primary">Vax</span>
          </h1>
          <button
            onClick={onClose}
            className="
              p-1.5 rounded-md
              text-gray-400 hover:text-gray-600 hover:bg-gray-100
              transition-colors duration-150
            "
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-1">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg
                      transition-all duration-150
                      ${isActive
                        ? 'bg-accent-primary text-white'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="flex-1 font-medium text-sm">
                      {t(item.labelKey)}
                    </span>
                    {item.badge && (
                      <Badge
                        variant={isActive ? 'neutral' : 'info'}
                        size="sm"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer with Logout */}
        <div className="p-4 border-t border-gray-200 space-y-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium text-sm">{t('logout')}</span>
          </button>
          
          <div className="text-xs text-gray-500 text-center">
            <p>MegaVax v2.0</p>
            <p className="mt-1">© 2026</p>
          </div>
        </div>
      </aside>
    </>
  );
}
