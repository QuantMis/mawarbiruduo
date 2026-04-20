import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import {
  successResponse,
  errorResponse,
  withErrorHandling,
  validateBody,
  createRateLimiter,
} from '@/lib/api';
import { updateSlotSchema } from '@/lib/validations/slot-temujanji';

export const dynamic = 'force-dynamic';

const rateLimit = createRateLimiter({
  interval: 60_000,
  maxRequests: 60,
});

type RouteParams = { params: Promise<{ id: string }> };

export const PUT = withErrorHandling(async (req: NextRequest, context: unknown) => {
  const rateLimited = rateLimit(req);
  if (rateLimited) return rateLimited;

  const { id } = await (context as RouteParams).params;

  if (!id) {
    return errorResponse('ID diperlukan', 400);
  }

  const existing = await prisma.slotTemujanji.findUnique({ where: { id } });
  if (!existing) {
    return errorResponse('Slot tidak dijumpai', 404);
  }

  if (existing.status !== 'TERSEDIA') {
    return errorResponse(
      'Hanya slot dengan status TERSEDIA boleh dikemaskini',
      400,
    );
  }

  const body = await req.json();
  const validated = validateBody(updateSlotSchema, body);

  const tarikh = validated.tarikh ? new Date(validated.tarikh) : existing.tarikh;
  const masaMula = validated.masaMula ?? existing.masaMula;
  const masaTamat = validated.masaTamat ?? existing.masaTamat;

  // Validate masaTamat > masaMula after merging
  if (masaTamat <= masaMula) {
    return errorResponse('Masa tamat mestilah selepas masa mula', 400);
  }

  // Check for overlapping slots (excluding this one)
  const others = await prisma.slotTemujanji.findMany({
    where: {
      tarikh,
      status: { not: 'DIBATALKAN' },
      id: { not: id },
    },
    select: { masaMula: true, masaTamat: true },
  });

  const hasOverlap = others.some(
    (e) => masaMula < e.masaTamat && masaTamat > e.masaMula,
  );
  if (hasOverlap) {
    return errorResponse('Slot bertindih dengan slot sedia ada', 409);
  }

  const updated = await prisma.slotTemujanji.update({
    where: { id },
    data: { tarikh, masaMula, masaTamat },
  });

  return successResponse(updated);
});

export const DELETE = withErrorHandling(async (req: NextRequest, context: unknown) => {
  const rateLimited = rateLimit(req);
  if (rateLimited) return rateLimited;

  const { id } = await (context as RouteParams).params;

  if (!id) {
    return errorResponse('ID diperlukan', 400);
  }

  const existing = await prisma.slotTemujanji.findUnique({ where: { id } });
  if (!existing) {
    return errorResponse('Slot tidak dijumpai', 404);
  }

  if (existing.status === 'DITEMPAH') {
    const { searchParams } = new URL(req.url);
    const force = searchParams.get('force');
    if (force !== 'true') {
      return errorResponse(
        'Slot ini telah ditempah. Gunakan force=true untuk memadamkan.',
        400,
      );
    }
  }

  await prisma.slotTemujanji.delete({ where: { id } });

  return successResponse({ deleted: true });
});
