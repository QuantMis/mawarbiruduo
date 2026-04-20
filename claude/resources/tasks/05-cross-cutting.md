# Phase 5: Cross-cutting Concerns (Client-focused)

These are shared infrastructure components that multiple client-facing pages depend on. They enforce consistency across the public surface and reduce duplication.

---

## 5.1 Admin Route Auth Guard Middleware

**Description:** Create a Next.js middleware that protects all `/admin/*` routes. Unauthenticated requests redirect to a login page. Uses NextAuth.js session check.

**Acceptance criteria:**
- [ ] All routes under `/admin` require valid session
- [ ] Unauthenticated users are redirected to `/admin/login`
- [ ] Session check happens server-side via NextAuth middleware
- [ ] Authenticated users proceed normally
- [ ] Login page is excluded from the guard (no redirect loop)
- [ ] API routes under `/api/admin/*` return 401 JSON for unauthenticated requests

**Technical notes:**
- Use Next.js `middleware.ts` with `matcher` config targeting `/admin/:path*`
- Check session via `getToken()` from `next-auth/jwt`
- Keep middleware lightweight; no DB calls, JWT check only
- API routes should return `{ error: "Tidak dibenarkan" }` with 401 status

**Dependencies:** 1.x (Foundation — NextAuth setup)
**Estimate:** S

---

## 5.2 Global Error Boundary for Client Pages

**Description:** Wrap all public pages in an error boundary that catches rendering errors and displays a branded fallback UI instead of a white screen. Server errors during SSR should also render a styled error page.

**Acceptance criteria:**
- [ ] Runtime errors in client pages show a branded error screen
- [ ] Error screen matches MawarBiru luxury aesthetic (navy/cream palette)
- [ ] Error screen includes: apologetic message in Bahasa Malaysia, "Kembali ke Laman Utama" CTA
- [ ] `error.tsx` file exists at the app route level
- [ ] `global-error.tsx` exists for root layout failures
- [ ] Errors are logged to console (monitoring hook point for later)
- [ ] Error boundary does not affect admin pages (admin has own error handling)

**States:**
- Default: Normal rendering, boundary invisible
- Error: Branded fallback with message + CTA button
- Hover/Focus on CTA: Standard button states from design system

**Responsive:**
- Mobile: Centered layout, stacked content, full-width CTA
- Tablet/Desktop: Centered card with constrained max-width

**Accessibility:**
- Focus moves to the error heading when boundary activates
- CTA is keyboard accessible
- Screen reader announces error context

**Technical notes:**
- Use Next.js App Router `error.tsx` convention
- Include a `reset()` callback button to retry rendering
- Style with Tailwind using brand tokens from Phase 2
- Keep error page self-contained (no external data fetching)

**Dependencies:** 2.x (Design system — Button, typography tokens)
**Estimate:** S
**Out of scope:** Error tracking/monitoring service integration (Phase 8)

---

## 5.3 Loading States and Skeleton Loaders

**Description:** Create reusable loading components: a full-page skeleton loader, inline skeleton primitives (text lines, cards, calendar grid), and a branded spinner. These are used across Temujanji, Kalendar, and layout transitions.

**Acceptance criteria:**
- [ ] `<SkeletonText>` component renders animated placeholder lines (configurable count)
- [ ] `<SkeletonCard>` renders a card-shaped placeholder matching the slot card design
- [ ] `<SkeletonCalendar>` renders a calendar-grid-shaped placeholder for `/kalendar`
- [ ] `<LoadingSpinner>` renders a branded spinner using MawarBiru palette
- [ ] `loading.tsx` files exist for `/temujanji` and `/kalendar` routes
- [ ] Skeleton pulse animation uses `#EBDED4` (cream) to `#D9AA90` (dusty rose) gradient
- [ ] Animation respects `prefers-reduced-motion` — falls back to static placeholder

**States:**
- Loading: Animated pulse/shimmer
- Reduced motion: Static grey placeholders, no animation

**Responsive:**
- Skeletons match the responsive layout of the content they replace
- Mobile: Single-column skeletons
- Desktop: Multi-column where the real content is multi-column

**Accessibility:**
- Skeleton containers have `aria-busy="true"` and `role="status"`
- Screen reader: `aria-label="Memuatkan..."` on the container

**Technical notes:**
- Use Tailwind `animate-pulse` as base, customize with brand colours
- Export from a shared `components/ui/skeleton/` directory
- `loading.tsx` files leverage Next.js App Router Suspense integration automatically

**Dependencies:** 2.x (Design system tokens)
**Estimate:** M
**Out of scope:** Admin-side loading states (handled within admin components)

---

## 5.4 Empty State Components

**Description:** Create branded empty state displays for when data-driven pages have no content. Primary consumers: Temujanji page (no available slots), Kalendar (no events in selected month).

**Acceptance criteria:**
- [ ] `<EmptyState>` component accepts: icon (optional), title, description, CTA (optional)
- [ ] Temujanji empty state: "Tiada slot tersedia" with suggestion to check back later or contact via WhatsApp
- [ ] Kalendar empty state: "Tiada acara pada bulan ini" with month navigation hint
- [ ] Styled with MawarBiru palette — subtle, not alarming
- [ ] Each empty state includes an optional WhatsApp CTA link

**States:**
- Default: Centered illustration/icon + text + optional CTA
- Hover/Focus on CTA: Standard button hover from design system

**Responsive:**
- Mobile: Full-width centered, comfortable padding
- Desktop: Constrained max-width, centered in content area

**Accessibility:**
- Empty state region has `role="status"` so screen readers announce it
- CTA is keyboard navigable

**Technical notes:**
- Generic `<EmptyState>` component; page-specific instances pass props
- Use a simple SVG icon or emoji placeholder (luxury-appropriate)
- Place in `components/ui/empty-state/`

**Dependencies:** 2.x (Design system — typography, Button)
**Estimate:** S
**Out of scope:** Admin empty states (use basic "Tiada rekod" text)

---

## 5.5 Toast Notification System

**Description:** Implement a toast notification system for success/error feedback on the Temujanji booking form and admin actions. Toasts appear at the top or bottom of the viewport, auto-dismiss after a timeout, and are dismissible manually.

**Acceptance criteria:**
- [ ] `<ToastProvider>` wraps the app and manages toast state
- [ ] `useToast()` hook exposes `showToast({ type, message, duration? })` function
- [ ] Toast types: `success` (green/dusty-rose), `error` (terracotta/red), `info` (navy)
- [ ] Toasts auto-dismiss after 5 seconds (configurable)
- [ ] Toasts can be manually dismissed with close button
- [ ] Multiple toasts stack vertically
- [ ] Toast entrance/exit has slide + fade animation
- [ ] Animation respects `prefers-reduced-motion`

**States:**
- Hidden: No toast visible
- Visible: Toast slides in with message
- Hover on toast: Pause auto-dismiss timer
- Dismissing: Slide + fade out

**Responsive:**
- Mobile: Full-width toast at bottom of viewport
- Desktop: Fixed-width toast at top-right corner

**Accessibility:**
- Toast container has `role="alert"` and `aria-live="polite"`
- Close button has `aria-label="Tutup"`
- Keyboard: close button focusable, Escape dismisses topmost toast

**Technical notes:**
- Use React Context + `useReducer` for toast state management
- Consider `sonner` or `react-hot-toast` as lightweight alternatives to custom implementation
- If using a library, ensure it supports custom styling with Tailwind
- Place provider in root layout

**Dependencies:** 2.x (Design system tokens)
**Estimate:** M
**Out of scope:** Admin gets the same toast system (shared), but no additional admin-specific toast types

---

## 5.6 Temujanji Form Validation Pattern

**Description:** Implement client-side and server-side validation for the Temujanji booking form. This establishes the validation pattern used across the app.

**Acceptance criteria:**
- [ ] Client-side validation using Zod schema
- [ ] Fields validated: Nama (required, min 2 chars, max 100), No. Telefon (required, Malaysian format), Nota (optional, max 500 chars)
- [ ] Malaysian phone validation: accepts `01x-xxxxxxx` patterns (with or without dashes, with or without `+60` prefix)
- [ ] Inline error messages appear below each field in Bahasa Malaysia
- [ ] Errors display on blur and on submit attempt
- [ ] Submit button is disabled during submission (loading state)
- [ ] Server-side validation mirrors client-side Zod schema (shared schema file)
- [ ] API returns structured error response: `{ errors: { field: string[] } }`

**States:**
- Default: Empty form, no errors shown
- Touched + invalid: Inline error below field, field border turns terracotta (`#A65E46`)
- Touched + valid: Field border returns to default (or subtle green check)
- Submitting: Button shows spinner, all fields disabled
- Success: Toast notification, form resets or redirects
- Server error: Toast with error message, form remains filled

**Responsive:**
- Mobile: Stacked fields, full-width inputs
- Tablet/Desktop: Same stacked layout (form doesn't need multi-column)

**Accessibility:**
- Error messages linked to fields via `aria-describedby`
- Invalid fields have `aria-invalid="true"`
- Focus moves to first error field on failed submit
- Error summary announced to screen readers

**Technical notes:**
- Create shared Zod schema in `lib/validations/temujanji.ts`
- Use `react-hook-form` with `@hookform/resolvers/zod` for client-side
- Server action or API route reuses same Zod schema
- Phone regex: `/^(\+?60)?0?1[0-9]-?[0-9]{7,8}$/`

**Dependencies:** 2.x (Design system — Input, Button), 4.x (Temujanji feature slice — form structure)
**Estimate:** M
**Out of scope:** SMS/OTP verification, email validation

---

## 5.7 WhatsApp Floating Button Component

**Description:** Build a floating WhatsApp button that appears on all public pages. It links to the business owner's WhatsApp number via `wa.me` URL. Persistent across page navigations, visually prominent but not obstructing content.

**Acceptance criteria:**
- [ ] Floating circular button fixed to bottom-right corner of viewport
- [ ] WhatsApp green icon (SVG) on the button
- [ ] Clicking opens `https://wa.me/<configured-number>` in new tab
- [ ] WhatsApp number is configurable via environment variable (`NEXT_PUBLIC_WHATSAPP_NUMBER`)
- [ ] Button has subtle entrance animation on page load (fade + slide up)
- [ ] Button has hover scale effect
- [ ] Button does not overlap page footer when scrolled to bottom (offset margin)
- [ ] Button is visible on all public pages (`/`, `/temujanji`, `/kalendar`, `/pakej`)
- [ ] Button is NOT visible on admin pages

**States:**
- Default: Green circular button with WhatsApp icon, slight shadow
- Hover: Scale up to 1.1x, shadow intensifies
- Focus: Visible focus ring (for keyboard users)
- Active: Scale down to 0.95x (press effect)

**Responsive:**
- Mobile: 48x48px minimum touch target, 16px from edges
- Tablet: 56x56px, 24px from edges
- Desktop: 56x56px, 32px from edges

**Accessibility:**
- `aria-label="Hubungi kami melalui WhatsApp"`
- `target="_blank"` with `rel="noopener noreferrer"`
- Keyboard focusable (naturally, as an `<a>` tag)
- Respects `prefers-reduced-motion` for entrance animation

**Technical notes:**
- Implement as a client component in `components/ui/whatsapp-button.tsx`
- Include in the public layout (not root layout, to exclude admin)
- Use inline SVG for the WhatsApp icon (avoid external dependency)
- `z-index` should be below modals but above page content (e.g., `z-40`)

**Dependencies:** 2.x (Design system tokens)
**Estimate:** S
**Out of scope:** WhatsApp chat widget, pre-filled message templates
