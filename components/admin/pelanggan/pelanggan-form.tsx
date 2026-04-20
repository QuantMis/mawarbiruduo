'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  pelangganCreateSchema,
  type PelangganCreateInput,
} from '@/lib/validations/pelanggan';
import { useState } from 'react';

interface PelangganData {
  readonly id: string;
  readonly nama: string;
  readonly noTelefon: string;
  readonly nota: string | null;
}

interface PelangganFormProps {
  readonly pelanggan: PelangganData | null;
  readonly onClose: () => void;
  readonly onSuccess: () => void;
}

export function PelangganForm({ pelanggan, onClose, onSuccess }: PelangganFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = pelanggan !== null;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PelangganCreateInput>({
    resolver: zodResolver(pelangganCreateSchema),
    defaultValues: {
      nama: pelanggan?.nama ?? '',
      noTelefon: pelanggan?.noTelefon ?? '',
      nota: pelanggan?.nota ?? '',
    },
  });

  const onSubmit = async (data: PelangganCreateInput) => {
    setServerError(null);
    setIsSubmitting(true);

    try {
      const url = isEditing
        ? `/api/admin/pelanggan/${pelanggan.id}`
        : '/api/admin/pelanggan';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!result.success) {
        setServerError(result.error ?? 'Ralat berlaku');
        return;
      }

      onSuccess();
    } catch {
      setServerError('Ralat rangkaian. Sila cuba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={isEditing ? 'Edit Pelanggan' : 'Tambah Pelanggan'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="nama">Nama</Label>
          <Input
            id="nama"
            placeholder="Nama pelanggan"
            {...register('nama')}
          />
          {errors.nama && (
            <p className="mt-1 text-xs text-red-600">{errors.nama.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="noTelefon">No. Telefon</Label>
          <Input
            id="noTelefon"
            placeholder="0121234567"
            {...register('noTelefon')}
          />
          {errors.noTelefon && (
            <p className="mt-1 text-xs text-red-600">{errors.noTelefon.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="nota">Nota</Label>
          <Textarea
            id="nota"
            placeholder="Nota tambahan (pilihan)"
            rows={3}
            {...register('nota')}
          />
          {errors.nota && (
            <p className="mt-1 text-xs text-red-600">{errors.nota.message}</p>
          )}
        </div>

        {serverError && (
          <p className="text-sm text-red-600">{serverError}</p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Menyimpan...' : isEditing ? 'Kemaskini' : 'Simpan'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
