'use client';

import Link from "next/link";
import { Target, Zap, Users, Shield } from "lucide-react";
import { Nav } from '@/components/marketing/landing/Nav';
import { Footer } from '@/components/marketing/landing/Footer';
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
    { value: "₺2M+", label: t('stats_budget') },
    { value: "150+", label: t('stats_users') },
    { value: "3.2x", label: t('stats_roas') },
  ];

  return (
    <main className="min-h-screen bg-[#FAFAF8]">
      <Nav />

      {/* Hero */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-[#F3F2EF] to-[#FAFAF8]">
        <div className="container mx-auto px-4 text-center">
          <h1
            className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-6"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {t('title')}
          </h1>
          <p className="text-xl text-[#6B7280] max-w-3xl mx-auto">
            {t('description')}
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-black/[0.06]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 gap-8 text-center max-w-2xl mx-auto">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl md:text-4xl font-bold text-[#2563EB]">{stat.value}</p>
                <p className="text-[#6B7280] mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <h2
            className="text-3xl font-bold text-center text-[#1A1A1A] mb-12"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {t('values_title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => (
              <div key={value.title} className="text-center group">
                <div className="w-16 h-16 bg-[#2563EB]/5 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-[#2563EB]/10 transition-colors">
                  <value.icon className="w-8 h-8 text-[#2563EB]" />
                </div>
                <h3 className="text-xl font-semibold text-[#1A1A1A] mb-2">{value.title}</h3>
                <p className="text-[#6B7280]">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founding Story */}
      <section className="py-24 bg-[#F3F2EF]">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2
            className="text-3xl font-bold text-center text-[#1A1A1A] mb-8"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {t('story_title')}
          </h2>
          <p className="text-lg text-[#6B7280] text-center leading-relaxed">
            {t('story_description')}
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-[#2563EB]">
        <div className="container mx-auto px-4 text-center">
          <h2
            className="text-3xl font-bold text-white mb-6"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {t('careers_title')}
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            {t('careers_description')}
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center px-8 py-4 bg-white text-[#2563EB] rounded-xl font-semibold hover:bg-white/80 transition-all"
          >
            {t('careers_button')}
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
