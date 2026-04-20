'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardBody } from '@/components/ui/card';
import { toast } from '@/components/ui/toast';
import { TempahanForm } from './tempahan-form';

interface PakejInfo {
  readonly id: string;
  readonly namaPakej: string;
  readonly warna: string;
}

interface PelangganInfo {
  readonly id: string;
  readonly nama: string;
  readonly noTelefon: string;
}

interface SlotInfo {
  readonly id: string;
  readonly tarikh: string;
  readonly status: string;
}

interface TempahanItem {
  readonly id: string;
  readonly namaTempahan: string;
  readonly pakejId: string;
  readonly pelangganId: string;
  readonly nota: string | null;
  readonly createdAt: string;
  readonly slotTempahan: SlotInfo;
  readonly pakej: PakejInfo;
  readonly pelanggan: PelangganInfo;
}

interface TempahanListResponse {
  readonly success: boolean;
  readonly data: {
    readonly items: readonly TempahanItem[];
    readonly meta: {
      readonly total: number;
      readonly page: number;
      readonly limit: number;
    };
  } | null;
}

interface PakejListResponse {
  readonly success: boolean;
  readonly data: {
    readonly items: readonly PakejInfo[];
  } | null;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function TempahanTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterPakejId, setFilterPakejId] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [editingTempahan, setEditingTempahan] = useState<TempahanItem | null>(null);

  const limit = 20;
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...(filterPakejId ? { pakejId: filterPakejId } : {}),
    ...(dateFrom ? { dateFrom } : {}),
    ...(dateTo ? { dateTo } : {}),
  });

  const { data, mutate, isLoading } = useSWR<TempahanListResponse>(
    `/api/admin/tempahan?${params.toString()}`,
    fetcher,
  );

  const { data: pakejData } = useSWR<PakejListResponse>(
    '/api/admin/pakej',
    fetcher,
  );

  const items = data?.data?.items ?? [];
  const meta = data?.data?.meta;
  const totalPages = meta ? Math.ceil(meta.total / meta.limit) : 0;
  const pakejList = pakejData?.data?.items ?? [];

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearch(value);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        setDebouncedSearch(value);
        setPage(1);
      }, 300);
    },
    [],
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm('Adakah anda pasti mahu memadam tempahan ini?')) return;

      const res = await fetch(`/api/admin/tempahan/${id}`, { method: 'DELETE' });
      const result = await res.json();

      if (!result.success) {
        toast.error(result.error ?? 'Gagal memadam tempahan');
        return;
      }

      toast.success('Tempahan berjaya dipadam');
      mutate();
    },
    [mutate],
  );

  const handleEditClose = useCallback(() => {
    setEditingTempahan(null);
  }, []);

  const handleEditSuccess = useCallback(() => {
    setEditingTempahan(null);
    toast.success('Tempahan berjaya dikemaskini');
    mutate();
  }, [mutate]);

  return (
    <>
      <Card className="bg-white">
        <CardBody>
          {/* Toolbar */}
          <div className="mb-4 space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Input
                placeholder="Cari nama tempahan atau pelanggan..."
                value={search}
                onChange={handleSearchChange}
                className="w-full sm:max-w-xs"
              />
              <select
                value={filterPakejId}
                onChange={(e) => {
                  setFilterPakejId(e.target.value);
                  setPage(1);
                }}
                className="rounded-md border border-navy/20 bg-white px-3 py-2 text-sm text-navy focus:border-dusty-rose focus:outline-none"
              >
                <option value="">Semua Pakej</option>
                {pakejList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.namaPakej}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2">
                <label className="text-xs text-navy/60">Dari:</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => {
                    setDateFrom(e.target.value);
                    setPage(1);
                  }}
                  className="rounded-md border border-navy/20 bg-white px-2 py-1.5 text-sm text-navy focus:border-dusty-rose focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-navy/60">Hingga:</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => {
                    setDateTo(e.target.value);
                    setPage(1);
                  }}
                  className="rounded-md border border-navy/20 bg-white px-2 py-1.5 text-sm text-navy focus:border-dusty-rose focus:outline-none"
                />
              </div>
              {(dateFrom || dateTo || filterPakejId || debouncedSearch) && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setSearch('');
                    setDebouncedSearch('');
                    setFilterPakejId('');
                    setDateFrom('');
                    setDateTo('');
                    setPage(1);
                  }}
                >
                  Reset
                </Button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-navy/10 text-navy/60">
                  <th className="px-3 py-2 font-medium">Nama Tempahan</th>
                  <th className="px-3 py-2 font-medium">Tarikh</th>
                  <th className="px-3 py-2 font-medium">Pakej</th>
                  <th className="hidden px-3 py-2 font-medium md:table-cell">Pelanggan</th>
                  <th className="px-3 py-2 font-medium">Tindakan</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-navy/60">
                      Memuatkan...
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-navy/60">
                      Tiada tempahan dijumpai.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id} className="border-b border-navy/5 hover:bg-navy/[0.02]">
                      <td className="px-3 py-2.5 font-medium text-navy">
                        {item.namaTempahan}
                      </td>
                      <td className="px-3 py-2.5 text-navy/80">
                        {new Date(item.slotTempahan.tarikh).toLocaleDateString('ms-MY', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="inline-flex items-center gap-1.5">
                          <span
                            className="inline-block h-3 w-3 rounded-full"
                            style={{ backgroundColor: item.pakej.warna }}
                          />
                          <span className="text-navy/80">{item.pakej.namaPakej}</span>
                        </span>
                      </td>
                      <td className="hidden px-3 py-2.5 text-navy/80 md:table-cell">
                        {item.pelanggan.nama}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => setEditingTempahan(item)}
                            className="rounded px-2 py-1 text-xs text-navy/70 hover:bg-navy/5"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            className="rounded px-2 py-1 text-xs text-red-600/70 hover:bg-red-50"
                          >
                            Padam
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-navy/60">
                Halaman {page} daripada {totalPages} ({meta?.total ?? 0} rekod)
              </span>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Sebelum
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Seterusnya
                </Button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Edit Form Modal */}
      {editingTempahan && (
        <TempahanForm
          tempahan={editingTempahan}
          onClose={handleEditClose}
          onSuccess={handleEditSuccess}
        />
      )}
    </>
  );
}
