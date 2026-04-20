# Phase 7: Quality & Polish (Client-focused)

Client pages get thorough quality passes. Admin gets a single consolidated QA task.

---

## 7.1 Client Accessibility Audit

**Description:** Systematic accessibility review of all four public pages (`/`, `/temujanji`, `/kalendar`, `/pakej`). Verify WCAG 2.1 AA compliance for the primary user flows: browsing, booking temujanji, viewing calendar.

**Acceptance criteria:**
- [ ] All pages pass axe-core automated scan with zero critical/serious violations
- [ ] Colour contrast meets 4.5:1 minimum for body text, 3:1 for large text — verified against the MawarBiru palette (#02000D on #EBDED4, #07203F on #EBDED4, etc.)
- [ ] All interactive elements are keyboard navigable in logical tab order
- [ ] Focus indicators are visible and styled (not browser default blue, use brand-appropriate ring)
- [ ] Temujanji form: complete booking flow works via keyboard only
- [ ] Kalendar: month navigation works via keyboard, events are screen-reader-accessible
- [ ] All images have meaningful `alt` text (pakej images) or are marked decorative (`alt=""`)
- [ ] Page headings follow a logical hierarchy (h1 -> h2 -> h3, no skips)
- [ ] `lang="ms"` set on `<html>` element for Bahasa Malaysia
- [ ] Skip-to-content link exists on all pages
- [ ] `prefers-reduced-motion` is respected for all animations (hero, skeleton, toast, WhatsApp button)

**Technical notes:**
- Run `axe-core` via browser extension or `@axe-core/react` in development
- Manual keyboard walkthrough of each page
- Test with VoiceOver (macOS) or NVDA (Windows) for screen reader flow
- Document any intentional deviations from WCAG AA with rationale

**Dependencies:** All Phase 4 client feature slices complete
**Estimate:** M
**Out of scope:** WCAG AAA compliance, cognitive disability accommodations

---

## 7.2 Responsive QA Across Breakpoints

**Description:** Verify all client pages render correctly and are usable across the responsive spectrum. Mobile-first design was built in Phase 4; this task verifies nothing is broken at edge-case widths.

**Acceptance criteria:**
- [ ] Tested at these widths: 320px, 375px, 414px (mobile), 768px (tablet), 1024px, 1280px, 1440px (desktop)
- [ ] No horizontal scroll on any page at any width
- [ ] No overlapping elements, truncated text, or overflow issues
- [ ] Touch targets are minimum 44x44px on mobile for all interactive elements
- [ ] Navigation is fully usable on mobile (hamburger/sheet pattern if applicable)
- [ ] Temujanji slot cards stack correctly on narrow viewports
- [ ] Kalendar grid cells remain legible at 320px (event text truncates gracefully)
- [ ] Pakej page images scale correctly without distortion
- [ ] WhatsApp floating button doesn't obscure critical content at any width
- [ ] Footer content doesn't break at narrow viewports

**Technical notes:**
- Use Chrome DevTools device emulation for width testing
- Check real devices if available (iPhone SE for 320px, iPad for 768px)
- Document any width where layout degrades and file fix tasks
- Pay extra attention to the kalendar grid — most complex responsive component

**Dependencies:** All Phase 4 client feature slices, 5.7 (WhatsApp button)
**Estimate:** M
**Out of scope:** Admin responsive testing (desktop-first, tablet-usable is sufficient)

---

## 7.3 Performance Optimization Pass

**Description:** Optimize client-side bundle size, image loading, font loading, and runtime performance. Target: Lighthouse Performance score of 90+ on mobile for all public pages.

**Acceptance criteria:**
- [ ] Lighthouse Performance score >= 90 on mobile for `/`, `/temujanji`, `/kalendar`, `/pakej`
- [ ] LCP (Largest Contentful Paint) < 2.5s on 4G throttled connection
- [ ] CLS (Cumulative Layout Shift) < 0.1
- [ ] FID (First Input Delay) < 100ms
- [ ] Images on `/pakej` use Next.js `<Image>` component with proper `width`, `height`, `priority` for above-fold
- [ ] Below-fold images use `loading="lazy"`
- [ ] Font loading: system font stack or self-hosted web font with `font-display: swap`
- [ ] No render-blocking CSS or JS
- [ ] Kalendar page: calendar grid does not re-render unnecessarily on month change (proper memoization)
- [ ] Bundle analysis: no packages over 50KB that could be replaced or tree-shaken
- [ ] Dynamic imports for any heavy components (e.g., colour picker in admin, if leaked into client bundle)

**Technical notes:**
- Run `next build && next analyze` (or `@next/bundle-analyzer`) to inspect bundle
- Use `next/image` for all images, configure `remotePatterns` if needed
- Font: prefer `next/font/google` or `next/font/local` for automatic optimization
- Check for accidental client bundle inclusion of admin-only dependencies
- Verify SSR is working for public pages (view source should have content)

**Dependencies:** All Phase 4 client feature slices
**Estimate:** M
**Out of scope:** CDN setup (handled in Phase 8), server-side caching optimization

---

## 7.4 SEO and Meta Tags

**Description:** Ensure all public pages have proper meta tags, Open Graph tags, and SSR-rendered content for search engine and social media indexing.

**Acceptance criteria:**
- [ ] Each public page has unique `<title>` and `<meta name="description">` in Bahasa Malaysia
  - `/` — "MawarBiru — Dewan Perkahwinan & Acara Eksklusif"
  - `/temujanji` — "Tempah Temujanji | MawarBiru"
  - `/kalendar` — "Kalendar Acara | MawarBiru"
  - `/pakej` — "Pakej Perkahwinan & Acara | MawarBiru"
- [ ] Open Graph tags: `og:title`, `og:description`, `og:image`, `og:url`, `og:type`
- [ ] `og:image` uses a branded social sharing image (1200x630px)
- [ ] `robots.txt` allows crawling of public pages, blocks `/admin`
- [ ] `sitemap.xml` generated (static, listing the 4 public pages)
- [ ] Canonical URLs set on all pages
- [ ] SSR verification: view-source shows rendered HTML content (not empty div)
- [ ] Structured data (JSON-LD): `LocalBusiness` schema on homepage with venue name, address, phone

**Technical notes:**
- Use Next.js App Router `metadata` export or `generateMetadata()` for per-page meta
- Create `public/robots.txt` and `app/sitemap.ts` (Next.js built-in sitemap generation)
- OG image: create a static image in `public/og-image.jpg` (can be designed later, use placeholder for now)
- JSON-LD: embed `<script type="application/ld+json">` in homepage layout

**Dependencies:** All Phase 4 client feature slices
**Estimate:** S
**Out of scope:** Google Search Console setup, analytics integration, advanced structured data for events

---

## 7.5 Admin Basic QA Pass

**Description:** Single consolidated QA task for the entire admin surface. Verify all CRUD operations work, no console errors, basic usability check.

**Acceptance criteria:**
- [ ] All admin modules load without console errors
- [ ] Complete CRUD cycle works for each resource: create, read list, read detail, update, delete
- [ ] Form validations trigger correctly (required fields, format checks)
- [ ] Delete confirmations work (especially for records with dependencies)
- [ ] Navigation between all admin pages works
- [ ] Logout works and redirects to login
- [ ] Login with wrong credentials shows error
- [ ] Admin pages are not accessible when logged out (redirect to login)
- [ ] Usable on tablet (1024px) viewport — no critical layout breaks

**Technical notes:**
- Manual walkthrough of every admin module
- Test the full tempahan creation flow: create slot -> create tempahan -> verify on public kalendar
- Test the temujanji flow end-to-end: admin creates slot -> visitor books on public page -> admin sees booking
- Check browser console for uncaught errors during all operations

**Dependencies:** All Phase 6 tasks complete
**Estimate:** M
**Out of scope:** Comprehensive responsive testing, accessibility audit, performance optimization for admin
