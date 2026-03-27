'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  Video,
  Shield,
  CheckCircle,
  CalendarDays,
  ArrowRight,
  Loader2,
  MessageSquare,
  Sparkles,
  Users,
} from 'lucide-react';
import { api } from '@/lib/api';
import Link from 'next/link';
import { Nav } from '@/components/marketing/landing/Nav';
import { Footer } from '@/components/marketing/landing/Footer';
import { ScrollReveal } from '@/components/marketing/landing/ScrollReveal';
import { useTranslations } from '@/lib/i18n';
import { useToast } from '@/components/ui/Toast';
import { Calendar as CalendarPicker } from '@/components/ui/Calendar';
import { TimeSlotPicker } from '@/components/ui/TimeSlotPicker';
import type { TimeSlot } from '@/components/ui';

function generateTimeSlots(date: Date | null): TimeSlot[] {
  if (!date) return [];
  if (date.getDay() === 0 || date.getDay() === 6) return [];
  const slots: TimeSlot[] = [];
  const seed = date.getDate();
  for (let h = 9; h <= 17; h++) {
    for (const m of ['00', '30']) {
      if (h === 17 && m === '30') continue;
      const time = `${h.toString().padStart(2, '0')}:${m}`;
      const taken = (h + seed) % 5 === 0 && m === '00';
      slots.push({ time, available: !taken });
    }
  }
  return slots;
}

const STEPS = [1, 2, 3] as const;

export default function BookPage() {
  const t = useTranslations('book');
  const toast = useToast();

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [notes, setNotes] = useState('');
  const [booked, setBooked] = useState(false);
  const [booking, setBooking] = useState(false);

  const timeSlots = useMemo(() => generateTimeSlots(selectedDate), [selectedDate]);

  const canSubmit = selectedDate && selectedTime && name.trim() && email.trim() && !booking;

  // Current step: 1 = date, 2 = time, 3 = details
  const currentStep = !selectedDate ? 1 : !selectedTime ? 2 : 3;

  const handleBook = async () => {
    if (!canSubmit || !selectedDate || !selectedTime) return;
    setBooking(true);
    try {
      await api('/meetings', {
        method: 'POST',
        body: JSON.stringify({
          name,
          email,
          company: company || undefined,
          notes: notes || undefined,
          date: selectedDate.toISOString().split('T')[0],
          time: selectedTime,
        }),
      });
    } catch {
      toast.error(t('booking_error') || 'Could not complete booking. Please try again or contact us directly.');
      setBooking(false);
      return;
    }
    setBooking(false);
    setBooked(true);
  };

  const handleReset = () => {
    setSelectedDate(null);
    setSelectedTime(null);
    setName('');
    setEmail('');
    setCompany('');
    setNotes('');
    setBooked(false);
  };

  const formatSelectedDate = () => {
    if (!selectedDate) return '';
    return selectedDate.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const benefits = [
    { icon: Clock, label: t('benefit_duration'), desc: t('benefit_duration_desc') },
    { icon: Video, label: t('benefit_demo'), desc: t('benefit_demo_desc') },
    { icon: MessageSquare, label: t('benefit_qa'), desc: t('benefit_qa_desc') },
    { icon: Shield, label: t('benefit_free'), desc: t('benefit_free_desc') },
  ];

  return (
    <main className="min-h-screen bg-[#FAFAF8] overflow-x-hidden">
      <Nav />

      <section className="pt-24 pb-20 md:pt-32 md:pb-28">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <motion.div
              className="text-center mb-10"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1
                className="text-3xl md:text-4xl font-extrabold text-[#1A1A1A] mb-4 tracking-tight"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {t('title')}
              </h1>
              <p className="text-base text-[#6B7280] max-w-xl mx-auto leading-relaxed">
                {t('description')}
              </p>
            </motion.div>

            {/* Step Indicator */}
            {!booked && (
              <motion.div
                className="flex items-center justify-center gap-2 mb-10"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                {STEPS.map((step) => (
                  <div key={step} className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        step === currentStep
                          ? 'bg-[#2563EB] text-white shadow-lg shadow-[#2563EB]/25'
                          : step < currentStep
                            ? 'bg-emerald-500 text-white'
                            : 'bg-[#F3F2EF] text-[#9CA3AF]'
                      }`}
                    >
                      {step < currentStep ? <CheckCircle className="w-4 h-4" /> : step}
                    </div>
                    <span
                      className={`text-xs font-medium hidden sm:block ${
                        step === currentStep ? 'text-[#1A1A1A]' : 'text-[#9CA3AF]'
                      }`}
                    >
                      {t(`step_${step}`)}
                    </span>
                    {step < 3 && (
                      <div
                        className={`w-8 sm:w-12 h-px mx-1 ${
                          step < currentStep ? 'bg-emerald-400' : 'bg-[#E5E7EB]'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              {booked ? (
                /* Confirmation */
                <motion.div
                  key="confirmed"
                  className="max-w-lg mx-auto"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="bg-white border border-black/[0.08] rounded-2xl p-8 text-center relative overflow-hidden">
                    {/* Confetti-like decorative elements */}
                    <div className="absolute inset-0 pointer-events-none">
                      {[...Array(6)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-2 h-2 rounded-full"
                          style={{
                            background: ['#2563EB', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'][i],
                            left: `${15 + i * 15}%`,
                            top: '-8px',
                          }}
                          initial={{ y: 0, opacity: 1 }}
                          animate={{
                            y: [0, 60 + i * 20, 120 + i * 15],
                            opacity: [1, 1, 0],
                            x: [0, (i % 2 === 0 ? 1 : -1) * (10 + i * 5)],
                          }}
                          transition={{ duration: 1.2, delay: 0.1 + i * 0.08, ease: 'easeOut' }}
                        />
                      ))}
                    </div>

                    <motion.div
                      className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.2 }}
                    >
                      <CheckCircle className="w-8 h-8 text-emerald-600" />
                    </motion.div>

                    <motion.h2
                      className="text-2xl font-bold text-[#1A1A1A] mb-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35 }}
                    >
                      {t('booking_confirmed')}
                    </motion.h2>
                    <motion.p
                      className="text-sm text-[#6B7280] mb-6"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.45 }}
                    >
                      {t('booking_confirmed_desc')}
                    </motion.p>

                    <motion.div
                      className="bg-[#F3F2EF] rounded-xl p-4 text-left space-y-3 mb-6"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.55 }}
                    >
                      <div className="flex items-center gap-3 text-sm">
                        <CalendarDays className="w-4 h-4 text-[#9CA3AF] shrink-0" />
                        <span className="text-[#374151] font-medium">
                          {formatSelectedDate()} · {selectedTime}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Clock className="w-4 h-4 text-[#9CA3AF] shrink-0" />
                        <span className="text-[#374151]">{t('benefit_duration')}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Video className="w-4 h-4 text-[#9CA3AF] shrink-0" />
                        <span className="text-[#374151]">{t('benefit_video')}</span>
                      </div>
                    </motion.div>

                    <motion.div
                      className="space-y-3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.65 }}
                    >
                      <p className="text-sm font-medium text-[#1A1A1A] mb-3">{t('next_steps')}</p>
                      <div className="flex flex-col gap-2 text-left mb-4">
                        {(['next_step_1', 'next_step_2', 'next_step_3'] as const).map((key, i) => (
                          <div key={key} className="flex items-start gap-2 text-sm text-[#6B7280]">
                            <span className="w-5 h-5 rounded-full bg-[#2563EB]/10 text-[#2563EB] flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                              {i + 1}
                            </span>
                            <span>{t(key)}</span>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={handleReset}
                        className="w-full px-5 py-2.5 border border-black/[0.08] rounded-xl text-sm font-medium text-[#374151] hover:bg-[#F3F2EF] transition-colors"
                      >
                        {t('book_another')}
                      </button>
                      <p className="text-xs text-[#9CA3AF] mt-2">{t('or_signup')}</p>
                      <Link href="/signup" className="w-full block">
                        <button className="w-full px-5 py-2.5 bg-[#2563EB] text-white rounded-xl text-sm font-semibold hover:bg-[#1D4ED8] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                          {t('go_to_signup')}
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </Link>
                    </motion.div>
                  </div>
                </motion.div>
              ) : (
                /* Booking Flow */
                <motion.div
                  key="booking"
                  className="grid grid-cols-1 lg:grid-cols-12 gap-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, delay: 0.15 }}
                >
                  {/* Left panel — What to expect */}
                  <div className="lg:col-span-3 order-2 lg:order-1">
                    <ScrollReveal direction="left" delay={0.1}>
                      <div className="p-5 rounded-2xl border border-black/[0.06] bg-white lg:sticky lg:top-28">
                        <div className="flex items-center gap-2 mb-5">
                          <Sparkles className="w-4 h-4 text-[#2563EB]" />
                          <h3 className="text-sm font-bold text-[#1A1A1A]">{t('what_to_expect')}</h3>
                        </div>
                        <div className="space-y-4">
                          {benefits.map((b, i) => (
                            <div key={i} className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-lg bg-[#2563EB]/[0.06] flex items-center justify-center flex-shrink-0">
                                <b.icon className="w-4 h-4 text-[#2563EB]" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-[#1A1A1A]">{b.label}</p>
                                <p className="text-xs text-[#9CA3AF] leading-relaxed">{b.desc}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="mt-6 pt-5 border-t border-black/[0.06]">
                          <div className="flex items-center gap-2 mb-2">
                            <Users className="w-4 h-4 text-[#6B7280]" />
                            <span className="text-xs font-semibold text-[#6B7280]">{t('trusted_by')}</span>
                          </div>
                          <p className="text-xs text-[#9CA3AF] leading-relaxed">{t('trusted_by_desc')}</p>
                        </div>
                      </div>
                    </ScrollReveal>
                  </div>

                  {/* Center — Calendar */}
                  <div className="lg:col-span-4 order-1 lg:order-2">
                    <div className="p-5 rounded-2xl border border-black/[0.06] bg-white h-full">
                      <div className="flex items-center gap-2 mb-4">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            currentStep === 1
                              ? 'bg-[#2563EB] text-white'
                              : 'bg-emerald-500 text-white'
                          }`}
                        >
                          {currentStep > 1 ? <CheckCircle className="w-3.5 h-3.5" /> : '1'}
                        </span>
                        <h3 className="text-sm font-semibold text-[#1A1A1A]">{t('select_date')}</h3>
                      </div>
                      <CalendarPicker
                        selected={selectedDate}
                        onSelect={(d) => {
                          setSelectedDate(d);
                          setSelectedTime(null);
                        }}
                        minDate={new Date()}
                        disabledDays={[0, 6]}
                      />

                      {/* Time Slots — below calendar */}
                      <div className="mt-5 pt-5 border-t border-black/[0.06]">
                        <div className="flex items-center gap-2 mb-4">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              currentStep === 2
                                ? 'bg-[#2563EB] text-white'
                                : currentStep > 2
                                  ? 'bg-emerald-500 text-white'
                                  : 'bg-[#F3F2EF] text-[#9CA3AF]'
                            }`}
                          >
                            {currentStep > 2 ? <CheckCircle className="w-3.5 h-3.5" /> : '2'}
                          </span>
                          <h3 className="text-sm font-semibold text-[#1A1A1A]">{t('select_time')}</h3>
                        </div>
                        {selectedDate ? (
                          <TimeSlotPicker
                            slots={timeSlots}
                            selected={selectedTime}
                            onSelect={setSelectedTime}
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center py-10 text-center">
                            <CalendarDays className="w-7 h-7 text-[#D1D5DB] mb-2" />
                            <p className="text-sm text-[#9CA3AF]">{t('select_date_first')}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right — Details Form */}
                  <div className="lg:col-span-5 order-3">
                    <div className="p-5 rounded-2xl border border-black/[0.06] bg-white h-full">
                      <div className="flex items-center gap-2 mb-4">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            currentStep === 3
                              ? 'bg-[#2563EB] text-white'
                              : 'bg-[#F3F2EF] text-[#9CA3AF]'
                          }`}
                        >
                          3
                        </span>
                        <h3 className="text-sm font-semibold text-[#1A1A1A]">{t('your_details')}</h3>
                      </div>

                      {/* Summary bar when date+time selected */}
                      <AnimatePresence>
                        {selectedDate && selectedTime && (
                          <motion.div
                            className="flex items-center gap-3 p-3 rounded-xl bg-[#2563EB]/[0.04] border border-[#2563EB]/10 mb-4"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                          >
                            <CalendarDays className="w-4 h-4 text-[#2563EB] shrink-0" />
                            <span className="text-xs font-medium text-[#2563EB]">
                              {formatSelectedDate()} · {selectedTime}
                            </span>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-[#6B7280] mb-1">
                            {t('name')}
                          </label>
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={t('name_placeholder')}
                            className="w-full px-3.5 py-2.5 bg-white border border-black/[0.08] rounded-xl text-sm text-[#1A1A1A] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[#6B7280] mb-1">
                            {t('email')}
                          </label>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={t('email_placeholder')}
                            className="w-full px-3.5 py-2.5 bg-white border border-black/[0.08] rounded-xl text-sm text-[#1A1A1A] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[#6B7280] mb-1">
                            {t('company')}
                          </label>
                          <input
                            type="text"
                            value={company}
                            onChange={(e) => setCompany(e.target.value)}
                            placeholder={t('company_placeholder')}
                            className="w-full px-3.5 py-2.5 bg-white border border-black/[0.08] rounded-xl text-sm text-[#1A1A1A] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[#6B7280] mb-1">
                            {t('notes')}
                          </label>
                          <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder={t('notes_placeholder')}
                            rows={4}
                            className="w-full px-3.5 py-2.5 bg-white border border-black/[0.08] rounded-xl text-sm text-[#1A1A1A] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all resize-none"
                          />
                        </div>
                        <button
                          onClick={handleBook}
                          disabled={!canSubmit}
                          className={`w-full px-5 py-3.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                            canSubmit
                              ? 'bg-[#2563EB] text-white hover:bg-[#1D4ED8] active:scale-[0.98] shadow-lg shadow-[#2563EB]/20 cursor-pointer'
                              : 'bg-[#F3F2EF] text-[#9CA3AF] cursor-not-allowed'
                          }`}
                        >
                          {booking && <Loader2 className="w-4 h-4 animate-spin" />}
                          {t('confirm_booking')}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
