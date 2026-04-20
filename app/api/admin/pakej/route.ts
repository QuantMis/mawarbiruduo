import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import {
  successResponse,
  withErrorHandling,
  validateBody,
} from '@/lib/api';
import { createPakejSchema } from '@/lib/validations/pakej';

export const dynamic = 'force-dynamic';

export const GET = withErrorHandling(async () => {
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

  return successResponse(pakejList);
});

export const POST = withErrorHandling(async (req: NextRequest) => {
  const body: unknown = await req.json();
  const data = validateBody(createPakejSchema, body);

  const pakej = await prisma.$transaction(async (tx) => {
    const created = await tx.pakej.create({
      data: {
        namaPakej: data.namaPakej,
        warna: data.warna,
        tiers: {
          create: data.tiers.map((tier) => ({
            namaTier: tier.namaTier,
            bilanganPax: tier.bilanganPax,
            harga: tier.harga,
          })),
        },
        sections: {
          create: data.sections.map((section) => ({
            tajuk: section.tajuk,
            items: section.items,
          })),
        },
      },
      include: {
        tiers: true,
        sections: true,
      },
    });

    return created;
  });

  return successResponse(pakej, 201);
});
