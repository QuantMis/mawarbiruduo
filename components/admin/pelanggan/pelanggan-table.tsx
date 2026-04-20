'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardBody } from '@/components/ui/card';
import { PelangganForm } from './pelanggan-form';
import { PelangganDetail } from './pelanggan-detail';

interface PelangganItem {
  readonly id: string;
  readonly nama: string;
  readonly noTelefon: string;
  readonly nota: string | null;
  readonly createdAt: string;
  readonly _count: {
    readonly temujanji: number;
    readonly tempahan: number;
  };
}

interface PelangganListResponse {
  readonly success: boolean;
  readonly data: {
    readonly items: readonly PelangganItem[];
    readonly meta: {
      readonly total: number;
      readonly page: number;
      readonly limit: number;
    };
  } | null;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function truncateText(text: string | null, maxLength: number): string {
  if (!text) return '-';
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

export function PelangganTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPelanggan, setEditingPelanggan] = useState<PelangganItem | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);

  const limit = 20;
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
  });

  const { data, mutate, isLoading } = useSWR<PelangganListResponse>(
    `/api/admin/pelanggan?${params.toString()}`,
    fetcher,
  );

  const items = data?.data?.items ?? [];
  const meta = data?.data?.meta;
  const totalPages = meta ? Math.ceil(meta.total / meta.limit) : 0;

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const handleFormClose = useCallback(() => {
    setShowForm(false);
    setEditingPelanggan(null);
  }, []);

  const handleFormSuccess = useCallback(() => {
    handleFormClose();
    mutate();
  }, [handleFormClose, mutate]);

  const handleEdit = useCallback((pelanggan: PelangganItem) => {
    setEditingPelanggan(pelanggan);
    setShowForm(true);
  }, []);

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm('Adakah anda pasti mahu memadam pelanggan ini?')) return;

      const res = await fetch(`/api/admin/pelanggan/${id}`, { method: 'DELETE' });
      const result = await res.json();

      if (!result.success) {
        alert(result.error ?? 'Gagal memadam pelanggan');
        return;
      }

      mutate();
    },
    [mutate],
  );

  return (
    <>
      <Card className="bg-white">
        <CardBody>
          {/* Toolbar */}
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Input
              placeholder="Cari nama atau no. telefon..."
              value={search}
              onChange={handleSearchChange}
              className="w-full sm:max-w-xs"
            />
            <Button onClick={() => setShowForm(true)}>Tambah Pelanggan</Button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-navy/10 text-navy/60">
                  <th className="px-3 py-2 font-medium">Nama</th>
                  <th className="px-3 py-2 font-medium">No. Telefon</th>
                  <th className="hidden px-3 py-2 font-medium md:table-cell">Nota</th>
                  <th className="px-3 py-2 font-medium text-center">Jml Temujanji</th>
                  <th className="px-3 py-2 font-medium text-center">Jml Tempahan</th>
                  <th className="px-3 py-2 font-medium">Tindakan</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-8 text-center text-navy/60">
                      Memuatkan...
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-8 text-center text-navy/60">
                      Tiada pelanggan dijumpai.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id} className="border-b border-navy/5 hover:bg-navy/[0.02]">
                      <td className="px-3 py-2.5 font-medium text-navy">{item.nama}</td>
                      <td className="px-3 py-2.5 text-navy/80">{item.noTelefon}</td>
                      <td className="hidden px-3 py-2.5 text-navy/60 md:table-cell">
                        {truncateText(item.nota, 50)}
                      </td>
                      <td className="px-3 py-2.5 text-center text-navy/80">
                        {item._count.temujanji}
                      </td>
                      <td className="px-3 py-2.5 text-center text-navy/80">
                        {item._count.tempahan}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => setDetailId(item.id)}
                            className="rounded px-2 py-1 text-xs text-navy/70 hover:bg-navy/5"
                          >
                            Lihat
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEdit(item)}
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

      {/* Form Modal */}
      {showForm && (
        <PelangganForm
          pelanggan={editingPelanggan}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* Detail Modal */}
      {detailId && (
        <PelangganDetail
          pelangganId={detailId}
          onClose={() => setDetailId(null)}
        />
      )}
    </>
  );
}
