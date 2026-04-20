'use client';

import { useState, useCallback } from 'react';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardBody } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Modal } from '@/components/ui/modal';
import { toast } from '@/components/ui/toast';
import { TemujanjiDetail } from './temujanji-detail';
import type { Temujanji } from './temujanji-detail';

interface ApiResponse {
  success: boolean;
  data: {
    data: Temujanji[];
    meta: { total: number; page: number; limit: number };
  } | null;
  error: string | null;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function formatTarikh(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ms-MY', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function truncateText(text: string | null, maxLength: number): string {
  if (!text) return '-';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
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

export function TemujanjiTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedTemujanji, setSelectedTemujanji] = useState<Temujanji | null>(null);
  const limit = 20;

  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('limit', String(limit));
  if (search) params.set('search', search);
  if (status) params.set('status', status);
  if (dateFrom) params.set('dateFrom', dateFrom);
  if (dateTo) params.set('dateTo', dateTo);

  const { data, error, isLoading, mutate } = useSWR<ApiResponse>(
    `/api/admin/temujanji?${params.toString()}`,
    fetcher,
  );

  const temujanjiList = data?.data?.data ?? [];
  const meta = data?.data?.meta ?? { total: 0, page: 1, limit };
  const totalPages = Math.ceil(meta.total / meta.limit);

  const handleDelete = useCallback(
    async (temujanji: Temujanji) => {
      if (!confirm('Adakah anda pasti mahu memadamkan temujanji ini? Slot akan dikembalikan kepada status TERSEDIA.')) {
        return;
      }

      const res = await fetch(`/api/admin/temujanji/${temujanji.id}`, {
        method: 'DELETE',
      });
      const result = await res.json();

      if (result.success) {
        toast.success('Temujanji berjaya dipadamkan');
        mutate();
      } else {
        toast.error(result.error ?? 'Gagal memadamkan temujanji');
      }
    },
    [mutate],
  );

  const handleView = useCallback((temujanji: Temujanji) => {
    setSelectedTemujanji(temujanji);
  }, []);

  const handleDetailClose = useCallback(() => {
    setSelectedTemujanji(null);
  }, []);

  const handleDetailDeleted = useCallback(() => {
    setSelectedTemujanji(null);
    mutate();
  }, [mutate]);

  return (
    <>
      <Card className="bg-white">
        <CardBody>
          {/* Filters */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="filter-search">Carian</Label>
              <Input
                id="filter-search"
                type="text"
                placeholder="Cari nama atau no. telefon..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div className="min-w-[150px]">
              <Label htmlFor="filter-status">Status</Label>
              <select
                id="filter-status"
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-button border border-navy/20 bg-white px-3 py-2 text-sm text-navy focus:border-dusty-rose focus:outline-none focus:ring-2 focus:ring-dusty-rose/20"
              >
                <option value="">Semua</option>
                <option value="TERSEDIA">Tersedia</option>
                <option value="DITEMPAH">Ditempah</option>
                <option value="DIBATALKAN">Dibatalkan</option>
              </select>
            </div>
            <div className="min-w-[150px]">
              <Label htmlFor="filter-date-from">Dari tarikh</Label>
              <Input
                id="filter-date-from"
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div className="min-w-[150px]">
              <Label htmlFor="filter-date-to">Hingga tarikh</Label>
              <Input
                id="filter-date-to"
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : error ? (
            <p className="py-4 text-center text-red-600">
              Gagal memuatkan data
            </p>
          ) : temujanjiList.length === 0 ? (
            <p className="py-8 text-center text-navy/60">
              Tiada temujanji dijumpai.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-navy/10">
                    <th className="px-3 py-3 font-medium text-navy/70">
                      Pelanggan
                    </th>
                    <th className="px-3 py-3 font-medium text-navy/70">
                      Tarikh
                    </th>
                    <th className="px-3 py-3 font-medium text-navy/70">
                      Masa
                    </th>
                    <th className="px-3 py-3 font-medium text-navy/70">
                      Nota
                    </th>
                    <th className="px-3 py-3 font-medium text-navy/70">
                      Status
                    </th>
                    <th className="px-3 py-3 font-medium text-navy/70">
                      Tindakan
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {temujanjiList.map((item) => (
                    <tr
                      key={item.id}
                      className="cursor-pointer border-b border-navy/5 last:border-0 hover:bg-navy/5"
                      onClick={() => handleView(item)}
                    >
                      <td className="px-3 py-3">
                        <div>
                          <p className="font-medium text-navy">
                            {item.pelanggan.nama}
                          </p>
                          <p className="text-xs text-navy/60">
                            {item.pelanggan.noTelefon}
                          </p>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        {formatTarikh(item.slotTemujanji.tarikh)}
                      </td>
                      <td className="px-3 py-3">
                        {item.slotTemujanji.masaMula} - {item.slotTemujanji.masaTamat}
                      </td>
                      <td className="px-3 py-3 text-navy/70">
                        {truncateText(item.nota, 40)}
                      </td>
                      <td className="px-3 py-3">
                        <Badge variant={statusBadgeVariant(item.slotTemujanji.status)}>
                          {item.slotTemujanji.status}
                        </Badge>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleView(item)}
                          >
                            Lihat
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(item)}
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
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-navy/60">
                Halaman {meta.page} daripada {totalPages} ({meta.total} rekod)
              </p>
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

      {/* Detail Modal */}
      <Modal
        isOpen={selectedTemujanji !== null}
        onClose={handleDetailClose}
        title="Butiran Temujanji"
        size="md"
      >
        {selectedTemujanji && (
          <TemujanjiDetail
            temujanji={selectedTemujanji}
            onClose={handleDetailClose}
            onDeleted={handleDetailDeleted}
          />
        )}
      </Modal>
    </>
  );
}
