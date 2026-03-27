'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  Bell,
  Loader2,
  ArrowRight,
  Zap,
  Globe,
  Database,
  Server,
  Cpu,
  Activity,
} from 'lucide-react';
import { Nav } from '@/components/marketing/landing/Nav';
import { Footer } from '@/components/marketing/landing/Footer';
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/marketing/landing/ScrollReveal';
import { useTranslations } from '@/lib/i18n';

type ServiceStatus = 'operational' | 'degraded' | 'outage' | 'maintenance';

interface Service {
  nameKey: string;
  icon: typeof Server;
  status: ServiceStatus;
  uptime: string;
  responseTime: string;
}

const SERVICES: Service[] = [
  { nameKey: 'service_api', icon: Server, status: 'operational', uptime: '99.99%', responseTime: '45ms' },
  { nameKey: 'service_web', icon: Globe, status: 'operational', uptime: '99.98%', responseTime: '120ms' },
  { nameKey: 'service_meta', icon: Zap, status: 'operational', uptime: '99.95%', responseTime: '230ms' },
  { nameKey: 'service_pipeline', icon: Database, status: 'operational', uptime: '99.99%', responseTime: '85ms' },
  { nameKey: 'service_worker', icon: Cpu, status: 'operational', uptime: '99.97%', responseTime: '60ms' },
];

// Generate 30 days of uptime blocks (all green for now)
function generateUptimeBlocks(): ('operational' | 'degraded' | 'outage')[] {
  return Array.from({ length: 30 }, () => 'operational');
}

export default function StatusPage() {
  const t = useTranslations('system_status');
  const [subscribeEmail, setSubscribeEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const uptimeBlocks = useMemo(generateUptimeBlocks, []);

  const allOperational = SERVICES.every((s) => s.status === 'operational');

  const statusConfig: Record<
    ServiceStatus,
    { icon: typeof CheckCircle; dotColor: string; bgColor: string; textColor: string; label: string }
  > = {
    operational: {
      icon: CheckCircle,
      dotColor: 'bg-emerald-500',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      label: t('operational'),
    },
    degraded: {
      icon: AlertTriangle,
      dotColor: 'bg-amber-500',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700',
      label: t('degraded'),
    },
    outage: {
      icon: XCircle,
      dotColor: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      label: t('outage'),
    },
    maintenance: {
      icon: Clock,
      dotColor: 'bg-[#2563EB]',
      bgColor: 'bg-[#2563EB]/10',
      textColor: 'text-[#2563EB]',
      label: t('maintenance'),
    },
  };

  const blockColorMap: Record<string, string> = {
    operational: 'bg-emerald-500',
    degraded: 'bg-amber-400',
    outage: 'bg-red-500',
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscribeEmail.trim()) return;
    setSubscribing(true);
    // Simulate subscription
    await new Promise((r) => setTimeout(r, 800));
    setSubscribing(false);
    setSubscribed(true);
  };

  return (
    <main className="min-h-screen bg-[#FAFAF8]">
      <Nav />

      {/* Hero */}
      <section className="pt-28 pb-6 md:pt-36 md:pb-10">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Overall status badge */}
            <motion.div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6 ${
                allOperational ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
              }`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <span className="relative flex h-2.5 w-2.5">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    allOperational ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                    allOperational ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                />
              </span>
              {allOperational ? t('all_operational') : t('some_issues')}
            </motion.div>

            <h1
              className="text-4xl md:text-5xl font-extrabold text-[#1A1A1A] mb-4 tracking-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {t('title')}
            </h1>
            <p className="text-lg text-[#6B7280] leading-relaxed">{t('subtitle')}</p>
          </motion.div>
        </div>
      </section>

      {/* Service Grid */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4" stagger={0.06}>
              {SERVICES.map((service) => {
                const config = statusConfig[service.status];
                const Icon = service.icon;
                return (
                  <StaggerItem key={service.nameKey}>
                    <div className="p-5 rounded-2xl border border-black/[0.06] bg-white hover:shadow-md hover:border-black/[0.1] transition-all group">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-9 h-9 rounded-xl bg-[#F3F2EF] flex items-center justify-center group-hover:bg-[#2563EB]/[0.06] transition-colors">
                          <Icon className="w-4.5 h-4.5 text-[#6B7280] group-hover:text-[#2563EB] transition-colors" />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${config.dotColor}`} />
                          <span className={`text-xs font-semibold ${config.textColor}`}>
                            {config.label}
                          </span>
                        </div>
                      </div>
                      <h3 className="text-sm font-semibold text-[#1A1A1A] mb-3">
                        {t(service.nameKey)}
                      </h3>
                      <div className="flex items-center justify-between text-xs text-[#9CA3AF]">
                        <span>
                          {t('uptime')}: <span className="font-semibold text-[#374151]">{service.uptime}</span>
                        </span>
                        <span>
                          {t('response_time')}: <span className="font-semibold text-[#374151]">{service.responseTime}</span>
                        </span>
                      </div>
                    </div>
                  </StaggerItem>
                );
              })}

              {/* Overall uptime card */}
              <StaggerItem>
                <div className="p-5 rounded-2xl border border-[#2563EB]/20 bg-[#2563EB]/[0.03] flex flex-col justify-center items-center text-center h-full min-h-[140px]">
                  <Activity className="w-5 h-5 text-[#2563EB] mb-2" />
                  <p className="text-2xl font-bold text-[#1A1A1A]">99.97%</p>
                  <p className="text-xs text-[#6B7280] mt-1">{t('overall_uptime')}</p>
                </div>
              </StaggerItem>
            </StaggerContainer>
          </div>
        </div>
      </section>

      {/* Uptime Bar — Last 30 Days */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <ScrollReveal>
              <div className="p-6 rounded-2xl border border-black/[0.06] bg-white">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-[#1A1A1A]">{t('uptime_30_days')}</h3>
                  <span className="text-xs text-[#9CA3AF]">{t('uptime_legend')}</span>
                </div>
                <div className="flex gap-[3px]">
                  {uptimeBlocks.map((status, i) => (
                    <motion.div
                      key={i}
                      className={`flex-1 h-8 rounded-sm ${blockColorMap[status]} hover:opacity-80 transition-opacity cursor-default`}
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ delay: i * 0.02, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      style={{ transformOrigin: 'bottom' }}
                      title={`${t('day')} ${i + 1}: ${t(status)}`}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between mt-3 text-xs text-[#9CA3AF]">
                  <span>{t('thirty_days_ago')}</span>
                  <span>{t('today')}</span>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Incident History */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <ScrollReveal>
              <div className="p-6 rounded-2xl border border-black/[0.06] bg-white">
                <h3
                  className="text-base font-bold text-[#1A1A1A] mb-4"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {t('incident_history')}
                </h3>
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                    <CheckCircle className="w-6 h-6 text-emerald-500" />
                  </div>
                  <p className="text-sm font-medium text-[#1A1A1A] mb-1">{t('no_incidents')}</p>
                  <p className="text-xs text-[#9CA3AF]">{t('no_incidents_desc')}</p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Subscribe */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <ScrollReveal>
              <div className="p-8 rounded-2xl border border-black/[0.06] bg-[#0C0D14] text-center">
                <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <h3
                  className="text-lg font-bold text-white mb-2"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {t('subscribe_title')}
                </h3>
                <p className="text-sm text-white/60 mb-6 max-w-md mx-auto">
                  {t('subscribe_desc')}
                </p>

                <AnimatePresence mode="wait">
                  {subscribed ? (
                    <motion.div
                      key="done"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-center gap-2 text-emerald-400 text-sm font-medium"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {t('subscribe_success')}
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      onSubmit={handleSubscribe}
                      className="flex gap-3 max-w-sm mx-auto"
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <input
                        type="email"
                        required
                        value={subscribeEmail}
                        onChange={(e) => setSubscribeEmail(e.target.value)}
                        placeholder={t('subscribe_placeholder')}
                        className="flex-1 px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50 focus:border-[#2563EB] transition-all"
                      />
                      <button
                        type="submit"
                        disabled={subscribing}
                        className="inline-flex items-center gap-2 px-5 py-3 bg-[#2563EB] text-white rounded-xl text-sm font-semibold hover:bg-[#1D4ED8] active:scale-[0.98] transition-all disabled:opacity-60"
                      >
                        {subscribing ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <ArrowRight className="w-4 h-4" />
                        )}
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
