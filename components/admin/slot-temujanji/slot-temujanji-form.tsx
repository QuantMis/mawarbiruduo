'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/toast';

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

const singleFormSchema = z
  .object({
    tarikh: z.string().min(1, 'Tarikh diperlukan'),
    masaMula: z.string().regex(timeRegex, 'Format masa tidak sah'),
    masaTamat: z.string().regex(timeRegex, 'Format masa tidak sah'),
  })
  .refine((d) => d.masaTamat > d.masaMula, {
    message: 'Masa tamat mestilah selepas masa mula',
    path: ['masaTamat'],
  });

const bulkFormSchema = z.object({
  tarikh: z.string().min(1, 'Tarikh diperlukan'),
  slots: z
    .array(
      z
        .object({
          masaMula: z.string().regex(timeRegex, 'Format masa tidak sah'),
          masaTamat: z.string().regex(timeRegex, 'Format masa tidak sah'),
        })
        .refine((d) => d.masaTamat > d.masaMula, {
          message: 'Masa tamat mestilah selepas masa mula',
          path: ['masaTamat'],
        }),
    )
    .min(1, 'Sekurang-kurangnya satu slot diperlukan'),
});

type SingleFormData = z.infer<typeof singleFormSchema>;
type BulkFormData = z.infer<typeof bulkFormSchema>;

interface SlotTemujanjiFormProps {
  slot: {
    id: string;
    tarikh: string;
    masaMula: string;
    masaTamat: string;
  } | null;
  onSuccess: () => void;
  onCancel: () => void;
}

function addHours(time: string, hours: number): string {
  const [h, m] = time.split(':').map(Number);
  const totalMinutes = h * 60 + m + hours * 60;
  const newH = Math.min(23, Math.floor(totalMinutes / 60));
  const newM = totalMinutes % 60;
  return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
}

function formatDateForInput(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toISOString().split('T')[0];
}

export function SlotTemujanjiForm({
  slot,
  onSuccess,
  onCancel,
}: SlotTemujanjiFormProps) {
  const [isBulk, setIsBulk] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const isEdit = Boolean(slot);

  // Single form
  const singleForm = useForm<SingleFormData>({
    resolver: zodResolver(singleFormSchema),
    defaultValues: slot
      ? {
          tarikh: formatDateForInput(slot.tarikh),
          masaMula: slot.masaMula,
          masaTamat: slot.masaTamat,
        }
      : {
          tarikh: '',
          masaMula: '09:00',
          masaTamat: '11:00',
        },
  });

  // Bulk form
  const bulkForm = useForm<BulkFormData>({
    resolver: zodResolver(bulkFormSchema),
    defaultValues: {
      tarikh: '',
      slots: [{ masaMula: '09:00', masaTamat: '11:00' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: bulkForm.control,
    name: 'slots',
  });

  const handleMasaMulaChange = (value: string, index?: number) => {
    if (isBulk && index !== undefined) {
      bulkForm.setValue(`slots.${index}.masaMula`, value);
      bulkForm.setValue(`slots.${index}.masaTamat`, addHours(value, 2));
    } else {
      singleForm.setValue('masaMula', value);
      singleForm.setValue('masaTamat', addHours(value, 2));
    }
  };

  const handleSingleSubmit = async (data: SingleFormData) => {
    setSubmitting(true);
    try {
      const url = isEdit
        ? `/api/admin/slot-temujanji/${slot!.id}`
        : '/api/admin/slot-temujanji';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      if (result.success) {
        toast.success(isEdit ? 'Slot berjaya dikemaskini' : 'Slot berjaya ditambah');
        onSuccess();
      } else {
        toast.error(result.error ?? 'Gagal menyimpan slot');
      }
    } catch {
      toast.error('Ralat rangkaian');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkSubmit = async (data: BulkFormData) => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/slot-temujanji', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      if (result.success) {
        toast.success(`${result.data.count} slot berjaya ditambah`);
        onSuccess();
      } else {
        toast.error(result.error ?? 'Gagal menyimpan slot');
      }
    } catch {
      toast.error('Ralat rangkaian');
    } finally {
      setSubmitting(false);
    }
  };

  // Edit mode — always single form
  if (isEdit) {
    return (
      <form
        onSubmit={singleForm.handleSubmit(handleSingleSubmit)}
        className="space-y-4"
      >
        <div>
          <Label htmlFor="edit-tarikh">Tarikh</Label>
          <Input
            id="edit-tarikh"
            type="date"
            {...singleForm.register('tarikh')}
          />
          {singleForm.formState.errors.tarikh && (
            <p className="mt-1 text-xs text-red-600">
              {singleForm.formState.errors.tarikh.message}
            </p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="edit-masaMula">Masa Mula</Label>
            <Input
              id="edit-masaMula"
              type="time"
              {...singleForm.register('masaMula')}
              onChange={(e) => handleMasaMulaChange(e.target.value)}
            />
            {singleForm.formState.errors.masaMula && (
              <p className="mt-1 text-xs text-red-600">
                {singleForm.formState.errors.masaMula.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="edit-masaTamat">Masa Tamat</Label>
            <Input
              id="edit-masaTamat"
              type="time"
              {...singleForm.register('masaTamat')}
            />
            {singleForm.formState.errors.masaTamat && (
              <p className="mt-1 text-xs text-red-600">
                {singleForm.formState.errors.masaTamat.message}
              </p>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Batal
          </Button>
          <Button type="submit" loading={submitting}>
            Kemaskini
          </Button>
        </div>
      </form>
    );
  }

  // Create mode — toggle between single/bulk
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-navy">
          <input
            type="checkbox"
            checked={isBulk}
            onChange={(e) => setIsBulk(e.target.checked)}
            className="rounded border-navy/30"
          />
          Tambah banyak slot sekaligus
        </label>
      </div>

      {!isBulk ? (
        <form
          onSubmit={singleForm.handleSubmit(handleSingleSubmit)}
          className="space-y-4"
        >
          <div>
            <Label htmlFor="create-tarikh">Tarikh</Label>
            <Input
              id="create-tarikh"
              type="date"
              {...singleForm.register('tarikh')}
            />
            {singleForm.formState.errors.tarikh && (
              <p className="mt-1 text-xs text-red-600">
                {singleForm.formState.errors.tarikh.message}
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="create-masaMula">Masa Mula</Label>
              <Input
                id="create-masaMula"
                type="time"
                {...singleForm.register('masaMula')}
                onChange={(e) => handleMasaMulaChange(e.target.value)}
              />
              {singleForm.formState.errors.masaMula && (
                <p className="mt-1 text-xs text-red-600">
                  {singleForm.formState.errors.masaMula.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="create-masaTamat">Masa Tamat</Label>
              <Input
                id="create-masaTamat"
                type="time"
                {...singleForm.register('masaTamat')}
              />
              {singleForm.formState.errors.masaTamat && (
                <p className="mt-1 text-xs text-red-600">
                  {singleForm.formState.errors.masaTamat.message}
                </p>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onCancel}>
              Batal
            </Button>
            <Button type="submit" loading={submitting}>
              Tambah
            </Button>
          </div>
        </form>
      ) : (
        <form
          onSubmit={bulkForm.handleSubmit(handleBulkSubmit)}
          className="space-y-4"
        >
          <div>
            <Label htmlFor="bulk-tarikh">Tarikh</Label>
            <Input
              id="bulk-tarikh"
              type="date"
              {...bulkForm.register('tarikh')}
            />
            {bulkForm.formState.errors.tarikh && (
              <p className="mt-1 text-xs text-red-600">
                {bulkForm.formState.errors.tarikh.message}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Label>Slot Masa</Label>
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-end gap-2">
                <div className="flex-1">
                  <Input
                    type="time"
                    {...bulkForm.register(`slots.${index}.masaMula`)}
                    onChange={(e) =>
                      handleMasaMulaChange(e.target.value, index)
                    }
                  />
                </div>
                <span className="pb-2 text-sm text-navy/60">-</span>
                <div className="flex-1">
                  <Input
                    type="time"
                    {...bulkForm.register(`slots.${index}.masaTamat`)}
                  />
                </div>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                  >
                    Buang
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => append({ masaMula: '09:00', masaTamat: '11:00' })}
            >
              + Tambah slot
            </Button>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onCancel}>
              Batal
            </Button>
            <Button type="submit" loading={submitting}>
              Tambah {fields.length} Slot
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
