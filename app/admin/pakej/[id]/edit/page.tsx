import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { PakejForm } from '@/components/admin/pakej/pakej-form';

export default async function EditPakejPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const pakej = await prisma.pakej.findUnique({
    where: { id },
    include: {
      tiers: { orderBy: { createdAt: 'asc' } },
      sections: { orderBy: { createdAt: 'asc' } },
    },
  });

  if (!pakej) {
    notFound();
  }

  const initialData = {
    id: pakej.id,
    namaPakej: pakej.namaPakej,
    warna: pakej.warna,
    tiers: pakej.tiers.map((tier) => ({
      namaTier: tier.namaTier,
      bilanganPax: tier.bilanganPax,
      harga: Number(tier.harga),
    })),
    sections: pakej.sections.map((section) => ({
      tajuk: section.tajuk,
      items: section.items as string[],
    })),
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-navy">Edit Pakej</h1>
      <PakejForm initialData={initialData} />
    </div>
  );
}
