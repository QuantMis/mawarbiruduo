import { z } from 'zod';

// ── Server-side environment variables ──────────────────────────────────
const serverSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  NEXTAUTH_SECRET: z.string().min(1, 'NEXTAUTH_SECRET is required'),
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL'),
  ADMIN_EMAIL: z.string().email('ADMIN_EMAIL must be a valid email'),
  WHATSAPP_NUMBER: z.string().default(''),
});

// ── Client-safe environment variables (NEXT_PUBLIC_ prefix) ────────────
const clientSchema = z.object({
  NEXT_PUBLIC_WHATSAPP_NUMBER: z.string().default(''),
});

// ── Guard: prevent server env from leaking to client bundles ───────────
function validateServerEnv() {
  if (typeof window !== 'undefined') {
    throw new Error(
      'Server environment variables must not be imported in client components. ' +
        'Use `clientEnv` instead.',
    );
  }

  const result = serverSchema.safeParse(process.env);

  if (!result.success) {
    const missing = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');

    throw new Error(
      `Missing or invalid server environment variables:\n${missing}`,
    );
  }

  return result.data;
}

function validateClientEnv() {
  const result = clientSchema.safeParse({
    NEXT_PUBLIC_WHATSAPP_NUMBER:
      process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '',
  });

  if (!result.success) {
    const missing = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');

    throw new Error(
      `Missing or invalid client environment variables:\n${missing}`,
    );
  }

  return result.data;
}

// ── Exported validated env objects ──────────────────────────────────────

/**
 * Server-only environment variables.
 * Throws at import time if any required variable is missing or invalid.
 * Throws if imported from a client component (browser context).
 */
export const serverEnv = validateServerEnv();

/**
 * Client-safe environment variables (NEXT_PUBLIC_ prefix only).
 * Safe to import from both server and client components.
 */
export const clientEnv = validateClientEnv();
