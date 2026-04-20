import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import {
  successResponse,
  errorResponse,
  withErrorHandling,
  validateBody,
  createRateLimiter,
} from '@/lib/api';
import {
  createSlotTempahanSchema,
  bulkCreateSlotTempahanSchema,
} from '@/lib/validations/slot-tempahan';

export const dynamic = 'force-dynamic';

const rateLimit = createRateLimiter({
  interval: 60_000,
  maxRequests: 60,
});

export const GET = withErrorHandling(async (req: NextRequest) => {
  const rateLimited = rateLimit(req);
  if (rateLimited) return rateLimited;

  const { searchParams } = new URL(req.url);
  const month = searchParams.get('month'); // YYYY-MM

  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return errorResponse('Parameter "month" diperlukan dalam format YYYY-MM', 400);
  }

  const [year, monthNum] = month.split('-').map(Number);
  const startDate = new Date(Date.UTC(year, monthNum - 1, 1));
  const endDate = new Date(Date.UTC(year, monthNum, 1));

  const slots = await prisma.slotTempahan.findMany({
    where: {
      tarikh: {
        gte: startDate,
        lt: endDate,
      },
    },
    orderBy: { tarikh: 'asc' },
    include: {
      tempahan: {
        select: { id: true, namaTempahan: true },
      },
    },
  });

  return successResponse({ data: slots, meta: { total: slots.length } });
});

export const POST = withErrorHandling(async (req: NextRequest) => {
  const rateLimited = rateLimit(req);
  if (rateLimited) return rateLimited;

  const body = await req.json();

  // Determine if bulk (date range) or single create
  const isBulk = 'startDate' in body && 'endDate' in body;

  if (isBulk) {
    const validated = validateBody(bulkCreateSlotTempahanSchema, body);
    const start = new Date(validated.startDate);
    const end = new Date(validated.endDate);

    // Generate all dates in range
    const dates: Date[] = [];
    const current = new Date(start);
    while (current <= end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    if (dates.length > 90) {
      return errorResponse('Julat tarikh tidak boleh melebihi 90 hari', 400);
    }

    // Find existing slots in the date range to skip
    const existing = await prisma.slotTempahan.findMany({
      where: {
        tarikh: { gte: start, lte: end },
      },
      select: { tarikh: true },
    });

    const existingDates = new Set(
      existing.map((s) => s.tarikh.toISOString().split('T')[0]),
    );

    const newDates = dates.filter(
      (d) => !existingDates.has(d.toISOString().split('T')[0]),
    );

    if (newDates.length === 0) {
      return successResponse({ count: 0, skipped: dates.length }, 200);
    }

    const created = await prisma.slotTempahan.createMany({
      data: newDates.map((d: Date) => ({
        tarikh: d,
        status: 'TERSEDIA' as const,
      })),
    });

    return successResponse(
      { count: created.count, skipped: dates.length - newDates.length },
      201,
    );
  }

  // Single create
  const validated = validateBody(createSlotTempahanSchema, body);
  const tarikh = new Date(validated.tarikh);

  // Check if slot already exists for this date
  const existing = await prisma.slotTempahan.findFirst({
    where: { tarikh },
  });

  if (existing) {
    return errorResponse('Slot untuk tarikh ini sudah wujud', 409);
  }

  const slot = await prisma.slotTempahan.create({
    data: {
      tarikh,
      status: 'TERSEDIA',
    },
  });

  return successResponse(slot, 201);
});
