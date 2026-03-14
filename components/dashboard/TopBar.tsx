'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown, Calendar, Check, Menu } from 'lucide-react';
import { useTranslations } from '@/lib/i18n';

interface TopBarProps {
  onMenuClick?: () => void;
}

function formatDateYYYYMMDD(date: Date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const t = useTranslations('navigation');
  const tc = useTranslations('common');
  const ta = useTranslations('accounts');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const accounts = useMemo(
    () => [
      { id: 'act_1234567890', name: 'Megvax Demo Inc.' },
      { id: 'act_9876543210', name: 'Other Account Inc.' },
    ],
    []
  );

  const dateRange = useMemo((): '7d' | '30d' | 'custom' => {
    const raw = searchParams.get('range') as '7d' | '30d' | 'custom' | null;
    if (raw === '7d' || raw === '30d' || raw === 'custom') return raw;
    return '7d';
  }, [searchParams]);

  const selectedAccountId = useMemo(() => {
    return searchParams.get('account') ?? accounts[0]?.id ?? 'act_1234567890';
  }, [accounts, searchParams]);

  const customFrom = useMemo(() => searchParams.get('from'), [searchParams]);
  const customTo = useMemo(() => searchParams.get('to'), [searchParams]);

  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isCustomOpen, setIsCustomOpen] = useState(false);

  const selectedAccount = useMemo(
    () => accounts.find((a) => a.id === selectedAccountId) ?? accounts[0],
    [accounts, selectedAccountId]
  );

  const updateQuery = (next: { account?: string; range?: '7d' | '30d' | 'custom'; from?: string; to?: string }) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next.account) params.set('account', next.account);

    if (next.range) {
      params.set('range', next.range);
      if (next.range !== 'custom') {
        params.delete('from');
        params.delete('to');
      }
    }

    if (next.from) params.set('from', next.from);
    if (next.to) params.set('to', next.to);

    router.replace(`${pathname}?${params.toString()}`);
  };

  useEffect(() => {
    const hasAccount = Boolean(searchParams.get('account'));
    const hasRange = Boolean(searchParams.get('range'));
    const currentRange = (searchParams.get('range') as '7d' | '30d' | 'custom' | null) ?? dateRange;
    const needsCustomDates = currentRange === 'custom' && (!searchParams.get('from') || !searchParams.get('to'));
    if (hasAccount && hasRange && !needsCustomDates) return;

    const params = new URLSearchParams(searchParams.toString());
    if (!hasAccount) params.set('account', selectedAccountId);

    if (!hasRange) params.set('range', dateRange);

    const normalizedRange = (params.get('range') as '7d' | '30d' | 'custom' | null) ?? dateRange;
    if (normalizedRange === 'custom') {
      const now = new Date();
      const fallbackTo = formatDateYYYYMMDD(now);
      const fallbackFrom = formatDateYYYYMMDD(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6));
      if (!params.get('from')) params.set('from', customFrom ?? fallbackFrom);
      if (!params.get('to')) params.set('to', customTo ?? fallbackTo);
    }

    router.replace(`${pathname}?${params.toString()}`);
  }, [customFrom, customTo, dateRange, pathname, router, searchParams, selectedAccountId]);

  return (
    <header className="h-16 bg-brand-white border-b border-brand-black flex items-center justify-between px-4 md:px-8 sticky top-0 z-30 md:ml-64 w-full md:w-[calc(100%-16rem)] transition-all">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-2 text-brand-black/70 hover:text-brand-black"
        >
          <Menu size={24} />
        </button>

        <div className="relative">
          <button
            onClick={() => setIsAccountOpen(!isAccountOpen)}
            className="flex items-center gap-2 text-sm font-bold text-brand-black hover:text-brand-black transition-colors focus:outline-none"
          >
            <span className="truncate max-w-[150px]">{selectedAccount?.name ?? tc('account')}</span>
            <ChevronDown size={14} className={`text-brand-black/60 transition-transform ${isAccountOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown */}
          {isAccountOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsAccountOpen(false)} />
              <div className="absolute top-full left-0 w-56 bg-brand-white border-2 border-brand-black rounded-[2px] mt-2 p-1 z-20 animate-in fade-in zoom-in-95 duration-100">
                {accounts.map((account) => (
                  <div
                    key={account.id}
                    onClick={() => {
                      updateQuery({ account: account.id });
                      setIsAccountOpen(false);
                    }}
                    className="p-2 hover:bg-paper-white rounded-[2px] cursor-pointer text-sm font-medium text-brand-black flex items-center justify-between border border-transparent hover:border-brand-black"
                  >
                    {account.name}
                    {selectedAccountId === account.id && <Check size={14} className="text-action-blue" />}
                  </div>
                ))}
                <div className="h-px bg-brand-black my-1" />
                <div
                  onClick={() => {
                    router.push('/app/accounts');
                    setIsAccountOpen(false);
                  }}
                  className="p-2 hover:bg-paper-white rounded-[2px] cursor-pointer text-sm font-medium text-action-blue flex items-center gap-2 border border-transparent hover:border-brand-black"
                >
                  + {ta('connect')}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center p-1 bg-paper-white border-2 border-brand-black rounded-[2px]">
          <button
            onClick={() => {
              setIsCustomOpen(false);
              updateQuery({ range: '7d' });
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-[2px] transition-all ${dateRange === '7d'
                ? 'bg-brand-white border-2 border-brand-black text-brand-black font-bold'
                : 'text-brand-black/70 hover:text-brand-black hover:bg-brand-white'
              }`}
          >
            {tc('last_7_days') || 'Last 7 Days'}
          </button>
          <button
            onClick={() => {
              setIsCustomOpen(false);
              updateQuery({ range: '30d' });
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-[2px] transition-all ${dateRange === '30d'
                ? 'bg-brand-white border-2 border-brand-black text-brand-black font-bold'
                : 'text-brand-black/70 hover:text-brand-black hover:bg-brand-white'
              }`}
          >
            {tc('last_30_days') || 'Last 30 Days'}
          </button>
          <button
            onClick={() => {
              const now = new Date();
              const fallbackTo = formatDateYYYYMMDD(now);
              const fallbackFrom = formatDateYYYYMMDD(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6));
              const nextFrom = customFrom ?? fallbackFrom;
              const nextTo = customTo ?? fallbackTo;
              setIsCustomOpen(true);
              updateQuery({ range: 'custom', from: nextFrom, to: nextTo });
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-[2px] transition-all flex items-center gap-2 ${dateRange === 'custom'
                ? 'bg-brand-white border-2 border-brand-black text-brand-black font-bold'
                : 'text-brand-black/70 hover:text-brand-black hover:bg-brand-white'
              }`}
          >
            <Calendar size={12} />
            {tc('custom') || 'Custom'}
          </button>
        </div>

        {dateRange === 'custom' && isCustomOpen && (
          <div className="relative">
            <div className="absolute right-0 top-full mt-2 w-[320px] bg-brand-white border-2 border-brand-black rounded-[2px] p-4 z-30">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1">
                  <p className="text-xs font-bold text-brand-black/70 uppercase">{ta('from') || 'From'}</p>
                  <input
                    type="date"
                    value={customFrom ?? ''}
                    onChange={(e) => {
                      const next = e.target.value;
                      updateQuery({ range: 'custom', from: next, to: customTo ?? undefined });
                    }}
                    className="form-input-muted mt-1"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-brand-black/70 uppercase">{ta('to') || 'To'}</p>
                  <input
                    type="date"
                    value={customTo ?? ''}
                    onChange={(e) => {
                      const next = e.target.value;
                      updateQuery({ range: 'custom', from: customFrom ?? undefined, to: next });
                    }}
                    className="form-input-muted mt-1"
                  />
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsCustomOpen(false)}
                  className="minimal-button secondary"
                >
                  {tc('close')}
                </button>
                <button
                  type="button"
                  onClick={() => setIsCustomOpen(false)}
                  className="minimal-button primary"
                >
                  {tc('apply')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
