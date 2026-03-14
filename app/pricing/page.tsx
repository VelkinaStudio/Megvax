'use client';

import Link from "next/link";
import { Check } from "lucide-react";
import { MarketingNav } from '@/components/marketing/MarketingNav';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import { useTranslations } from '@/lib/i18n';

const plansData = [
  {
    name: "Starter",
    price: "499",
    descriptionKey: "starter_desc",
    featuresKeys: ["starter_f1", "starter_f2", "starter_f3", "starter_f4", "starter_f5"],
    popular: false,
  },
  {
    name: "Pro",
    price: "1.999",
    descriptionKey: "pro_desc",
    featuresKeys: ["pro_f1", "pro_f2", "pro_f3", "pro_f4", "pro_f5", "pro_f6", "pro_f7"],
    popular: true,
  },
  {
    name: "Business",
    price: "4.999",
    descriptionKey: "business_desc",
    featuresKeys: ["business_f1", "business_f2", "business_f3", "business_f4", "business_f5", "business_f6", "business_f7", "business_f8"],
    popular: false,
  },
];

export default function PricingPage() {
  const t = useTranslations('pricing');
  return (
    <main className="min-h-screen bg-gray-50">
      <MarketingNav />

      {/* Header */}
      <section className="pt-24 pb-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t('title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>
      </section>

      {/* Pricing Grid */}
      <section className="pb-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plansData.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-8 ${
                  plan.popular
                    ? "bg-blue-600 text-white shadow-xl scale-105"
                    : "bg-white border border-gray-200"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-amber-400 text-amber-900 px-4 py-1 rounded-full text-sm font-semibold">
                      {t('most_popular')}
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className={`text-2xl font-bold mb-2 ${plan.popular ? "text-white" : "text-gray-900"}`}>
                    {plan.name}
                  </h3>
                  <p className={`text-sm mb-4 ${plan.popular ? "text-blue-100" : "text-gray-500"}`}>
                    {t(plan.descriptionKey)}
                  </p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className={`text-4xl font-bold ${plan.popular ? "text-white" : "text-gray-900"}`}>
                      ₺{plan.price}
                    </span>
                    <span className={plan.popular ? "text-blue-200" : "text-gray-500"}>{t('per_month')}</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.featuresKeys.map((featureKey) => (
                    <li key={featureKey} className="flex items-center gap-3">
                      <Check className={`w-5 h-5 ${plan.popular ? "text-blue-200" : "text-emerald-500"}`} />
                      <span className={plan.popular ? "text-blue-100" : "text-gray-600"}>{t(featureKey)}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/signup"
                  className={`block w-full py-3 px-4 rounded-xl font-semibold text-center transition-all ${
                    plan.popular
                      ? "bg-white text-blue-600 hover:bg-gray-100"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {plan.popular ? t('get_started') : t('contact_sales')}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            {t('faq_title')}
          </h2>
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-2">{t('faq_q1')}</h3>
              <p className="text-gray-600">{t('faq_a1')}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-2">{t('faq_q2')}</h3>
              <p className="text-gray-600">{t('faq_a2')}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-2">{t('faq_q3')}</h3>
              <p className="text-gray-600">{t('faq_a3')}</p>
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </main>
  );
}
