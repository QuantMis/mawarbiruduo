# MawarBiru — Task List

## Overview

MawarBiru is a luxury wedding and event venue website built as a Next.js monolith with MySQL, Prisma, and Tailwind CSS. Public visitors browse packages, book consultation appointments (temujanji), and check venue availability via a colour-coded calendar. A single business owner manages everything through an admin panel.

**Rigor split:** Client-facing pages (phases 3-4) receive full treatment — every interactive state, responsive breakpoint, accessibility requirement, edge case, and performance consideration is specified. Admin modules (phase 6) use standard rigor — functional correctness and basic usability without exhaustive state/a11y enumeration.

## Dependency Overview

```
Phase 1: Foundation
  └── Phase 2: Design System (depends on 1.1-1.4)
        └── Phase 3: Client Layout (depends on 2.1-2.5)
              └── Phase 4: Client Feature Slices (depends on 3.1-3.3)
                    └── Phase 5: Cross-cutting Concerns (depends on 2.x, 4.x)
                          └── Phase 6: Admin Surface (depends on 1.x, 2.x)
                                └── Phase 7: Quality & Polish (depends on all above)
                                      └── Phase 8: Release Prep (depends on all above)
```

Phase 1 establishes the repo, database, and auth. Phase 2 builds the reusable design tokens and components. Phase 3 assembles the public-facing shell (nav, footer, layout). Phase 4 implements the four client pages with full interactivity. Phase 5 adds cross-cutting client concerns. Phase 6 builds the admin CRUD surface. Phase 7 polishes and audits. Phase 8 ships.

## File Index

| File | Phase | Surface | Tasks |
|------|-------|---------|-------|
| `01-foundation.md` | 1 — Foundation | Shared | 1.1–1.6 |
| `02-design-system.md` | 2 — Design System | Client | 2.1–2.5 |
| `03-client-layout.md` | 3 — Client Layout | Client | 3.1–3.3 |
| `04-client-homepage.md` | 4.1 — Homepage | Client | 4.1 |
| `04-client-pakej.md` | 4.2 — Pakej Page | Client | 4.2 |
| `04-client-temujanji.md` | 4.3, 4.5 — Temujanji | Client | 4.3, 4.5 |
| `04-client-kalendar.md` | 4.4, 4.6 — Kalendar | Client | 4.4, 4.6 |
| `05-cross-cutting.md` | 5 — Cross-cutting | Client | 5.1–5.7 |
| `06-admin-surface.md` | 6 — Admin Surface | Admin | 6.1–6.9 |
| `07-quality-polish.md` | 7 — Quality & Polish | Both | 7.1–7.5 |
| `08-release-prep.md` | 8 — Release Prep | Shared | 8.1–8.6 |
| `09-assumptions-and-questions.md` | — | — | — |
