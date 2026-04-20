'use client';

import { useState, useCallback } from 'react';
import useSWR from 'swr';
import { Card, CardBody, Badge, Button } from '@/components/ui';
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

type StatusFilter = 'ALL' | 'TERSEDIA' | 'DITEMPAH' | 'DIBATALKAN';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const PAGE_SIZE = 20;

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

function formatMonth(year: number, month: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}`;
}

export function SlotTempahanList() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [page, setPage] = useState(1);

  const monthParam = formatMonth(year, month);

  const { data, mutate, isLoading } = useSWR<ApiResponse>(
    `/api/admin/slot-tempahan?month=${monthParam}`,
    fetcher,
  );

  const allSlots = data?.data?.data ?? [];

  // Client-side filtering and pagination
  const filtered =
    statusFilter === 'ALL'
      ? allSlots
      : allSlots.filter((s) => s.status === statusFilter);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePageVal = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (safePageVal - 1) * PAGE_SIZE,
    safePageVal * PAGE_SIZE,
  );

  const goToPrevMonth = useCallback(() => {
    if (month === 0) {
      setYear((y) => y - 1);
      setMonth(11);
    } else {
      setMonth((m) => m - 1);
    }
    setPage(1);
  }, [month]);

  const goToNextMonth = useCallback(() => {
    if (month === 11) {
      setYear((y) => y + 1);
      setMonth(0);
    } else {
      setMonth((m) => m + 1);
    }
    setPage(1);
  }, [month]);

  const handleUpdateStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/admin/slot-tempahan/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const result = await res.json();
    if (result.success) {
      toast.success('Status berjaya dikemaskini');
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
      mutate();
    } else {
      toast.error(result.error ?? 'Gagal memadam slot');
    }
  };

  const getMonthLabel = () => {
    const date = new Date(year, month, 1);
    return date.toLocaleDateString('ms-MY', { month: 'long', year: 'numeric' });
  };

  return (
    <Card className="bg-white">
      <CardBody>
        {/* Month navigation and filter */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
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
            <h2 className="text-lg font-semibold text-navy">{getMonthLabel()}</h2>
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

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as StatusFilter);
              setPage(1);
            }}
            className="rounded-md border border-navy/20 bg-white px-3 py-1.5 text-sm text-navy"
          >
            <option value="ALL">Semua Status</option>
            <option value="TERSEDIA">Tersedia</option>
            <option value="DITEMPAH">Ditempah</option>
            <option value="DIBATALKAN">Dibatalkan</option>
          </select>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <p className="text-navy/60">Memuatkan...</p>
          </div>
        ) : paginated.length === 0 ? (
          <div className="flex h-32 items-center justify-center">
            <p className="text-navy/60">Tiada slot untuk bulan ini.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-navy/10">
                  <th className="px-3 py-2 font-semibold text-navy/60">Tarikh</th>
                  <th className="px-3 py-2 font-semibold text-navy/60">Status</th>
                  <th className="px-3 py-2 font-semibold text-navy/60">Tindakan</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((slot) => (
                  <tr key={slot.id} className="border-b border-navy/5">
                    <td className="px-3 py-2.5 text-navy">
                      {new Date(slot.tarikh).toLocaleDateString('ms-MY', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-3 py-2.5">
                      <Badge variant={statusBadgeVariant(slot.status)}>
                        {slot.status}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex gap-2">
                        {slot.status === 'TERSEDIA' && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleUpdateStatus(slot.id, 'DIBATALKAN')}
                          >
                            Batalkan
                          </Button>
                        )}
                        {slot.status === 'DIBATALKAN' && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleUpdateStatus(slot.id, 'TERSEDIA')}
                          >
                            Aktifkan
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleDelete(slot.id, slot.status === 'DITEMPAH')}
                          className="text-red-600 hover:bg-red-50"
                        >
                          Padam
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between border-t border-navy/10 pt-3">
            <p className="text-xs text-navy/60">
              {filtered.length} slot dijumpai
            </p>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePageVal <= 1}
              >
                Sebelum
              </Button>
              <span className="flex items-center px-2 text-sm text-navy">
                {safePageVal} / {totalPages}
              </span>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePageVal >= totalPages}
              >
                Seterusnya
              </Button>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
