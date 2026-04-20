import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import {
  successResponse,
  errorResponse,
  withErrorHandling,
  validateBody,
} from '@/lib/api';
import { updatePakejSchema } from '@/lib/validations/pakej';

export const dynamic = 'force-dynamic';

async function extractId(context: unknown): Promise<string> {
  const ctx = context as { params: Promise<{ id: string }> };
  const { id } = await ctx.params;
  return id;
}

export const GET = withErrorHandling(async (_req: NextRequest, context) => {
  const id = await extractId(context);

  const pakej = await prisma.pakej.findUnique({
    where: { id },
    include: {
      tiers: { orderBy: { createdAt: 'asc' } },
      sections: { orderBy: { createdAt: 'asc' } },
    },
  });

  if (!pakej) {
    return errorResponse('Pakej tidak dijumpai', 404);
  }

  return successResponse(pakej);
});

export const PUT = withErrorHandling(async (req: NextRequest, context) => {
  const id = await extractId(context);
  const body: unknown = await req.json();
  const data = validateBody(updatePakejSchema, body);

  const pakej = await prisma.$transaction(async (tx) => {
    // Verify pakej exists
    const existing = await tx.pakej.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('NOT_FOUND');
    }

    // Delete existing tiers and sections
    await tx.pakejTier.deleteMany({ where: { pakejId: id } });
    await tx.pakejSection.deleteMany({ where: { pakejId: id } });

    // Update pakej and recreate tiers + sections
    const updated = await tx.pakej.update({
      where: { id },
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

    return updated;
  });

  return successResponse(pakej);
});

export const DELETE = withErrorHandling(async (_req: NextRequest, context) => {
  const id = await extractId(context);

  const pakej = await prisma.pakej.findUnique({
    where: { id },
    include: {
      _count: { select: { tempahan: true } },
    },
  });

  if (!pakej) {
    return errorResponse('Pakej tidak dijumpai', 404);
  }

  if (pakej._count.tempahan > 0) {
    return errorResponse(
      'Pakej tidak boleh dipadam kerana masih ada tempahan yang berkaitan',
      409,
    );
  }

  await prisma.pakej.delete({ where: { id } });

  return successResponse({ deleted: true });
});
