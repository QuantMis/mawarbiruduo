'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Card, CardBody } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { toast } from '@/components/ui/toast';

type PakejItem = {
  readonly id: string;
  readonly namaPakej: string;
  readonly warna: string;
  readonly gambar: string | null;
  readonly createdAt: Date;
  readonly _count: {
    readonly tiers: number;
    readonly sections: number;
    readonly tempahan: number;
  };
};

interface PakejTableProps {
  readonly pakejList: readonly PakejItem[];
}

export function PakejTable({ pakejList }: PakejTableProps) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/pakej/${deleteId}`, {
        method: 'DELETE',
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error ?? 'Gagal memadam pakej');
        return;
      }

      toast.success('Pakej berjaya dipadam');
      router.refresh();
    } catch {
      toast.error('Ralat rangkaian');
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  }

  if (pakejList.length === 0) {
    return (
      <Card className="bg-white">
        <CardBody>
          <p className="text-center text-navy/60">
            Tiada pakej. Klik &quot;Tambah Pakej&quot; untuk mula.
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <>
      <Card className="overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-navy/10 bg-navy/5">
              <tr>
                <th className="px-4 py-3 font-medium text-navy">Nama Pakej</th>
                <th className="px-4 py-3 font-medium text-navy">Warna</th>
                <th className="px-4 py-3 font-medium text-navy">
                  Bilangan Tier
                </th>
                <th className="px-4 py-3 font-medium text-navy">Gambar</th>
                <th className="px-4 py-3 font-medium text-navy">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy/10">
              {pakejList.map((pakej) => (
                <tr key={pakej.id} className="hover:bg-navy/5">
                  <td className="px-4 py-3 font-medium text-navy">
                    {pakej.namaPakej}
                    {pakej._count.tempahan > 0 && (
                      <Badge variant="default" className="ml-2">
                        {pakej._count.tempahan} tempahan
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block h-6 w-6 rounded border border-navy/20"
                        style={{ backgroundColor: pakej.warna }}
                      />
                      <span className="font-mono text-xs text-navy/60">
                        {pakej.warna}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-navy">
                    {pakej._count.tiers}
                  </td>
                  <td className="px-4 py-3">
                    {pakej.gambar ? (
                      <img
                        src={pakej.gambar}
                        alt={pakej.namaPakej}
                        className="h-10 w-10 rounded object-cover"
                      />
                    ) : (
                      <span className="text-xs text-navy/40">Tiada</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          router.push(`/admin/pakej/${pakej.id}/edit`)
                        }
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setDeleteId(pakej.id)}
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
      </Card>

      <Modal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        title="Padam Pakej"
      >
        <p className="text-sm text-navy/80">
          Adakah anda pasti mahu memadam pakej ini? Tindakan ini tidak boleh
          dibatalkan.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button
            variant="secondary"
            onClick={() => setDeleteId(null)}
            disabled={isDeleting}
          >
            Batal
          </Button>
          <Button onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? 'Memadamkan...' : 'Padam'}
          </Button>
        </div>
      </Modal>
    </>
  );
}
