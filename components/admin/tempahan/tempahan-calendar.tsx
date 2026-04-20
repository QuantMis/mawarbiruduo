'use client';

import { useState, useCallback } from 'react';
import useSWR from 'swr';
import { Card, CardBody } from '@/components/ui/card';
import { toast } from '@/components/ui/toast';
import { TempahanForm } from './tempahan-form';

interface SlotTempahan {
  readonly id: string;
  readonly tarikh: string;
  readonly status: 'TERSEDIA' | 'DITEMPAH' | 'DIBATALKAN';
  readonly tempahan?: { readonly id: string; readonly namaTempahan: string } | null;
}

interface TempahanItem {
  readonly id: string;
  readonly namaTempahan: string;
  readonly nota: string | null;
  readonly createdAt: string;
  readonly slotTempahanId: string;
  readonly slotTempahan: { readonly id: string; readonly tarikh: string; readonly status: string };
  readonly pakej: { readonly id: string; readonly namaPakej: string; readonly warna: string };
  readonly pelanggan: { readonly id: string; readonly nama: string; readonly noTelefon: string };
}

interface SlotApiResponse {
  readonly success: boolean;
  readonly data: {
    readonly data: readonly SlotTempahan[];
    readonly meta: { readonly total: number };
  } | null;
}

interface TempahanApiResponse {
  readonly success: boolean;
  readonly data: {
    readonly items: readonly TempahanItem[];
    readonly meta: { readonly total: number; readonly page: number; readonly limit: number };
  } | null;
}

const DAY_HEADERS = ['Isn', 'Sel', 'Rab', 'Kha', 'Jum', 'Sab', 'Ahd'] as const;

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function formatMonth(year: number, month: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}`;
}

function getMonthLabel(year: number, month: number): string {
  const date = new Date(year, month, 1);
  return date.toLocaleDateString('ms-MY', { month: 'long', year: 'numeric' });
}

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

export function TempahanCalendar() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [showForm, setShowForm] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const monthParam = formatMonth(year, month);

  // Fetch slots for the month
  const { data: slotData, isLoading: slotsLoading } = useSWR<SlotApiResponse>(
    `/api/admin/slot-tempahan?month=${monthParam}`,
    fetcher,
  );

  // Fetch tempahan for the month to overlay pakej colours
  const dateFrom = `${monthParam}-01`;
  const lastDay = new Date(year, month + 1, 0).getDate();
  const dateTo = `${monthParam}-${String(lastDay).padStart(2, '0')}`;

  const { data: tempahanData, mutate: mutateTempahan } = useSWR<TempahanApiResponse>(
    `/api/admin/tempahan?dateFrom=${dateFrom}&dateTo=${dateTo}&limit=100`,
    fetcher,
  );

  const slots = slotData?.data?.data ?? [];
  const tempahanItems = tempahanData?.data?.items ?? [];

  // Map slot by day
  const slotsByDay = new Map<number, SlotTempahan>();
  for (const slot of slots) {
    const day = new Date(slot.tarikh).getUTCDate();
    slotsByDay.set(day, slot);
  }

  // Map tempahan by slotTempahanId
  const tempahanBySlotId = new Map<string, TempahanItem>();
  for (const t of tempahanItems) {
    tempahanBySlotId.set(t.slotTempahanId, t);
  }

  const calendarDays = getCalendarDays(year, month);

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

  const handleDayClick = (day: number) => {
    const slot = slotsByDay.get(day);
    if (!slot) {
      toast.error('Tiada slot untuk tarikh ini. Sila buat slot terlebih dahulu.');
      return;
    }

    if (slot.status === 'DITEMPAH') {
      toast.error('Slot ini sudah ditempah.');
      return;
    }

    if (slot.status === 'DIBATALKAN') {
      toast.error('Slot ini telah dibatalkan.');
      return;
    }

    // TERSEDIA — open booking form
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedSlotId(slot.id);
    setSelectedDate(dateStr);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setSelectedSlotId(null);
    setSelectedDate(null);
    toast.success('Tempahan berjaya dibuat');
    mutateTempahan();
  };

  return (
    <>
      <Card className="bg-white">
        <CardBody>
          {/* Month navigation */}
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={goToPrevMonth}
              className="rounded-md p-2 text-navy/60 hover:bg-navy/5 hover:text-navy"
              aria-label="Bulan sebelumnya"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
            </button>
            <h2 className="text-lg font-semibold text-navy">
              {getMonthLabel(year, month)}
            </h2>
            <button
              type="button"
              onClick={goToNextMonth}
              className="rounded-md p-2 text-navy/60 hover:bg-navy/5 hover:text-navy"
              aria-label="Bulan seterusnya"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>

          {/* Calendar grid */}
          {slotsLoading ? (
            <div className="flex h-64 items-center justify-center">
              <p className="text-navy/60">Memuatkan...</p>
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {/* Day headers */}
              {DAY_HEADERS.map((day) => (
                <div
                  key={day}
                  className="py-2 text-center text-xs font-semibold text-navy/60"
                >
                  {day}
                </div>
              ))}

              {/* Day cells */}
              {calendarDays.map((day, idx) => {
                if (day === null) {
                  return <div key={`empty-${idx}`} className="aspect-square" />;
                }

                const slot = slotsByDay.get(day);
                const tempahan = slot ? tempahanBySlotId.get(slot.id) : undefined;
                const isBooked = slot?.status === 'DITEMPAH' && tempahan;

                let cellClass = 'border-navy/10 bg-gray-50 hover:bg-navy/5';
                if (slot) {
                  if (slot.status === 'TERSEDIA') {
                    cellClass = 'bg-green-100 border-green-300 hover:bg-green-200 cursor-pointer';
                  } else if (slot.status === 'DITEMPAH') {
                    cellClass = 'bg-amber-100 border-amber-300';
                  } else {
                    cellClass = 'bg-red-100 border-red-300';
                  }
                }

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDayClick(day)}
                    disabled={!slot || slot.status !== 'TERSEDIA'}
                    className={`aspect-square rounded-md border p-1 text-xs transition-colors ${cellClass} ${
                      !slot || slot.status !== 'TERSEDIA' ? 'cursor-default' : ''
                    }`}
                  >
                    <span className="block font-medium text-navy">{day}</span>
                    {isBooked && tempahan && (
                      <>
                        <span
                          className="mt-0.5 inline-block h-2 w-2 rounded-full"
                          style={{ backgroundColor: tempahan.pakej.warna }}
                        />
                        <span className="block truncate text-[9px] text-navy/70">
                          {tempahan.namaTempahan}
                        </span>
                      </>
                    )}
                    {slot && slot.status === 'TERSEDIA' && (
                      <span className="mt-0.5 block text-[10px] text-green-700">Buka</span>
                    )}
                    {slot && slot.status === 'DIBATALKAN' && (
                      <span className="mt-0.5 block text-[10px] text-red-700">Batal</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-4 border-t border-navy/10 pt-3">
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded border border-green-300 bg-green-100" />
              <span className="text-xs text-navy/60">Tersedia</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded border border-amber-300 bg-amber-100" />
              <span className="text-xs text-navy/60">Ditempah</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded border border-red-300 bg-red-100" />
              <span className="text-xs text-navy/60">Dibatalkan</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded border border-navy/10 bg-gray-50" />
              <span className="text-xs text-navy/60">Tiada slot</span>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Create Tempahan Form */}
      {showForm && selectedSlotId && (
        <TempahanForm
          slotTempahanId={selectedSlotId}
          slotDate={selectedDate ?? undefined}
          onClose={() => {
            setShowForm(false);
            setSelectedSlotId(null);
            setSelectedDate(null);
          }}
          onSuccess={handleFormSuccess}
        />
      )}
    </>
  );
}
