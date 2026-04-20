import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import {
  successResponse,
  errorResponse,
  withErrorHandling,
  validateBody,
} from '@/lib/api';
import { pelangganCreateSchema } from '@/lib/validations/pelanggan';

export const dynamic = 'force-dynamic';

export const GET = withErrorHandling(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get('page') ?? '1'));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') ?? '20')));
  const search = searchParams.get('search')?.trim() ?? '';

  const where = search
    ? {
        OR: [
          { nama: { contains: search } },
          { noTelefon: { contains: search } },
        ],
      }
    : {};

  const [pelanggan, total] = await Promise.all([
    prisma.pelanggan.findMany({
      where,
      include: {
        _count: { select: { temujanji: true, tempahan: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.pelanggan.count({ where }),
  ]);

  return successResponse({
    items: pelanggan,
    meta: { total, page, limit },
  });
});

export const POST = withErrorHandling(async (req: NextRequest) => {
  const body: unknown = await req.json();
  const data = validateBody(pelangganCreateSchema, body);

  const noTelefonNormalized = data.noTelefon.replace(/-/g, '');

  const existing = await prisma.pelanggan.findUnique({
    where: { noTelefon: noTelefonNormalized },
  });

  if (existing) {
    return errorResponse(
      `Pelanggan dengan nombor telefon ${noTelefonNormalized} sudah wujud`,
      409,
    );
  }

  const pelanggan = await prisma.pelanggan.create({
    data: {
      nama: data.nama,
      noTelefon: noTelefonNormalized,
      nota: data.nota ?? null,
    },
    include: {
      _count: { select: { temujanji: true, tempahan: true } },
    },
  });

  return successResponse(pelanggan, 201);
});
