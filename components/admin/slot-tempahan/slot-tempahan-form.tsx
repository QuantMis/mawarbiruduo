'use client';

import { useState } from 'react';
import { Button, Input, Label } from '@/components/ui';
import { toast } from '@/components/ui';

interface SlotTempahanFormProps {
  readonly defaultDate?: string | null;
  readonly onSuccess: () => void;
  readonly onCancel: () => void;
}

type FormMode = 'single' | 'range';

export function SlotTempahanForm({
  defaultDate,
  onSuccess,
  onCancel,
}: SlotTempahanFormProps) {
  const [mode, setMode] = useState<FormMode>(defaultDate ? 'single' : 'range');
  const [tarikh, setTarikh] = useState(defaultDate ?? '');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const body =
        mode === 'single' ? { tarikh } : { startDate, endDate };

      const res = await fetch('/api/admin/slot-tempahan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const result = await res.json();

      if (result.success) {
        if (mode === 'range') {
          const { count, skipped } = result.data;
          toast.success(
            `${count} slot berjaya dicipta${skipped > 0 ? ` (${skipped} dilangkau)` : ''}`,
          );
        } else {
          toast.success('Slot berjaya dicipta');
        }
        onSuccess();
      } else {
        toast.error(result.error ?? 'Gagal mencipta slot');
      }
    } catch {
      toast.error('Ralat rangkaian');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Mode toggle */}
      {!defaultDate && (
        <div className="flex gap-1 rounded-lg bg-navy/5 p-1">
          <button
            type="button"
            onClick={() => setMode('single')}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              mode === 'single'
                ? 'bg-white text-navy shadow-sm'
                : 'text-navy/60 hover:text-navy'
            }`}
          >
            Tarikh Tunggal
          </button>
          <button
            type="button"
            onClick={() => setMode('range')}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              mode === 'range'
                ? 'bg-white text-navy shadow-sm'
                : 'text-navy/60 hover:text-navy'
            }`}
          >
            Julat Tarikh
          </button>
        </div>
      )}

      {mode === 'single' ? (
        <div>
          <Label htmlFor="tarikh">Tarikh</Label>
          <Input
            id="tarikh"
            type="date"
            value={tarikh}
            onChange={(e) => setTarikh(e.target.value)}
            required
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="startDate">Tarikh Mula</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="endDate">Tarikh Akhir</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
              required
            />
          </div>
        </div>
      )}

      {mode === 'range' && (
        <p className="text-xs text-navy/60">
          Slot sedia ada dalam julat tarikh akan dilangkau secara automatik.
        </p>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Mencipta...' : 'Cipta'}
        </Button>
      </div>
    </form>
  );
}
