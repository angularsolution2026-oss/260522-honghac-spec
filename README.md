# Hồng Hạc City — Decision Platform

**Status:** Phase 0 ✓ Foundation scaffolding complete

Interactive urban decision map & real estate development platform for **Hồng Hạc City** (197 hecta, Bắc Ninh). Built with Next.js 15, Tailwind CSS v4, MapLibre GL, and Firestore.

## Quick Start

```bash
npm install
npm run dev
# Open http://localhost:3000
```

## Architecture

### Tech Stack
- **Framework:** Next.js 15 (App Router, SSG/SSR/ISR)
- **Styling:** Tailwind CSS v4 + semantic design tokens (OKLCH color space)
- **Map Engine:** MapLibre GL JS + PMTiles (anti-scraping architecture)
- **Database:** Postgres (Neon) + Firestore (real-time leads)
- **Storage:** Cloudflare R2 / Vercel Blob
- **Auth:** Supabase Auth
- **CMS:** Payload CMS 3 (in Phase 1)

### Key Features (by Phase)

#### Phase 0: Foundation ✓
- [x] Next.js App Router scaffold
- [x] Tailwind CSS v4 + design tokens (11.1–11.3)
- [x] Semantic CSS variables (primary, accent, neutrals, spacing, radius)
- [x] Typography: Cormorant Garamond (serif) + Inter (sans)
- [x] Layout components: Header, Footer, DisambiguationBanner, BreadcrumbNav
- [x] Type definitions + environmental setup

#### Phase 1: Core Map (In Progress)
- [ ] MapContainer + LOD state machine
- [ ] 1.074 lots ingestion (Postgres)
- [ ] Filter Rail + real-time lot count
- [ ] Lot detail popover
- [ ] Firestore real-time sync

#### Phase 2: Lead Capture
- [ ] Watchlist system (IndexedDB)
- [ ] Financial Calculator component
- [ ] Advisory lead form (Turnstile)
- [ ] Lead scoring + CRM webhook
- [ ] Telegram hot-lead notifications

#### Phase 3: AI Matching + Lifestyle
- [ ] AI Matching Engine (27 SKU codes)
- [ ] Lifestyle exploration (`/phong-cach-song/*`)
- [ ] Micro-mode spotlight carousel

#### Phase 4: Content & Editorial
- [ ] Homepage (7–10 positions)
- [ ] Trust artifacts (`/phap-ly/*`)
- [ ] Investment thesis pages (`/tiem-nang/*`)
- [ ] Urban exploration (`/kham-pha-do-thi/*`)
- [ ] SEO programmatic cluster (2830 pages)

#### Phase 5: Analytics & Optimization
- [ ] GA4 + GTM setup
- [ ] Sentry error tracking
- [ ] Performance optimization (<1.8s LCP mobile)
- [ ] PDPL compliance
- [ ] Sitemap & crawlability

## File Structure

```
/vercel/share/v0-project/
├── app/                        # Next.js App Router
│   ├── layout.tsx             # Root layout + fonts + metadata
│   ├── page.tsx               # Homepage
│   ├── sa-ban/                # Map core product (Phase 1)
│   ├── api/                   # API routes
│   └── ...
├── components/
│   ├── layout/
│   │   ├── Header.tsx         # Sticky nav header
│   │   ├── Footer.tsx         # Footer with links
│   │   ├── DisambiguationBanner.tsx
│   │   └── BreadcrumbNav.tsx
│   ├── map/                   # MapLibre components (Phase 1)
│   ├── leads/                 # Lead capture (Phase 2)
│   └── ...
├── lib/
│   ├── map/
│   ├── leads/
│   └── ...
├── data/
│   ├── types/honghac.ts       # Domain model + 27 SKU codes
│   ├── constants/
│   ├── geometry/              # GeoJSON + KML
│   └── styles/                # MapLibre GL styles
├── styles/
│   └── globals.css            # Design tokens (section 11.1–11.3)
└── public/
    ├── tiles/
    └── images/
```

## Design System

### Colors (OKLCH)
- **Primary:** Dark luxury green (`#1a472a`)
- **Accent:** Gold (`#d4af37`)
- **Neutrals:** Warm whites to near-black
- See `styles/globals.css` for full token list

### Typography
- **Headings:** Cormorant Garamond (serif, elegant)
- **Body:** Inter (sans-serif, readable)
- **Mono:** Monaco / Menlo (code)

### Spacing
8px base unit (Tailwind default), mapped to semantic tokens in `tailwind.config.ts`.

## Environment Variables

See `.env.example` for required keys:
- `NEXT_PUBLIC_PMTILES_URL` — CDN URL for map tiles
- `NEXT_PUBLIC_FIREBASE_*` — Firebase config
- `NEON_DATABASE_URL` — Postgres connection
- `TURNSTILE_SECRET_KEY` — Cloudflare CAPTCHA
- `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID_*` — Lead notifications
- And more...

## Development

### Type Checking
```bash
npm run typecheck
```

### Building for Production
```bash
npm run build
npm run start
```

### Linting (if ESLint configured)
```bash
npm run lint
```

## Key Metrics (Target)

- **Homepage LCP:** ≤ 1.8s mobile 4G
- **INP:** ≤ 200ms
- **CLS:** ≤ 0.05
- **Soft Lead CR:** ≥ 8%
- **Advisory Lead CR:** ≥ 1.5%
- **Speed-to-Lead (hot):** ≤ 5 minutes

## Compliance

- **PDPL:** Privacy policy, cookie consent, data retention
- **SEO:** Canonical protection, robots.txt, sitemaps (5 files ≤ 500 URLs)
- **Security:** Anti-scraping via PMTiles + rate limiting + Turnstile

## References

- **Spec:** `000-spec.md` (full constitution)
- **System Context:** `system-role--context.md`

## Next Phase

**Phase 1:** MapLibre GL integration + lot ingestion (ETA: Week 3–5)
- PMTiles setup + LOD state machine
- Postgres schema + lot data
- Filter Rail + popover interactions

---

**Built with ❤️ by v0 for Hồng Hạc City**
