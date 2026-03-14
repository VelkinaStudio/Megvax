'use client';

import { Card, Button } from '@/components/ui';
import { CheckCircle2, Star } from 'lucide-react';
import { useTranslations } from '@/lib/i18n';

interface PlanDef {
  id: string;
  nameKey: string;
  price: number;
  period: 'monthly' | 'yearly';
  featureKeys: string[];
  isPopular?: boolean;
}

const planDefs: PlanDef[] = [
  {
    id: 'starter',
    nameKey: 'plan_starter',
    price: 199,
    period: 'monthly',
    featureKeys: ['starter_f1', 'starter_f2', 'starter_f4'],
  },
  {
    id: 'pro',
    nameKey: 'plan_pro',
    price: 499,
    period: 'monthly',
    featureKeys: ['pro_f1', 'pro_f2', 'pro_f6', 'pro_f4'],
    isPopular: true,
  },
  {
    id: 'business',
    nameKey: 'plan_business',
    price: 1499,
    period: 'monthly',
    featureKeys: ['business_f1', 'business_f2', 'business_f7', 'business_f4', 'business_f8'],
  },
];

function formatCurrencyTRY(value: number) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(value);
}

export function SubscriptionPlansView() {
  const t = useTranslations('finance');
  const tp = useTranslations('pricing');
  const currentPlanId = 'pro';

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900">{t('tab_plans')}</h3>
        <p className="text-gray-500">{tp('subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {planDefs.map((plan) => (
          <Card key={plan.id} className={`p-6 relative ${plan.isPopular ? 'ring-2 ring-blue-500 shadow-lg' : ''}`}>
            {plan.isPopular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">
                  <Star className="w-3 h-3" /> {tp('most_popular')}
                </span>
              </div>
            )}
            <div className="text-center mb-6">
              <h4 className="text-xl font-bold text-gray-900">{t(plan.nameKey)}</h4>
              <div className="mt-2">
                <span className="text-3xl font-bold text-gray-900">{formatCurrencyTRY(plan.price)}</span>
                <span className="text-gray-500">{tp('per_month')}</span>
              </div>
            </div>
            <ul className="space-y-3 mb-6">
              {plan.featureKeys.map((fKey, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  {tp(fKey)}
                </li>
              ))}
            </ul>
            <Button 
              variant={plan.isPopular ? 'primary' : 'secondary'} 
              fullWidth
            >
              {currentPlanId === plan.id ? t('current_plan') : t('change_plan')}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
