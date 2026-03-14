'use client';

import { Clock } from 'lucide-react';

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface TimeSlotPickerProps {
  slots: TimeSlot[];
  selected?: string | null;
  onSelect?: (time: string) => void;
  className?: string;
}

export function TimeSlotPicker({ slots, selected, onSelect, className = '' }: TimeSlotPickerProps) {
  if (slots.length === 0) {
    return (
      <div className={`flex items-center justify-center py-8 text-sm text-gray-400 ${className}`}>
        <Clock className="w-4 h-4 mr-2" />
        No available time slots
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-3 gap-2 ${className}`}>
      {slots.map((slot) => (
        <button
          key={slot.time}
          type="button"
          disabled={!slot.available}
          onClick={() => slot.available && onSelect?.(slot.time)}
          className={`
            px-3 py-2.5 rounded-md text-sm font-medium transition-all text-center
            ${selected === slot.time
              ? 'bg-blue-600 text-white'
              : slot.available
                ? 'bg-white border border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50 cursor-pointer'
                : 'bg-gray-50 text-gray-300 cursor-not-allowed line-through'
            }
          `}
        >
          {slot.time}
        </button>
      ))}
    </div>
  );
}
