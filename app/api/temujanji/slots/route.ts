import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';
import {
  successResponse,
  withErrorHandling,
  createRateLimiter,
} from '@/lib/api';

const rateLimit = createRateLimiter({
  interval: 60_000,
  maxRequests: 30,
});

export const GET = withErrorHandling(async (req: NextRequest) => {
  const rateLimited = rateLimit(req);
  if (rateLimited) return rateLimited;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + 14);

  const slots = await prisma.slotTemujanji.findMany({
    where: {
      status: 'TERSEDIA',
      tarikh: {
        gte: today,
        lt: maxDate,
      },
    },
    orderBy: [{ tarikh: 'asc' }, { masaMula: 'asc' }],
  });

  return successResponse(slots);
});
