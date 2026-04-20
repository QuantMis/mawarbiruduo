# Phase 4.1 — Client Homepage

---

## Task 4.1: Build Homepage (`/`)

**Description:** Implement the homepage with hero section, introduction section, and call-to-action buttons (to `/temujanji` and `/kalendar`). Strictly hero + intro + CTAs — nothing else.

**Acceptance criteria:**
- [ ] `app/(client)/page.tsx` renders the homepage
- [ ] **Hero section:** full-viewport-height (100vh minus header), background image (placeholder for now) with navy overlay at 60% opacity, centred content: venue name in serif `text-5xl` cream, tagline in `text-xl` cream, two CTA buttons side-by-side
- [ ] **Hero CTA 1:** "Buat Temujanji" — `primary` button variant, links to `/temujanji`
- [ ] **Hero CTA 2:** "Lihat Kalendar" — `secondary` button variant, links to `/kalendar`
- [ ] **Intro section:** cream background, centred text block (max-width ~700px), SectionTitle "Selamat Datang ke MawarBiru", 2-3 paragraphs about the venue (hardcoded BM text), decorative underline
- [ ] No other sections — strictly what the spec defines
- [ ] **States — hover:** CTA buttons show hover variant
- [ ] **States — focus:** visible focus ring on CTAs
- [ ] **States — loading:** page is server-rendered, no loading state needed (static content)
- [ ] **Responsive — mobile (<640px):** hero text `text-3xl`, CTA buttons stack vertically full width, intro text `text-base`
- [ ] **Responsive — tablet (640-1023px):** hero text `text-4xl`, CTAs side-by-side, intro comfortable reading width
- [ ] **Responsive — desktop (1024px+):** hero text `text-5xl`, CTAs side-by-side with gap, intro centred with generous whitespace
- [ ] **Accessibility:** hero image has `role="img"` with `aria-label`. CTAs are `<Link>` components. Heading hierarchy: `h1` for venue name, `h2` for intro section title. Colour contrast: cream text on navy overlay passes AA.
- [ ] **Performance:** hero background image uses `next/image` with `priority` prop (LCP element). Navy gradient fallback if image fails.
- [ ] **Polish:** hero content fades in on initial load (subtle, 300ms). Intro section has slight fade-in on scroll-into-view. All animations respect `prefers-reduced-motion`.

**Technical notes:**
- Hero image: use `next/image` with `fill` + `object-cover` inside relative container
- LCP optimisation: hero image marked with `priority`
- Scroll-triggered animation: lightweight IntersectionObserver hook (`useInView`), toggle a CSS class
- CTA links: use `next/link` with button styling — semantically links, visually buttons
- All text content hardcoded in BM

**Dependencies:** 3.3, 2.2, 2.3

**Estimate:** M

**Out of scope:** Admin-editable homepage content, image upload, analytics, testimonials, gallery.
