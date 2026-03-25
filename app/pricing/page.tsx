'use client';

import Link from "next/link";
import { Check } from "lucide-react";
import { Nav } from '@/components/marketing/landing/Nav';
import { Footer } from '@/components/marketing/landing/Footer';
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
    <main className="min-h-screen bg-[#FAFAF8]">
      <Nav />

      {/* Header */}
      <section className="pt-24 pb-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-4" style={{ fontFamily: 'var(--font-display)' }}>
            {t('title')}
          </h1>
          <p className="text-xl text-[#6B7280] max-w-2xl mx-auto">
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
                    ? "bg-[#2563EB] text-white shadow-xl scale-105"
                    : "bg-white border border-black/[0.08]"
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
                  <h3 className={`text-2xl font-bold mb-2 ${plan.popular ? "text-white" : "text-[#1A1A1A]"}`}>
                    {plan.name}
                  </h3>
                  <p className={`text-sm mb-4 ${plan.popular ? "text-blue-100" : "text-[#6B7280]"}`}>
                    {t(plan.descriptionKey)}
                  </p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className={`text-4xl font-bold ${plan.popular ? "text-white" : "text-[#1A1A1A]"}`}>
                      ₺{plan.price}
                    </span>
                    <span className={plan.popular ? "text-blue-200" : "text-[#6B7280]"}>{t('per_month')}</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.featuresKeys.map((featureKey) => (
                    <li key={featureKey} className="flex items-center gap-3">
                      <Check className={`w-5 h-5 ${plan.popular ? "text-blue-200" : "text-emerald-500"}`} />
                      <span className={plan.popular ? "text-blue-100" : "text-[#6B7280]"}>{t(featureKey)}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.name === 'Business' ? '/contact' : '/signup'}
                  className={`block w-full py-3 px-4 rounded-xl font-semibold text-center transition-all ${
                    plan.popular
                      ? "bg-white text-[#2563EB] hover:bg-white/80"
                      : "bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
                  }`}
                >
                  {plan.name === 'Business' ? t('contact_sales') : t('get_started')}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-center text-[#1A1A1A] mb-12" style={{ fontFamily: 'var(--font-display)' }}>
            {t('faq_title')}
          </h2>
          <div className="space-y-6">
            <div className="bg-[#F3F2EF] rounded-xl p-6">
              <h3 className="font-semibold text-[#1A1A1A] mb-2">{t('faq_q1')}</h3>
              <p className="text-[#6B7280]">{t('faq_a1')}</p>
            </div>
            <div className="bg-[#F3F2EF] rounded-xl p-6">
              <h3 className="font-semibold text-[#1A1A1A] mb-2">{t('faq_q2')}</h3>
              <p className="text-[#6B7280]">{t('faq_a2')}</p>
            </div>
            <div className="bg-[#F3F2EF] rounded-xl p-6">
              <h3 className="font-semibold text-[#1A1A1A] mb-2">{t('faq_q3')}</h3>
              <p className="text-[#6B7280]">{t('faq_a3')}</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
