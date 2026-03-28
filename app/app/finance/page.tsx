'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from '@/lib/i18n';
import { ArrowRight, CreditCard, Receipt, Wallet } from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { PageHeader } from '@/components/dashboard';
import { InsightsView } from '@/components/dashboard/insights/InsightsView';
import { useDashboardQuery } from '@/components/dashboard/useDashboardQuery';
import { PaymentMethodsView } from './PaymentMethods';
import { SubscriptionPlansView } from './SubscriptionPlans';

type FinanceTab = 'billing' | 'ad_spend' | 'payment_methods' | 'plans';

type BillingStatus = 'active' | 'past_due' | 'canceled';

type BillingPeriod = 'monthly' | 'yearly';

interface BillingOverview {
  plan: {
    name: string;
    billingPeriod: BillingPeriod;
    status: BillingStatus;
  };
  credits: {
    available: number;
    unit: string;
  };
}

interface InvoiceRow {
  id: string;
  amount: number;
  currency: string;
  status: 'paid' | 'open' | 'void' | 'uncollectible';
  issuedAt: string;
}

const billing: BillingOverview | null = null;

const invoices: InvoiceRow[] = [];

function formatCurrencyTRY(value: number) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(value);
}

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState<FinanceTab>('billing');
  const t = useTranslations('finance');

  const { withQuery } = useDashboardQuery();

  const insights = null;

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title={t('title')}
        description={t('description')}
      />

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-xl overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('billing')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'billing'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t('tab_billing')}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('payment_methods')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'payment_methods'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t('tab_payment_methods')}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('plans')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'plans'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t('tab_plans')}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ad_spend')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'ad_spend'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t('tab_ad_spend')}
          </button>
        </div>
      </div>

      {activeTab === 'billing' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase">{t('plan')}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{billing?.plan.name ?? '—'}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {t('period')}: <span className="font-medium">{billing?.plan.billingPeriod === 'monthly' ? t('period_monthly') : t('period_yearly')}</span>
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {t('status_label')}: <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">{t('status_active')}</span>
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                  <CreditCard className="w-6 h-6" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase">{t('credit')}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{billing?.credits.available ?? 0}</p>
                  <p className="text-sm text-gray-600 mt-1">{t('unit')}: <span className="font-medium">{billing?.credits.unit ?? '—'}</span></p>
                </div>
                <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                  <Wallet className="w-6 h-6" />
                </div>
              </div>
            </Card>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">{t('invoices_title')}</p>
                <p className="text-sm text-gray-500 mt-0.5">{t('invoices_subtitle')}</p>
              </div>
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-gray-600">
                <Receipt className="w-5 h-5" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('col_id')}</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('col_date')}</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('col_status')}</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">{t('col_amount')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {invoices.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-gray-500">{row.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{row.issuedAt}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                          {row.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-sm font-medium text-gray-900">{formatCurrencyTRY(row.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : activeTab === 'payment_methods' ? (
        <PaymentMethodsView />
      ) : activeTab === 'plans' ? (
        <SubscriptionPlansView />
      ) : (
        <div className="space-y-6">
          <Card className="p-6">
            <p className="font-semibold text-gray-900">{t('ad_spend_summary')}</p>
            <p className="text-sm text-gray-600 mt-2">
              {t('ad_spend_desc')}{' '}
              <Link href={withQuery('/app/campaigns')} className="font-medium text-blue-600 hover:text-blue-700">
                {t('campaigns_link')}
              </Link>{' '}
              {t('ad_spend_page_suffix')}
            </p>
            <div className="mt-4">
              <Link href={withQuery('/app/campaigns')}>
                <Button variant="primary" className="flex items-center gap-2">
                  {t('go_to_campaigns')}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </Card>

          {insights && <InsightsView insights={insights} />}
        </div>
      )}
    </div>
  );
}
