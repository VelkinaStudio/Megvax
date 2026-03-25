'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Clock, Video, Shield, CheckCircle, CalendarDays, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Nav } from '@/components/marketing/landing/Nav';
import { Footer } from '@/components/marketing/landing/Footer';
import { useTranslations } from '@/lib/i18n';
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

export default function BookPage() {
  const t = useTranslations('book');

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [notes, setNotes] = useState('');
  const [booked, setBooked] = useState(false);

  const timeSlots = useMemo(() => generateTimeSlots(selectedDate), [selectedDate]);

  const canSubmit = selectedDate && selectedTime && name.trim() && email.trim();

  const handleBook = () => {
    if (!canSubmit) return;
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
    { icon: Clock, label: t('benefit_duration') },
    { icon: Video, label: t('benefit_video') },
    { icon: Shield, label: t('benefit_free') },
  ];

  return (
    <main className="min-h-screen bg-[#FAFAF8] overflow-x-hidden">
      <Nav />

      <section className="pt-24 pb-20 md:pt-32 md:pb-28">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <motion.div
              className="text-center mb-10"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
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

            {/* Benefits row */}
            <motion.div
              className="flex flex-wrap justify-center gap-6 mb-10"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {benefits.map((b, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-[#6B7280]">
                  <b.icon className="w-4 h-4 text-[#2563EB]" />
                  <span className="font-medium">{b.label}</span>
                </div>
              ))}
            </motion.div>

            {/* Booking Flow */}
            {booked ? (
              <motion.div
                className="max-w-lg mx-auto"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <div className="bg-[#FAFAF8] border border-black/[0.08] rounded-xl p-8 text-center">
                  <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">{t('booking_confirmed')}</h2>
                  <p className="text-sm text-[#6B7280] mb-6">{t('booking_confirmed_desc')}</p>

                  <div className="bg-[#F3F2EF] rounded-lg p-4 text-left space-y-2.5 mb-6">
                    <div className="flex items-center gap-3 text-sm">
                      <CalendarDays className="w-4 h-4 text-[#9CA3AF] shrink-0" />
                      <span className="text-[#374151]">{formatSelectedDate()} · {selectedTime}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Clock className="w-4 h-4 text-[#9CA3AF] shrink-0" />
                      <span className="text-[#374151]">{t('benefit_duration')}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Video className="w-4 h-4 text-[#9CA3AF] shrink-0" />
                      <span className="text-[#374151]">{t('benefit_video')}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <button
                      onClick={handleReset}
                      className="w-full px-5 py-2.5 border border-black/[0.08] rounded-lg text-sm font-medium text-[#374151] hover:bg-[#F3F2EF] transition-colors"
                    >
                      {t('book_another')}
                    </button>
                    <p className="text-xs text-[#9CA3AF] mt-2">{t('or_signup')}</p>
                    <Link href="/signup" className="w-full">
                      <button className="w-full px-5 py-2.5 bg-[#2563EB] text-white rounded-lg text-sm font-semibold hover:bg-[#1D4ED8] transition-colors flex items-center justify-center gap-2">
                        {t('go_to_signup')}
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                className="grid grid-cols-1 lg:grid-cols-3 gap-5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
              >
                {/* Calendar */}
                <div className="bg-[#FAFAF8] border border-black/[0.08] rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4">{t('select_date')}</h3>
                  <CalendarPicker
                    selected={selectedDate}
                    onSelect={(d) => { setSelectedDate(d); setSelectedTime(null); }}
                    minDate={new Date()}
                    disabledDays={[0, 6]}
                  />
                </div>

                {/* Time Slots */}
                <div className="bg-[#FAFAF8] border border-black/[0.08] rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4">{t('select_time')}</h3>
                  {selectedDate ? (
                    <TimeSlotPicker
                      slots={timeSlots}
                      selected={selectedTime}
                      onSelect={setSelectedTime}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <CalendarDays className="w-8 h-8 text-[#D1D5DB] mb-3" />
                      <p className="text-sm text-[#9CA3AF]">{t('select_date_first')}</p>
                    </div>
                  )}
                </div>

                {/* Details Form */}
                <div className="bg-[#FAFAF8] border border-black/[0.08] rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4">{t('your_details')}</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-[#6B7280] mb-1">{t('name')}</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={t('name_placeholder')}
                        className="w-full px-3 py-2.5 border border-black/[0.08] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#6B7280] mb-1">{t('email')}</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t('email_placeholder')}
                        className="w-full px-3 py-2.5 border border-black/[0.08] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#6B7280] mb-1">{t('company')}</label>
                      <input
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder={t('company_placeholder')}
                        className="w-full px-3 py-2.5 border border-black/[0.08] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#6B7280] mb-1">{t('notes')}</label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder={t('notes_placeholder')}
                        rows={3}
                        className="w-full px-3 py-2.5 border border-black/[0.08] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-colors resize-none"
                      />
                    </div>
                    <button
                      onClick={handleBook}
                      disabled={!canSubmit}
                      className={`w-full px-5 py-3 rounded-lg text-sm font-semibold transition-all ${
                        canSubmit
                          ? 'bg-[#2563EB] text-white hover:bg-[#1D4ED8] cursor-pointer'
                          : 'bg-[#F3F2EF] text-[#9CA3AF] cursor-not-allowed'
                      }`}
                    >
                      {t('confirm_booking')}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
