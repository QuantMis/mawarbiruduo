import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import {
  successResponse,
  errorResponse,
  withErrorHandling,
  validateBody,
  createRateLimiter,
} from '@/lib/api';
import { updateSlotTempahanSchema } from '@/lib/validations/slot-tempahan';

export const dynamic = 'force-dynamic';

const rateLimit = createRateLimiter({
  interval: 60_000,
  maxRequests: 60,
});

export const PUT = withErrorHandling(async (req: NextRequest, context?: unknown) => {
  const rateLimited = rateLimit(req);
  if (rateLimited) return rateLimited;

  const { id } = await (context as { params: Promise<{ id: string }> }).params;
  const body = await req.json();
  const validated = validateBody(updateSlotTempahanSchema, body);

  const existing = await prisma.slotTempahan.findUnique({
    where: { id },
    include: { tempahan: { select: { id: true } } },
  });

  if (!existing) {
    return errorResponse('Slot tidak dijumpai', 404);
  }

  // Cannot change status of a booked slot to TERSEDIA
  if (existing.status === 'DITEMPAH' && validated.status === 'TERSEDIA') {
    return errorResponse(
      'Tidak boleh menukar status slot yang telah ditempah kepada TERSEDIA',
      400,
    );
  }

  const updated = await prisma.slotTempahan.update({
    where: { id },
    data: { status: validated.status },
  });

  return successResponse(updated);
});

export const DELETE = withErrorHandling(async (req: NextRequest, context?: unknown) => {
  const rateLimited = rateLimit(req);
  if (rateLimited) return rateLimited;

  const { id } = await (context as { params: Promise<{ id: string }> }).params;
  const { searchParams } = new URL(req.url);
  const force = searchParams.get('force') === 'true';

  const existing = await prisma.slotTempahan.findUnique({
    where: { id },
    include: { tempahan: { select: { id: true } } },
  });

  if (!existing) {
    return errorResponse('Slot tidak dijumpai', 404);
  }

  if (existing.status === 'DITEMPAH' && !force) {
    return errorResponse(
      'Slot telah ditempah. Gunakan force=true untuk memadam.',
      400,
    );
  }

  await prisma.slotTempahan.delete({ where: { id } });

  return successResponse({ deleted: true });
});
