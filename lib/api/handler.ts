import { NextRequest } from 'next/server';
import { errorResponse } from './response';
import { ValidationError } from './validate';
import { Prisma } from '@prisma/client';

// Map Prisma error codes to Bahasa Malaysia messages
const prismaErrorMessages: Readonly<
  Record<string, { readonly message: string; readonly status: number }>
> = {
  P2002: { message: 'Rekod sudah wujud', status: 409 },
  P2025: { message: 'Rekod tidak dijumpai', status: 404 },
};

type RouteHandler = (req: NextRequest, context?: unknown) => Promise<Response>;

export function withErrorHandling(handler: RouteHandler): RouteHandler {
  return async (req, context) => {
    try {
      return await handler(req, context);
    } catch (error) {
      console.error('[API Error]', error);

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        const mapped = prismaErrorMessages[error.code];
        if (mapped) {
          return errorResponse(mapped.message, mapped.status);
        }
      }

      if (error instanceof ValidationError) {
        return errorResponse(error.message, 400);
      }

      return errorResponse('Ralat dalaman pelayan', 500);
    }
  };
}
