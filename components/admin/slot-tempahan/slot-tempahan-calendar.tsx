'use client';

import { useState, useCallback } from 'react';
import useSWR from 'swr';
import { Card, CardBody, Badge, Modal, Button } from '@/components/ui';
import { SlotTempahanForm } from './slot-tempahan-form';
import { toast } from '@/components/ui';

interface SlotTempahan {
  readonly id: string;
  readonly tarikh: string;
  readonly status: 'TERSEDIA' | 'DITEMPAH' | 'DIBATALKAN';
  readonly tempahan?: { readonly id: string; readonly namaTempahan: string } | null;
}

interface ApiResponse {
  readonly success: boolean;
  readonly data: {
    readonly data: readonly SlotTempahan[];
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
  // Convert Sunday=0 to Monday-start: Mon=0, Sun=6
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days: (number | null)[] = [];

  // Fill leading empty cells
  for (let i = 0; i < startOffset; i++) {
    days.push(null);
  }

  // Fill actual days
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(d);
  }

  return days;
}

function statusBadgeVariant(status: string): 'success' | 'warning' | 'error' {
  switch (status) {
    case 'TERSEDIA':
      return 'success';
    case 'DITEMPAH':
      return 'warning';
    case 'DIBATALKAN':
      return 'error';
    default:
      return 'success';
  }
}

function statusBgClass(status: string): string {
  switch (status) {
    case 'TERSEDIA':
      return 'bg-green-100 border-green-300 hover:bg-green-200';
    case 'DITEMPAH':
      return 'bg-amber-100 border-amber-300 hover:bg-amber-200';
    case 'DIBATALKAN':
      return 'bg-red-100 border-red-300 hover:bg-red-200';
    default:
      return '';
  }
}

export function SlotTempahanCalendar() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<SlotTempahan | null>(null);
  const [showSlotModal, setShowSlotModal] = useState(false);

  const monthParam = formatMonth(year, month);

  const { data, mutate, isLoading } = useSWR<ApiResponse>(
    `/api/admin/slot-tempahan?month=${monthParam}`,
    fetcher,
  );

  const slots = data?.data?.data ?? [];

  const slotsByDay = new Map<number, SlotTempahan>();
  for (const slot of slots) {
    const day = new Date(slot.tarikh).getUTCDate();
    slotsByDay.set(day, slot);
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
    if (slot) {
      setSelectedSlot(slot);
      setShowSlotModal(true);
    } else {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      setSelectedDate(dateStr);
      setShowForm(true);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/admin/slot-tempahan/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const result = await res.json();
    if (result.success) {
      toast.success('Status berjaya dikemaskini');
      setShowSlotModal(false);
      setSelectedSlot(null);
      mutate();
    } else {
      toast.error(result.error ?? 'Gagal mengemaskini status');
    }
  };

  const handleDelete = async (id: string, force = false) => {
    const url = force
      ? `/api/admin/slot-tempahan/${id}?force=true`
      : `/api/admin/slot-tempahan/${id}`;
    const res = await fetch(url, { method: 'DELETE' });
    const result = await res.json();
    if (result.success) {
      toast.success('Slot berjaya dipadam');
      setShowSlotModal(false);
      setSelectedSlot(null);
      mutate();
    } else {
      toast.error(result.error ?? 'Gagal memadam slot');
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setSelectedDate(null);
    mutate();
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

          {/* Add bulk button */}
          <div className="mb-4 flex justify-end">
            <Button
              size="sm"
              onClick={() => {
                setSelectedDate(null);
                setShowForm(true);
              }}
            >
              + Tambah Slot
            </Button>
          </div>

          {/* Calendar grid */}
          {isLoading ? (
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
                const hasSlot = Boolean(slot);

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDayClick(day)}
                    className={`aspect-square rounded-md border p-1 text-xs transition-colors ${
                      hasSlot
                        ? statusBgClass(slot!.status)
                        : 'border-navy/10 bg-gray-50 hover:bg-navy/5'
                    }`}
                  >
                    <span className="block font-medium text-navy">{day}</span>
                    {hasSlot && (
                      <span className="mt-0.5 block truncate text-[10px]">
                        {slot!.status === 'TERSEDIA' ? 'Buka' : slot!.status === 'DITEMPAH' ? 'Tempah' : 'Batal'}
                      </span>
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

      {/* Create slot modal */}
      <Modal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setSelectedDate(null);
        }}
        title="Tambah Slot Tempahan"
      >
        <SlotTempahanForm
          defaultDate={selectedDate}
          onSuccess={handleFormSuccess}
          onCancel={() => {
            setShowForm(false);
            setSelectedDate(null);
          }}
        />
      </Modal>

      {/* Slot detail/actions modal */}
      <Modal
        isOpen={showSlotModal}
        onClose={() => {
          setShowSlotModal(false);
          setSelectedSlot(null);
        }}
        title="Slot Tempahan"
        size="sm"
      >
        {selectedSlot && (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-navy/60">Tarikh</p>
              <p className="font-medium text-navy">
                {new Date(selectedSlot.tarikh).toLocaleDateString('ms-MY', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-navy/60">Status</p>
              <Badge variant={statusBadgeVariant(selectedSlot.status)}>
                {selectedSlot.status}
              </Badge>
            </div>
            {selectedSlot.tempahan && (
              <div>
                <p className="text-sm text-navy/60">Tempahan</p>
                <p className="font-medium text-navy">
                  {selectedSlot.tempahan.namaTempahan}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-2 border-t border-navy/10 pt-4">
              {selectedSlot.status === 'TERSEDIA' && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleUpdateStatus(selectedSlot.id, 'DIBATALKAN')}
                >
                  Batalkan
                </Button>
              )}
              {selectedSlot.status === 'DIBATALKAN' && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleUpdateStatus(selectedSlot.id, 'TERSEDIA')}
                >
                  Aktifkan Semula
                </Button>
              )}
              <Button
                size="sm"
                variant="secondary"
                onClick={() =>
                  handleDelete(selectedSlot.id, selectedSlot.status === 'DITEMPAH')
                }
                className="text-red-600 hover:bg-red-50"
              >
                {selectedSlot.status === 'DITEMPAH' ? 'Padam (Paksa)' : 'Padam'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
