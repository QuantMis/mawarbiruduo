import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';
import {
  successResponse,
  errorResponse,
  withErrorHandling,
  createRateLimiter,
} from '@/lib/api';
import { getCalendarDateRange } from '@/lib/utils/calendar';

const rateLimit = createRateLimiter({
  interval: 60_000,
  maxRequests: 30,
});

const currentYear = new Date().getFullYear();

const kalendarQuerySchema = z.object({
  bulan: z.coerce
    .number()
    .int()
    .min(1, 'Bulan mestilah antara 1 dan 12')
    .max(12, 'Bulan mestilah antara 1 dan 12'),
  tahun: z.coerce
    .number()
    .int()
    .min(currentYear - 2, `Tahun mestilah antara ${currentYear - 2} dan ${currentYear + 2}`)
    .max(currentYear + 2, `Tahun mestilah antara ${currentYear - 2} dan ${currentYear + 2}`),
});

export const GET = withErrorHandling(async (req: NextRequest) => {
  const rateLimited = rateLimit(req);
  if (rateLimited) {
    return rateLimited;
  }

  const searchParams = req.nextUrl.searchParams;
  const parseResult = kalendarQuerySchema.safeParse({
    bulan: searchParams.get('bulan'),
    tahun: searchParams.get('tahun'),
  });

  if (!parseResult.success) {
    const firstIssue = parseResult.error.issues[0];
    return errorResponse(firstIssue?.message ?? 'Parameter tidak sah', 400);
  }

  const { bulan, tahun } = parseResult.data;
  const { start, end } = getCalendarDateRange(bulan, tahun);

  const tempahanRecords = await prisma.tempahan.findMany({
    where: {
      slotTempahan: {
        tarikh: {
          gte: start,
          lte: end,
        },
        status: 'DITEMPAH',
      },
    },
    select: {
      namaTempahan: true,
      slotTempahan: {
        select: {
          tarikh: true,
        },
      },
      pakej: {
        select: {
          id: true,
          namaPakej: true,
          warna: true,
        },
      },
    },
  });

  const tempahan = tempahanRecords.map((t) => ({
    tarikh: t.slotTempahan.tarikh.toISOString().split('T')[0],
    namaTempahan: t.namaTempahan,
    pakejNama: t.pakej.namaPakej,
    pakejWarna: t.pakej.warna,
  }));

  const pakejMap = new Map<string, { id: string; namaPakej: string; warna: string }>();
  for (const t of tempahanRecords) {
    if (!pakejMap.has(t.pakej.id)) {
      pakejMap.set(t.pakej.id, {
        id: t.pakej.id,
        namaPakej: t.pakej.namaPakej,
        warna: t.pakej.warna,
      });
    }
  }

  const response = successResponse({
    tempahan,
    pakej: [...pakejMap.values()],
  });

  response.headers.set('Cache-Control', 'public, max-age=60');

  return response;
});
