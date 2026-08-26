# PRD — Bharatiya Janta Party Website (भारतीय जनता पार्टी)

## Original Problem Statement
Premium, modern, mobile-first political organization website for Bharatiya Janta Party (भारतीय जनता पार्टी). Saffron/white/deep-navy branding with lotus motif and tricolor accents; Hindi + English support; sticky header with hamburger/search/CTA; auto-slide swipeable hero carousel; leadership grid (admin-managed); special leader donation section (premium saffron); donation with ₹10,001 minimum, UPI QR payment (user-provided QR), receipt download, admin-managed donation records; About (intro/mission/vision/values/history/milestones, alternating layout); Our Footprints (interactive India map + searchable state selector); News (featured, categories, load more); Events; Media/Live (tabs, full-screen viewer); detailed footer with tricolor strip. No Aadhaar/PAN/ID upload. Premium visual quality, no harsh gradients.

## Architecture
- Frontend: React 19 + Tailwind + shadcn/ui, bilingual i18n context (hi default, EN toggle), embla hero carousel, framer-motion entrances
- Backend: FastAPI + motor (MongoDB), JWT Bearer auth (12h tokens), bcrypt password hashing, seeded content
- Payment: UPI QR scan & pay (user-provided QR at /payment-qr.jpg); donations recorded as PENDING, admin marks VERIFIED/FAILED
- Admin: /admin route — leaders CRUD, donations status management, news/events/media add-delete, contacts inbox

## User Personas
- Visitor/supporter (mobile-first, Hindi-first): browses leaders, news, events; donates via UPI QR
- Donor: contributes ₹10,001+; gets receipt number + downloadable receipt
- Party admin: manages leaders, verifies donations, publishes news/events/media

## Core Requirements (static)
Min donation ₹10,001 (client + server validated) • bilingual hi/en • lotus motif • tricolor accents • responsive 4/2/1 leader grid • admin-managed leaders (hide unavailable) • special-leader donation section • interactive India map + searchable states • news load-more • media tabs (Live/Videos/Photos) with viewer • footer tricolor strip • no ID document upload

## Implemented (2026-08-25)
- Official BJP lotus logo (user-provided) across header, mobile menu, footer, admin panel
- Real leadership added: PM Narendra Modi, National President Nitin Nabin (both featured in special leader-donation section), Atal Bihari Vajpayee (Former PM, Bharat Ratna); fictional placeholder president demoted to National Vice President
- "Our Foundation / हमारी नींव" section with user-provided Mookherjee & Deendayal Upadhyaya banner + founder cards
- "Leadership You Can Trust / विश्वसनीय नेतृत्व" navy grid section — 31 leader portraits cropped from user-provided reference image
- Sticky glass header: lotus logo, bilingual nav, search panel (sections + leaders), EN/हिंदी toggle, Donate CTA, hamburger sheet, saffron accent line
- Hero carousel: 3 slides, auto-slide 5s, swipe, prev/next, indicators, bilingual headlines
- Leaders grid (6 seeded, admin CRUD, profile dialog)
- Special leader donation section (saffron, lotus watermark, badge, per-leader donate prefill)
- Donation flow: presets/custom, ₹10,001 min validation, UPI QR step (user-provided QR), PENDING status, receipt no + download
- About: 4 alternating blocks + navy milestones strip
- Footprints: stylized India SVG with clickable state dots, search, state detail stats panel (12 states seeded)
- News: featured + cards, category/date, read-more dialog, load more (7 seeded)
- Events: 4 cards + details dialog
- Media: Live/Videos/Photos tabs, full-screen viewer (sample MP4 videos — MOCKED content)
- Footer: navy, quick links, contact form (POST /api/contact), social icons, tricolor strip
- Admin panel: JWT login, leaders CRUD (special/active flags), donations status, news/events/media add-delete, contacts inbox
- Test credentials documented in /app/memory/test_credentials.md

## Verification Done
- curl: leaders/special/news/events/media/states, login, /me, donation 400 below min, valid donation, receipt lookup, admin donations, leader CRUD — all pass
- Screenshots: desktop hero/leaders/leader-donation/donate/footprints/media/footer; full donation flow (form→QR→receipt BJP-04E4E05B); min-amount error; mobile hero/hamburger/news; admin login/dashboard/donations/add-leader dialog
- Fixed: hero image with another party's banner replaced; female leader photos corrected

## Backlog
- P0: (none blocking)
- P1: Real payment gateway (Razorpay/Stripe) if online collection needed; real YouTube/live video URLs; real leader photos/bios from party
- P2: News edit in admin (currently add/delete); event RSVP; donation email/SMS receipts; state-level pages; full content management for About/milestones

## Next Tasks
1. Replace sample videos/photos with real party media via admin panel
2. Optional: Razorpay integration for instant verified payments
3. Optional: Resend email receipts on donation
