# Phase 4.4 — Client Kalendar (Venue Availability Calendar)

---

## Task 4.4: Build Kalendar Page (`/kalendar`) — Venue Availability Calendar

**Description:** Implement the public calendar page showing a monthly view of venue bookings. Events are colour-coded by package (admin-configurable colours). Read-only — visitors can only view.

**Acceptance criteria:**
- [ ] `app/(client)/kalendar/page.tsx` renders the calendar page
- [ ] Page title: SectionTitle "Kalendar Tempahan" with decorative underline
- [ ] **Calendar grid:** monthly view, 7-column grid (Ahd/Isn/Sel/Rab/Kha/Jum/Sab — BM day abbreviations). Shows current month by default.
- [ ] **Month navigation:** left/right arrows for prev/next month. Month/year centred: "April 2026" in BM. Buttons: `aria-label="Bulan sebelumnya"` / `aria-label="Bulan seterusnya"`.
- [ ] **Today indicator:** current date cell has dusty-rose circle/ring around the date number
- [ ] **Booked dates:** dates with Tempahan show coloured dot/pill matching Pakej's `warna`. Multiple bookings on same date: stack dots or show "2 acara" indicator.
- [ ] **Colour legend:** below calendar, row of coloured dots with Pakej names. Dynamic — pulled from database.
- [ ] **Date cell click/tap:** opens detail popover showing event name (`namaTempahan`), package name, colour badge. Read-only.
- [ ] **States — date cell default:** cream bg, dark text
- [ ] **States — date cell hover:** slight bg darken, pointer cursor if has events
- [ ] **States — date cell today:** dusty-rose ring, bolder text
- [ ] **States — date cell other-month:** lighter opacity (40%)
- [ ] **States — date cell booked:** coloured dot matching pakej warna below date number
- [ ] **States — popover open:** small card near clicked date, closes on outside click / Escape
- [ ] **States — loading:** skeleton calendar grid (7x5 rects) + skeleton legend
- [ ] **States — error:** Alert "Gagal memuatkan kalendar. Sila cuba lagi." + retry button
- [ ] **States — empty month:** normal grid, no dots, subtle "Tiada tempahan pada bulan ini" message
- [ ] **Responsive — mobile:** compact cells (date number + small dot), single-letter day headers (A/I/S/R/K/J/S). Date detail opens as bottom sheet. Touch-friendly: cells min 44x44px.
- [ ] **Responsive — tablet:** full day abbreviations, medium cells, popover below cell
- [ ] **Responsive — desktop:** spacious cells, popover follows click position, legend in single row
- [ ] **Accessibility:** `role="grid"` with `aria-label="Kalendar tempahan bulan [bulan] [tahun]"`. Cells are `role="gridcell"` with `aria-label="[tarikh penuh], [jumlah] acara"`. Arrow keys navigate cells, Enter/Space opens detail. Colour never sole indicator — aria-label communicates events.
- [ ] **Data — fetching:** `GET /api/kalendar?bulan=4&tahun=2026` with SWR, keyed by month/year. Caches previous months.
- [ ] **Edge cases:** February 28/29. Month nav limited to +/- 12 months. Multiple events on one date. Long event names truncated with ellipsis.
- [ ] **Performance:** only fetch visible month. `useMemo` for day calculation and event mapping. Popover state isolated from grid re-renders. Pakej colour data cached.
- [ ] **Polish:** month transition cross-fade (100ms). Dot scale-in animation (150ms). Popover fade + shift (100ms). Booked cells subtle glow on hover. All respect `prefers-reduced-motion`.

**Technical notes:**
- Calendar grid generation: `lib/utils/calendar.ts` — `getCalendarDays(month, year)` returns `{ date, isCurrentMonth, isToday }[]`
- BM month names: `['Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun', 'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember']`
- BM day abbreviations: `['Ahd', 'Isn', 'Sel', 'Rab', 'Kha', 'Jum', 'Sab']` (Sunday first)
- Popover: use `@floating-ui/react` for smart positioning, or simple absolute-positioned div
- Keyboard grid navigation: roving tabindex pattern
- Mobile bottom sheet: simplified Modal variant, slides up, max 40% viewport

**Dependencies:** 3.3, 2.2, 2.3, 2.4, 1.6

**Estimate:** XL

**Out of scope:** Booking from calendar, event creation (admin), week/day views, iCal export, Google Calendar sync.

---

## Task 4.6: Build Kalendar API Route

**Description:** Implement the backend API route that powers the Kalendar page: fetching bookings for a given month with their associated package colours.

**Acceptance criteria:**
- [ ] `app/api/kalendar/route.ts` — GET handler
  - Accepts query params: `bulan` (1-12), `tahun` (4-digit year)
  - Validates params with Zod — returns 400 if invalid
  - Returns all Tempahan for the month, including overflow days for calendar grid padding
  - Each Tempahan includes: `tarikh` (from SlotTempahan), `namaTempahan`, `pakej.namaPakej`, `pakej.warna`
  - Also returns distinct Pakej list (id, namaPakej, warna) for legend
  - Response: `{ success: true, data: { tempahan: [...], pakej: [...] } }`
  - Returns 200 with empty arrays if no bookings
  - No authentication required
  - Rate limited: 30 requests per minute per IP
  - Year range limited to current +/- 2 years
- [ ] Query joins SlotTempahan and Pakej on Tempahan
- [ ] Uses `withErrorHandling` wrapper from 1.6
- [ ] All error messages in Bahasa Malaysia

**Technical notes:**
- Calculate visible date range: first day of month's week start (Sunday) to last day of month's week end (Saturday). Query SlotTempahan.tarikh between these bounds.
- Prisma query: join Tempahan -> SlotTempahan + Pakej, select relevant fields
- Pakej list for legend: `prisma.pakej.findMany({ select: { id, namaPakej, warna } })`
- Caching: `Cache-Control: public, max-age=60` since bookings don't change frequently

**Dependencies:** 1.2, 1.3, 1.6

**Estimate:** S

**Out of scope:** Booking creation, admin calendar, recurring events, export.
