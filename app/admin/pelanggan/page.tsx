import { PelangganTable } from '@/components/admin/pelanggan/pelanggan-table';

export const metadata = {
  title: 'Pelanggan - Admin MawarBiru',
};

export default function PelangganPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-navy">Pelanggan</h1>
      <PelangganTable />
    </div>
  );
}
