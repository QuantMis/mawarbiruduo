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
import { SlotTemujanjiForm } from './slot-temujanji-form';

interface SlotTemujanji {
  id: string;
  tarikh: string;
  masaMula: string;
  masaTamat: string;
  status: 'TERSEDIA' | 'DITEMPAH' | 'DIBATALKAN';
  createdAt: string;
}

interface ApiResponse {
  success: boolean;
  data: {
    data: SlotTemujanji[];
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

export function SlotTemujanjiTable() {
  const [page, setPage] = useState(1);
  const [tarikh, setTarikh] = useState('');
  const [status, setStatus] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<SlotTemujanji | null>(null);
  const limit = 20;

  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('limit', String(limit));
  if (tarikh) params.set('tarikh', tarikh);
  if (status) params.set('status', status);

  const { data, error, isLoading, mutate } = useSWR<ApiResponse>(
    `/api/admin/slot-temujanji?${params.toString()}`,
    fetcher,
  );

  const slots = data?.data?.data ?? [];
  const meta = data?.data?.meta ?? { total: 0, page: 1, limit };
  const totalPages = Math.ceil(meta.total / meta.limit);

  const handleDelete = useCallback(
    async (slot: SlotTemujanji) => {
      const message =
        slot.status === 'DITEMPAH'
          ? 'Slot ini telah ditempah. Adakah anda pasti mahu memadamkan?'
          : 'Adakah anda pasti mahu memadamkan slot ini?';

      if (!confirm(message)) return;

      const force = slot.status === 'DITEMPAH' ? '?force=true' : '';
      const res = await fetch(`/api/admin/slot-temujanji/${slot.id}${force}`, {
        method: 'DELETE',
      });
      const result = await res.json();

      if (result.success) {
        toast.success('Slot berjaya dipadamkan');
        mutate();
      } else {
        toast.error(result.error ?? 'Gagal memadamkan slot');
      }
    },
    [mutate],
  );

  const handleEdit = useCallback((slot: SlotTemujanji) => {
    setEditingSlot(slot);
    setIsFormOpen(true);
  }, []);

  const handleCreate = useCallback(() => {
    setEditingSlot(null);
    setIsFormOpen(true);
  }, []);

  const handleFormClose = useCallback(() => {
    setIsFormOpen(false);
    setEditingSlot(null);
  }, []);

  const handleFormSuccess = useCallback(() => {
    setIsFormOpen(false);
    setEditingSlot(null);
    mutate();
  }, [mutate]);

  return (
    <>
      <Card className="bg-white">
        <CardBody>
          {/* Filters */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Label htmlFor="filter-tarikh">Cari mengikut tarikh</Label>
              <Input
                id="filter-tarikh"
                type="date"
                value={tarikh}
                onChange={(e) => {
                  setTarikh(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div className="flex-1">
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
            <div>
              <Button onClick={handleCreate}>Tambah Slot</Button>
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
          ) : slots.length === 0 ? (
            <p className="py-8 text-center text-navy/60">
              Tiada slot dijumpai.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-navy/10">
                    <th className="px-3 py-3 font-medium text-navy/70">
                      Tarikh
                    </th>
                    <th className="px-3 py-3 font-medium text-navy/70">
                      Masa Mula
                    </th>
                    <th className="px-3 py-3 font-medium text-navy/70">
                      Masa Tamat
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
                  {slots.map((slot) => (
                    <tr
                      key={slot.id}
                      className="border-b border-navy/5 last:border-0"
                    >
                      <td className="px-3 py-3">{formatTarikh(slot.tarikh)}</td>
                      <td className="px-3 py-3">{slot.masaMula}</td>
                      <td className="px-3 py-3">{slot.masaTamat}</td>
                      <td className="px-3 py-3">
                        <Badge variant={statusBadgeVariant(slot.status)}>
                          {slot.status}
                        </Badge>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex gap-2">
                          {slot.status === 'TERSEDIA' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(slot)}
                            >
                              Edit
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(slot)}
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

      {/* Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={handleFormClose}
        title={editingSlot ? 'Kemaskini Slot' : 'Tambah Slot Temujanji'}
        size="md"
      >
        <SlotTemujanjiForm
          slot={editingSlot}
          onSuccess={handleFormSuccess}
          onCancel={handleFormClose}
        />
      </Modal>
    </>
  );
}
