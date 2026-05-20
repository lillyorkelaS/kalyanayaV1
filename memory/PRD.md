# Kalyanaya — Premium Luxury Indian Wedding Website Platform

## Original Problem Statement
> Clone https://github.com/lillyorkelaS/kalyanayaV1/, start preview and suggest improvements / new features. Once confirmed, implement.

User refinement (2026-05-19):
> Make this admin-only. Users should NOT be able to sign up for free. They contact us via WhatsApp or a contact form. Hide the Admin Login button. Admin logs in via `/admin`. Create admin credentials.

## Architecture
- **Stack:** Next.js 14 (App Router) + MongoDB + Cloudinary + framer-motion + Tailwind + Radix UI
- **API Routing trick:** This environment routes `/api/*` to port 8001 (FastAPI) and everything else to 3000 (Next.js). Since the original repo is a Next.js full-stack app with `/api/[[...path]]/route.js`, `/app/backend/server.py` is a thin **FastAPI reverse proxy** that forwards `/api/*` to `http://localhost:3000/api/*`.
- **Auth:** JWT (30d expiry) via bcrypt-hashed passwords stored in `users` collection.
- **Storage:** MongoDB `kalyanaya` database — collections: `users`, `weddings`, `rsvps`, `leads`.

## User Personas
- **Studio Admin (Kalyanaya staff):** Logs in at `/admin/login`, builds wedding websites for paying couples, manages RSVPs and incoming leads.
- **Couple (customer):** Visits landing page, taps Contact Us / WhatsApp → studio reaches out → site is built for them.
- **Wedding Guest:** Visits public `/wedding/[slug]` URL, browses gallery, submits RSVP.

## Implemented (cumulative)
### From upstream repo (working out of the box)
- Luxury landing page (editorial design, 10 templates showcase)
- JWT auth, admin dashboard with stats, wedding CRUD, slug auto-generation
- Original 8 wedding templates: Moonveil, Royal Heritage, Eternal Edit, Crimson Lotus, Sapphire Saga, Sanctum Veil, Marigold Bloom, Pearl & Velvet
- Public wedding pages with countdown, gallery, events, RSVP, lightbox
- Cloudinary image upload + delete (real keys configured)
- RSVP submit (public) + admin list + CSV export

### Added in this session (2026-05-19) — Admin-only conversion
- **Public registration disabled** — `POST /api/auth/register` returns 403
- **Admin auto-seed on first DB connection** — idempotent, configurable via env
- **`/admin/login`** — new dedicated, restricted-access login page (replaces public `/login`)
- **`/login`** route now redirects to homepage
- **Landing page rewrite** — removed "Admin Login" nav link, removed "Get Started/Begin Your Story" CTAs; replaced with **"Contact Us" button + WhatsApp CTAs everywhere**
- **`ContactModal` component** — beautiful modal with name/phone/email/partner/date/city/budget fields; submits to MongoDB; also has direct WhatsApp link
- **Floating WhatsApp button** (bottom-right) on every landing-page visit
- **Template cards** — clicking any template opens contact modal pre-filled with template interest
- **Leads CRUD API** — public POST, admin-only GET/PUT/DELETE/export
- **Admin "Leads" tab** with status (new/contacted/converted/closed), inline WhatsApp/email links, CSV export, delete
- **FastAPI reverse proxy** wired so `/api/*` works through the ingress

### Added in this session (2026-05-20 — pt 2) — Scroll transitions + Muhurtham time
- **Muhurtham time picker** in admin builder — added `weddingTime` field next to date. On save, combined into ISO datetime with explicit IST timezone (`+05:30`) so display is consistent regardless of server/viewer timezone.
- **Banyan & Brass** and **Pichwai Bloom** hero now show "Muhurtham · 6:30 AM" prominently. Time displayed via `Intl.DateTimeFormat` with `timeZone: 'Asia/Kolkata'`. Hidden automatically when no time set.
- **Countdown precision** — automatically uses muhurtham time. Works in all 10 templates since `new Date(weddingDate).getTime()` handles ISO datetimes natively. Older 8 templates' countdowns now tick to the exact muhurtham moment.
- **Lenis smooth scroll** on all wedding pages via new `WeddingPageWrapper` component.
- **Hero parallax** — hero image translates + scales subtly on scroll.
- **Section reveal animations** — IntersectionObserver applies `data-revealed` to each `<section>` on viewport entry. Global CSS fades + slides + scales sections in (1.2s cubic-bezier). Direct children (countdown tiles, gallery items, event cards) stagger in via `kal-rise` keyframe. Respects `prefers-reduced-motion`.
- **Zero per-template changes** — wrapper applies transitions globally, so future templates inherit automatically.


### Added in this session (2026-05-20 — pt 3) — Template 11: Albion Vow
- **Albion Vow** (`/app/frontend/components/templates/AlbionVow.js`) — Classic English manor garden wedding. Palette: sage green `#8B9B7E` + dusty rose `#D4B5B0` + champagne brass `#C9A961` + antique cream `#F5EFE0` + soft charcoal `#3D4146`.
- Custom SVG motifs hand-drawn: **English rose stem**, **eucalyptus branch**, **ivy vine**, **monogram crest with laurels** (auto-generated from couple's initials), **flourish divider**, **wax seal** (CSS radial-gradient + Pinyon Script initials).
- **Pinyon Script** + **Cormorant Garamond** loaded via Google Fonts (lazy-loaded inside template — no global config needed).
- Hero reads like a letterpress invitation: "Together with their families" eyebrow → "request the honour of your presence" in script → italic names with sage script "and" → flourish divider → Friday / 12 June 2026 / at 4:30 pm. Cream-paper overlay (92% opacity) makes ANY hero image work as a soft watermark.
- **Story section** = handwritten letter card with "Dearest reader," opening salutation, drop cap, "yours, forever —" sign-off.
- **Gallery** = polaroid-style frames with hand-placed tilt (±3°), drop shadow, "no. 01" script captions.
- **Events** = letterpress cards with vertical date band, "no. 02" script number, italic title.
- **RSVP** = letter-style form with embossed wax seal on top (initials), "With joy / Perhaps / With regret" reply choices, "Send my reply" CTA.
- Updated wedding renderer, admin picker (11 templates), landing page ("Eleven signatures", new pricing copy "All 11 luxury templates").
- Live demo: `/wedding/eleanor-henry` (muhurtham 4:30 PM).


## Backlog (suggested next steps — awaiting user confirmation)
Curated for "surprise me" mandate. Ordered by ROI for a SaaS wedding studio:

### Added in this session (2026-05-20 — pt 4) — Template 12: Jannah Vow (Muslim wedding)
- **Jannah Vow** (`/app/frontend/components/templates/JannahVow.js`) — Authentic Muslim Nikah wedding template. Palette: deep Islamic emerald `#0F5132` + antique Mughal gold `#C5A572` + warm ivory `#F5EFE3` + rose-gold accent + deepest emerald.
- Custom SVG motifs hand-drawn: **8-point Islamic star** (Rub el Hizb), **mashrabiya/girih tile** lattice, **mosque silhouette** (dome + dual minarets + crescent finials), **crescent + star**, **arabesque vine**, **Ottoman tulip**, **mehrab arch** (via clip-path).
- **Amiri Arabic font** + **Cormorant Garamond** loaded via Google Fonts.
- Tasteful Arabic calligraphy: Bismillah hero blessing, Quran 30:21 (وَمِنْ آيَاتِهِ — "And among His signs") above story, "Nikah Mubarak" on RSVP, "Baraka Allahu lakuma" (May Allah bless you both) in footer — all with English translations.
- Muslim-specific copy: "With the blessings of Allah ﷻ", "Nikah at 6:30 PM" muhurtham label, "Insha'Allah / Perhaps / With regret" RSVP options, "A dua for the couple" textarea, "Meal preference (all halal)", "Send · Insha'Allah" CTA, "Your duas are our greatest gift" registry section.
- **Gallery uses mehrab arch-shaped photo frames** via CSS clip-path — a unique Islamic architectural detail.
- Event cards designed for **Mehndi · Nikah · Walima** flow with emerald date band + mashrabiya backdrop.
- Updated wedding renderer, admin picker (12 templates), landing page ("Twelve signatures"), pricing ("All 12 luxury templates").
- Live demo: `/wedding/ayesha-imran` (Nikah at 6:30 PM, Hyderabad).


### P0 — Revenue & lead conversion
1. **Stripe / Razorpay checkout** — once a couple is qualified, send them a payment link straight from the Leads tab. Skip invoicing dance.
2. **Live template preview links** — give each template a working `/preview/[template]` URL with dummy data so leads can browse demos.
3. **Lead notifications** — WhatsApp Business API or email alert to admin when a new lead arrives (right now they must check dashboard).

### P1 — Guest delight (drives word-of-mouth)
4. **Digital save-the-date generator** — auto-generate a beautifully styled image guest can share on WhatsApp/Instagram.
5. **Photo wall** — guests can upload photos during the wedding; admin moderates; appears live on the site.
6. **Live-stream embed** — Zoom/YouTube live URL on the wedding page (Heirloom plan upsell).
7. **Gift registry payment** — collect cash gifts via UPI/Stripe directly on the site (5% platform fee).

### P2 — Polish & growth
8. **AI love-story writer (Gemini Nano Banana / GPT)** — admin types bullet points, AI drafts the story in the template's voice.
9. **AI event captions** — auto-generate descriptions for Mehendi, Sangeet, etc.
10. **Blog + SEO landing pages** (e.g., "Best Mughal-themed wedding websites") for inbound traffic.
11. **Per-template demo videos** on the landing page (replace static images with looped MP4 walkthroughs).
12. **Mobile RSVP polish + skeletons** + accessibility audit.
13. **Multi-language support** (Hindi, Tamil, Bengali) for guest-facing pages.

## Next Tasks
- Replace placeholder WhatsApp number `+91 98765 43210` in `/app/frontend/components/ContactModal.js`
- Provide real Cloudinary `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET` in `/app/frontend/.env` (cloud name `dqnjsxtcl` retained from original; upload will 401 until keys are set)
- Pick which P0/P1/P2 items above to implement next
 new lead arrives (right now they must check dashboard).

### P1 — Guest delight (drives word-of-mouth)
4. **Digital save-the-date generator** — auto-generate a beautifully styled image guest can share on WhatsApp/Instagram.
5. **Photo wall** — guests can upload photos during the wedding; admin moderates; appears live on the site.
6. **Live-stream embed** — Zoom/YouTube live URL on the wedding page (Heirloom plan upsell).
7. **Gift registry payment** — collect cash gifts via UPI/Stripe directly on the site (5% platform fee).

### P2 — Polish & growth
8. **AI love-story writer (Gemini Nano Banana / GPT)** — admin types bullet points, AI drafts the story in the template's voice.
9. **AI event captions** — auto-generate descriptions for Mehendi, Sangeet, etc.
10. **Blog + SEO landing pages** (e.g., "Best Mughal-themed wedding websites") for inbound traffic.
11. **Per-template demo videos** on the landing page (replace static images with looped MP4 walkthroughs).
12. **Mobile RSVP polish + skeletons** + accessibility audit.
13. **Multi-language support** (Hindi, Tamil, Bengali) for guest-facing pages.

## Next Tasks
- Replace placeholder WhatsApp number `+91 98765 43210` in `/app/frontend/components/ContactModal.js`
- Provide real Cloudinary `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET` in `/app/frontend/.env` (cloud name `dqnjsxtcl` retained from original; upload will 401 until keys are set)
- Pick which P0/P1/P2 items above to implement next
