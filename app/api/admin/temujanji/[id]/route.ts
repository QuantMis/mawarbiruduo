import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import {
  successResponse,
  errorResponse,
  withErrorHandling,
  createRateLimiter,
} from '@/lib/api';

export const dynamic = 'force-dynamic';

const rateLimit = createRateLimiter({
  interval: 60_000,
  maxRequests: 60,
});

type RouteParams = { params: Promise<{ id: string }> };

export const GET = withErrorHandling(async (req: NextRequest, context: unknown) => {
  const rateLimited = rateLimit(req);
  if (rateLimited) return rateLimited;

  const { id } = await (context as RouteParams).params;

  if (!id) {
    return errorResponse('ID diperlukan', 400);
  }

  const temujanji = await prisma.temujanji.findUnique({
    where: { id },
    include: {
      pelanggan: true,
      slotTemujanji: true,
    },
  });

  if (!temujanji) {
    return errorResponse('Temujanji tidak dijumpai', 404);
  }

  return successResponse(temujanji);
});

export const DELETE = withErrorHandling(async (req: NextRequest, context: unknown) => {
  const rateLimited = rateLimit(req);
  if (rateLimited) return rateLimited;

  const { id } = await (context as RouteParams).params;

  if (!id) {
    return errorResponse('ID diperlukan', 400);
  }

  const temujanji = await prisma.temujanji.findUnique({
    where: { id },
    include: { slotTemujanji: true },
  });

  if (!temujanji) {
    return errorResponse('Temujanji tidak dijumpai', 404);
  }

  await prisma.$transaction([
    prisma.temujanji.delete({ where: { id } }),
    prisma.slotTemujanji.update({
      where: { id: temujanji.slotTemujanjiId },
      data: { status: 'TERSEDIA' },
    }),
  ]);

  return successResponse({ deleted: true });
});
