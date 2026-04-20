import { TempahanTable } from '@/components/admin/tempahan/tempahan-table';
import { TempahanCalendar } from '@/components/admin/tempahan/tempahan-calendar';

export const metadata = {
  title: 'Tempahan - Admin MawarBiru',
};

export default function TempahanPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-navy">Tempahan</h1>
      <TempahanCalendar />
      <TempahanTable />
    </div>
  );
}
