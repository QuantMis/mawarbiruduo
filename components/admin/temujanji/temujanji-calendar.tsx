'use client';

import { useState, useCallback } from 'react';
import useSWR from 'swr';
import { Card, CardBody, Badge, Modal, Button } from '@/components/ui';
import { toast } from '@/components/ui';

interface SlotTemujanji {
  readonly id: string;
  readonly tarikh: string;
  readonly masaMula: string;
  readonly masaTamat: string;
  readonly status: 'TERSEDIA' | 'DITEMPAH' | 'DIBATALKAN';
}

interface Pelanggan {
  readonly id: string;
  readonly nama: string;
  readonly noTelefon: string;
}

interface Temujanji {
  readonly id: string;
  readonly nota: string | null;
  readonly createdAt: string;
  readonly pelanggan: Pelanggan;
  readonly slotTemujanji: SlotTemujanji;
}

interface ApiResponse {
  readonly success: boolean;
  readonly data: {
    readonly data: readonly Temujanji[];
    readonly meta: { readonly total: number };
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

interface DaySlots {
  readonly tersedia: number;
  readonly ditempah: number;
  readonly dibatalkan: number;
  readonly temujanjiList: readonly Temujanji[];
}

function getDaySummaryClass(summary: DaySlots): string {
  if (summary.ditempah > 0 && summary.tersedia === 0) {
    return 'bg-amber-100 border-amber-300';
  }
  if (summary.ditempah > 0 && summary.tersedia > 0) {
    return 'bg-blue-50 border-blue-300';
  }
  if (summary.tersedia > 0) {
    return 'bg-green-100 border-green-300';
  }
  return 'border-navy/10 bg-gray-50';
}

export function TemujanjiCalendar() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showDayModal, setShowDayModal] = useState(false);
  const [selectedTemujanji, setSelectedTemujanji] = useState<Temujanji | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const monthStr = formatMonth(year, month);
  const firstOfMonth = `${monthStr}-01`;
  const lastDay = new Date(year, month + 1, 0).getDate();
  const lastOfMonth = `${monthStr}-${String(lastDay).padStart(2, '0')}`;

  const { data, mutate } = useSWR<ApiResponse>(
    `/api/admin/temujanji?limit=200&dateFrom=${firstOfMonth}&dateTo=${lastOfMonth}`,
    fetcher,
  );

  const temujanjiList = data?.data?.data ?? [];

  // Group by day
  const byDay = new Map<number, DaySlots>();
  for (const t of temujanjiList) {
    const day = new Date(t.slotTemujanji.tarikh).getUTCDate();
    const existing = byDay.get(day) ?? {
      tersedia: 0,
      ditempah: 0,
      dibatalkan: 0,
      temujanjiList: [] as Temujanji[],
    };

    const status = t.slotTemujanji.status;
    byDay.set(day, {
      tersedia: existing.tersedia + (status === 'TERSEDIA' ? 1 : 0),
      ditempah: existing.ditempah + (status === 'DITEMPAH' ? 1 : 0),
      dibatalkan: existing.dibatalkan + (status === 'DIBATALKAN' ? 1 : 0),
      temujanjiList: [...existing.temujanjiList, t],
    });
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
    const summary = byDay.get(day);
    if (summary && summary.temujanjiList.length > 0) {
      setSelectedDay(day);
      setShowDayModal(true);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Padam temujanji ini? Slot akan dikembalikan ke status Tersedia.')) return;

    const res = await fetch(`/api/admin/temujanji/${id}`, { method: 'DELETE' });
    const result = await res.json();
    if (result.success) {
      toast.success('Temujanji berjaya dipadam');
      setShowDetailModal(false);
      setSelectedTemujanji(null);
      mutate();
    } else {
      toast.error(result.error ?? 'Gagal memadam temujanji');
    }
  };

  const dayTemujanji = selectedDay ? (byDay.get(selectedDay)?.temujanjiList ?? []) : [];

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

              const summary = byDay.get(day);
              const count = summary ? summary.temujanjiList.length : 0;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDayClick(day)}
                  disabled={count === 0}
                  className={`aspect-square rounded-md border p-1 text-xs transition-colors ${
                    count > 0
                      ? `${getDaySummaryClass(summary!)} cursor-pointer hover:opacity-80`
                      : 'border-navy/10 bg-gray-50 cursor-default opacity-60'
                  }`}
                >
                  <span className="block font-medium text-navy">{day}</span>
                  {count > 0 && (
                    <span className="mt-0.5 block text-[10px] font-medium text-navy/70">
                      {count} janji
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-4 border-t border-navy/10 pt-3">
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded border border-green-300 bg-green-100" />
              <span className="text-xs text-navy/60">Semua tersedia</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded border border-blue-300 bg-blue-50" />
              <span className="text-xs text-navy/60">Sebahagian ditempah</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded border border-amber-300 bg-amber-100" />
              <span className="text-xs text-navy/60">Penuh ditempah</span>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Day detail modal — list of temujanji for the day */}
      <Modal
        isOpen={showDayModal}
        onClose={() => {
          setShowDayModal(false);
          setSelectedDay(null);
        }}
        title={
          selectedDay
            ? `Temujanji — ${selectedDay} ${getMonthLabel(year, month)}`
            : 'Temujanji'
        }
      >
        <div className="space-y-3">
          {dayTemujanji.length === 0 ? (
            <p className="text-sm text-navy/60">Tiada temujanji pada hari ini.</p>
          ) : (
            dayTemujanji.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setSelectedTemujanji(t);
                  setShowDayModal(false);
                  setShowDetailModal(true);
                }}
                className="w-full rounded-lg border border-navy/10 p-3 text-left transition-colors hover:bg-navy/5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-navy">
                    {t.pelanggan.nama}
                  </span>
                  <Badge
                    variant={
                      t.slotTemujanji.status === 'DITEMPAH'
                        ? 'warning'
                        : t.slotTemujanji.status === 'TERSEDIA'
                          ? 'success'
                          : 'error'
                    }
                  >
                    {t.slotTemujanji.status}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-navy/60">
                  {t.slotTemujanji.masaMula} – {t.slotTemujanji.masaTamat} &middot;{' '}
                  {t.pelanggan.noTelefon}
                </p>
                {t.nota && (
                  <p className="mt-1 truncate text-xs text-navy/50">{t.nota}</p>
                )}
              </button>
            ))
          )}
        </div>
      </Modal>

      {/* Temujanji detail modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedTemujanji(null);
        }}
        title="Butiran Temujanji"
      >
        {selectedTemujanji && (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-navy/60">Pelanggan</p>
              <p className="font-medium text-navy">{selectedTemujanji.pelanggan.nama}</p>
              <p className="text-sm text-navy/60">{selectedTemujanji.pelanggan.noTelefon}</p>
            </div>
            <div>
              <p className="text-sm text-navy/60">Tarikh & Masa</p>
              <p className="font-medium text-navy">
                {new Date(selectedTemujanji.slotTemujanji.tarikh).toLocaleDateString('ms-MY', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
              <p className="text-sm text-navy/60">
                {selectedTemujanji.slotTemujanji.masaMula} – {selectedTemujanji.slotTemujanji.masaTamat}
              </p>
            </div>
            <div>
              <p className="text-sm text-navy/60">Status</p>
              <Badge
                variant={
                  selectedTemujanji.slotTemujanji.status === 'DITEMPAH'
                    ? 'warning'
                    : selectedTemujanji.slotTemujanji.status === 'TERSEDIA'
                      ? 'success'
                      : 'error'
                }
              >
                {selectedTemujanji.slotTemujanji.status}
              </Badge>
            </div>
            {selectedTemujanji.nota && (
              <div>
                <p className="text-sm text-navy/60">Nota</p>
                <p className="text-sm text-navy whitespace-pre-wrap">{selectedTemujanji.nota}</p>
              </div>
            )}
            <div className="border-t border-navy/10 pt-4">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleDelete(selectedTemujanji.id)}
                className="text-red-600 hover:bg-red-50"
              >
                Padam Temujanji
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
