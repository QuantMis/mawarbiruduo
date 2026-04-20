'use client';

import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/toast';

interface Pelanggan {
  id: string;
  nama: string;
  noTelefon: string;
}

interface SlotTemujanji {
  id: string;
  tarikh: string;
  masaMula: string;
  masaTamat: string;
  status: 'TERSEDIA' | 'DITEMPAH' | 'DIBATALKAN';
}

interface Temujanji {
  id: string;
  nota: string | null;
  createdAt: string;
  pelanggan: Pelanggan;
  slotTemujanji: SlotTemujanji;
}

interface TemujanjiDetailProps {
  temujanji: Temujanji;
  onClose: () => void;
  onDeleted: () => void;
}

function formatTarikh(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ms-MY', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function statusBadgeVariant(
  status: string,
): 'success' | 'warning' | 'error' | 'default' {
  switch (status) {
    case 'TERSEDIA':
      return 'success';
    case 'DITEMPAH':
      return 'warning';
    case 'DIBATALKAN':
      return 'error';
    default:
      return 'default';
  }
}

function TemujanjiDetail({ temujanji, onClose, onDeleted }: TemujanjiDetailProps) {
  const handleDelete = useCallback(async () => {
    if (!confirm('Adakah anda pasti mahu memadamkan temujanji ini? Slot akan dikembalikan kepada status TERSEDIA.')) {
      return;
    }

    const res = await fetch(`/api/admin/temujanji/${temujanji.id}`, {
      method: 'DELETE',
    });
    const result = await res.json();

    if (result.success) {
      toast.success('Temujanji berjaya dipadamkan');
      onDeleted();
    } else {
      toast.error(result.error ?? 'Gagal memadamkan temujanji');
    }
  }, [temujanji.id, onDeleted]);

  return (
    <div className="space-y-6">
      {/* Maklumat Pelanggan */}
      <div>
        <h3 className="mb-2 text-sm font-medium text-navy/60">Maklumat Pelanggan</h3>
        <div className="space-y-1 text-sm">
          <p>
            <span className="font-medium text-navy">Nama:</span>{' '}
            {temujanji.pelanggan.nama}
          </p>
          <p>
            <span className="font-medium text-navy">No. Telefon:</span>{' '}
            {temujanji.pelanggan.noTelefon}
          </p>
        </div>
      </div>

      {/* Maklumat Slot */}
      <div>
        <h3 className="mb-2 text-sm font-medium text-navy/60">Maklumat Slot</h3>
        <div className="space-y-1 text-sm">
          <p>
            <span className="font-medium text-navy">Tarikh:</span>{' '}
            {formatTarikh(temujanji.slotTemujanji.tarikh)}
          </p>
          <p>
            <span className="font-medium text-navy">Masa:</span>{' '}
            {temujanji.slotTemujanji.masaMula} - {temujanji.slotTemujanji.masaTamat}
          </p>
          <p>
            <span className="font-medium text-navy">Status:</span>{' '}
            <Badge variant={statusBadgeVariant(temujanji.slotTemujanji.status)}>
              {temujanji.slotTemujanji.status}
            </Badge>
          </p>
        </div>
      </div>

      {/* Nota */}
      <div>
        <h3 className="mb-2 text-sm font-medium text-navy/60">Nota</h3>
        <p className="whitespace-pre-wrap text-sm text-navy">
          {temujanji.nota ?? 'Tiada nota'}
        </p>
      </div>

      {/* Tarikh Dibuat */}
      <div>
        <p className="text-xs text-navy/40">
          Dibuat pada {formatTarikh(temujanji.createdAt)}
        </p>
      </div>

      {/* Tindakan */}
      <div className="flex justify-end gap-3 border-t border-navy/10 pt-4">
        <Button variant="secondary" size="sm" onClick={onClose}>
          Tutup
        </Button>
        <Button variant="danger" size="sm" onClick={handleDelete}>
          Padam Temujanji
        </Button>
      </div>
    </div>
  );
}

export { TemujanjiDetail };
export type { Temujanji, Pelanggan, SlotTemujanji };
