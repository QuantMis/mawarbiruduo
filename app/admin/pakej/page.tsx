import Link from 'next/link';
import { prisma } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { PakejTable } from '@/components/admin/pakej/pakej-table';

export default async function PakejListPage() {
  const pakejList = await prisma.pakej.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: {
          tiers: true,
          sections: true,
          tempahan: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-navy">Senarai Pakej</h1>
        <Link href="/admin/pakej/baru">
          <Button>+ Tambah Pakej</Button>
        </Link>
      </div>

      <PakejTable pakejList={pakejList} />
    </div>
  );
}
