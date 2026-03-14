'use client';

import { useEffect, useState } from 'react';
import { AccountCard } from '@/components/dashboard/AccountCard';
import { ConnectAccountModal } from '@/components/dashboard/accounts/ConnectAccountModal';
import { MetaAccount } from '@/types/dashboard';
import { Plus } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { Button, Card, Skeleton } from '@/components/ui';
import { PageHeader } from '@/components/dashboard';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDashboardQuery } from '@/components/dashboard/useDashboardQuery';
import { useTranslations } from '@/lib/i18n';

// Mock Data
const initialAccounts: MetaAccount[] = [];

const demoAccounts: MetaAccount[] = [
  {
    id: 'acc_1',
    name: 'Megvax Demo Inc.',
    accountId: 'act_1234567890',
    status: 'connected',
    lastSync: 'Now',
  },
  {
    id: 'acc_2',
    name: 'Other Account Inc.',
    accountId: 'act_9876543210',
    status: 'connected',
    lastSync: 'Now',
  },
];

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<MetaAccount[]>(initialAccounts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const toast = useToast();
  const t = useTranslations('accounts');
  const [isAccountsLoading, setIsAccountsLoading] = useState(false);
  const [accountsError, setAccountsError] = useState<string | null>(null);

  const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' || !process.env.NEXT_PUBLIC_API_URL;
  const { account: activeAccountId, range, from, to } = useDashboardQuery();

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setActiveAccount = (nextAccountId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('account', nextAccountId);
    params.set('range', range);

    if (range === 'custom') {
      if (from) params.set('from', from);
      if (to) params.set('to', to);
    } else {
      params.delete('from');
      params.delete('to');
    }

    router.replace(`${pathname}?${params.toString()}`);
  };

  useEffect(() => {
    const fetchAccounts = async () => {
      setIsAccountsLoading(true);
      setAccountsError(null);

      if (useMockData) {
        setAccounts(demoAccounts);
        setIsAccountsLoading(false);
        return;
      }

      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const res = await fetch(
          `${baseUrl}/api/meta/accounts?accountId=${encodeURIComponent(activeAccountId)}&range=${encodeURIComponent(range)}${
            range === 'custom' && from && to
              ? `&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
              : ''
          }`
        );

        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }

        const data = await res.json();

        const rows: unknown[] = Array.isArray(data)
          ? data
          : Array.isArray((data as { accounts?: unknown }).accounts)
            ? ((data as { accounts?: unknown }).accounts as unknown[])
            : [];

        const mapped: MetaAccount[] = rows.map((item: unknown): MetaAccount => {
          const obj = item as Record<string, unknown>;
          const backendStatus = String(obj.status || '').toLowerCase();

          let status: MetaAccount['status'] = 'connected';
          if (backendStatus === 'error') status = 'error';
          if (backendStatus === 'expired') status = 'expired';

          const lastSyncAt = obj.lastSyncAt;
          const lastSyncDate = lastSyncAt ? new Date(String(lastSyncAt)) : null;
          const lastSync = lastSyncDate
            ? lastSyncDate.toLocaleString('tr-TR')
            : t('unknown');

          return {
            id: String(obj.id ?? ''),
            name: String(obj.name ?? t('unknown_account')),
            accountId: String(obj.metaAccountId ?? 'N/A'),
            status,
            lastSync,
          };
        });

        setAccounts(mapped);
      } catch (error) {
        console.error('Error fetching Meta accounts', error);
        toast.info(t('fetch_error'));
        setAccountsError(t('fetch_error_banner'));
        setAccounts(demoAccounts);
      } finally {
        setIsAccountsLoading(false);
      }
    };

    fetchAccounts();
  }, [toast, activeAccountId, range, from, to, useMockData]);

  const handleConnect = () => {
    setAccounts((prev) => {
      const next = prev.length === 0 ? [demoAccounts[0]] : prev.length === 1 ? [demoAccounts[0], demoAccounts[1]] : prev;
      const active = next[next.length - 1];
      if (active) setActiveAccount(active.accountId);
      return next;
    });
    toast.success(t('connected_success'));
  };

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title={t('title')}
        description={t('description')}
      />

      {useMockData && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">{t('info_label')}:</span> {t('mock_data_info')}
          </p>
        </div>
      )}

      <div className="flex justify-end mb-6">
        <Button 
          variant="primary"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          {t('connect_meta')}
        </Button>
      </div>

      {isAccountsLoading ? (
        <div className="grid grid-cols-1 gap-4">
          {Array.from({ length: 3 }).map((_, idx) => (
            <Card key={idx} className="p-6">
              <Skeleton className="h-6 w-1/3 mb-3" />
              <Skeleton className="h-4 w-2/3 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </Card>
          ))}
        </div>
      ) : (
        <>
          {accountsError && (
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-sm text-amber-800">{accountsError}</p>
            </div>
          )}

          {accounts.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {accounts.map((account) => (
                <AccountCard
                  key={account.id}
                  account={account}
                  isActive={account.accountId === activeAccountId}
                  onSelect={() => setActiveAccount(account.accountId)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-12 text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('no_accounts_title')}</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {t('no_accounts_desc')}
              </p>
              <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                {t('connect_meta')}
              </Button>
            </div>
          )}
        </>
      )}

      {!isAccountsLoading && !accountsError && accounts.length > 0 && (
        <div className="mt-8 bg-gray-50 rounded-xl p-8 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('add_new_title')}</h3>
          <p className="text-gray-600 mb-4">
            {t('add_new_desc')}
          </p>
          <Button variant="secondary" onClick={() => setIsModalOpen(true)}>
            {t('connect_meta')}
          </Button>
        </div>
      )}

      <ConnectAccountModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onConnect={handleConnect} 
      />
    </div>
  );
}
