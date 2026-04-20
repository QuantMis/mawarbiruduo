'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import useSWR from 'swr';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  tempahanCreateSchema,
  type TempahanCreateInput,
} from '@/lib/validations/tempahan';

interface PakejOption {
  readonly id: string;
  readonly namaPakej: string;
  readonly warna: string;
}

interface PelangganOption {
  readonly id: string;
  readonly nama: string;
  readonly noTelefon: string;
}

interface TempahanData {
  readonly id: string;
  readonly namaTempahan: string;
  readonly pakejId: string;
  readonly pelangganId: string;
  readonly nota: string | null;
  readonly slotTempahan: {
    readonly id: string;
    readonly tarikh: string;
  };
  readonly pelanggan: {
    readonly id: string;
    readonly nama: string;
    readonly noTelefon: string;
  };
}

interface TempahanFormProps {
  readonly tempahan?: TempahanData | null;
  readonly slotTempahanId?: string;
  readonly slotDate?: string;
  readonly onClose: () => void;
  readonly onSuccess: () => void;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function TempahanForm({
  tempahan,
  slotTempahanId,
  slotDate,
  onClose,
  onSuccess,
}: TempahanFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pelangganSearch, setPelangganSearch] = useState('');
  const [debouncedPelangganSearch, setDebouncedPelangganSearch] = useState('');
  const [showPelangganDropdown, setShowPelangganDropdown] = useState(false);
  const [selectedPelanggan, setSelectedPelanggan] = useState<PelangganOption | null>(
    tempahan ? { id: tempahan.pelanggan.id, nama: tempahan.pelanggan.nama, noTelefon: tempahan.pelanggan.noTelefon } : null,
  );
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pelangganDropdownRef = useRef<HTMLDivElement>(null);

  const isEditing = Boolean(tempahan);

  // Fetch pakej list — API returns { success, data: PakejOption[] }
  const { data: pakejData } = useSWR<{ success: boolean; data: readonly PakejOption[] | null }>(
    '/api/admin/pakej',
    fetcher,
  );
  const pakejList = pakejData?.data ?? [];

  // Fetch pelanggan with search — API returns { success, data: { items, meta } }
  const { data: pelangganData } = useSWR<{ success: boolean; data: { items: readonly PelangganOption[] } | null }>(
    debouncedPelangganSearch
      ? `/api/admin/pelanggan?search=${encodeURIComponent(debouncedPelangganSearch)}&limit=10`
      : null,
    fetcher,
  );
  const pelangganList = pelangganData?.data?.items ?? [];

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<TempahanCreateInput>({
    resolver: zodResolver(tempahanCreateSchema),
    defaultValues: {
      namaTempahan: tempahan?.namaTempahan ?? '',
      slotTempahanId: tempahan?.slotTempahan.id ?? slotTempahanId ?? '',
      pakejId: tempahan?.pakejId ?? '',
      pelangganId: tempahan?.pelangganId ?? '',
      nota: tempahan?.nota ?? '',
    },
  });

  // Debounce pelanggan search
  const handlePelangganSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setPelangganSearch(value);
      setShowPelangganDropdown(true);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        setDebouncedPelangganSearch(value);
      }, 300);
    },
    [],
  );

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        pelangganDropdownRef.current &&
        !pelangganDropdownRef.current.contains(e.target as Node)
      ) {
        setShowPelangganDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const handlePelangganSelect = (p: PelangganOption) => {
    setSelectedPelanggan(p);
    setPelangganSearch(`${p.nama} (${p.noTelefon})`);
    setValue('pelangganId', p.id);
    setShowPelangganDropdown(false);
  };

  const onSubmit = async (data: TempahanCreateInput) => {
    setServerError(null);
    setIsSubmitting(true);

    try {
      const url = isEditing
        ? `/api/admin/tempahan/${tempahan!.id}`
        : '/api/admin/tempahan';
      const method = isEditing ? 'PUT' : 'POST';

      // For edit, don't send slotTempahanId
      const payload = isEditing
        ? {
            namaTempahan: data.namaTempahan,
            pakejId: data.pakejId,
            pelangganId: data.pelangganId,
            nota: data.nota || null,
          }
        : data;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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

  const dateLabel = tempahan
    ? new Date(tempahan.slotTempahan.tarikh).toLocaleDateString('ms-MY', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : slotDate
      ? new Date(slotDate).toLocaleDateString('ms-MY', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      : '';

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={isEditing ? 'Edit Tempahan' : 'Tambah Tempahan'}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Slot date (read-only) */}
        <div>
          <Label>Tarikh Slot</Label>
          <p className="mt-1 rounded-md border border-navy/10 bg-navy/5 px-3 py-2 text-sm text-navy">
            {dateLabel}
          </p>
          <input type="hidden" {...register('slotTempahanId')} />
        </div>

        {/* Nama Tempahan */}
        <div>
          <Label htmlFor="namaTempahan">Nama Tempahan</Label>
          <Input
            id="namaTempahan"
            placeholder="Cth: Majlis Perkahwinan Ahmad & Siti"
            {...register('namaTempahan')}
          />
          {errors.namaTempahan && (
            <p className="mt-1 text-xs text-red-600">{errors.namaTempahan.message}</p>
          )}
        </div>

        {/* Pakej */}
        <div>
          <Label htmlFor="pakejId">Pakej</Label>
          <select
            id="pakejId"
            {...register('pakejId')}
            className="mt-1 w-full rounded-md border border-navy/20 bg-white px-3 py-2 text-sm text-navy focus:border-dusty-rose focus:outline-none focus:ring-2 focus:ring-dusty-rose/20"
          >
            <option value="">-- Pilih Pakej --</option>
            {pakejList.map((p) => (
              <option key={p.id} value={p.id}>
                {p.namaPakej}
              </option>
            ))}
          </select>
          {errors.pakejId && (
            <p className="mt-1 text-xs text-red-600">{errors.pakejId.message}</p>
          )}
        </div>

        {/* Pelanggan */}
        <div ref={pelangganDropdownRef} className="relative">
          <Label htmlFor="pelangganSearch">Pelanggan</Label>
          <Input
            id="pelangganSearch"
            placeholder="Cari nama atau no. telefon..."
            value={pelangganSearch}
            onChange={handlePelangganSearchChange}
            onFocus={() => {
              if (pelangganSearch) setShowPelangganDropdown(true);
            }}
            autoComplete="off"
          />
          <input type="hidden" {...register('pelangganId')} />
          {errors.pelangganId && (
            <p className="mt-1 text-xs text-red-600">{errors.pelangganId.message}</p>
          )}
          {selectedPelanggan && !showPelangganDropdown && (
            <p className="mt-1 text-xs text-navy/60">
              Dipilih: {selectedPelanggan.nama} ({selectedPelanggan.noTelefon})
            </p>
          )}

          {/* Dropdown */}
          {showPelangganDropdown && pelangganList.length > 0 && (
            <div className="absolute z-10 mt-1 w-full rounded-md border border-navy/10 bg-white shadow-lg">
              <ul className="max-h-40 overflow-y-auto py-1">
                {pelangganList.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => handlePelangganSelect(p)}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-navy/5"
                    >
                      <span className="font-medium text-navy">{p.nama}</span>
                      <span className="ml-2 text-navy/60">{p.noTelefon}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {showPelangganDropdown && debouncedPelangganSearch && pelangganList.length === 0 && (
            <div className="absolute z-10 mt-1 w-full rounded-md border border-navy/10 bg-white p-3 shadow-lg">
              <p className="text-xs text-navy/60">Tiada pelanggan dijumpai</p>
            </div>
          )}
        </div>

        {/* Nota */}
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
