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
import { api } from '@/lib/api';

const initialAccounts: MetaAccount[] = [];

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<MetaAccount[]>(initialAccounts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const toast = useToast();
  const t = useTranslations('accounts');
  const [isAccountsLoading, setIsAccountsLoading] = useState(false);
  const [accountsError, setAccountsError] = useState<string | null>(null);

  const { account: activeAccountId, range, from, to } = useDashboardQuery();

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Handle Meta OAuth callback results
  useEffect(() => {
    const connected = searchParams.get('meta_connected');
    const error = searchParams.get('meta_error');
    if (connected === 'true') {
      toast.success('Meta hesabınız başarıyla bağlandı!');
      // Clean URL
      const params = new URLSearchParams(searchParams.toString());
      params.delete('meta_connected');
      router.replace(`${pathname}?${params.toString()}`);
    } else if (error) {
      toast.error(`Meta bağlantı hatası: ${error}`);
      const params = new URLSearchParams(searchParams.toString());
      params.delete('meta_error');
      router.replace(`${pathname}?${params.toString()}`);
    }
  }, [searchParams, toast, router, pathname]);

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

      try {
        // Extract unique ad accounts from campaigns (works without live Meta API)
        const res = await api<{ data: Array<{ adAccountId?: string; adAccount?: { name?: string; lastSyncAt?: string; currency?: string; timezone?: string } }> }>('/campaigns?limit=100');
        const seen = new Map<string, MetaAccount>();
        for (const c of res.data || []) {
          if (c.adAccountId && !seen.has(c.adAccountId)) {
            seen.set(c.adAccountId, {
              id: c.adAccountId,
              name: c.adAccount?.name || c.adAccountId,
              accountId: `act_${c.adAccountId}`,
              status: 'connected',
              lastSync: c.adAccount?.lastSyncAt || '—',
              currency: c.adAccount?.currency || 'TRY',
              timezone: c.adAccount?.timezone || 'Europe/Istanbul',
            });
          }
        }
        setAccounts(Array.from(seen.values()));
      } catch (error) {
        console.error('Failed to fetch accounts', error);
        setAccounts([]);
        setAccountsError('Hesaplar yüklenemedi');
      } finally {
        setIsAccountsLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  const handleConnect = () => {
    toast.success(t('connected_success'));
  };

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title={t('title')}
        description={t('description')}
      />

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
