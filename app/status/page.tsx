'use client';

import { motion } from 'framer-motion';
import { CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { Nav } from '@/components/marketing/landing/Nav';
import { Footer } from '@/components/marketing/landing/Footer';
import { useTranslations } from '@/lib/i18n';

export default function StatusPage() {
  const t = useTranslations('system_status');

  const services = [
    { name: t('service_dashboard'), status: 'operational' as const },
    { name: t('service_api'), status: 'operational' as const },
    { name: t('service_meta'), status: 'operational' as const },
    { name: t('service_analytics'), status: 'operational' as const },
    { name: t('service_billing'), status: 'operational' as const },
  ];

  const statusConfig = {
    operational: { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50', label: t('operational') },
    degraded: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50', label: t('degraded') },
    maintenance: { icon: Clock, color: 'text-[#2563EB]', bg: 'bg-[#2563EB]/10', label: t('maintenance') },
  };

  return (
    <main className="min-h-screen bg-[#FAFAF8]">
      <Nav />
      <section className="pt-28 pb-20">
        <div className="container mx-auto px-6 max-w-3xl">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-sm font-semibold mb-6">
              <CheckCircle className="w-4 h-4" />
              {t('all_operational')}
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#1A1A1A] mb-4 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>{t('title')}</h1>
            <p className="text-lg text-[#6B7280]">{t('subtitle')}</p>
          </motion.div>

          <div className="space-y-3">
            {services.map((service, i) => {
              const config = statusConfig[service.status];
              return (
                <motion.div
                  key={i}
                  className="flex items-center justify-between p-5 rounded-xl border border-black/[0.06] bg-[#F3F2EF]/30"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <span className="font-medium text-[#1A1A1A] text-sm">{service.name}</span>
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.color}`}>
                    <config.icon className="w-3.5 h-3.5" />
                    {config.label}
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-12 p-6 rounded-xl border border-black/[0.06] bg-[#F3F2EF]/30 text-center">
            <p className="text-sm text-[#6B7280]">{t('uptime_note')}</p>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
