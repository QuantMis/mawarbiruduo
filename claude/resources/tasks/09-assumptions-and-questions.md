# Assumptions

These assumptions were made during task generation based on the spec and owner clarifications. If any are incorrect, the affected tasks should be revisited.

1. **Slot Temujanji = 2-hour ranges.** Each consultation slot has a `masaMula` and `masaTamat` where the gap is typically 2 hours. The admin can adjust but 2 hours is the default.

2. **No kategori on Tempahan.** The `kategori` field from the original spec is removed. The linked Pakej serves as the de facto category. Calendar colour-coding is driven by `Pakej.warna`, not a separate kategori enum.

3. **Pakej colour = calendar colour-coding.** Each Pakej has an admin-configurable `warna` (hex colour) field. The public `/kalendar` and admin calendar views use this colour to visually differentiate event types.

4. **Static Pakej page.** The `/pakej` page content is hardcoded in the codebase. It is NOT dynamically rendered from admin-managed Pakej data. The admin Pakej module exists for booking workflow purposes (selecting a pakej when creating tempahan) and calendar colour-coding, not for public display.

5. **Single admin user, no roles.** There is exactly one admin account. No role-based access control, no staff accounts, no permission tiers. Auth is a binary: logged in as admin, or anonymous visitor.

6. **Admin is desktop-first.** Admin pages are designed for desktop, usable on tablet (1024px+). Mobile admin experience is not a priority.

7. **No notifications.** No email, SMS, or push notifications for bookings. Visitors get a success confirmation on-screen. Admin checks bookings by logging in to the admin panel.

8. **Image storage is local filesystem.** Pakej images are uploaded to the VPS filesystem (`public/uploads/`), not to a cloud storage service (S3, Cloudinary, etc.).

9. **No payment processing.** No online payment, no invoice generation, no financial transactions through the website.

10. **Malaysian phone number format.** Phone validation accepts common Malaysian mobile formats: `01x-xxxxxxx`, `+601x-xxxxxxx`, with or without dashes. No international format support needed.

11. **Bahasa Malaysia only.** No i18n infrastructure needed. All UI text, error messages, form labels, and meta tags are in Bahasa Malaysia. No language toggle.

12. **Pelanggan auto-creation.** When a visitor books a temujanji, a Pelanggan record is automatically created from the form data (nama, noTelefon). If a phone number already exists, the system should link to the existing Pelanggan rather than creating a duplicate.

13. **One slot = one booking.** Each SlotTemujanji maps to at most one Temujanji. Each SlotTempahan maps to at most one Tempahan. No double-booking.

14. **No calendar library dependency.** The kalendar component is custom-built with Tailwind grid, not a heavy calendar library. This keeps the client bundle lean.

15. **VPS already provisioned or will be provisioned before Phase 8.** Deployment tasks assume a Linux VPS (Ubuntu/Debian) is available with root/sudo access.

---

# Open Questions

## From Original Spec (Unresolved)

1. **Domain registration** — Is `mawarbiru.my` already registered? If not, who handles registration and DNS configuration?

2. **VPS provider** — Is there an existing VPS, or does one need to be provisioned? What provider/specs?

3. **WhatsApp number** — Which phone number should the floating WhatsApp button link to? Is it the same number used for pelanggan communication?

4. **Content readiness** — Are photos and marketing text ready for the homepage and static pakej page? Current tasks assume placeholder content will be replaced before launch.

## New Questions from Task Generation

5. **Pakej page content structure** — The static pakej page is based on 3 package types from the provided images (Night Wedding, Pakej Wedding, Event Package). Are these final, or might more packages be added before launch? If content changes, a code change + deploy is required.

6. **Pelanggan deduplication** — When a visitor books temujanji with a phone number that already exists in the Pelanggan table, should we: (a) silently link to the existing record, (b) update the existing record's nama/nota if different, or (c) create a new record anyway? Assumption: option (a).

7. **Temujanji slot visibility window** — Should the public temujanji page show all future available slots, or only slots within a certain window (e.g., next 30 days)? Unlimited future slots could look empty if admin hasn't created them yet.

8. **Kalendar date range** — Should the public kalendar only show current and future months, or should visitors be able to browse past months too? Past events may be useful for social proof.

9. **Admin seeding** — What email and initial password should the admin account use? Should the seed script use values from environment variables, or hardcode a default that must be changed on first login?

10. **Backup responsibility** — Is automated database backup expected as part of MVP, or is manual backup by the developer sufficient for launch?

11. **Upload size and count limits** — Is one image per pakej sufficient? What's the maximum image file size the owner expects to upload? Current assumption: single image, 5MB max.

12. **Slot Temujanji operating hours** — Are there standard operating hours for consultations (e.g., 9 AM - 6 PM only), or can the admin create slots at any time? Should the UI default to business hours?

---

# Summary Stats

## Task Count

| Category | Count |
|----------|-------|
| Phase 5: Cross-cutting (client) | 7 tasks |
| Phase 6: Admin surface | 9 tasks |
| Phase 7: Quality & polish | 5 tasks |
| Phase 8: Release prep | 6 tasks |
| **Total (Phases 5-8)** | **27 tasks** |

Breakdown by surface:
- **Client-focused:** 12 tasks (Phase 5 + Phase 7 minus admin QA)
- **Admin-focused:** 10 tasks (Phase 6 minus layout/dashboard + admin QA)
- **Shared/Infrastructure:** 5 tasks (auth guard, environment, build, deploy, monitoring)

## Critical Path (Phases 5-8)

```
Foundation (Phase 1)
  -> 5.1 Auth Guard
    -> 6.1 Admin Shell + Auth
      -> 6.3 Slot Temujanji CRUD
      -> 6.5 Slot Tempahan CRUD
      -> 6.7 Pakej CRUD
      -> 6.9 Pelanggan CRUD
        -> 6.6 Tempahan CRUD (depends on Pakej + Pelanggan + Slot Tempahan)
          -> 7.5 Admin QA
            -> 8.2 Build Pipeline
              -> 8.4 VPS Deployment
                -> 8.5 Domain + SSL
                  -> 8.6 Monitoring
```

The longest chain runs through the Tempahan CRUD (which has the most dependencies) into release.

## 3 Riskiest Client-side Tasks

1. **5.6 Temujanji Form Validation** — Malaysian phone number validation edge cases, the shared Zod schema between client and server, and the pelanggan auto-creation/deduplication logic on submit make this the most integration-heavy client task. Bugs here directly impact the primary conversion flow.

2. **5.3 Loading States and Skeleton Loaders** — Skeleton loaders that match the actual content layout at every breakpoint are surprisingly fiddly. If the skeletons don't match the loaded content dimensions, CLS (Cumulative Layout Shift) suffers, hurting Lighthouse scores.

3. **5.7 WhatsApp Floating Button** — Seems simple, but z-index stacking conflicts, footer overlap on scroll, and mobile viewport interactions (especially with virtual keyboards) make floating buttons a common source of production bugs.
