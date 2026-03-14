'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from '@/lib/i18n';
import { ArrowRight, CreditCard, Receipt, Wallet, Plus, Trash2, AlertCircle, CheckCircle2, Star } from 'lucide-react';
import { Button, Card, Badge } from '@/components/ui';
import { PageHeader } from '@/components/dashboard';
import { InsightsView } from '@/components/dashboard/insights/InsightsView';
import { createMockInsightsSingle } from '@/components/dashboard/insights/mock';
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

const mockBilling: BillingOverview = {
  plan: {
    name: 'Pro',
    billingPeriod: 'monthly',
    status: 'active',
  },
  credits: {
    available: 1200,
    unit: 'kredi',
  },
};

const mockInvoices: InvoiceRow[] = [
  { id: 'in_1', amount: 499, currency: 'TRY', status: 'paid', issuedAt: '2025-12-01' },
  { id: 'in_2', amount: 499, currency: 'TRY', status: 'paid', issuedAt: '2025-11-01' },
  { id: 'in_3', amount: 499, currency: 'TRY', status: 'paid', issuedAt: '2025-10-01' },
];

interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal';
  last4: string;
  brand: string;
  expiryMonth: string;
  expiryYear: string;
  isDefault: boolean;
}

const mockPaymentMethods: PaymentMethod[] = [
  { id: 'pm_1', type: 'card', last4: '4242', brand: 'Visa', expiryMonth: '12', expiryYear: '2027', isDefault: true },
  { id: 'pm_2', type: 'card', last4: '8888', brand: 'Mastercard', expiryMonth: '08', expiryYear: '2026', isDefault: false },
];

interface Plan {
  id: string;
  name: string;
  price: number;
  period: 'monthly' | 'yearly';
  features: string[];
  isPopular?: boolean;
}

const mockPlans: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 199,
    period: 'monthly',
    features: ['3 Ad Accounts', 'Basic Automation', 'Email Support'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 499,
    period: 'monthly',
    features: ['10 Ad Accounts', 'Advanced Automation', 'AI Suggestions', 'Priority Support'],
    isPopular: true,
  },
  {
    id: 'business',
    name: 'Business',
    price: 1499,
    period: 'monthly',
    features: ['Unlimited Accounts', 'Custom Rules', 'API Access', '24/7 Support', 'Custom Integrations'],
  },
];

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

  const { account, range, from, to, withQuery } = useDashboardQuery();
  const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' || !process.env.NEXT_PUBLIC_API_URL;

  const insights = useMemo(() => {
    const seed =
      range === 'custom'
        ? `finance:${account}:${range}:${from ?? ''}:${to ?? ''}`
        : `finance:${account}:${range}`;
    return createMockInsightsSingle('account', seed);
  }, [account, range, from, to]);

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
                  <p className="text-2xl font-bold text-gray-900 mt-1">{mockBilling.plan.name}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {t('period')}: <span className="font-medium">{mockBilling.plan.billingPeriod === 'monthly' ? t('period_monthly') : t('period_yearly')}</span>
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
                  <p className="text-2xl font-bold text-gray-900 mt-1">{mockBilling.credits.available}</p>
                  <p className="text-sm text-gray-600 mt-1">{t('unit')}: <span className="font-medium">{mockBilling.credits.unit}</span></p>
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
                  {mockInvoices.map((row) => (
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

          <InsightsView insights={insights} />
        </div>
      )}
    </div>
  );
}
