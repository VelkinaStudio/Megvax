'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from '@/lib/i18n';
import { Menu, ChevronDown, User, Settings, LogOut, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useNotifications } from '@/lib/hooks/use-notifications';
import { useAuth } from '@/lib/auth-context';
import { NotificationBell } from './NotificationBell';
import { api } from '@/lib/api';

interface HeaderProps {
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}

export function Header({ onMenuClick, showMenuButton = false }: HeaderProps) {
  const t = useTranslations('navigation');
  const tHeader = useTranslations('header');
  const tAccounts = useTranslations('accounts');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, logout } = useAuth();
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const {
    notifications,
    unreadCount,
    markRead,
    markAllRead,
  } = useNotifications();

  const [accounts, setAccounts] = useState<{ id: string; name: string; status: string }[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<{ id: string; name: string; status: string } | null>(null);

  useEffect(() => {
    if (!user) return; // Wait for auth before fetching accounts

    api<{ data: Array<{ adAccountId?: string; adAccount?: { name?: string } }> }>('/campaigns?limit=100')
      .then((res) => {
        const seen = new Map<string, { id: string; name: string; status: string }>();
        for (const c of res.data || []) {
          if (c.adAccountId && !seen.has(c.adAccountId)) {
            seen.set(c.adAccountId, {
              id: c.adAccountId,
              name: c.adAccount?.name || c.adAccountId,
              status: 'connected',
            });
          }
        }
        return Array.from(seen.values());
      })
      .catch(() => [] as { id: string; name: string; status: string }[])
      .then((items) => {
        setAccounts(items);
        const currentAccountId = searchParams.get('account');
        const match = items.find((a) => a.id === currentAccountId);
        if (match) {
          setSelectedAccount(match);
        } else if (items.length > 0) {
          setSelectedAccount(items[0]);
          const params = new URLSearchParams(searchParams.toString());
          params.set('account', items[0].id);
          router.replace(`${pathname}?${params.toString()}`);
        }
      });
  }, [user, pathname, router, searchParams]);

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
                    ${selectedAccount?.status === 'connected'
                      ? 'bg-accent-success'
                      : 'bg-accent-warning'
                    }
                  `}
                />
                <span className="text-sm font-medium text-gray-900">
                  {selectedAccount?.name || tAccounts('select_account')}
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
                          const params = new URLSearchParams(searchParams.toString());
                          params.set('account', account.id);
                          router.replace(`${pathname}?${params.toString()}`);
                        }}
                        className={`
                          w-full flex items-center gap-3 px-3 py-2.5 rounded-md
                          transition-colors duration-150
                          ${account.id === selectedAccount?.id
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
                      {tAccounts('connect')}
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
          <NotificationBell
            notifications={notifications}
            unreadCount={unreadCount}
            isOpen={showNotifications}
            onToggle={() => setShowNotifications(!showNotifications)}
            onClose={() => setShowNotifications(false)}
            onMarkRead={markRead}
            onMarkAllRead={markAllRead}
          />

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
