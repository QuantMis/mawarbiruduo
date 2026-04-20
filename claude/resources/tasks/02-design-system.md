# Phase 2 — Design System & Primitives

---

## Task 2.1: Define Design Tokens in Tailwind Configuration

**Description:** Extend the Tailwind config with the MawarBiru colour palette, typography scale, spacing, border-radius, and shadow tokens. These tokens are the single source of truth for the entire UI.

**Acceptance criteria:**
- [ ] `tailwind.config.ts` extends `colors` with: `navy: '#07203F'`, `cream: '#EBDED4'`, `dusty-rose: '#D9AA90'`, `terracotta: '#A65E46'`, `dark: '#02000D'`
- [ ] Additional tints/shades generated for each colour (at minimum 3 variants per colour)
- [ ] Typography: `fontFamily.serif` set to a luxury serif font (e.g., Playfair Display) for headings, `fontFamily.sans` for body text
- [ ] Font size scale includes: `xs`, `sm`, `base`, `lg`, `xl`, `2xl`, `3xl`, `4xl`, `5xl` with matching line-heights
- [ ] Spacing tokens for consistent section padding: `section-y`, `section-x` with responsive values
- [ ] Border radius tokens: `rounded-card` (0.75rem), `rounded-button` (0.5rem), `rounded-badge` (9999px)
- [ ] Box shadow tokens: `shadow-card`, `shadow-elevated`, `shadow-dropdown`
- [ ] All colour combinations pass WCAG AA contrast ratio (4.5:1 for normal text, 3:1 for large text)
- [ ] `globals.css` applies base styles: background `cream`, text `dark`, font `sans`

**Technical notes:**
- Use Tailwind `theme.extend` to preserve defaults while adding custom tokens
- Import Google Fonts (Playfair Display + Inter) via `next/font`
- Verify contrast: `navy` on `cream` (AA pass), `cream` on `navy` (AA pass), `dark` on `cream` (AAA pass)
- Add CSS custom properties as fallback for dynamic colour needs

**Dependencies:** 1.1

**Estimate:** S

**Out of scope:** Component implementation, responsive layout utilities, animations.

---

## Task 2.2: Build Core UI Primitive Components

**Description:** Create the foundational UI primitives used across both client and admin: Button, Input, Textarea, Label, Badge, Card, Skeleton, Spinner. Each component is fully typed, accessible, and style-consistent with the design tokens.

**Acceptance criteria:**
- [ ] `components/ui/button.tsx` — variants: `primary` (navy bg, cream text), `secondary` (cream bg, navy text/border), `accent` (dusty-rose bg), `ghost` (transparent), `danger` (red). Sizes: `sm`, `md`, `lg`. States: default, hover, focus (visible ring), active, disabled (opacity 50%), loading (spinner, aria-busy).
- [ ] `components/ui/input.tsx` — cream bg, navy border. States: default, hover, focus (ring-2 dusty-rose), error (border red + error message), disabled. Props: `label`, `error`, `helperText`, full `InputHTMLAttributes` pass-through.
- [ ] `components/ui/textarea.tsx` — same styling/states as Input, auto-resize optional.
- [ ] `components/ui/label.tsx` — associated with input via `htmlFor`, required indicator (`*` in terracotta).
- [ ] `components/ui/badge.tsx` — small pill, variants: `default`, `success`, `warning`, `error`, `custom` (accepts arbitrary bg colour for pakej calendar).
- [ ] `components/ui/card.tsx` — cream bg, `shadow-card`, `rounded-card`, optional hover lift. Compound: `Card`, `Card.Header`, `Card.Body`, `Card.Footer`.
- [ ] `components/ui/skeleton.tsx` — animated placeholder with `animate-pulse`. Variants: `text`, `circle`, `rect`.
- [ ] `components/ui/spinner.tsx` — SVG spinner, sizes `sm`/`md`/`lg`, `role="status"` + `aria-label="Memuatkan"`.
- [ ] All components use `forwardRef` for ref forwarding
- [ ] All components accept `className` for composition via `cn()` (clsx + tailwind-merge)
- [ ] All interactive components have visible focus indicators (WCAG 2.1)
- [ ] All components support `data-testid` prop

**Technical notes:**
- Install `clsx` and `tailwind-merge`, create `lib/utils.ts` exporting `cn(...inputs)` utility
- Use `cva` (class-variance-authority) for variant management on Button and Badge
- Transitions: 150ms ease for hover/focus, 100ms for active — respect `prefers-reduced-motion`

**Dependencies:** 2.1

**Estimate:** L

**Out of scope:** Form composition, specific page layouts, admin-only components.

---

## Task 2.3: Build Typography and Layout Components

**Description:** Create reusable typography components (Heading, Text, SectionTitle) and layout primitives (Container, Section, Stack, Grid) that enforce the design system spacing and responsive behaviour.

**Acceptance criteria:**
- [ ] `components/ui/heading.tsx` — renders `h1`-`h6` via `level` prop. Serif font. Sizes scale responsively. Colour defaults to `navy`.
- [ ] `components/ui/text.tsx` — renders `p` by default, `as` prop for `span`/`div`/`small`. Variants: `body`, `lead`, `small`, `muted`. Colour defaults to `dark`.
- [ ] `components/ui/section-title.tsx` — composed: Heading + optional subtitle Text + decorative underline (dusty-rose, 3rem wide, 2px thick, centred).
- [ ] `components/ui/container.tsx` — max-width 1200px, centred, responsive horizontal padding (px-4 mobile, px-6 tablet, px-8 desktop).
- [ ] `components/ui/section.tsx` — semantic `<section>` with vertical padding, optional `bg` variant (`cream`, `navy`, `white`). Includes Container internally.
- [ ] `components/ui/stack.tsx` — flex column/row with configurable `gap`. Props: `direction`, `gap`, `align`, `justify`.
- [ ] `components/ui/grid.tsx` — CSS Grid wrapper. Props: `cols` (responsive object `{ mobile: 1, tablet: 2, desktop: 3 }`), `gap`.
- [ ] Responsive breakpoints consistent: mobile (<640px), tablet (640-1023px), desktop (1024px+)

**Technical notes:**
- Heading responsive sizing: `text-3xl md:text-4xl lg:text-5xl` pattern
- Container uses `mx-auto` + `w-full` + `max-w-[1200px]`
- Stack and Grid are thin convenience wrappers — avoid over-abstraction

**Dependencies:** 2.1

**Estimate:** M

**Out of scope:** Page-specific layouts, navigation, footer.

---

## Task 2.4: Build Feedback and Overlay Components

**Description:** Create components for user feedback and overlays: Toast/notification system, Modal/Dialog, Alert (inline), and EmptyState.

**Acceptance criteria:**
- [ ] `components/ui/toast.tsx` + `lib/toast.ts` — toast notification system. Types: `success`, `error`, `info`, `warning`. Auto-dismiss after 5s. Stacks from bottom-right (desktop) / bottom-centre (mobile). Max 3 visible. `role="alert"` + `aria-live="polite"`. Imperative API: `toast.success(msg)`.
- [ ] `components/ui/modal.tsx` — accessible dialog. Focus trap on open, restores focus on close. Closes on Escape and backdrop click. Props: `isOpen`, `onClose`, `title`, `children`, `size`. Backdrop with navy overlay at 50% opacity. Entry/exit animation.
- [ ] `components/ui/alert.tsx` — inline alert banner. Variants: `info`, `success`, `warning`, `error`. Icon + message + optional action.
- [ ] `components/ui/empty-state.tsx` — illustration placeholder + heading + description + optional CTA button.
- [ ] All overlays respect `prefers-reduced-motion`
- [ ] All overlays are keyboard navigable
- [ ] Modal prevents body scroll when open

**Technical notes:**
- Toast system: use `sonner` wrapped with custom styling to match design tokens, or React context + reducer
- Modal: `createPortal` to `document.body`, or use native `<dialog>` with `showModal()`
- Focus trap: use `focus-trap-react` or implement manually

**Dependencies:** 2.1, 2.2

**Estimate:** M

**Out of scope:** Specific use-case modals, admin-specific dialogs.

---

## Task 2.5: Build Navigation Primitives and Floating WhatsApp Button

**Description:** Create the shared navigation components (NavLink, MobileMenu) and the floating WhatsApp CTA button that appears on all client pages.

**Acceptance criteria:**
- [ ] `components/ui/nav-link.tsx` — styled anchor/Link. States: default (cream text on navy bg), hover (dusty-rose underline), active/current page (terracotta underline, `aria-current="page"`), focus (visible ring). Uses `next/link` with `usePathname()`.
- [ ] `components/ui/mobile-menu.tsx` — slide-in drawer from right. Hamburger icon button (`aria-label="Buka menu"`, `aria-expanded`). Overlay: navy at 70% opacity. Menu: cream bg, full-height, nav links stacked. Close: X button + backdrop click + Escape. Focus trap while open. Body scroll lock. Transition: 200ms slide + fade.
- [ ] `components/client/whatsapp-fab.tsx` — floating action button, bottom-right, green WhatsApp icon (#25D366). Size: 56px circle. Hover: scale(1.05) + shadow lift. `aria-label="Hubungi kami melalui WhatsApp"`. Links to `https://wa.me/{NEXT_PUBLIC_WHATSAPP_NUMBER}` in new tab. Hidden if number is empty. `fixed bottom-6 right-6 z-40`.
- [ ] WhatsApp button has subtle entrance animation (fade-up after 1s delay) — skipped on `prefers-reduced-motion`
- [ ] Mobile menu renders above WhatsApp button (z-index layering)
- [ ] All components are SSR-safe

**Technical notes:**
- Hamburger icon: 3 horizontal lines, animates to X on open (CSS transform)
- Z-index scale in Tailwind: `z-fab: 40`, `z-menu: 50`, `z-modal: 60`, `z-toast: 70`
- WhatsApp FAB reads from `process.env.NEXT_PUBLIC_WHATSAPP_NUMBER` client-side

**Dependencies:** 2.1, 2.2

**Estimate:** M

**Out of scope:** Full header/footer composition (Phase 3), admin navigation.
