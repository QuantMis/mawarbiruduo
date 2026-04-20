# Phase 3 — Client Layout & Navigation

---

## Task 3.1: Build Client Header and Navigation Bar

**Description:** Compose the client-facing header with logo, navigation links (Utama, Pakej, Temujanji, Kalendar), and mobile hamburger menu. The header is fixed/sticky at the top, navy background, and responsive.

**Acceptance criteria:**
- [ ] `components/client/header.tsx` renders a `<header>` with `role="banner"`
- [ ] Logo (text "MawarBiru") on the left — links to `/`. Serif font, cream colour.
- [ ] Desktop nav (>=1024px): horizontal link row — Utama `/`, Pakej `/pakej`, Temujanji `/temujanji`, Kalendar `/kalendar`. Uses NavLink component.
- [ ] Mobile/tablet (<1024px): hamburger button replaces nav links, triggers MobileMenu with same links
- [ ] Header is `sticky top-0 z-30` with navy background
- [ ] On scroll: header gains subtle `shadow-md` transition
- [ ] **States — default:** navy bg, cream text, no shadow
- [ ] **States — scrolled:** navy bg, cream text, shadow-md
- [ ] **States — mobile menu open:** hamburger animates to X, menu slides in
- [ ] **Responsive:** mobile (logo + hamburger), tablet (logo + hamburger), desktop (logo + full nav)
- [ ] **Accessibility:** `<nav aria-label="Navigasi utama">` wraps links. Skip-to-content link as first focusable element (`#main-content`). Focus visible on all interactive elements. Mobile menu has focus trap.
- [ ] **Performance:** scroll shadow uses `IntersectionObserver` on sentinel div — more performant than scroll listener
- [ ] **Reduced motion:** shadow transition instant if `prefers-reduced-motion`

**Technical notes:**
- Skip-to-content link: visually hidden, becomes visible on focus, jumps to `#main-content`
- Header height: ~64px mobile, ~72px desktop — account for in page content padding
- Use `next/image` for logo if image, otherwise styled text

**Dependencies:** 2.2, 2.3, 2.5

**Estimate:** M

**Out of scope:** Admin header, search functionality, user avatar.

---

## Task 3.2: Build Client Footer

**Description:** Compose the client-facing footer with venue info, quick links, and copyright. Navy background, cream text.

**Acceptance criteria:**
- [ ] `components/client/footer.tsx` renders a `<footer>` with `role="contentinfo"`
- [ ] Three-column layout on desktop, stacked on mobile:
  - Column 1: Logo/venue name + short tagline
  - Column 2: Quick links — Utama, Pakej, Temujanji, Kalendar
  - Column 3: Contact info — WhatsApp number (linked), address, operating hours
- [ ] Copyright bar at bottom: "© 2026 MawarBiru. Hak cipta terpelihara."
- [ ] **Responsive:** mobile (single column, centred text), tablet (2 columns), desktop (3 columns)
- [ ] Navy background with cream text, dusty-rose for link hover
- [ ] **Accessibility:** footer links in `<nav aria-label="Navigasi footer">` (distinct from header nav)
- [ ] WhatsApp link opens in new tab with `rel="noopener noreferrer"`
- [ ] Decorative top border: thin dusty-rose line

**Technical notes:**
- Footer content hardcoded — no CMS needed
- Use Grid component from 2.3 for column layout
- Ensure footer stays at page bottom on short-content pages (flex layout)

**Dependencies:** 2.2, 2.3, 2.5

**Estimate:** S

**Out of scope:** Newsletter signup, social media links, sitemap.

---

## Task 3.3: Assemble Client Root Layout and Page Shell

**Description:** Create the root layout for all client pages that composes Header, Footer, WhatsApp FAB, and main content area.

**Acceptance criteria:**
- [ ] `app/(client)/layout.tsx` renders: Header + `<main id="main-content">` + Footer + WhatsApp FAB
- [ ] `<main>` has top padding to account for sticky header height
- [ ] Metadata: default `<title>` "MawarBiru — Dewan Perkahwinan & Acara", `<meta name="description">` in BM
- [ ] Open Graph tags: title, description, default og:image placeholder
- [ ] HTML `lang="ms"` attribute set for Bahasa Malaysia
- [ ] Fonts loaded via `next/font` — serif (Playfair Display) and sans (Inter) — with `font-display: swap`
- [ ] **Responsive:** layout adapts, footer always at bottom (min-h-screen flex column, main flex-1)
- [ ] **Accessibility:** skip-to-content link targets `#main-content`. Landmark roles: banner, main, contentinfo.
- [ ] **Performance:** fonts preloaded, critical CSS inlined by Next.js, no layout shift from font loading
- [ ] **Edge case:** very short page content still pushes footer to bottom

**Technical notes:**
- Use Next.js App Router layout convention — `layout.tsx` wraps all routes in `(client)` group
- Route group `(client)` keeps client pages separate from `(admin)` without affecting URL
- Sticky footer pattern: `<body className="flex flex-col min-h-screen">` + `<main className="flex-1">`

**Dependencies:** 3.1, 3.2, 2.5

**Estimate:** S

**Out of scope:** Admin layout, SEO beyond basic meta, analytics integration.
