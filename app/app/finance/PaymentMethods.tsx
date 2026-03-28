'use client';

import { Card, Button } from '@/components/ui';
import { Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { useTranslations } from '@/lib/i18n';

interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal';
  last4: string;
  brand: string;
  expiryMonth: string;
  expiryYear: string;
  isDefault: boolean;
}

const paymentMethods: PaymentMethod[] = [];

export function PaymentMethodsView() {
  const t = useTranslations('finance');
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{t('payment_methods')}</h3>
          <p className="text-sm text-gray-500">{t('payment_methods_desc')}</p>
        </div>
        <Button variant="primary" icon={<Plus className="w-4 h-4" />}>
          {t('add_card')}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {paymentMethods.map((method) => (
          <Card key={method.id} className={`p-6 ${method.isDefault ? 'ring-2 ring-blue-500' : ''}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded-md flex items-center justify-center text-white text-xs font-bold">
                  {method.brand}
                </div>
                <div>
                  <p className="font-medium text-gray-900">•••• {method.last4}</p>
                  <p className="text-sm text-gray-500">{t('expires')}: {method.expiryMonth}/{method.expiryYear}</p>
                  {method.isDefault && (
                    <span className="inline-flex items-center gap-1 text-xs text-blue-600 mt-1">
                      <CheckCircle2 className="w-3 h-3" /> {t('default_method')}
                    </span>
                  )}
                </div>
              </div>
              <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
