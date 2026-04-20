import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import {
  successResponse,
  errorResponse,
  withErrorHandling,
  validateBody,
} from '@/lib/api';
import { tempahanUpdateSchema } from '@/lib/validations/tempahan';

export const dynamic = 'force-dynamic';

function extractId(req: NextRequest): string {
  const segments = new URL(req.url).pathname.split('/');
  return segments[segments.length - 1];
}

export const GET = withErrorHandling(async (req: NextRequest) => {
  const id = extractId(req);

  const tempahan = await prisma.tempahan.findUnique({
    where: { id },
    include: {
      slotTempahan: true,
      pakej: { select: { id: true, namaPakej: true, warna: true } },
      pelanggan: { select: { id: true, nama: true, noTelefon: true } },
    },
  });

  if (!tempahan) {
    return errorResponse('Tempahan tidak dijumpai', 404);
  }

  return successResponse(tempahan);
});

export const PUT = withErrorHandling(async (req: NextRequest) => {
  const id = extractId(req);

  const existing = await prisma.tempahan.findUnique({
    where: { id },
  });

  if (!existing) {
    return errorResponse('Tempahan tidak dijumpai', 404);
  }

  const body: unknown = await req.json();
  const data = validateBody(tempahanUpdateSchema, body);

  // Verify pakej if changing
  if (data.pakejId) {
    const pakej = await prisma.pakej.findUnique({
      where: { id: data.pakejId },
    });
    if (!pakej) {
      return errorResponse('Pakej tidak dijumpai', 404);
    }
  }

  // Verify pelanggan if changing
  if (data.pelangganId) {
    const pelanggan = await prisma.pelanggan.findUnique({
      where: { id: data.pelangganId },
    });
    if (!pelanggan) {
      return errorResponse('Pelanggan tidak dijumpai', 404);
    }
  }

  const updateData: Record<string, unknown> = {};
  if (data.namaTempahan !== undefined) updateData.namaTempahan = data.namaTempahan;
  if (data.pakejId !== undefined) updateData.pakejId = data.pakejId;
  if (data.pelangganId !== undefined) updateData.pelangganId = data.pelangganId;
  if (data.nota !== undefined) updateData.nota = data.nota;

  const tempahan = await prisma.tempahan.update({
    where: { id },
    data: updateData,
    include: {
      slotTempahan: true,
      pakej: { select: { id: true, namaPakej: true, warna: true } },
      pelanggan: { select: { id: true, nama: true, noTelefon: true } },
    },
  });

  return successResponse(tempahan);
});

export const DELETE = withErrorHandling(async (req: NextRequest) => {
  const id = extractId(req);

  const existing = await prisma.tempahan.findUnique({
    where: { id },
    select: { id: true, slotTempahanId: true },
  });

  if (!existing) {
    return errorResponse('Tempahan tidak dijumpai', 404);
  }

  // Delete tempahan and revert slot to TERSEDIA in a transaction
  await prisma.$transaction(async (tx) => {
    await tx.tempahan.delete({
      where: { id },
    });

    await tx.slotTempahan.update({
      where: { id: existing.slotTempahanId },
      data: { status: 'TERSEDIA' },
    });
  });

  return successResponse({ message: 'Tempahan berjaya dipadam' });
});
