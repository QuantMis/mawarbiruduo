'use client';

import {
  useState,
  useCallback,
  useEffect,
  useRef,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import useSWR from 'swr';
import { Card, CardBody, Badge, Skeleton, Alert, EmptyState, Button } from '@/components/ui';
import { getCalendarDays } from '@/lib/utils/calendar';

/* ─── Constants ─── */

const BULAN_NAMA = [
  'Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun',
  'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember',
] as const;

const HARI_PENUH = ['Ahd', 'Isn', 'Sel', 'Rab', 'Kha', 'Jum', 'Sab'] as const;
const HARI_SINGKAT = ['A', 'I', 'S', 'R', 'K', 'J', 'S'] as const;

const HARI_PENUH_ARIA = [
  'Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu',
] as const;

/* ─── Types ─── */

interface TempahanItem {
  readonly tarikh: string;
  readonly namaTempahan: string;
  readonly pakejNama: string;
  readonly pakejWarna: string;
}

interface PakejItem {
  readonly id: string;
  readonly namaPakej: string;
  readonly warna: string;
}

interface KalendarData {
  readonly tempahan: readonly TempahanItem[];
  readonly pakej: readonly PakejItem[];
}

interface ApiResponse {
  readonly success: boolean;
  readonly data: KalendarData | null;
  readonly error: string | null;
}

/* ─── Fetcher ─── */

async function fetcher(url: string): Promise<KalendarData> {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => null) as ApiResponse | null;
    throw new Error(body?.error ?? 'Gagal memuatkan data kalendar');
  }
  const json = (await res.json()) as ApiResponse;
  if (!json.success || !json.data) {
    throw new Error(json.error ?? 'Data tidak sah');
  }
  return json.data;
}

/* ─── Helpers ─── */

function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getBookingsForDate(
  tempahan: readonly TempahanItem[],
  dateKey: string,
): readonly TempahanItem[] {
  return tempahan.filter((t) => t.tarikh === dateKey);
}

/* ─── Navigation range ─── */

function getNavBounds(): { readonly minMonth: number; readonly minYear: number; readonly maxMonth: number; readonly maxYear: number } {
  const now = new Date();
  const min = new Date(now.getFullYear(), now.getMonth() - 12, 1);
  const max = new Date(now.getFullYear(), now.getMonth() + 12, 1);
  return {
    minMonth: min.getMonth() + 1,
    minYear: min.getFullYear(),
    maxMonth: max.getMonth() + 1,
    maxYear: max.getFullYear(),
  };
}

function canGoPrev(month: number, year: number): boolean {
  const bounds = getNavBounds();
  return year > bounds.minYear || (year === bounds.minYear && month > bounds.minMonth);
}

function canGoNext(month: number, year: number): boolean {
  const bounds = getNavBounds();
  return year < bounds.maxYear || (year === bounds.maxYear && month < bounds.maxMonth);
}

/* ─── Component ─── */

export function Kalendar() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  const popoverRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const cellRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const { data, error, isLoading, mutate } = useSWR<KalendarData>(
    `/api/kalendar?bulan=${month}&tahun=${year}`,
    fetcher,
    { revalidateOnFocus: false },
  );

  const days = getCalendarDays(month, year);
  const tempahan = data?.tempahan ?? [];
  const pakej = data?.pakej ?? [];

  /* ─── Navigation ─── */

  const goToPrev = useCallback(() => {
    if (!canGoPrev(month, year)) return;
    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
    setSelectedDate(null);
    setFocusedIndex(null);
  }, [month, year]);

  const goToNext = useCallback(() => {
    if (!canGoNext(month, year)) return;
    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
    setSelectedDate(null);
    setFocusedIndex(null);
  }, [month, year]);

  /* ─── Close popover on outside click / Escape ─── */

  useEffect(() => {
    if (!selectedDate) return;

    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setSelectedDate(null);
      }
    }

    function handleEscape(e: globalThis.KeyboardEvent) {
      if (e.key === 'Escape') {
        setSelectedDate(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [selectedDate]);

  /* ─── Keyboard navigation ─── */

  const handleGridKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLDivElement>) => {
      const total = days.length;
      if (focusedIndex === null) return;

      let nextIndex = focusedIndex;

      switch (e.key) {
        case 'ArrowRight':
          nextIndex = Math.min(focusedIndex + 1, total - 1);
          e.preventDefault();
          break;
        case 'ArrowLeft':
          nextIndex = Math.max(focusedIndex - 1, 0);
          e.preventDefault();
          break;
        case 'ArrowDown':
          nextIndex = Math.min(focusedIndex + 7, total - 1);
          e.preventDefault();
          break;
        case 'ArrowUp':
          nextIndex = Math.max(focusedIndex - 7, 0);
          e.preventDefault();
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          {
            const day = days[focusedIndex];
            if (day) {
              const dateKey = formatDateKey(day.date);
              setSelectedDate((prev) => (prev === dateKey ? null : dateKey));
            }
          }
          return;
        default:
          return;
      }

      setFocusedIndex(nextIndex);
      cellRefs.current[nextIndex]?.focus();
    },
    [days, focusedIndex],
  );

  /* ─── Render states ─── */

  if (isLoading) {
    return <CalendarSkeleton />;
  }

  if (error) {
    return (
      <Alert
        variant="error"
        message={error instanceof Error ? error.message : 'Gagal memuatkan kalendar'}
        action={
          <Button variant="ghost" size="sm" onClick={() => mutate()}>
            Cuba semula
          </Button>
        }
        data-testid="kalendar-error"
      />
    );
  }

  return (
    <Card data-testid="kalendar-card">
      <CardBody className="p-4 sm:p-6">
        {/* Month navigation */}
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={goToPrev}
            disabled={!canGoPrev(month, year)}
            aria-label="Bulan sebelumnya"
            data-testid="kalendar-prev"
          >
            <ChevronLeftIcon />
          </Button>

          <h3
            className="font-serif text-lg font-semibold text-navy sm:text-xl"
            aria-live="polite"
            data-testid="kalendar-month-label"
          >
            {BULAN_NAMA[month - 1]} {year}
          </h3>

          <Button
            variant="ghost"
            size="sm"
            onClick={goToNext}
            disabled={!canGoNext(month, year)}
            aria-label="Bulan seterusnya"
            data-testid="kalendar-next"
          >
            <ChevronRightIcon />
          </Button>
        </div>

        {/* Day headers */}
        <div
          className="mb-2 grid grid-cols-7 gap-1"
          role="row"
          aria-label="Hari dalam minggu"
        >
          {HARI_PENUH.map((hari, i) => (
            <div
              key={hari}
              className="py-2 text-center text-xs font-medium uppercase text-navy/60"
              role="columnheader"
              aria-label={HARI_PENUH_ARIA[i]}
            >
              <span className="hidden sm:inline">{hari}</span>
              <span className="sm:hidden">{HARI_SINGKAT[i]}</span>
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div
          ref={gridRef}
          className="grid grid-cols-7 gap-1"
          role="grid"
          aria-label="Kalendar tempahan"
          onKeyDown={handleGridKeyDown}
          data-testid="kalendar-grid"
        >
          {days.map((day, index) => {
            const dateKey = formatDateKey(day.date);
            const bookings = getBookingsForDate(tempahan, dateKey);
            const hasBookings = bookings.length > 0;
            const isSelected = selectedDate === dateKey;

            return (
              <div key={dateKey} className="relative">
                <button
                  ref={(el) => { cellRefs.current[index] = el; }}
                  type="button"
                  role="gridcell"
                  tabIndex={focusedIndex === index ? 0 : -1}
                  aria-label={`${day.date.getDate()} ${BULAN_NAMA[day.date.getMonth()]} ${day.date.getFullYear()}${hasBookings ? `, ${bookings.length} acara` : ''}`}
                  aria-selected={isSelected}
                  className={buildCellClasses(day, isSelected)}
                  onClick={() => {
                    setFocusedIndex(index);
                    if (hasBookings) {
                      setSelectedDate(isSelected ? null : dateKey);
                    }
                  }}
                  onFocus={() => setFocusedIndex(index)}
                >
                  <span className="text-sm font-medium">{day.date.getDate()}</span>

                  {/* Booking dots */}
                  {hasBookings && (
                    <div className="mt-0.5 flex items-center justify-center gap-0.5">
                      {bookings.length <= 3 ? (
                        bookings.map((b, bi) => (
                          <span
                            key={bi}
                            className="motion-safe:animate-scale-in block h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: b.pakejWarna }}
                            aria-hidden="true"
                          />
                        ))
                      ) : (
                        <span className="text-[10px] font-medium text-navy/70">
                          {bookings.length} acara
                        </span>
                      )}
                    </div>
                  )}
                </button>

                {/* Popover */}
                {isSelected && hasBookings && (
                  <DatePopover
                    ref={popoverRef}
                    bookings={bookings}
                    dateLabel={`${day.date.getDate()} ${BULAN_NAMA[day.date.getMonth()]}`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Empty month message */}
        {tempahan.length === 0 && (
          <EmptyState
            title="Tiada tempahan"
            description="Tiada tempahan untuk bulan ini."
            className="mt-4"
            data-testid="kalendar-empty"
            icon={<CalendarIcon />}
          />
        )}

        {/* Colour legend */}
        {pakej.length > 0 && (
          <div
            className="mt-6 flex flex-wrap items-center gap-4 border-t border-navy/10 pt-4"
            aria-label="Legenda pakej"
            data-testid="kalendar-legend"
          >
            {pakej.map((p) => (
              <div key={p.id} className="flex items-center gap-2">
                <span
                  className="block h-3 w-3 rounded-full"
                  style={{ backgroundColor: p.warna }}
                  aria-hidden="true"
                />
                <span className="text-xs text-navy/70">{p.namaPakej}</span>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}

/* ─── Cell class builder ─── */

function buildCellClasses(
  day: { readonly isCurrentMonth: boolean; readonly isToday: boolean },
  isSelected: boolean,
): string {
  const base = [
    'flex flex-col items-center justify-center',
    'min-h-[44px] min-w-[44px] rounded-lg p-1',
    'transition-colors duration-100 motion-reduce:transition-none',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dusty-rose',
    'cursor-pointer',
  ];

  if (!day.isCurrentMonth) {
    base.push('bg-cream opacity-40');
  } else if (isSelected) {
    base.push('bg-dusty-rose/20 text-navy');
  } else {
    base.push('bg-cream text-dark hover:bg-cream-dark');
  }

  if (day.isToday) {
    base.push('ring-2 ring-dusty-rose');
  }

  return base.join(' ');
}

/* ─── Date popover ─── */

import { forwardRef } from 'react';

interface DatePopoverProps {
  readonly bookings: readonly TempahanItem[];
  readonly dateLabel: string;
}

const DatePopover = forwardRef<HTMLDivElement, DatePopoverProps>(
  function DatePopover({ bookings, dateLabel }, ref) {
    return (
      <>
        {/* Desktop popover */}
        <div
          ref={ref}
          className="
            motion-safe:animate-fade-in
            absolute left-1/2 top-full z-30 mt-1 -translate-x-1/2
            hidden sm:block
            w-56 rounded-lg bg-white p-3 shadow-elevated
            border border-navy/10
          "
          role="dialog"
          aria-label={`Tempahan pada ${dateLabel}`}
          data-testid="kalendar-popover"
        >
          <p className="mb-2 text-xs font-semibold text-navy/50">{dateLabel}</p>
          <ul className="space-y-2">
            {bookings.map((b, i) => (
              <li key={i} className="flex items-start gap-2">
                <Badge
                  variant="custom"
                  className="mt-0.5 shrink-0 text-white"
                  style={{ backgroundColor: b.pakejWarna }}
                >
                  {b.pakejNama}
                </Badge>
                <span className="text-sm text-navy">{b.namaTempahan}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Mobile bottom sheet */}
        <div
          className="
            motion-safe:animate-slide-up
            fixed inset-x-0 bottom-0 z-50
            sm:hidden
            rounded-t-2xl bg-white p-4 shadow-elevated
            border-t border-navy/10
          "
          role="dialog"
          aria-label={`Tempahan pada ${dateLabel}`}
          data-testid="kalendar-bottom-sheet"
        >
          <div className="mx-auto mb-3 h-1 w-8 rounded-full bg-navy/20" aria-hidden="true" />
          <p className="mb-3 font-serif text-sm font-semibold text-navy">{dateLabel}</p>
          <ul className="space-y-3">
            {bookings.map((b, i) => (
              <li key={i} className="flex items-start gap-2">
                <Badge
                  variant="custom"
                  className="mt-0.5 shrink-0 text-white"
                  style={{ backgroundColor: b.pakejWarna }}
                >
                  {b.pakejNama}
                </Badge>
                <span className="text-sm text-navy">{b.namaTempahan}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Mobile backdrop */}
        <div
          className="fixed inset-0 z-40 bg-navy/30 sm:hidden"
          aria-hidden="true"
        />
      </>
    );
  },
);

/* ─── Loading skeleton ─── */

function CalendarSkeleton() {
  return (
    <Card data-testid="kalendar-skeleton">
      <CardBody className="p-4 sm:p-6">
        {/* Nav skeleton */}
        <div className="mb-6 flex items-center justify-between">
          <Skeleton className="h-8 w-8" variant="rect" />
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-8 w-8" variant="rect" />
        </div>

        {/* Day headers skeleton */}
        <div className="mb-2 grid grid-cols-7 gap-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-6" />
          ))}
        </div>

        {/* Grid skeleton - 5 rows */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 35 }).map((_, i) => (
            <Skeleton key={i} className="h-11 min-h-[44px]" variant="rect" />
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

/* ─── Icons ─── */

function ChevronLeftIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-12 w-12"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
      />
    </svg>
  );
}
