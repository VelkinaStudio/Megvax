'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Send,
  Loader2,
  Clock,
  Calendar,
  ExternalLink,
  Building2,
  ChevronRight,
  HelpCircle,
  Activity,
  Check,
} from 'lucide-react';
import { Nav } from '@/components/marketing/landing/Nav';
import { Footer } from '@/components/marketing/landing/Footer';
import { ScrollReveal } from '@/components/marketing/landing/ScrollReveal';
import { useTranslations } from '@/lib/i18n';
import { useToast } from '@/components/ui/Toast';
import { api } from '@/lib/api';
import Link from 'next/link';

const SUBJECT_OPTIONS = ['general', 'sales', 'support', 'partnership'] as const;

export default function ContactPage() {
  const t = useTranslations('contact');
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    subject: 'general',
    message: '',
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await api('/meetings', {
        method: 'POST',
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          date: new Date().toISOString().split('T')[0],
          time: '00:00',
          notes: `[Contact Form]\nSubject: ${formData.subject}\nCompany: ${formData.company}\n\n${formData.message}`,
          company: formData.company,
        }),
      });
      toast.success(t('success'));
      setFormData({ name: '', email: '', company: '', subject: 'general', message: '' });
      setSent(true);
      setTimeout(() => setSent(false), 3000);
    } catch {
      const { name, email, subject, message, company } = formData;
      const body = `${message}\n\n---\nFrom: ${name}\nEmail: ${email}\nCompany: ${company}`;
      const mailto = `mailto:destek@megvax.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailto;
      toast.success(t('success'));
      setFormData({ name: '', email: '', company: '', subject: 'general', message: '' });
      setSent(true);
      setTimeout(() => setSent(false), 3000);
    } finally {
      setSending(false);
    }
  };

  const updateField = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const inputClasses =
    'w-full px-4 py-3 bg-white border border-black/[0.08] rounded-xl text-sm text-[#1A1A1A] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all';

  return (
    <main className="min-h-screen bg-[#FAFAF8]">
      <Nav />

      {/* Hero */}
      <section className="pt-28 pb-4 md:pt-36 md:pb-8">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Animated floating envelope icon */}
            <motion.div
              className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#2563EB]/[0.08] mb-5"
              animate={{
                y: [0, -6, 0],
                scale: [1, 1.04, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <Mail className="w-7 h-7 text-[#2563EB]" />
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

      {/* Two-column layout */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto grid lg:grid-cols-5 gap-10 lg:gap-14">
            {/* Left — Info Cards */}
            <div className="lg:col-span-2 space-y-5">
              {/* Email card */}
              <ScrollReveal direction="left" delay={0}>
                <div className="p-5 rounded-2xl border border-black/[0.06] bg-white">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#2563EB]/[0.06] flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-[#2563EB]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#1A1A1A] mb-0.5">{t('email_label')}</p>
                      <a
                        href="mailto:destek@megvax.com"
                        className="text-sm text-[#2563EB] hover:underline"
                      >
                        destek@megvax.com
                      </a>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              {/* Response time */}
              <ScrollReveal direction="left" delay={0.08}>
                <div className="p-5 rounded-2xl border border-black/[0.06] bg-white">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/[0.06] flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#1A1A1A] mb-0.5">
                        {t('response_time_label')}
                      </p>
                      <p className="text-sm text-[#6B7280]">{t('response_time_value')}</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              {/* Office hours */}
              <ScrollReveal direction="left" delay={0.16}>
                <div className="p-5 rounded-2xl border border-black/[0.06] bg-white">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/[0.06] flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#1A1A1A] mb-0.5">
                        {t('office_hours_label')}
                      </p>
                      <p className="text-sm text-[#6B7280]">{t('office_hours_value')}</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              {/* Quick links */}
              <ScrollReveal direction="left" delay={0.24}>
                <div className="p-5 rounded-2xl border border-black/[0.06] bg-white">
                  <p className="text-sm font-semibold text-[#1A1A1A] mb-3">{t('quick_links')}</p>
                  <div className="space-y-2">
                    <Link
                      href="/help"
                      className="flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#2563EB] transition-colors group"
                    >
                      <HelpCircle className="w-4 h-4" />
                      <span>{t('link_help_center')}</span>
                      <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                    <Link
                      href="/status"
                      className="flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#2563EB] transition-colors group"
                    >
                      <Activity className="w-4 h-4" />
                      <span>{t('link_system_status')}</span>
                      <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* Right — Contact Form */}
            <ScrollReveal direction="right" delay={0.1} className="lg:col-span-3">
              <div className="p-6 md:p-8 rounded-2xl border border-black/[0.06] bg-white">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 rounded-lg bg-[#2563EB]/[0.06] flex items-center justify-center">
                    <Building2 className="w-4.5 h-4.5 text-[#2563EB]" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#1A1A1A]">{t('form_title')}</h2>
                    <p className="text-xs text-[#9CA3AF]">{t('form_subtitle')}</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#374151] mb-1.5">
                        {t('name')}
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => updateField('name', e.target.value)}
                        placeholder={t('name_placeholder')}
                        className={inputClasses}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#374151] mb-1.5">
                        {t('email')}
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => updateField('email', e.target.value)}
                        placeholder={t('email_placeholder')}
                        className={inputClasses}
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#374151] mb-1.5">
                        {t('company')}
                      </label>
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => updateField('company', e.target.value)}
                        placeholder={t('company_placeholder')}
                        className={inputClasses}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#374151] mb-1.5">
                        {t('subject')}
                      </label>
                      <select
                        value={formData.subject}
                        onChange={(e) => updateField('subject', e.target.value)}
                        className={`${inputClasses} appearance-none cursor-pointer`}
                      >
                        {SUBJECT_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {t(`subject_${opt}`)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#374151] mb-1.5">
                      {t('message')}
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => updateField('message', e.target.value)}
                      placeholder={t('message_placeholder')}
                      className={`${inputClasses} resize-none`}
                    />
                  </div>

                  <motion.button
                    type="submit"
                    disabled={sending || sent}
                    className={`inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-sm transition-all shadow-lg disabled:cursor-not-allowed ${
                      sent
                        ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                        : 'bg-[#2563EB] text-white hover:bg-[#1D4ED8] shadow-[#2563EB]/20 active:scale-[0.98] disabled:opacity-60'
                    }`}
                    animate={sent ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    <AnimatePresence mode="wait">
                      {sent ? (
                        <motion.span
                          key="check"
                          className="inline-flex items-center gap-2"
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        >
                          <Check className="w-4 h-4" />
                          {t('success')}
                        </motion.span>
                      ) : sending ? (
                        <motion.span
                          key="loading"
                          className="inline-flex items-center gap-2"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {t('sending')}
                        </motion.span>
                      ) : (
                        <motion.span
                          key="default"
                          className="inline-flex items-center gap-2"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <Send className="w-4 h-4" />
                          {t('send')}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </form>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* FAQ Quick Links */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal>
              <h2
                className="text-xl font-bold text-[#1A1A1A] mb-6"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {t('faq_title')}
              </h2>
            </ScrollReveal>
            <div className="grid sm:grid-cols-3 gap-4">
              {([1, 2, 3] as const).map((n) => (
                <ScrollReveal key={n} delay={n * 0.08}>
                  <Link
                    href="/help"
                    className="group flex items-start gap-3 p-5 rounded-2xl border border-black/[0.06] bg-white hover:border-[#2563EB]/20 hover:shadow-sm transition-all"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#F3F2EF] flex items-center justify-center flex-shrink-0 group-hover:bg-[#2563EB]/[0.06] transition-colors">
                      <HelpCircle className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#2563EB] transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1A1A1A] mb-1 group-hover:text-[#2563EB] transition-colors">
                        {t(`faq_q${n}`)}
                      </p>
                      <span className="inline-flex items-center gap-1 text-xs text-[#9CA3AF] group-hover:text-[#2563EB] transition-colors">
                        {t('faq_read_more')}
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Schedule a Meeting CTA */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <div className="relative overflow-hidden rounded-2xl bg-[#0C0D14] p-8 sm:p-12 text-center">
              <div className="absolute top-0 left-0 w-[300px] h-[300px] rounded-full bg-[#2563EB]/10 blur-[80px] -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-[200px] h-[200px] rounded-full bg-violet-500/10 blur-[60px] translate-x-1/3 translate-y-1/3" />
              <div className="relative z-10">
                <Calendar className="w-10 h-10 text-[#2563EB] mx-auto mb-4" />
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3" style={{ fontFamily: 'var(--font-display)' }}>
                  {t('schedule_meeting_title')}
                </h3>
                <p className="text-white/50 max-w-md mx-auto mb-6 text-sm leading-relaxed">
                  {t('schedule_meeting_desc')}
                </p>
                <Link
                  href="/book"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#2563EB] text-white font-medium text-sm hover:bg-[#1D4ED8] transition-all duration-300 shadow-lg shadow-[#2563EB]/25"
                >
                  <Calendar className="w-4 h-4" />
                  {t('schedule_meeting_button')}
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <Footer />
    </main>
  );
}
