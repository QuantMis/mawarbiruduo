import { SlotTemujanjiTable } from '@/components/admin/slot-temujanji/slot-temujanji-table';

export const metadata = {
  title: 'Slot Temujanji - Admin',
};

export default function SlotTemujanjiPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-navy">Slot Temujanji</h1>
      <SlotTemujanjiTable />
    </div>
  );
}
