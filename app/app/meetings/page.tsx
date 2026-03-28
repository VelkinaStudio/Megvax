'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from '@/lib/i18n';
import { Calendar, TimeSlotPicker, Card, Button, Input, Select, Textarea, Badge } from '@/components/ui';
import { CalendarDays, Clock, Video, CheckCircle, Plus, ArrowLeft, X } from 'lucide-react';
import type { TimeSlot } from '@/components/ui';

interface Meeting {
  id: string;
  date: string;
  time: string;
  topic: string;
  topicKey: string;
  name: string;
  email: string;
  notes: string;
  status: 'confirmed' | 'cancelled' | 'completed';
}

const initialMeetings: Meeting[] = [];

function generateTimeSlots(date: Date | null): TimeSlot[] {
  if (!date) return [];
  const day = date.getDay();
  if (day === 0 || day === 6) return [];

  const slots: TimeSlot[] = [];
  const bookedTimes = ['10:30', '14:00'];

  for (let h = 9; h <= 17; h++) {
    for (const m of ['00', '30']) {
      if (h === 17 && m === '30') continue;
      const time = `${h.toString().padStart(2, '0')}:${m}`;
      const isBooked = bookedTimes.includes(time);
      slots.push({ time, available: !isBooked });
    }
  }
  return slots;
}

type ViewMode = 'list' | 'schedule';

export default function MeetingsPage() {
  const t = useTranslations('meetings');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- reserved for future use
  const tc = useTranslations('common');

  const [view, setView] = useState<ViewMode>('list');
  const [meetings, setMeetings] = useState<Meeting[]>(initialMeetings);
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [formName, setFormName] = useState('Demo User');
  const [formEmail, setFormEmail] = useState('demo@megvax.com');
  const [formTopic, setFormTopic] = useState('topic_strategy');
  const [formNotes, setFormNotes] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const timeSlots = useMemo(() => generateTimeSlots(selectedDate), [selectedDate]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingMeetings = meetings.filter(m => m.status === 'confirmed' && new Date(m.date) >= today);
  const pastMeetings = meetings.filter(m => m.status === 'completed' || m.status === 'cancelled' || (m.status === 'confirmed' && new Date(m.date) < today));

  const topicOptions = [
    { value: 'topic_onboarding', label: t('topic_onboarding') },
    { value: 'topic_strategy', label: t('topic_strategy') },
    { value: 'topic_performance', label: t('topic_performance') },
    { value: 'topic_billing', label: t('topic_billing') },
    { value: 'topic_other', label: t('topic_other') },
  ];

  const handleBook = () => {
    if (!selectedDate || !selectedTime || !formName || !formEmail) return;

    const newMeeting: Meeting = {
      id: String(Date.now()),
      date: selectedDate.toISOString().split('T')[0],
      time: selectedTime,
      topic: topicOptions.find(o => o.value === formTopic)?.label ?? formTopic,
      topicKey: formTopic,
      name: formName,
      email: formEmail,
      notes: formNotes,
      status: 'confirmed',
    };

    setMeetings(prev => [newMeeting, ...prev]);
    setBookingSuccess(true);
  };

  const handleCancel = (id: string) => {
    setMeetings(prev => prev.map(m => m.id === id ? { ...m, status: 'cancelled' as const } : m));
  };

  const resetScheduleForm = () => {
    setSelectedDate(null);
    setSelectedTime(null);
    setFormNotes('');
    setBookingSuccess(false);
    setView('list');
  };

  const statusBadge = (status: Meeting['status']) => {
    switch (status) {
      case 'confirmed':
        return <Badge variant="success">{t('status_confirmed')}</Badge>;
      case 'cancelled':
        return <Badge variant="danger">{t('status_cancelled')}</Badge>;
      case 'completed':
        return <Badge variant="neutral">{t('status_completed')}</Badge>;
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (view === 'schedule') {
    if (bookingSuccess) {
      return (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <button onClick={resetScheduleForm} className="p-2 hover:bg-gray-100 rounded-md transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-500" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">{t('booking_confirmed')}</h1>
          </div>

          <Card padding="lg" className="max-w-lg">
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">{t('booking_confirmed')}</h2>
              <p className="text-sm text-gray-500 mb-6">{t('booking_confirmed_desc')}</p>

              <div className="bg-gray-50 rounded-lg p-4 text-left space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <CalendarDays className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">{selectedDate && formatDate(selectedDate.toISOString().split('T')[0])} · {selectedTime}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">{t('duration')}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Video className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">{t('video_call')} {t('with_team')}</span>
                </div>
              </div>

              <Button variant="primary" className="mt-6" onClick={resetScheduleForm}>
                {t('back_to_meetings')}
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setView('list')} className="p-2 hover:bg-gray-100 rounded-md transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('schedule_meeting')}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{t('duration')} · {t('video_call')} {t('with_team')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <Card padding="lg">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">{t('select_date')}</h3>
            <Calendar
              selected={selectedDate}
              onSelect={(d) => { setSelectedDate(d); setSelectedTime(null); }}
              minDate={new Date()}
              disabledDays={[0, 6]}
            />
          </Card>

          {/* Time Slots */}
          <Card padding="lg">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">{t('select_time')}</h3>
            {selectedDate ? (
              <TimeSlotPicker
                slots={timeSlots}
                selected={selectedTime}
                onSelect={setSelectedTime}
              />
            ) : (
              <div className="flex items-center justify-center py-12 text-sm text-gray-400">
                <CalendarDays className="w-4 h-4 mr-2" />
                {t('select_date')}
              </div>
            )}
          </Card>

          {/* Details Form */}
          <Card padding="lg">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">{t('meeting_details')}</h3>
            <div className="space-y-4">
              <Input
                label={t('your_name')}
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
              <Input
                label={t('your_email')}
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
              />
              <Select
                label={t('meeting_topic')}
                value={formTopic}
                onChange={(e) => setFormTopic(e.target.value)}
                options={topicOptions}
              />
              <Textarea
                label={t('notes')}
                placeholder={t('notes_placeholder')}
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                rows={3}
              />
              <Button
                variant="primary"
                className="w-full"
                disabled={!selectedDate || !selectedTime || !formName || !formEmail}
                onClick={handleBook}
              >
                {t('confirm_booking')}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-sm text-gray-500 mt-1">{t('description')}</p>
        </div>
        <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setView('schedule')}>
          {t('schedule_meeting')}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        <button
          onClick={() => setTab('upcoming')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            tab === 'upcoming'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          {t('upcoming')} ({upcomingMeetings.length})
        </button>
        <button
          onClick={() => setTab('past')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            tab === 'past'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          {t('past')} ({pastMeetings.length})
        </button>
      </div>

      {/* Meeting List */}
      {tab === 'upcoming' ? (
        upcomingMeetings.length > 0 ? (
          <div className="space-y-3">
            {upcomingMeetings.map(meeting => (
              <Card key={meeting.id} padding="md" className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                  <Video className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900">{meeting.topic}</p>
                    {statusBadge(meeting.status)}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {formatDate(meeting.date)} · {meeting.time} · {t('duration')}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCancel(meeting.id)}
                  icon={<X className="w-4 h-4" />}
                >
                  {t('cancel_meeting')}
                </Button>
              </Card>
            ))}
          </div>
        ) : (
          <Card padding="lg" className="text-center py-12">
            <CalendarDays className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-gray-900">{t('no_upcoming')}</p>
            <p className="text-sm text-gray-500 mt-1">{t('no_upcoming_desc')}</p>
            <Button variant="primary" className="mt-4" onClick={() => setView('schedule')}>
              {t('schedule_meeting')}
            </Button>
          </Card>
        )
      ) : (
        pastMeetings.length > 0 ? (
          <div className="space-y-3">
            {pastMeetings.map(meeting => (
              <Card key={meeting.id} padding="md" className="flex items-center gap-4 opacity-75">
                <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center shrink-0">
                  <Video className="w-5 h-5 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900">{meeting.topic}</p>
                    {statusBadge(meeting.status)}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {formatDate(meeting.date)} · {meeting.time}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card padding="lg" className="text-center py-12">
            <CalendarDays className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-gray-900">{t('no_past')}</p>
            <p className="text-sm text-gray-500 mt-1">{t('no_past_desc')}</p>
          </Card>
        )
      )}
    </div>
  );
}
