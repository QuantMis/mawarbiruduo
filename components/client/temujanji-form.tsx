'use client';

import { useState, useCallback } from 'react';
import useSWR from 'swr';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from '@/lib/utils';
import {
  Button,
  Input,
  Textarea,
  Card,
  CardBody,
  Skeleton,
  Alert,
  EmptyState,
  toast,
} from '@/components/ui';
import { temujanjiSchema, type TemujanjiInput } from '@/lib/validations/temujanji';
import { TemujanjiCalendar } from './temujanji-calendar';

/* ─── Types ─── */

interface SlotTemujanji {
  readonly id: string;
  readonly tarikh: string;
  readonly masaMula: string;
  readonly masaTamat: string;
  readonly status: string;
}

interface SlotsResponse {
  readonly success: boolean;
  readonly data: readonly SlotTemujanji[];
}

/* ─── Helpers ─── */

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '';

const dateFormatter = new Intl.DateTimeFormat('ms-MY', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

function groupSlotsByDate(
  slots: readonly SlotTemujanji[],
): ReadonlyMap<string, readonly SlotTemujanji[]> {
  const grouped = new Map<string, SlotTemujanji[]>();

  for (const slot of slots) {
    const dateKey = slot.tarikh.split('T')[0];
    const existing = grouped.get(dateKey);
    if (existing) {
      grouped.set(dateKey, [...existing, slot]);
    } else {
      grouped.set(dateKey, [slot]);
    }
  }

  return grouped;
}

function formatDateLabel(isoDate: string): string {
  const date = new Date(isoDate + 'T00:00:00');
  return dateFormatter.format(date);
}

async function fetcher(url: string): Promise<SlotsResponse> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Gagal memuatkan slot temujanji');
  }
  return res.json() as Promise<SlotsResponse>;
}

/* ─── Skeleton Loader ─── */

function SlotsSkeleton() {
  return (
    <div className="space-y-6" data-testid="slots-skeleton">
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton variant="text" className="h-5 w-48" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 4 }, (_, j) => (
              <Skeleton key={j} variant="rect" className="h-10 w-28" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Checkmark Icon ─── */

function CheckIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

/* ─── Main Component ─── */

function TemujanjiForm() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const { data, error, isLoading, mutate } = useSWR<SlotsResponse>(
    '/api/temujanji/slots',
    fetcher,
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TemujanjiInput>({
    resolver: zodResolver(temujanjiSchema),
    defaultValues: {
      nama: '',
      noTelefon: '',
      nota: '',
      slotTemujanjiId: '',
    },
  });

  const handleDateSelect = useCallback((dateKey: string | null) => {
    setSelectedDate(dateKey);
    setSelectedSlotId(null);
    setSubmitSuccess(false);
  }, []);

  const handleSlotSelect = useCallback((slotId: string) => {
    setSelectedSlotId(slotId);
    setSubmitSuccess(false);
  }, []);

  const onSubmit = useCallback(
    async (formData: Omit<TemujanjiInput, 'slotTemujanjiId'>) => {
      if (!selectedSlotId || isSubmitting) return;

      setIsSubmitting(true);
      try {
        const res = await fetch('/api/temujanji', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            slotTemujanjiId: selectedSlotId,
          }),
        });

        const body = await res.json();

        if (!res.ok) {
          if (res.status === 409) {
            toast.error('Slot ini telah ditempah');
          } else {
            toast.error(body?.error ?? 'Ralat dalaman pelayan');
          }
          return;
        }

        toast.success('Temujanji anda telah berjaya ditempah!');
        setSubmitSuccess(true);
        setSelectedSlotId(null);
        setSelectedDate(null);
        reset();
        await mutate();
      } catch {
        toast.error('Ralat dalaman pelayan');
      } finally {
        setIsSubmitting(false);
      }
    },
    [selectedSlotId, isSubmitting, reset, mutate],
  );

  /* ─── Loading state ─── */
  if (isLoading) {
    return <SlotsSkeleton />;
  }

  /* ─── Error state ─── */
  if (error) {
    return (
      <Alert
        variant="error"
        message="Gagal memuatkan slot temujanji. Sila muat semula halaman."
        data-testid="slots-error"
      />
    );
  }

  const slots = data?.data ?? [];

  /* ─── Empty state ─── */
  if (slots.length === 0) {
    return (
      <EmptyState
        title="Tiada slot temujanji yang tersedia"
        description="Sila hubungi kami melalui WhatsApp untuk membuat temujanji."
        icon={
          <svg
            className="h-12 w-12"
            viewBox="0 0 24 24"
            fill="none"
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
        }
        action={
          WHATSAPP_NUMBER
            ? {
                label: 'Hubungi WhatsApp',
                onClick: () =>
                  window.open(
                    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Saya ingin membuat temujanji')}`,
                    '_blank',
                  ),
              }
            : undefined
        }
        data-testid="slots-empty"
      />
    );
  }

  const slotsForSelectedDate = selectedDate
    ? slots.filter((s) => s.tarikh.split('T')[0] === selectedDate)
    : [];

  return (
    <div className="space-y-8" data-testid="temujanji-form">
      {/* Success alert */}
      {submitSuccess && (
        <Alert
          variant="success"
          message="Temujanji anda telah berjaya ditempah! Kami akan menghubungi anda untuk pengesahan."
          data-testid="submit-success"
        />
      )}

      {/* Calendar date picker */}
      <div data-testid="slot-selection">
        <p className="mb-4 text-sm text-navy/70">
          Pilih tarikh pada kalendar untuk melihat slot yang tersedia:
        </p>
        <TemujanjiCalendar
          slots={slots}
          selectedDate={selectedDate}
          onSelectDate={handleDateSelect}
        />
      </div>

      {/* Time slot picker — shown after date is selected */}
      {selectedDate && slotsForSelectedDate.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-serif text-sm font-semibold text-navy capitalize">
            {formatDateLabel(selectedDate)}
          </h3>
          <div className="flex flex-wrap gap-2">
            {slotsForSelectedDate.map((slot) => {
              const isSelected = selectedSlotId === slot.id;
              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => handleSlotSelect(slot.id)}
                  className={cn(
                    'inline-flex items-center gap-1.5',
                    'h-10 px-4 text-sm font-medium',
                    'rounded-button border',
                    'transition-colors duration-150',
                    'motion-reduce:transition-none',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-dusty-rose',
                    isSelected
                      ? 'bg-navy text-cream border-navy'
                      : 'bg-cream text-navy border-navy/30 hover:border-navy hover:bg-cream-dark',
                  )}
                  aria-pressed={isSelected}
                  data-testid={`slot-${slot.id}`}
                >
                  {isSelected && <CheckIcon />}
                  {slot.masaMula} - {slot.masaTamat}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Booking form */}
      {selectedSlotId && (
        <Card data-testid="booking-form">
          <CardBody>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4"
              noValidate
            >
              <Input
                label="Nama"
                placeholder="Nama penuh anda"
                required
                error={errors.nama?.message}
                data-testid="input-nama"
                {...register('nama')}
              />

              <Input
                label="No. Telefon"
                type="tel"
                placeholder="0121234567"
                required
                error={errors.noTelefon?.message}
                helperText="Format: 01X-XXXXXXX atau 01XXXXXXXX"
                data-testid="input-telefon"
                {...register('noTelefon')}
              />

              <Textarea
                label="Nota"
                placeholder="Sebarang catatan tambahan (pilihan)"
                error={errors.nota?.message}
                autoResize
                data-testid="input-nota"
                {...register('nota')}
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="accent"
                  size="lg"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  className="w-full"
                  data-testid="submit-btn"
                >
                  {isSubmitting ? 'Menempah...' : 'Tempah Temujanji'}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}
    </div>
  );
}

TemujanjiForm.displayName = 'TemujanjiForm';

export { TemujanjiForm };
