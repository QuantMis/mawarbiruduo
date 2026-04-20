# Phase 6: Admin Surface

All admin modules use STANDARD rigor. Functionality over finesse. Desktop-first, conventional CRUD patterns. One task per resource unless complexity warrants splitting.

---

## 6.1 Admin Layout Shell and Authentication

**Description:** Build the admin layout wrapper: sidebar navigation, top bar with logout, and the NextAuth.js credentials login page. This is the frame for all admin modules.

**Acceptance criteria:**
- [ ] `/admin/login` page with email + password form
- [ ] NextAuth.js credentials provider authenticates against single admin User record
- [ ] Password stored as bcrypt hash in DB
- [ ] Successful login redirects to `/admin` dashboard
- [ ] Failed login shows inline error: "E-mel atau kata laluan salah"
- [ ] Admin layout has collapsible sidebar with navigation links to all modules
- [ ] Sidebar nav items: Dashboard, Slot Temujanji, Temujanji, Slot Tempahan, Tempahan, Pakej, Pelanggan
- [ ] Top bar shows admin name/email and logout button
- [ ] Logout clears session and redirects to `/admin/login`
- [ ] Sidebar collapses to icons on narrow viewports (tablet)

**Technical notes:**
- Use NextAuth.js `CredentialsProvider` with Prisma adapter for session persistence
- Admin layout in `app/admin/layout.tsx` — wraps all admin routes
- Login page at `app/admin/login/page.tsx` — excluded from admin layout (own layout)
- Seed script creates initial admin user with hashed password
- Sidebar: simple `<nav>` with links, active state highlighting

**Dependencies:** 1.x (Foundation — NextAuth, Prisma, DB schema)
**Estimate:** M

---

## 6.2 Admin Dashboard

**Description:** Simple overview page at `/admin` showing key counts and recent activity. Not a complex analytics dashboard — just quick-glance numbers.

**Acceptance criteria:**
- [ ] Shows count cards: Temujanji hari ini, Tempahan bulan ini, Jumlah Pelanggan, Jumlah Pakej
- [ ] Shows 5 most recent temujanji bookings (nama, tarikh, status)
- [ ] Shows 5 most recent tempahan (nama, tarikh, pakej)
- [ ] Each card links to its respective management page
- [ ] Data fetched server-side (SSR or server component)

**Technical notes:**
- Use server components for data fetching
- Simple Prisma aggregate queries (`count`, `findMany` with `take: 5`)
- Basic card grid layout — no charts or complex visualization needed

**Dependencies:** 6.1
**Estimate:** S

---

## 6.3 Pengurusan Slot Temujanji (Consultation Slot Management)

**Description:** Full CRUD for managing 2-hour consultation time slots. Admin creates available slots; visitors see and book them on the public temujanji page.

**Acceptance criteria:**
- [ ] List view: table with columns Tarikh, Masa Mula, Masa Tamat, Status, Tindakan
- [ ] Table is searchable by date and filterable by status (Tersedia/Ditempah)
- [ ] Pagination on the list (default 20 per page)
- [ ] Create form: Tarikh (date picker), Masa Mula (time picker), Masa Tamat (auto-calculated as Mula + 2 hours, editable)
- [ ] Validation: Masa Tamat must be after Masa Mula, no overlapping slots on same date
- [ ] Edit existing slot (only if status is Tersedia)
- [ ] Delete slot (only if status is Tersedia; ditempah slots show warning before delete)
- [ ] Bulk create: option to generate multiple slots for a date (e.g., 10:00-12:00, 14:00-16:00, 16:00-18:00)
- [ ] Status shown as badge: Tersedia (green), Ditempah (amber)

**Technical notes:**
- Use shared DataTable component with server-side pagination
- API routes: `GET/POST /api/admin/slot-temujanji`, `PUT/DELETE /api/admin/slot-temujanji/[id]`
- Masa Tamat auto-fills when Masa Mula changes (convenience, not enforced)
- Overlap check in API: query existing slots for same tarikh, check time range intersection

**Dependencies:** 6.1, 1.x (Prisma schema — SlotTemujanji)
**Estimate:** M

---

## 6.4 Pengurusan Temujanji (Consultation Booking Management)

**Description:** View and manage all consultation bookings made by visitors. Admin can see pelanggan details, slot info, and notes. Admin can update status or delete bookings.

**Acceptance criteria:**
- [ ] List view: table with columns Pelanggan (Nama + No. Telefon), Tarikh, Masa, Nota (truncated), Status, Tindakan
- [ ] Table searchable by pelanggan name or phone number
- [ ] Filterable by date range and status
- [ ] Pagination (default 20 per page)
- [ ] Click row to see full detail view (pelanggan info, slot details, full nota)
- [ ] Admin can delete a temujanji (slot reverts to Tersedia)
- [ ] Admin can manually change slot status if needed
- [ ] No create action from this page — temujanji are created by visitors via public page

**Technical notes:**
- API routes: `GET /api/admin/temujanji`, `DELETE /api/admin/temujanji/[id]`
- Include Pelanggan and SlotTemujanji relations in query
- Deleting temujanji should update the linked SlotTemujanji status back to TERSEDIA (transaction)

**Dependencies:** 6.1, 6.3
**Estimate:** S

---

## 6.5 Pengurusan Slot Tempahan (Venue Booking Slot Management)

**Description:** CRUD for venue booking date slots. Each slot represents a single date the venue is available for booking. Includes a calendar view for visual management.

**Acceptance criteria:**
- [ ] Calendar view showing all dates with slots (colour-coded: Tersedia green, Ditempah amber/red)
- [ ] Click on empty date to create new slot for that date
- [ ] Click on existing slot to edit or delete
- [ ] Table/list view toggle as alternative to calendar
- [ ] Create form: Tarikh (date picker), Status defaults to Tersedia
- [ ] Bulk create: select date range to create multiple slots at once
- [ ] Delete only Tersedia slots; Ditempah slots require confirmation and cascade warning
- [ ] Month navigation on calendar view

**Technical notes:**
- Reuse calendar grid component (shared with public Kalendar, but interactive version)
- API routes: `GET/POST /api/admin/slot-tempahan`, `PUT/DELETE /api/admin/slot-tempahan/[id]`
- Calendar rendering: server-fetch all slots for displayed month, render client-side grid
- Bulk create endpoint accepts `{ startDate, endDate }` and creates one slot per day

**Dependencies:** 6.1, 1.x (Prisma schema — SlotTempahan)
**Estimate:** M

---

## 6.6 Pengurusan Tempahan (Venue Booking Management)

**Description:** Manage venue bookings. Admin creates bookings by clicking available slot dates, then fills in booking details. Booked events appear on the public `/kalendar`.

**Acceptance criteria:**
- [ ] Calendar view of Slot Tempahan; clicking a Tersedia slot opens booking creation form
- [ ] Creation form fields: Nama Tempahan (text), Pakej (select dropdown from existing Pakej), Pelanggan (searchable select from existing Pelanggan)
- [ ] No kategori field — Pakej acts as the category
- [ ] On submit: Tempahan created, SlotTempahan status set to DITEMPAH (transaction)
- [ ] List view: table with columns Nama Tempahan, Tarikh, Pakej, Pelanggan, Tindakan
- [ ] Table searchable by nama tempahan or pelanggan name
- [ ] Filterable by pakej and date range
- [ ] Edit booking: can change nama tempahan, pakej, pelanggan (but not slot date)
- [ ] Delete booking: slot reverts to Tersedia (transaction)
- [ ] Pagination on list view
- [ ] Calendar events colour-coded by Pakej.warna (matches public kalendar)

**Technical notes:**
- API routes: `GET/POST /api/admin/tempahan`, `PUT/DELETE /api/admin/tempahan/[id]`
- Creation flow: calendar click -> captures slotTempahanId -> passes to form
- Pakej select: fetch all pakej with `id, namaPakej` for dropdown
- Pelanggan select: searchable/autocomplete dropdown, fetch with debounced search
- Transactions: creating/deleting tempahan must atomically update SlotTempahan status

**Dependencies:** 6.1, 6.5, 6.7, 6.9 (needs Pakej and Pelanggan to exist)
**Estimate:** L

---

## 6.7 Pengurusan Pakej (Package Management)

**Description:** Full CRUD for packages including dynamic tiers (pax + price combos), dynamic sections (title + bullet items), colour picker for calendar coding, and image upload.

**Acceptance criteria:**
- [ ] List view: table with columns Nama Pakej, Warna (colour swatch), Bilangan Tier, Gambar (thumbnail), Tindakan
- [ ] Create/Edit form fields:
  - Nama Pakej (text, required)
  - Warna (colour picker input, hex value, required) — used for calendar colour-coding
  - Gambar (image upload, single file, optional)
- [ ] Tiers section: dynamic list, each row has Bilangan Pax (number) + Harga (number, RM formatted)
  - Add tier button, remove tier button per row
  - Minimum 1 tier required
- [ ] Sections section: dynamic list, each row has Tajuk (text) + Items (multi-line or tag input for bullet items)
  - Add section button, remove section button per row
  - Items stored as JSON array of strings
- [ ] Image upload: accept JPG/PNG, max 5MB, stored locally on VPS filesystem (or `/public/uploads/`)
- [ ] Delete pakej: only if no Tempahan references it (show warning if referenced)
- [ ] Colour picker shows preview swatch next to the input

**Technical notes:**
- API routes: `GET/POST /api/admin/pakej`, `PUT/DELETE /api/admin/pakej/[id]`
- Image upload: use Next.js API route with `formidable` or `multer`, save to `public/uploads/pakej/`
- Dynamic tiers/sections: managed as nested arrays in form state, sent as JSON
- On save: upsert PakejTier and PakejSection records (delete removed, create new, update existing)
- Colour picker: HTML5 `<input type="color">` is sufficient, or a small library for better UX
- PakejSection items field: store as JSON array in the database column

**Dependencies:** 6.1, 1.x (Prisma schema — Pakej, PakejTier, PakejSection)
**Estimate:** L

---

## 6.8 Pengurusan Pakej — Image Upload Utility

**Description:** Shared image upload utility for the Pakej module. Handles file validation, storage, and serving. Kept as a separate concern for reusability.

**Acceptance criteria:**
- [ ] Upload endpoint accepts multipart form data
- [ ] Validates file type (JPG, PNG only) and size (max 5MB)
- [ ] Generates unique filename (UUID + original extension)
- [ ] Saves to `public/uploads/pakej/` directory
- [ ] Returns the public URL path for the saved image
- [ ] Old image is deleted when a new one is uploaded (update case)
- [ ] Handles missing/corrupt file gracefully with error message

**Technical notes:**
- API route: `POST /api/admin/upload`
- Use `fs.writeFile` for saving (VPS filesystem, not cloud storage)
- Ensure `public/uploads/` is in `.gitignore`
- Return path like `/uploads/pakej/<uuid>.jpg` (Next.js serves from `public/`)

**Dependencies:** 6.1
**Estimate:** S

---

## 6.9 Pengurusan Pelanggan (Customer Management)

**Description:** View and manage customer records. Customers are auto-created when visitors book temujanji, or manually created by admin.

**Acceptance criteria:**
- [ ] List view: table with columns Nama, No. Telefon, Nota (truncated), Jumlah Temujanji, Jumlah Tempahan, Tindakan
- [ ] Table searchable by nama or phone number
- [ ] Pagination (default 20 per page)
- [ ] Create form: Nama (required), No. Telefon (required, Malaysian format), Nota (optional)
- [ ] Edit existing pelanggan
- [ ] Delete pelanggan: only if no linked Temujanji or Tempahan (show warning with counts if referenced)
- [ ] Click row to view detail: full info + list of linked temujanji and tempahan

**Technical notes:**
- API routes: `GET/POST /api/admin/pelanggan`, `PUT/DELETE /api/admin/pelanggan/[id]`
- Include relation counts in list query: `_count: { temujanji: true, tempahan: true }`
- Phone validation: reuse the same Zod schema pattern from 5.6
- Deduplication: on create, check if phone number already exists and warn (don't block)

**Dependencies:** 6.1, 1.x (Prisma schema — Pelanggan)
**Estimate:** M
