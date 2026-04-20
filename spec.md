# MawarBiru — Spec

## TL;DR

MawarBiru is a wedding and event venue website for a small business owner. Public visitors (primarily from TikTok) can browse the venue's offerings, book consultation appointments (temujanji), and check venue availability via an event calendar. The business owner manages everything — slots, bookings, packages, and customers — through a protected admin panel. Built as a Next.js monolith with MySQL, styled in a luxury aesthetic with a navy-and-cream palette.

---

## 1. Problem & Users

**Problem:** The business owner promotes his venue on TikTok but has no website for interested visitors to learn more, check availability, or book consultations. All coordination happens manually via WhatsApp.

**Users:**

| User | Description |
|------|-------------|
| **Pelawat (Visitor)** | Arrives from TikTok. Browses packages, checks venue availability, books a consultation. No account required. |
| **Admin (Business Owner)** | Single user. Manages all content, slots, bookings, and customer data via admin panel. |

**One-sentence pitch:** A luxury venue showcase site with consultation booking and an admin CMS for the business owner.

---

## 2. Core User Journeys

### Journey 1: Visitor Books a Consultation (Temujanji)

1. Visitor sees TikTok video with link to `mawarbiru.my/temujanji`
2. Visitor lands on `/temujanji` page
3. Visitor sees available consultation slots (created by admin)
4. Visitor selects a slot
5. Visitor fills in: **Nama**, **No. Telefon**, **Nota**
6. Visitor submits — booking confirmed
7. A **Pelanggan** record is automatically created from the form data

### Journey 2: Visitor Checks Venue Availability

1. Visitor navigates to `/kalendar`
2. Visitor sees a monthly calendar view showing all booked events (colour-coded by category)
3. Visitor can navigate between months
4. **Read-only** — no actions available, just viewing

### Journey 3: Admin Creates a Tempahan (Booking)

1. Admin logs in to admin panel
2. Navigates to **Pengurusan Tempahan**
3. Views calendar of available slots (Slot Tempahan)
4. Clicks on an available date — redirected to tempahan creation form
5. Fills in: **Nama Tempahan**, selects **Pakej**, selects **Pelanggan**
6. Submits — tempahan created, slot marked as booked
7. Event appears on public `/kalendar`

---

## 3. Scope — MVP vs Later

### In (MVP)

- Single admin login (email + password)
- Admin modules: Slot Tempahan, Slot Temujanji, Tempahan, Temujanji, Pakej, Pelanggan
- Public pages: Homepage (`/`), Temujanji (`/temujanji`), Kalendar (`/kalendar`), Pakej (`/pakej` — static)
- Floating WhatsApp button on all public pages
- Mobile-first responsive design for customer-facing pages
- Luxury design with brand colour palette
- Bahasa Malaysia only

### Out (Later)

- Customer accounts / login
- Online payment
- Email / SMS notifications
- Analytics integration
- Multi-user admin / staff roles
- English language toggle
- List view for kalendar
- Dynamic pakej page (pulled from admin data)

---

## 4. Functional Requirements

### 4.1 Public Pages

#### Homepage (`/`)

- Hero section with venue branding ("MawarBiru" text logo)
- Introduction to the business
- CTA buttons to `/temujanji` and `/kalendar`
- Floating WhatsApp button

#### Temujanji (`/temujanji`)

- Displays available consultation slots (from admin-managed Slot Temujanji)
- Visitor selects a slot and fills in:
  - Nama (required)
  - No. Telefon (required)
  - Nota (optional)
- On submit: creates Temujanji record + auto-creates Pelanggan record
- Booked slots no longer appear as available

#### Kalendar (`/kalendar`)

- Monthly calendar view
- Shows all Tempahan entries with:
  - Event name
  - Category (colour-coded: kahwin, aqiqah, open house, etc.)
  - Date
- Month navigation (previous/next)
- Read-only — no user interaction beyond navigation

#### Pakej (`/pakej`)

- Static page — content is hardcoded, not pulled from admin
- Showcases wedding and event packages
- Designed to match the luxury aesthetic

### 4.2 Admin Modules

All admin routes are protected behind authentication.

#### Pengurusan Slot Temujanji

- CRUD for consultation time slots
- Fields: Tarikh, Masa, Status (Tersedia / Ditempah)
- Admin can create, edit, delete slots

#### Pengurusan Temujanji

- View all consultation bookings
- Each record shows: Pelanggan info, Slot details, Nota
- Admin can update status or delete

#### Pengurusan Slot Tempahan

- CRUD for venue booking date slots
- Fields: Tarikh, Status (Tersedia / Ditempah)
- Calendar view for managing slots

#### Pengurusan Tempahan

- Create booking from calendar: click available slot → redirected to creation form
- Creation form fields:
  - Nama Tempahan (required)
  - Pakej (select from existing packages)
  - Pelanggan (select from existing customers)
  - Kategori: Kahwin, Aqiqah, Open House, etc.
- View, edit, delete existing bookings
- Booked events appear on public `/kalendar`

#### Pengurusan Pakej

- CRUD for packages
- Fields:
  - Nama Pakej (required)
  - Kategori (Perkahwinan, Acara, etc.)
  - Gambar (image upload)
  - Tiers — dynamic list of: Bilangan Pax + Harga
  - Sections — dynamic list of: Tajuk Section + bullet list of items
- Pakej data is used when creating Tempahan (admin-only, not public-facing)

#### Pengurusan Pelanggan

- View all customers
- Created automatically when visitor books temujanji, or manually by admin
- Fields: Nama, No. Telefon, Nota
- Edit and delete

---

## 5. Data Model

### Entities

| Entity | Fields | Notes |
|--------|--------|-------|
| **User** | id, email, password, createdAt, updatedAt | Single admin user |
| **Pelanggan** | id, nama, noTelefon, nota, createdAt, updatedAt | Auto-created from temujanji or manually |
| **SlotTemujanji** | id, tarikh, masa, status, createdAt, updatedAt | Status: TERSEDIA, DITEMPAH |
| **Temujanji** | id, pelangganId, slotTemujanjiId, nota, createdAt, updatedAt | Links to Pelanggan and SlotTemujanji |
| **SlotTempahan** | id, tarikh, status, createdAt, updatedAt | Status: TERSEDIA, DITEMPAH |
| **Tempahan** | id, namaTempahan, slotTempahanId, pakejId, pelangganId, kategori, createdAt, updatedAt | Kategori: KAHWIN, AQIQAH, OPEN_HOUSE, etc. |
| **Pakej** | id, namaPakej, kategori, gambar, createdAt, updatedAt | Parent entity for tiers and sections |
| **PakejTier** | id, pakejId, bilanganPax, harga | e.g., 300 PAX → RM15,500 |
| **PakejSection** | id, pakejId, tajuk, items (JSON or related table) | e.g., "Menu Kenduri" → list of food items |

### Relationships

```
User (standalone — single admin)

Pelanggan 1 ← N Temujanji
SlotTemujanji 1 ← 1 Temujanji

Pelanggan 1 ← N Tempahan
SlotTempahan 1 ← 1 Tempahan
Pakej 1 ← N Tempahan

Pakej 1 ← N PakejTier
Pakej 1 ← N PakejSection
```

### Data Privacy

- No sensitive data requiring encryption beyond admin password (hashed)
- Customer data (nama, phone) is basic contact info
- No payment data stored

---

## 6. Auth & Permissions

| Aspect | Decision |
|--------|----------|
| Auth method | Email + password |
| Users | Single admin account |
| Customer login | None — visitors are anonymous |
| Session | Server-side session or JWT |
| Roles | No role system — single admin only |
| Multi-tenant | No |

---

## 7. Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | **Next.js** (monolith) | Full-stack, SSR for public pages, API routes for admin |
| Language | **TypeScript** | Type safety |
| Database | **MySQL** | Familiar, reliable |
| ORM | **Prisma** | Best DX with Next.js, type-safe queries |
| Styling | **Tailwind CSS** | Rapid UI development, mobile-first utilities |
| Hosting | **VPS** | Full control, cost-effective |
| Auth | **NextAuth.js** (or similar) | Simple credentials provider for single admin |

---

## 8. Integrations

| Integration | Status |
|-------------|--------|
| WhatsApp | Floating button linking to `wa.me/<number>` |
| Payment gateway | Not in MVP |
| Email / SMS | Not in MVP |
| Analytics | Not in MVP |

---

## 9. Non-Functional Requirements

| Aspect | Requirement |
|--------|-------------|
| Responsive | Mobile-first for all customer-facing pages |
| Language | Bahasa Malaysia only |
| Browser support | Modern browsers (Chrome, Safari, Firefox, Edge) |
| Performance | Fast initial load — critical for TikTok traffic with short attention spans |
| Accessibility | Basic — semantic HTML, readable contrast |
| SEO | Basic meta tags, SSR for public pages |

---

## 10. Design

### Branding

- **Logo:** Text-based "MawarBiru" (no graphic logo yet)
- **Style:** Luxury / mewah

### Colour Palette

| Role | Hex | Description | Usage |
|------|-----|-------------|-------|
| Primary | `#07203F` | Deep navy | Headers, nav, buttons, key UI elements |
| Secondary | `#EBDED4` | Warm cream | Page backgrounds, cards |
| Accent 1 | `#D9AA90` | Dusty rose / peach | CTAs, highlights, hover states |
| Accent 2 | `#A65E46` | Terracotta | Active states, badges, small accents |
| Dark | `#02000D` | Near-black | Body text, footer |

### Design Decisions

- Navy + cream base for luxury feel with high contrast
- Dusty rose for CTAs — draws attention without being loud
- Terracotta used sparingly for warmth
- Near-black for text instead of pure black — softer on eyes

---

## 11. Constraints

| Constraint | Detail |
|------------|--------|
| Budget | Minimal — self-hosted VPS |
| Team | Solo developer (Claude-assisted) |
| Timeline | Not specified |
| Domain | `mawarbiru.my` (TBC if secured) |

---

## 12. Open Questions

1. **Domain** — Is `mawarbiru.my` already registered?
2. **VPS** — Is there an existing VPS, or does one need to be provisioned?
3. **WhatsApp number** — Which phone number(s) for the floating button?
4. **Content** — Are photos and text ready for the static homepage and pakej page?
5. **Tempahan categories** — Is the list (Kahwin, Aqiqah, Open House) final, or should admin be able to add custom categories?
6. **Slot Temujanji structure** — Is it one slot per time (e.g., 10:00 AM on 1 May), or a range (e.g., 10:00 AM - 11:00 AM)?
7. **Calendar colour-coding** — Should each tempahan kategori have a fixed colour, or admin-configurable?
