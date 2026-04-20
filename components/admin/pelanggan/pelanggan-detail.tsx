'use client';

import useSWR from 'swr';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';

interface TemujanjiItem {
  readonly id: string;
  readonly nota: string | null;
  readonly createdAt: string;
  readonly slotTemujanji: {
    readonly tarikh: string;
    readonly masaMula: string;
    readonly masaTamat: string;
    readonly status: string;
  };
}

interface TempahanItem {
  readonly id: string;
  readonly namaTempahan: string;
  readonly nota: string | null;
  readonly createdAt: string;
  readonly pakej: {
    readonly namaPakej: string;
  };
  readonly slotTempahan: {
    readonly tarikh: string;
  };
}

interface PelangganFull {
  readonly id: string;
  readonly nama: string;
  readonly noTelefon: string;
  readonly nota: string | null;
  readonly createdAt: string;
  readonly temujanji: readonly TemujanjiItem[];
  readonly tempahan: readonly TempahanItem[];
}

interface PelangganDetailResponse {
  readonly success: boolean;
  readonly data: PelangganFull | null;
}

interface PelangganDetailProps {
  readonly pelangganId: string;
  readonly onClose: () => void;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function formatTarikh(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ms-MY', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function statusBadgeVariant(
  status: string,
): 'default' | 'success' | 'warning' | 'error' {
  switch (status) {
    case 'TERSEDIA':
      return 'success';
    case 'DITEMPAH':
      return 'default';
    case 'DIBATALKAN':
      return 'error';
    default:
      return 'default';
  }
}

export function PelangganDetail({ pelangganId, onClose }: PelangganDetailProps) {
  const { data, isLoading } = useSWR<PelangganDetailResponse>(
    `/api/admin/pelanggan/${pelangganId}`,
    fetcher,
  );

  const pelanggan = data?.data ?? null;

  return (
    <Modal isOpen onClose={onClose} title="Maklumat Pelanggan" size="lg">
      {isLoading ? (
        <p className="py-8 text-center text-navy/60">Memuatkan...</p>
      ) : !pelanggan ? (
        <p className="py-8 text-center text-navy/60">Pelanggan tidak dijumpai.</p>
      ) : (
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-2">
            <div>
              <span className="text-xs text-navy/60">Nama</span>
              <p className="font-medium text-navy">{pelanggan.nama}</p>
            </div>
            <div>
              <span className="text-xs text-navy/60">No. Telefon</span>
              <p className="text-navy">{pelanggan.noTelefon}</p>
            </div>
            {pelanggan.nota && (
              <div>
                <span className="text-xs text-navy/60">Nota</span>
                <p className="text-navy/80">{pelanggan.nota}</p>
              </div>
            )}
            <div>
              <span className="text-xs text-navy/60">Didaftarkan</span>
              <p className="text-navy/80">{formatTarikh(pelanggan.createdAt)}</p>
            </div>
          </div>

          {/* Temujanji */}
          <div>
            <h3 className="mb-2 text-sm font-semibold text-navy">
              Temujanji ({pelanggan.temujanji.length})
            </h3>
            {pelanggan.temujanji.length === 0 ? (
              <p className="text-sm text-navy/60">Tiada temujanji.</p>
            ) : (
              <ul className="divide-y divide-navy/10 rounded border border-navy/10">
                {pelanggan.temujanji.map((t) => (
                  <li key={t.id} className="flex items-center justify-between px-3 py-2">
                    <div>
                      <p className="text-sm text-navy">
                        {formatTarikh(t.slotTemujanji.tarikh)}
                      </p>
                      <p className="text-xs text-navy/60">
                        {t.slotTemujanji.masaMula} - {t.slotTemujanji.masaTamat}
                      </p>
                    </div>
                    <Badge variant={statusBadgeVariant(t.slotTemujanji.status)}>
                      {t.slotTemujanji.status}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Tempahan */}
          <div>
            <h3 className="mb-2 text-sm font-semibold text-navy">
              Tempahan ({pelanggan.tempahan.length})
            </h3>
            {pelanggan.tempahan.length === 0 ? (
              <p className="text-sm text-navy/60">Tiada tempahan.</p>
            ) : (
              <ul className="divide-y divide-navy/10 rounded border border-navy/10">
                {pelanggan.tempahan.map((t) => (
                  <li key={t.id} className="flex items-center justify-between px-3 py-2">
                    <div>
                      <p className="text-sm text-navy">{t.namaTempahan}</p>
                      <p className="text-xs text-navy/60">
                        {formatTarikh(t.slotTempahan.tarikh)} &middot; {t.pakej.namaPakej}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
