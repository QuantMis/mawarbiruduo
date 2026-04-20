# Phase 1 — Foundation

---

## Task 1.1: Initialise Next.js Project and Repository

**Description:** Scaffold a new Next.js 14+ (App Router) project with TypeScript, Tailwind CSS, and ESLint. Initialise git, configure `.gitignore`, and set up the basic folder structure.

**Acceptance criteria:**
- [ ] `npm run dev` starts the dev server without errors
- [ ] TypeScript strict mode enabled in `tsconfig.json`
- [ ] Tailwind CSS configured with empty `theme.extend` ready for tokens
- [ ] ESLint runs clean on the scaffolded code
- [ ] Folder structure follows `app/(client)/`, `app/(admin)/`, `lib/`, `components/ui/`, `components/client/`, `components/admin/`, `prisma/`
- [ ] `.gitignore` excludes `node_modules`, `.next`, `.env*`, `prisma/*.db`
- [ ] Git repository initialised with initial commit

**Technical notes:**
- Use `create-next-app` with `--typescript --tailwind --eslint --app --src-dir=false`
- Add `prettier` and `prettier-plugin-tailwindcss` for consistent formatting
- Configure path aliases: `@/` maps to project root

**Dependencies:** None

**Estimate:** S

**Out of scope:** Database setup, authentication, design tokens, deployment configuration.

---

## Task 1.2: Configure Prisma with MySQL and Define Schema

**Description:** Install Prisma, configure the MySQL datasource via environment variable, and define the complete data model: User, Pelanggan, SlotTemujanji, Temujanji, SlotTempahan, Tempahan, Pakej, PakejTier, PakejSection.

**Acceptance criteria:**
- [ ] `prisma/schema.prisma` contains all 9 models with correct fields, types, and relations
- [ ] `User` model has `id`, `email`, `passwordHash`, `nama`, `createdAt`
- [ ] `Pelanggan` has `id`, `nama`, `noTelefon`, `nota`, `createdAt`
- [ ] `SlotTemujanji` has `id`, `tarikh` (DateTime date-only), `masaMula` (String HH:mm), `masaTamat` (String HH:mm), `status` (enum: TERSEDIA, DITEMPAH, DIBATALKAN), `createdAt`
- [ ] `Temujanji` has `id`, `pelangganId`, `slotTemujanjiId`, `nota`, `createdAt` — unique constraint on `slotTemujanjiId`
- [ ] `SlotTempahan` has `id`, `tarikh` (DateTime date-only), `status` (enum: TERSEDIA, DITEMPAH, DIBATALKAN), `createdAt`
- [ ] `Tempahan` has `id`, `namaTempahan`, `slotTempahanId`, `pakejId`, `pelangganId`, `nota`, `createdAt` — no kategori field
- [ ] `Pakej` has `id`, `namaPakej`, `warna` (String, hex colour), `gambar` (String, nullable), `createdAt`
- [ ] `PakejTier` has `id`, `pakejId`, `namaTier`, `bilanganPax`, `harga` (Decimal), `createdAt`
- [ ] `PakejSection` has `id`, `pakejId`, `tajuk`, `items` (Json array of strings), `createdAt`
- [ ] All relations use `@relation` with `onDelete` behaviour specified
- [ ] `npx prisma validate` passes
- [ ] `npx prisma generate` succeeds
- [ ] Migration runs cleanly against a fresh MySQL database
- [ ] `.env.example` documents `DATABASE_URL` format without real credentials

**Technical notes:**
- Use `@db.Date` for date-only fields if supported, otherwise store as `DateTime` and truncate in application code
- `masaMula`/`masaTamat` stored as `String` ("10:00", "12:00") — simpler than DateTime for 2-hour display slots
- `harga` uses `Decimal` with `@db.Decimal(10, 2)` for currency precision
- `PakejSection.items` is a JSON array — Prisma supports `Json` type on MySQL
- Seed script is a separate task (1.3)

**Dependencies:** 1.1

**Estimate:** M

**Out of scope:** Seed data, API routes, Prisma Client singleton setup.

---

## Task 1.3: Create Prisma Client Singleton and Seed Script

**Description:** Set up a global Prisma Client singleton for Next.js (avoiding multiple instances in development) and write a seed script that populates the database with the single admin user and the 3 base Pakej records with their tiers and sections.

**Acceptance criteria:**
- [ ] `lib/db.ts` exports a singleton `prisma` instance using the global cache pattern
- [ ] `prisma/seed.ts` creates 1 admin User with hashed password from env var `ADMIN_PASSWORD_HASH`
- [ ] Seed creates Pakej "Night Wedding" with tiers: 300 PAX / RM15,500, 500 PAX / RM18,500, 800 PAX / RM21,500
- [ ] Seed creates Pakej "Pakej Wedding" with tiers: Seroja 500 PAX / RM20,500, Melur 800 PAX / RM23,500, Teratai 1000 PAX / RM25,500
- [ ] Seed creates Pakej "Event Package" with tiers: Breakfast RM10/pax, Lunch RM23/pax, Hi-Tea RM23/pax, Dinner RM23/pax, Hall Rental RM2,500 (3hrs) / RM4,000 (5hrs)
- [ ] Each Pakej has sections with menu items (Menu Kenduri, Menu Kampung, Termasuk, Percuma)
- [ ] Each Pakej has a default `warna` hex value assigned
- [ ] Seed is idempotent — running twice does not create duplicates (upsert pattern)
- [ ] `npx prisma db seed` runs without errors
- [ ] `package.json` has `prisma.seed` script configured

**Technical notes:**
- Prisma Client singleton pattern: attach to `globalThis` in development, plain instance in production
- Use `bcrypt` or `bcryptjs` to hash the admin password; seed reads from `ADMIN_PASSWORD_HASH` env var to avoid plaintext in code
- Upsert on unique fields (`email` for User, `namaPakej` for Pakej)

**Dependencies:** 1.2

**Estimate:** S

**Out of scope:** API routes, admin UI, dynamic package content.

---

## Task 1.4: Set Up NextAuth.js for Admin Authentication

**Description:** Configure NextAuth.js with a Credentials provider for single-admin login. Only the admin panel routes need protection; all client-facing pages are public.

**Acceptance criteria:**
- [ ] NextAuth.js configured in `app/api/auth/[...nextauth]/route.ts`
- [ ] Credentials provider authenticates against the User table (email + password via bcrypt compare)
- [ ] Session strategy is JWT (no database sessions needed for single user)
- [ ] Session includes `user.id` and `user.nama`
- [ ] `NEXTAUTH_SECRET` and `NEXTAUTH_URL` documented in `.env.example`
- [ ] `lib/auth.ts` exports `authOptions` and a `getServerSession` helper
- [ ] Middleware in `middleware.ts` protects all `/admin/*` routes — redirects to `/admin/login` if unauthenticated
- [ ] `/admin/login` route is excluded from middleware protection
- [ ] Client-facing routes (`/`, `/temujanji`, `/kalendar`, `/pakej`) are never protected
- [ ] Invalid credentials return a generic "E-mel atau kata laluan tidak sah" error (no info leakage)
- [ ] Session expiry set to 24 hours

**Technical notes:**
- Use `next-auth@5` (Auth.js v5) if stable, otherwise `next-auth@4` with App Router adapter
- Middleware uses `matcher` config to target only `/admin/:path*` excluding `/admin/login`
- All auth error messages in Bahasa Malaysia
- No registration flow — single admin seeded in 1.3

**Dependencies:** 1.3

**Estimate:** M

**Out of scope:** Admin login page UI (covered in admin phase), password reset, multi-user roles, OAuth providers.

---

## Task 1.5: Configure Environment Variables and Validation

**Description:** Create a runtime environment validation module that fails fast at startup if required variables are missing.

**Acceptance criteria:**
- [ ] `lib/env.ts` exports a validated env object using Zod schema
- [ ] Required variables: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `ADMIN_EMAIL`
- [ ] Optional variables: `WHATSAPP_NUMBER` (defaults to empty string)
- [ ] Validation runs at import time — server crashes immediately with clear error if a required var is missing
- [ ] `.env.example` lists every variable with placeholder values and comments
- [ ] No secrets appear in `.env.example`
- [ ] Client-safe variables prefixed with `NEXT_PUBLIC_` where needed (e.g., `NEXT_PUBLIC_WHATSAPP_NUMBER`)

**Technical notes:**
- Use `zod` for schema validation — parse `process.env` at module level
- Separate server-only and client-safe env into distinct exports to prevent accidental leakage

**Dependencies:** 1.1

**Estimate:** XS

**Out of scope:** CI/CD environment configuration, deployment secrets management.

---

## Task 1.6: Set Up API Route Utilities and Error Handling

**Description:** Create shared utilities for API route handlers: consistent response envelope, error handling wrapper, input validation helper, and rate limiting setup.

**Acceptance criteria:**
- [ ] `lib/api/response.ts` exports `successResponse(data, status?)` and `errorResponse(message, status)` — both return `NextResponse` with consistent JSON shape `{ success, data, error }`
- [ ] `lib/api/handler.ts` exports a `withErrorHandling(handler)` wrapper that catches thrown errors, logs them server-side, and returns a sanitised `errorResponse`
- [ ] `lib/api/validate.ts` exports `validateBody(schema, body)` that parses with Zod and throws a structured 400 error on failure
- [ ] Prisma known errors mapped to user-friendly BM messages (P2002 -> "Rekod sudah wujud", P2025 -> "Rekod tidak dijumpai")
- [ ] Unknown errors return 500 with "Ralat dalaman pelayan" — no stack traces in response
- [ ] Rate limiting utility configured (in-memory for VPS, e.g., `lru-cache` based) — exportable per-route

**Technical notes:**
- Response envelope: `{ success: boolean, data: T | null, error: string | null }`
- Rate limiter: simple sliding window with `lru-cache`, configurable per endpoint
- All user-facing error messages in Bahasa Malaysia

**Dependencies:** 1.1, 1.2

**Estimate:** S

**Out of scope:** Specific endpoint implementations, admin-specific middleware.
