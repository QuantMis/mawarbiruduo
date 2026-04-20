import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import {
  successResponse,
  withErrorHandling,
  createRateLimiter,
} from '@/lib/api';

export const dynamic = 'force-dynamic';

const rateLimit = createRateLimiter({
  interval: 60_000,
  maxRequests: 60,
});

export const GET = withErrorHandling(async (req: NextRequest) => {
  const rateLimited = rateLimit(req);
  if (rateLimited) return rateLimited;

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get('page') ?? '1'));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') ?? '20')));
  const search = searchParams.get('search')?.trim() ?? '';
  const status = searchParams.get('status') ?? '';
  const dateFrom = searchParams.get('dateFrom') ?? '';
  const dateTo = searchParams.get('dateTo') ?? '';

  const where: Record<string, unknown> = {};

  if (search) {
    where.pelanggan = {
      OR: [
        { nama: { contains: search } },
        { noTelefon: { contains: search } },
      ],
    };
  }

  if (status && ['TERSEDIA', 'DITEMPAH', 'DIBATALKAN'].includes(status)) {
    where.slotTemujanji = {
      ...((where.slotTemujanji as Record<string, unknown>) ?? {}),
      status,
    };
  }

  if (dateFrom || dateTo) {
    const slotFilter = (where.slotTemujanji as Record<string, unknown>) ?? {};
    const tarikhFilter: Record<string, Date> = {};

    if (dateFrom) {
      const from = new Date(dateFrom);
      if (!isNaN(from.getTime())) {
        tarikhFilter.gte = from;
      }
    }

    if (dateTo) {
      const to = new Date(dateTo);
      if (!isNaN(to.getTime())) {
        tarikhFilter.lte = to;
      }
    }

    if (Object.keys(tarikhFilter).length > 0) {
      slotFilter.tarikh = tarikhFilter;
      where.slotTemujanji = slotFilter;
    }
  }

  const [temujanjiList, total] = await Promise.all([
    prisma.temujanji.findMany({
      where,
      include: {
        pelanggan: true,
        slotTemujanji: true,
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.temujanji.count({ where }),
  ]);

  return successResponse({ data: temujanjiList, meta: { total, page, limit } });
});
