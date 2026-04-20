import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';
import {
  successResponse,
  errorResponse,
  withErrorHandling,
  validateBody,
  createRateLimiter,
} from '@/lib/api';
import { temujanjiSchema } from '@/lib/validations/temujanji';

const rateLimit = createRateLimiter({
  interval: 60_000,
  maxRequests: 5,
});

type TransactionError = {
  readonly ok: false;
  readonly error: string;
  readonly status: number;
};

type TransactionSuccess = {
  readonly ok: true;
  readonly temujanji: { readonly id: string };
  readonly pelanggan: { readonly id: string };
};

type TransactionResult = TransactionError | TransactionSuccess;

export const POST = withErrorHandling(async (req: NextRequest) => {
  const rateLimited = rateLimit(req);
  if (rateLimited) return rateLimited;

  const body: unknown = await req.json();
  const data = validateBody(temujanjiSchema, body);

  const noTelefonNormalized = data.noTelefon.replace(/-/g, '');

  const result: TransactionResult = await prisma.$transaction(async (tx) => {
    const slot = await tx.slotTemujanji.findUnique({
      where: { id: data.slotTemujanjiId },
    });

    if (!slot) {
      return { ok: false, error: 'Slot temujanji tidak dijumpai', status: 404 };
    }

    if (slot.status === 'DITEMPAH') {
      return { ok: false, error: 'Slot ini telah ditempah', status: 409 };
    }

    const pelanggan = await tx.pelanggan.upsert({
      where: { noTelefon: noTelefonNormalized },
      update: { nama: data.nama },
      create: {
        nama: data.nama,
        noTelefon: noTelefonNormalized,
      },
    });

    const temujanji = await tx.temujanji.create({
      data: {
        pelangganId: pelanggan.id,
        slotTemujanjiId: data.slotTemujanjiId,
        nota: data.nota ?? null,
      },
    });

    await tx.slotTemujanji.update({
      where: { id: data.slotTemujanjiId },
      data: { status: 'DITEMPAH' },
    });

    return { ok: true, temujanji, pelanggan };
  });

  if (!result.ok) {
    return errorResponse(result.error, result.status);
  }

  return successResponse(
    { temujanji: result.temujanji, pelanggan: result.pelanggan },
    201,
  );
});
