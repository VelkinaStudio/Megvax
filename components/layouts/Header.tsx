'use client';

import { useState } from 'react';
import { useTranslations } from '@/lib/i18n';
import { Menu, ChevronDown, User, Settings, LogOut, Bell, X, Check, Info, AlertTriangle, Plus } from 'lucide-react';
import { Badge } from '@/components/ui';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useNotifications } from '@/lib/hooks/use-notifications';
import { useAuth } from '@/lib/auth-context';

interface HeaderProps {
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}

export function Header({ onMenuClick, showMenuButton = false }: HeaderProps) {
  const t = useTranslations('navigation');
  const tCommon = useTranslations('common');
  const tHeader = useTranslations('header');
  const router = useRouter();
  const { user, logout } = useAuth();
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const {
    notifications: rawNotifications,
    unreadCount,
    markRead: markAsRead,
    markAllRead: markAllAsRead,
  } = useNotifications();

  // Map hook notification shape to the display shape expected by the panel UI
  const notifications = rawNotifications.map((n) => ({
    id: n.id,
    title: n.title,
    message: n.body ?? '',
    type: (['info', 'success', 'warning', 'error'].includes(n.type)
      ? n.type
      : 'info') as 'info' | 'success' | 'warning' | 'error',
    timestamp: new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    read: !!n.readAt,
  }));

  const getNotificationIcon = (type: 'info' | 'success' | 'warning' | 'error') => {
    switch (type) {
      case 'success':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  // Mock data - will be replaced with real data
  const accounts = [
    { id: '1', name: 'Main Account', status: 'connected' },
    { id: '2', name: 'Test Account', status: 'connected' },
  ];

  const [selectedAccount, setSelectedAccount] = useState(accounts[0]);

  const dateRanges = [
    { value: '7d', label: tHeader('last_7_days') },
    { value: '30d', label: tHeader('last_30_days') },
    { value: 'custom', label: tHeader('custom_range') },
  ];

  const [selectedRange, setSelectedRange] = useState(dateRanges[0]);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left: Menu button + Account selector */}
        <div className="flex items-center gap-4">
          {showMenuButton && (
            <button
              onClick={onMenuClick}
              className="
                p-2 rounded-md
                text-gray-400 hover:text-gray-600 hover:bg-gray-100
                transition-colors duration-150
                lg:hidden
              "
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {/* Account Selector */}
          <div className="relative">
            <button
              onClick={() => setShowAccountMenu(!showAccountMenu)}
              className="
                flex items-center gap-2 px-4 py-2
                border-2 border-gray-300 rounded-md
                hover:border-gray-400 hover:bg-gray-50
                transition-all duration-150
                focus:outline-none focus:ring-4 focus:ring-accent-primary/10
              "
            >
              <div className="flex items-center gap-2">
                <div
                  className={`
                    w-2 h-2 rounded-full
                    ${selectedAccount.status === 'connected'
                      ? 'bg-accent-success'
                      : 'bg-accent-warning'
                    }
                  `}
                />
                <span className="text-sm font-medium text-gray-900">
                  {selectedAccount.name}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {showAccountMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowAccountMenu(false)}
                />
                <div
                  className="
                    absolute top-full left-0 mt-2 w-64
                    bg-white rounded-lg shadow-xl border border-gray-200
                    z-20
                    animate-in fade-in zoom-in-95 duration-150
                  "
                >
                  <div className="p-2">
                    {accounts.map((account) => (
                      <button
                        key={account.id}
                        onClick={() => {
                          setSelectedAccount(account);
                          setShowAccountMenu(false);
                        }}
                        className={`
                          w-full flex items-center gap-3 px-3 py-2.5 rounded-md
                          transition-colors duration-150
                          ${account.id === selectedAccount.id
                            ? 'bg-accent-primary/10 text-accent-primary'
                            : 'hover:bg-gray-100 text-gray-900'
                          }
                        `}
                      >
                        <div
                          className={`
                            w-2 h-2 rounded-full flex-shrink-0
                            ${account.status === 'connected'
                              ? 'bg-accent-success'
                              : 'bg-accent-warning'
                            }
                          `}
                        />
                        <span className="text-sm font-medium">
                          {account.name}
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-gray-200 p-2">
                    <button
                      onClick={() => {
                        router.push('/app/accounts');
                        setShowAccountMenu(false);
                      }}
                      className="
                        w-full flex items-center gap-2 px-3 py-2 rounded-md
                        text-sm font-medium text-accent-primary
                        hover:bg-accent-primary/10
                        transition-colors duration-150
                      "
                    >
                      <Plus className="w-4 h-4" />
                      {useTranslations('accounts')('connect')}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Date Range Selector */}
          <div className="relative hidden md:block">
            <select
              value={selectedRange.value}
              onChange={(e) => {
                const range = dateRanges.find((r) => r.value === e.target.value);
                if (range) setSelectedRange(range);
              }}
              className="
                px-4 py-2 pr-10
                border-2 border-gray-300 rounded-md
                bg-white
                text-sm font-medium text-gray-900
                hover:border-gray-400 hover:bg-gray-50
                focus:outline-none focus:ring-4 focus:ring-accent-primary/10
                transition-all duration-150
                cursor-pointer
                appearance-none
              "
            >
              {dateRanges.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Right: Notifications + User menu */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="
                relative p-2 rounded-md
                text-gray-400 hover:text-gray-600 hover:bg-gray-100
                transition-colors duration-150
              "
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-accent-danger rounded-full" />
              )}
            </button>

            {showNotifications && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowNotifications(false)}
                />
                <div
                  className="
                    absolute top-full right-0 mt-2 w-80
                    bg-white rounded-lg shadow-xl border border-gray-200
                    z-20
                    animate-in fade-in zoom-in-95 duration-150
                  "
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">{useTranslations('empty_states')('notifications_title')}</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        {tCommon('confirm')}
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center">
                        <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">{useTranslations('empty_states')('notifications_description')}</p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${!notification.read ? 'bg-blue-50/50' : ''
                            }`}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900">
                                {notification.title}
                              </p>
                              <p className="text-xs text-gray-600 mt-0.5">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {notification.timestamp}
                              </p>
                            </div>
                            {!notification.read && (
                              <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1.5" />
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-2 border-t border-gray-200">
                    <Link
                      href="/app/dashboard"
                      className="block w-full text-center px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      onClick={() => setShowNotifications(false)}
                    >
                      {tCommon('view')}
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="
                flex items-center gap-2 px-3 py-2 rounded-md
                hover:bg-gray-100
                transition-colors duration-150
              "
            >
              <div className="w-8 h-8 rounded-full bg-accent-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-accent-primary" />
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
            </button>

            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowUserMenu(false)}
                />
                <div
                  className="
                    absolute top-full right-0 mt-2 w-56
                    bg-white rounded-lg shadow-xl border border-gray-200
                    z-20
                    animate-in fade-in zoom-in-95 duration-150
                  "
                >
                  <div className="p-3 border-b border-gray-200">
                    <p className="text-sm font-semibold text-gray-900">{user?.fullName || 'User'}</p>
                    <p className="text-xs text-gray-600">{user?.email || ''}</p>
                  </div>
                  <div className="p-2">
                    <Link href="/app/settings">
                      <button
                        className="
                          w-full flex items-center gap-3 px-3 py-2 rounded-md
                          text-sm font-medium text-gray-700
                          hover:bg-gray-100
                          transition-colors duration-150
                        "
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Settings className="w-4 h-4" />
                        {t('settings')}
                      </button>
                    </Link>
                    <button
                      onClick={async () => { await logout(); router.push('/login'); }}
                      className="
                        w-full flex items-center gap-3 px-3 py-2 rounded-md
                        text-sm font-medium text-accent-danger
                        hover:bg-accent-danger/10
                        transition-colors duration-150
                      "
                    >
                      <LogOut className="w-4 h-4" />
                      {t('logout')}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
