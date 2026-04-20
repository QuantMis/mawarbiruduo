import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import {
  successResponse,
  errorResponse,
  withErrorHandling,
  validateBody,
} from '@/lib/api';
import { tempahanCreateSchema } from '@/lib/validations/tempahan';

export const dynamic = 'force-dynamic';

export const GET = withErrorHandling(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get('page') ?? '1'));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') ?? '20')));
  const search = searchParams.get('search')?.trim() ?? '';
  const pakejId = searchParams.get('pakejId')?.trim() ?? '';
  const dateFrom = searchParams.get('dateFrom')?.trim() ?? '';
  const dateTo = searchParams.get('dateTo')?.trim() ?? '';

  const where: Record<string, unknown> = {};
  const andConditions: Record<string, unknown>[] = [];

  if (search) {
    andConditions.push({
      OR: [
        { namaTempahan: { contains: search } },
        { pelanggan: { nama: { contains: search } } },
      ],
    });
  }

  if (pakejId) {
    andConditions.push({ pakejId });
  }

  if (dateFrom || dateTo) {
    const slotCondition: Record<string, unknown> = {};
    if (dateFrom) {
      slotCondition.gte = new Date(dateFrom);
    }
    if (dateTo) {
      slotCondition.lte = new Date(dateTo);
    }
    andConditions.push({
      slotTempahan: { tarikh: slotCondition },
    });
  }

  if (andConditions.length > 0) {
    where.AND = andConditions;
  }

  const [tempahan, total] = await Promise.all([
    prisma.tempahan.findMany({
      where,
      include: {
        slotTempahan: true,
        pakej: { select: { id: true, namaPakej: true, warna: true } },
        pelanggan: { select: { id: true, nama: true, noTelefon: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.tempahan.count({ where }),
  ]);

  return successResponse({
    items: tempahan,
    meta: { total, page, limit },
  });
});

export const POST = withErrorHandling(async (req: NextRequest) => {
  const body: unknown = await req.json();
  const data = validateBody(tempahanCreateSchema, body);

  // Verify slot exists and is TERSEDIA
  const slot = await prisma.slotTempahan.findUnique({
    where: { id: data.slotTempahanId },
  });

  if (!slot) {
    return errorResponse('Slot tempahan tidak dijumpai', 404);
  }

  if (slot.status !== 'TERSEDIA') {
    return errorResponse('Slot ini tidak tersedia untuk tempahan', 400);
  }

  // Verify pakej exists
  const pakej = await prisma.pakej.findUnique({
    where: { id: data.pakejId },
  });

  if (!pakej) {
    return errorResponse('Pakej tidak dijumpai', 404);
  }

  // Verify pelanggan exists
  const pelanggan = await prisma.pelanggan.findUnique({
    where: { id: data.pelangganId },
  });

  if (!pelanggan) {
    return errorResponse('Pelanggan tidak dijumpai', 404);
  }

  // Create tempahan and update slot status in a transaction
  const tempahan = await prisma.$transaction(async (tx) => {
    const created = await tx.tempahan.create({
      data: {
        namaTempahan: data.namaTempahan,
        slotTempahanId: data.slotTempahanId,
        pakejId: data.pakejId,
        pelangganId: data.pelangganId,
        nota: data.nota ?? null,
      },
      include: {
        slotTempahan: true,
        pakej: { select: { id: true, namaPakej: true, warna: true } },
        pelanggan: { select: { id: true, nama: true, noTelefon: true } },
      },
    });

    await tx.slotTempahan.update({
      where: { id: data.slotTempahanId },
      data: { status: 'DITEMPAH' },
    });

    return created;
  });

  return successResponse(tempahan, 201);
});
