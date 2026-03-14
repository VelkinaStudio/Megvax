'use client';

import Link from "next/link";
import { Target, Zap, Users, Shield } from "lucide-react";
import { MarketingNav } from '@/components/marketing/MarketingNav';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import { useTranslations } from '@/lib/i18n';

export default function AboutPage() {
  const t = useTranslations('about');
  
  const values = [
    {
      icon: Target,
      title: t('value_1_title'),
      description: t('value_1_desc')
    },
    {
      icon: Zap,
      title: t('value_2_title'),
      description: t('value_2_desc')
    },
    {
      icon: Users,
      title: t('value_3_title'),
      description: t('value_3_desc')
    },
    {
      icon: Shield,
      title: t('value_4_title'),
      description: t('value_4_desc')
    }
  ];

  const stats = [
    { value: "10K+", label: t('stats_users') },
    { value: "₺50M+", label: t('stats_budget') },
    { value: "4.9", label: t('stats_rating') },
    { value: "24/7", label: t('stats_support') },
  ];

  const team = [
    { name: "Ahmet Yilmaz", role: t('team_role_1') },
    { name: "Mehmet Kaya", role: t('team_role_2') },
    { name: "Ayse Demir", role: t('team_role_3') },
  ];

  return (
    <main className="min-h-screen bg-white">
      <MarketingNav />

      {/* Hero */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {t('title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('description')}
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl md:text-4xl font-bold text-blue-600">{stat.value}</p>
                <p className="text-gray-600 mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            {t('values_title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => (
              <div key={value.title} className="text-center group">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-100 transition-colors">
                  <value.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            {t('team_title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {team.map((member) => (
              <div key={member.name} className="text-center">
                <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4 overflow-hidden">
                  <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold">
                    {member.name.charAt(0)}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
                <p className="text-gray-600">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-blue-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            {t('careers_title')}
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            {t('careers_description')}
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-gray-100 transition-all"
          >
            {t('careers_button')}
          </Link>
        </div>
      </section>

      <MarketingFooter />
    </main>
  );
}
