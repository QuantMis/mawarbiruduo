'use client';

import { useState, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface SlotTemujanji {
  readonly id: string;
  readonly tarikh: string;
  readonly masaMula: string;
  readonly masaTamat: string;
}

interface TemujanjiCalendarProps {
  readonly slots: readonly SlotTemujanji[];
  readonly selectedDate: string | null;
  readonly onSelectDate: (dateKey: string | null) => void;
}

const DAY_HEADERS = ['Isn', 'Sel', 'Rab', 'Kha', 'Jum', 'Sab', 'Ahd'] as const;

function getCalendarDays(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1).getDay();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) {
    days.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(d);
  }
  return days;
}

function getMonthLabel(year: number, month: number): string {
  return new Date(year, month, 1).toLocaleDateString('ms-MY', {
    month: 'long',
    year: 'numeric',
  });
}

function toDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function TemujanjiCalendar({ slots, selectedDate, onSelectDate }: TemujanjiCalendarProps) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  // Count available slots per date key
  const slotCountByDate = useMemo(() => {
    const map = new Map<string, number>();
    for (const slot of slots) {
      const dateKey = slot.tarikh.split('T')[0];
      map.set(dateKey, (map.get(dateKey) ?? 0) + 1);
    }
    return map;
  }, [slots]);

  const calendarDays = useMemo(() => getCalendarDays(year, month), [year, month]);

  const todayKey = toDateKey(now.getFullYear(), now.getMonth(), now.getDate());

  const goToPrevMonth = useCallback(() => {
    if (month === 0) {
      setYear((y) => y - 1);
      setMonth(11);
    } else {
      setMonth((m) => m - 1);
    }
  }, [month]);

  const goToNextMonth = useCallback(() => {
    if (month === 11) {
      setYear((y) => y + 1);
      setMonth(0);
    } else {
      setMonth((m) => m + 1);
    }
  }, [month]);

  // Don't allow navigating to past months
  const canGoPrev = year > now.getFullYear() || (year === now.getFullYear() && month > now.getMonth());

  return (
    <div className="space-y-3">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={goToPrevMonth}
          disabled={!canGoPrev}
          className={cn(
            'rounded-full p-2 transition-colors',
            'motion-reduce:transition-none',
            canGoPrev
              ? 'text-navy/60 hover:bg-navy/5 hover:text-navy'
              : 'text-navy/20 cursor-not-allowed',
          )}
          aria-label="Bulan sebelumnya"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </button>
        <h3 className="font-serif text-base font-semibold text-navy capitalize">
          {getMonthLabel(year, month)}
        </h3>
        <button
          type="button"
          onClick={goToNextMonth}
          className="rounded-full p-2 text-navy/60 transition-colors hover:bg-navy/5 hover:text-navy motion-reduce:transition-none"
          aria-label="Bulan seterusnya"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day headers */}
        {DAY_HEADERS.map((day) => (
          <div
            key={day}
            className="py-2 text-center text-xs font-semibold text-navy/50"
          >
            {day}
          </div>
        ))}

        {/* Day cells */}
        {calendarDays.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} className="aspect-square" />;
          }

          const dateKey = toDateKey(year, month, day);
          const slotCount = slotCountByDate.get(dateKey) ?? 0;
          const isToday = dateKey === todayKey;
          const isSelected = dateKey === selectedDate;
          const isPast = dateKey < todayKey;
          const hasSlots = slotCount > 0;

          return (
            <button
              key={day}
              type="button"
              disabled={!hasSlots || isPast}
              onClick={() => onSelectDate(isSelected ? null : dateKey)}
              className={cn(
                'aspect-square rounded-lg flex flex-col items-center justify-center gap-0.5 text-xs transition-all duration-150',
                'motion-reduce:transition-none',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dusty-rose focus-visible:ring-offset-1',
                isSelected
                  ? 'bg-navy text-cream shadow-card scale-105'
                  : hasSlots && !isPast
                    ? 'bg-dusty-rose/20 text-navy border border-dusty-rose/40 hover:bg-dusty-rose/40 hover:border-dusty-rose cursor-pointer'
                    : isPast
                      ? 'text-navy/20 cursor-default'
                      : 'text-navy/30 cursor-default',
                isToday && !isSelected && 'ring-1 ring-navy/30',
              )}
              aria-label={
                hasSlots
                  ? `${day}, ${slotCount} slot tersedia`
                  : `${day}, tiada slot`
              }
              aria-pressed={isSelected}
            >
              <span className={cn('font-medium', isSelected ? 'text-cream' : '')}>
                {day}
              </span>
              {hasSlots && !isPast && (
                <span
                  className={cn(
                    'text-[9px] leading-none font-medium',
                    isSelected ? 'text-cream/80' : 'text-dusty-rose-dark',
                  )}
                >
                  {slotCount} slot
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 pt-2">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded border border-dusty-rose/40 bg-dusty-rose/20" />
          <span className="text-xs text-navy/50">Slot tersedia</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-navy" />
          <span className="text-xs text-navy/50">Dipilih</span>
        </div>
      </div>
    </div>
  );
}

TemujanjiCalendar.displayName = 'TemujanjiCalendar';

export { TemujanjiCalendar };
