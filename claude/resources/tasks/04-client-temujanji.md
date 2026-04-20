# Phase 4.3 — Client Temujanji (Consultation Booking)

---

## Task 4.3: Build Temujanji Page (`/temujanji`) — Consultation Booking UI

**Description:** Implement the consultation appointment page where visitors can view available 2-hour slots and book one by providing their name, phone number, and optional note. This is the primary conversion page.

**Acceptance criteria:**
- [ ] `app/(client)/temujanji/page.tsx` renders the booking page
- [ ] Page title: SectionTitle "Buat Temujanji" with decorative underline
- [ ] **Slot display:** shows available slots grouped by date. Each date group: date heading (formatted in BM, e.g., "Sabtu, 25 April 2026"), list of time range buttons ("10:00 - 12:00", "14:00 - 16:00", etc.)
- [ ] Only future dates with TERSEDIA slots shown, ordered chronologically (nearest first)
- [ ] Maximum 14 days of upcoming slots displayed
- [ ] **Slot selection:** visitor clicks/taps a time slot to select it (single selection)
- [ ] **States — slot default:** cream bg, navy text, dusty-rose left border
- [ ] **States — slot hover:** slight lift, border darkens to terracotta
- [ ] **States — slot focus:** visible focus ring (dusty-rose)
- [ ] **States — slot active (pressed):** terracotta bg briefly, scale 0.98
- [ ] **States — slot selected:** navy bg, cream text, checkmark icon, `aria-pressed="true"`
- [ ] **Booking form:** appears below selected slot
- [ ] Form fields: `Nama` (required, text, min 2 chars, max 100), `No. Telefon` (required, tel, Malaysian format: 01X-XXXXXXX or 01X-XXXXXXXX), `Nota` (optional, textarea, max 500 chars)
- [ ] **States — form default:** submit disabled until Nama + No. Telefon filled and slot selected
- [ ] **States — form field error:** red border, error message below. Validates on blur + on submit. BM messages: "Sila masukkan nama anda", "Sila masukkan nombor telefon yang sah", etc.
- [ ] **States — form submitting:** submit button shows spinner + "Menghantar...", all fields disabled, `aria-busy="true"`
- [ ] **States — form success:** toast "Temujanji anda telah berjaya ditempah!", form resets, slot removed from available list. Inline success Alert with booking summary.
- [ ] **States — form error (server):** toast with error message. Form remains filled. Common: "Slot ini telah ditempah oleh orang lain" (409 race condition), "Ralat dalaman pelayan" (500).
- [ ] **States — empty (no slots):** EmptyState — "Tiada slot temujanji yang tersedia buat masa ini. Sila hubungi kami melalui WhatsApp." + WhatsApp link button.
- [ ] **Responsive — mobile:** full-width stacked, generous touch targets (min 44px)
- [ ] **Responsive — tablet:** slot buttons in 2-column grid, form full-width
- [ ] **Responsive — desktop:** slot buttons in 3-column grid per date, form in constrained-width card (~500px)
- [ ] **Accessibility:** slot buttons are `<button>` with `aria-label="Slot temujanji pada [tarikh] dari [masa mula] hingga [masa tamat]"`. Form fields have `<label>`. Errors linked via `aria-describedby`. Form has `aria-label="Borang tempahan temujanji"`. Success/error use `aria-live="polite"`.
- [ ] **Data — fetching:** `GET /api/temujanji/slots` with SWR. Skeleton loaders while loading.
- [ ] **Data — submission:** `POST /api/temujanji` with `{ nama, noTelefon, nota, slotTemujanjiId }`
- [ ] **Data — error:** if fetch fails, Alert "Gagal memuatkan slot temujanji. Sila cuba lagi." + retry button
- [ ] **Edge cases:** slot taken between load and submit (409 handling — refresh slot list). Double-submit prevented. Phone with/without dashes normalised.
- [ ] **Performance:** `useMemo` on grouping/sorting. `react-hook-form` for form state. Slots data `Cache-Control: no-cache`.
- [ ] **Polish:** slot selection animates (150ms). Form section slides down when slot selected (200ms). Loading skeletons pulse.

**Technical notes:**
- Phone validation regex: `/^01[0-9]-?\d{7,8}$/`
- Date formatting: `new Intl.DateTimeFormat('ms-MY', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })`
- Use `react-hook-form` + `@hookform/resolvers/zod` for form management
- SWR with `revalidateOnFocus: true` for fresh data on tab return

**Dependencies:** 3.3, 2.2, 2.3, 2.4, 1.6

**Estimate:** XL

**Out of scope:** Slot management (admin), email/SMS confirmation, appointment cancellation, recurring appointments, payment.

---

## Task 4.5: Build Temujanji API Routes

**Description:** Implement the backend API routes that power the Temujanji page: fetching available slots and creating a new appointment booking.

**Acceptance criteria:**
- [ ] `app/api/temujanji/slots/route.ts` — GET handler
  - Returns SlotTemujanji where `status = 'TERSEDIA'` and `tarikh >= today`
  - Grouped by `tarikh`, ordered by `tarikh` ASC then `masaMula` ASC
  - Limited to 14 days from today
  - Response envelope: `{ success: true, data: [...] }`
  - No authentication required (public endpoint)
  - Rate limited: 30 requests per minute per IP
- [ ] `app/api/temujanji/route.ts` — POST handler
  - Validates body with Zod: `{ nama: string (2-100), noTelefon: string (valid MY mobile), nota?: string (max 500), slotTemujanjiId: string }`
  - Returns 400 with field-level errors on validation failure
  - Finds or creates Pelanggan by `noTelefon` (upserts — updates `nama`/`nota` if existing)
  - Creates Temujanji record linked to Pelanggan and SlotTemujanji
  - Updates SlotTemujanji `status` from TERSEDIA to DITEMPAH
  - All in a single Prisma `$transaction` with `Serializable` isolation
  - Returns 409 if slot already DITEMPAH (race condition)
  - Returns 201 on success with booking summary
  - No authentication required
  - Rate limited: 5 requests per minute per IP
- [ ] Phone number normalisation: strips dashes before storage
- [ ] All error messages in Bahasa Malaysia
- [ ] Uses `withErrorHandling` and response helpers from 1.6

**Technical notes:**
- Serializable transaction prevents double-booking race condition
- Phone upsert: `prisma.pelanggan.upsert({ where: { noTelefon }, create: {...}, update: { nama, nota } })`
- Zod schema exported from `lib/validations/temujanji.ts` for reuse in admin
- Date comparison: compare date-only, ignoring time component

**Dependencies:** 1.2, 1.3, 1.6

**Estimate:** M

**Out of scope:** Slot creation (admin), appointment cancellation, notifications.
