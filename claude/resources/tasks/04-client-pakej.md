# Phase 4.2 — Client Pakej Page (Static)

---

## Task 4.2: Build Pakej Page (`/pakej`) — Static Package Showcase

**Description:** Implement the static packages page displaying 3 package types (Night Wedding, Pakej Wedding, Event Package) with their tiers, sections, and pricing. Content is hardcoded — no database fetching.

**Acceptance criteria:**
- [ ] `app/(client)/pakej/page.tsx` renders the packages page
- [ ] Page title: SectionTitle "Pakej Kami" with decorative underline
- [ ] **Package 1 — Night Wedding:** card showing package name, 3 tier sub-cards (300 PAX / RM15,500, 500 PAX / RM18,500, 800 PAX / RM21,500), sections: Menu Kenduri, Menu Kampung, Termasuk, Percuma — each with bullet list of included items
- [ ] **Package 2 — Pakej Wedding:** card showing package name, 3 tier sub-cards (Seroja 500 PAX / RM20,500, Melur 800 PAX / RM23,500, Teratai 1000 PAX / RM25,500), sections: Menu Kenduri, Menu Kampung, Termasuk, Percuma
- [ ] **Package 3 — Event Package:** card showing package name, tiers by meal type (Breakfast RM10/pax, Lunch RM23/pax, Hi-Tea RM23/pax, Dinner RM23/pax), separate Hall Rental row (RM2,500 for 3hrs / RM4,000 for 5hrs)
- [ ] Each package card has a distinct visual identity
- [ ] Tier cards show: tier name, PAX count, price (formatted as RM X,XXX), bullet list of included items
- [ ] **States — hover:** package cards have subtle lift (`shadow-elevated`), tier cards have border colour change
- [ ] **States — focus:** focusable elements have visible ring
- [ ] **States — loading:** none (static page, SSG)
- [ ] **Responsive — mobile:** packages stack vertically, tiers stack within each package card, full-width cards
- [ ] **Responsive — tablet:** packages stack vertically, tiers in 2-column grid within each card
- [ ] **Responsive — desktop:** packages stack vertically (full-width cards), tiers in 3-column grid
- [ ] **Accessibility:** each package is a `<section>` with `aria-labelledby` pointing to its heading. Price values use `aria-label` for screen readers. Lists use `<ul>/<li>`. Heading hierarchy: `h1` page title, `h2` package names, `h3` tier names.
- [ ] **Data:** all content hardcoded in `lib/data/pakej.ts` constant. No API calls. Page is statically generated (SSG).
- [ ] **Performance:** page is fully static, zero client-side JS needed (pure RSC). Images use `next/image` with lazy loading.
- [ ] **Edge case:** long item lists wrap gracefully, no overflow. Malay text with special characters renders correctly.
- [ ] **Polish:** packages animate in with staggered fade-up on first load (100ms stagger). Cards have smooth hover transitions (150ms). Section dividers between packages.

**Technical notes:**
- Hardcoded data structure in `lib/data/pakej.ts`:
  ```ts
  type Pakej = { nama: string; warna: string; penerangan: string; tiers: PakejTier[]; sections: PakejSection[] }
  type PakejTier = { nama: string; bilanganPax: number; harga: number }
  type PakejSection = { tajuk: string; items: string[] }
  ```
- Event Package is structured differently (per-pax + hall rental) — may need a variant layout
- Price formatting: `new Intl.NumberFormat('ms-MY', { style: 'currency', currency: 'MYR' })`
- Pure React Server Component — no `'use client'` needed
- Page metadata: `<title>Pakej — MawarBiru</title>`

**Dependencies:** 3.3, 2.2, 2.3

**Estimate:** L

**Out of scope:** Admin-editable packages, dynamic data fetching, booking flow from packages, image gallery, comparison feature.
