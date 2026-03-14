'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface CalendarProps {
  selected?: Date | null;
  onSelect?: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
  disabledDays?: number[];
  locale?: string;
  className?: string;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isDateDisabled(date: Date, minDate?: Date, maxDate?: Date, disabledDates?: Date[], disabledDays?: number[]) {
  if (minDate && date < new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate())) return true;
  if (maxDate && date > new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate())) return true;
  if (disabledDays?.includes(date.getDay())) return true;
  if (disabledDates?.some(d => isSameDay(d, date))) return true;
  return false;
}

export function Calendar({
  selected,
  onSelect,
  minDate,
  maxDate,
  disabledDates,
  disabledDays = [0, 6],
  locale = 'en',
  className = '',
}: CalendarProps) {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(selected?.getMonth() ?? today.getMonth());
  const [viewYear, setViewYear] = useState(selected?.getFullYear() ?? today.getFullYear());

  const dayNames = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(locale === 'tr' ? 'tr-TR' : 'en-US', { weekday: 'short' });
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(2024, 0, i + 1);
      return formatter.format(d);
    });
  }, [locale]);

  const monthName = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(locale === 'tr' ? 'tr-TR' : 'en-US', { month: 'long', year: 'numeric' });
    return formatter.format(new Date(viewYear, viewMonth, 1));
  }, [viewMonth, viewYear, locale]);

  const days = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const lastDay = new Date(viewYear, viewMonth + 1, 0);
    const startOffset = (firstDay.getDay() + 6) % 7;

    const cells: (Date | null)[] = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) {
      cells.push(new Date(viewYear, viewMonth, d));
    }
    return cells;
  }, [viewMonth, viewYear]);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(y => y - 1);
    } else {
      setViewMonth(m => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(y => y + 1);
    } else {
      setViewMonth(m => m + 1);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Previous month"
          type="button"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-semibold text-gray-900 capitalize">{monthName}</span>
        <button
          onClick={nextMonth}
          className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Next month"
          type="button"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 mb-1">
        {dayNames.map((name, i) => (
          <div key={i} className="text-center text-[11px] font-medium text-gray-400 uppercase tracking-wider py-1.5">
            {name.slice(0, 2)}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {days.map((date, i) => {
          if (!date) {
            return <div key={`empty-${i}`} className="aspect-square" />;
          }

          const isToday = isSameDay(date, today);
          const isSelected = selected ? isSameDay(date, selected) : false;
          const disabled = isDateDisabled(date, minDate, maxDate, disabledDates, disabledDays);
          const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());

          return (
            <button
              key={date.toISOString()}
              type="button"
              disabled={disabled || isPast}
              onClick={() => onSelect?.(date)}
              className={`
                aspect-square flex items-center justify-center rounded-md text-sm font-medium transition-all
                ${isSelected
                  ? 'bg-blue-600 text-white'
                  : isToday
                    ? 'bg-blue-50 text-blue-600 font-semibold'
                    : disabled || isPast
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-100 cursor-pointer'
                }
              `}
              aria-label={date.toLocaleDateString()}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
