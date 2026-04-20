import { TemujanjiView } from '@/components/admin/temujanji/temujanji-view';

export const metadata = {
  title: 'Temujanji - Admin',
};

export default function TemujanjiPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-navy">Temujanji</h1>
      <TemujanjiView />
    </div>
  );
}
