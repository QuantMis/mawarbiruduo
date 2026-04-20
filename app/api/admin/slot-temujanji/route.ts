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
  createSlotSchema,
  bulkCreateSlotSchema,
} from '@/lib/validations/slot-temujanji';

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
  const tarikh = searchParams.get('tarikh');
  const status = searchParams.get('status');

  const where: Record<string, unknown> = {};

  if (tarikh) {
    const date = new Date(tarikh);
    if (!isNaN(date.getTime())) {
      where.tarikh = date;
    }
  }

  if (status && ['TERSEDIA', 'DITEMPAH', 'DIBATALKAN'].includes(status)) {
    where.status = status;
  }

  const [slots, total] = await Promise.all([
    prisma.slotTemujanji.findMany({
      where,
      orderBy: [{ tarikh: 'desc' }, { masaMula: 'asc' }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.slotTemujanji.count({ where }),
  ]);

  return successResponse({ data: slots, meta: { total, page, limit } });
});

export const POST = withErrorHandling(async (req: NextRequest) => {
  const rateLimited = rateLimit(req);
  if (rateLimited) return rateLimited;

  const body = await req.json();

  // Determine if bulk or single create
  const isBulk = Array.isArray(body.slots);

  if (isBulk) {
    const validated = validateBody(bulkCreateSlotSchema, body);
    const tarikh = new Date(validated.tarikh);

    // Check for overlapping slots
    const existing = await prisma.slotTemujanji.findMany({
      where: { tarikh, status: { not: 'DIBATALKAN' } },
      select: { masaMula: true, masaTamat: true },
    });

    for (const slot of validated.slots) {
      const hasOverlap = existing.some(
        (e) => slot.masaMula < e.masaTamat && slot.masaTamat > e.masaMula,
      );
      if (hasOverlap) {
        return errorResponse(
          `Slot ${slot.masaMula} - ${slot.masaTamat} bertindih dengan slot sedia ada`,
          409,
        );
      }
    }

    // Check for overlaps within the submitted batch
    for (let i = 0; i < validated.slots.length; i++) {
      for (let j = i + 1; j < validated.slots.length; j++) {
        const a = validated.slots[i];
        const b = validated.slots[j];
        if (a.masaMula < b.masaTamat && a.masaTamat > b.masaMula) {
          return errorResponse(
            `Slot ${a.masaMula} - ${a.masaTamat} bertindih dengan ${b.masaMula} - ${b.masaTamat}`,
            409,
          );
        }
      }
    }

    const created = await prisma.slotTemujanji.createMany({
      data: validated.slots.map((s) => ({
        tarikh,
        masaMula: s.masaMula,
        masaTamat: s.masaTamat,
        status: 'TERSEDIA' as const,
      })),
    });

    return successResponse({ count: created.count }, 201);
  }

  // Single create
  const validated = validateBody(createSlotSchema, body);
  const tarikh = new Date(validated.tarikh);

  // Check for overlapping slots
  const existing = await prisma.slotTemujanji.findMany({
    where: { tarikh, status: { not: 'DIBATALKAN' } },
    select: { masaMula: true, masaTamat: true },
  });

  const hasOverlap = existing.some(
    (e) => validated.masaMula < e.masaTamat && validated.masaTamat > e.masaMula,
  );
  if (hasOverlap) {
    return errorResponse('Slot bertindih dengan slot sedia ada', 409);
  }

  const slot = await prisma.slotTemujanji.create({
    data: {
      tarikh,
      masaMula: validated.masaMula,
      masaTamat: validated.masaTamat,
      status: 'TERSEDIA',
    },
  });

  return successResponse(slot, 201);
});
