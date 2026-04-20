import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import {
  successResponse,
  errorResponse,
  withErrorHandling,
  validateBody,
} from '@/lib/api';
import { pelangganUpdateSchema } from '@/lib/validations/pelanggan';

export const dynamic = 'force-dynamic';

function extractId(req: NextRequest): string {
  const segments = new URL(req.url).pathname.split('/');
  return segments[segments.length - 1];
}

export const GET = withErrorHandling(async (req: NextRequest) => {
  const id = extractId(req);

  const pelanggan = await prisma.pelanggan.findUnique({
    where: { id },
    include: {
      temujanji: {
        include: {
          slotTemujanji: { select: { tarikh: true, masaMula: true, masaTamat: true, status: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
      tempahan: {
        include: {
          pakej: { select: { namaPakej: true } },
          slotTempahan: { select: { tarikh: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!pelanggan) {
    return errorResponse('Pelanggan tidak dijumpai', 404);
  }

  return successResponse(pelanggan);
});

export const PUT = withErrorHandling(async (req: NextRequest) => {
  const id = extractId(req);
  const body: unknown = await req.json();
  const data = validateBody(pelangganUpdateSchema, body);

  const existing = await prisma.pelanggan.findUnique({ where: { id } });
  if (!existing) {
    return errorResponse('Pelanggan tidak dijumpai', 404);
  }

  const updateData: Record<string, unknown> = {};

  if (data.nama !== undefined) {
    updateData.nama = data.nama;
  }

  if (data.noTelefon !== undefined) {
    const noTelefonNormalized = data.noTelefon.replace(/-/g, '');

    if (noTelefonNormalized !== existing.noTelefon) {
      const duplicate = await prisma.pelanggan.findUnique({
        where: { noTelefon: noTelefonNormalized },
      });
      if (duplicate) {
        return errorResponse(
          `Pelanggan dengan nombor telefon ${noTelefonNormalized} sudah wujud`,
          409,
        );
      }
      updateData.noTelefon = noTelefonNormalized;
    }
  }

  if (data.nota !== undefined) {
    updateData.nota = data.nota ?? null;
  }

  const pelanggan = await prisma.pelanggan.update({
    where: { id },
    data: updateData,
    include: {
      _count: { select: { temujanji: true, tempahan: true } },
    },
  });

  return successResponse(pelanggan);
});

export const DELETE = withErrorHandling(async (req: NextRequest) => {
  const id = extractId(req);

  const pelanggan = await prisma.pelanggan.findUnique({
    where: { id },
    include: {
      _count: { select: { temujanji: true, tempahan: true } },
    },
  });

  if (!pelanggan) {
    return errorResponse('Pelanggan tidak dijumpai', 404);
  }

  const temujanjiCount = pelanggan._count.temujanji;
  const tempahanCount = pelanggan._count.tempahan;

  if (temujanjiCount > 0 || tempahanCount > 0) {
    return errorResponse(
      `Tidak dapat memadam pelanggan ini kerana masih mempunyai ${temujanjiCount} temujanji dan ${tempahanCount} tempahan`,
      409,
    );
  }

  await prisma.pelanggan.delete({ where: { id } });

  return successResponse({ deleted: true });
});
