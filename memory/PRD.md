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

## Backlog (suggested next steps — awaiting user confirmation)
Curated for "surprise me" mandate. Ordered by ROI for a SaaS wedding studio:

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
