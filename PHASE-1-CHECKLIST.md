# Phase 1 Preparation Checklist

## Pre-Phase 1 Sign-Off

Before starting Phase 1 (Core Map & Interactive Foundation), verify:

### Environment & Infrastructure
- [ ] Neon Postgres connection string validated in `.env.local`
- [ ] Firebase Firestore project created + config added to `.env.local`
- [ ] Cloudflare R2 bucket created for PMTiles + CDN configured
- [ ] Turnstile site key + secret obtained from Cloudflare
- [ ] Telegram bot token + chat IDs configured
- [ ] MapLibre GL style JSON files ready (day/dusk/aerial)

### Lot Data Preparation
- [ ] `data/geometry/hong-phat-lots-full.json` verified (1.074 lots, GeoJSON format)
- [ ] `data/constants/phasing.ts` populated with phase schedule + financing terms
- [ ] `data/types/honghac.ts` extended with LotEnriched interface (if needed)
- [ ] Lot SKU code mapping finalized (27 codes per spec)

### Design Assets
- [ ] Hero video poster image (`public/images/hero-video-poster.jpg`)
- [ ] Logo SVG finalized (`public/images/logo.svg`)
- [ ] MapLibre GL style JSON files prepared
- [ ] OG image ready (`https://bacninhhonghaccity.vn/og-image.jpg`)

### Database Schema
- [ ] Neon: `lots` table schema designed (id, internal_id, geometry, phase, status, area, orientation, etc.)
- [ ] Neon: `phases` table schema designed (phase_id, name, launch_date, units, status)
- [ ] Firestore: `leads` collection structure designed (lead_id, user_id, lots, score, events)
- [ ] Firestore: `lot_status_updates` listener topic defined

### Dependencies (to install in Phase 1)
```bash
npm install maplibre-gl pmtiles
npm install --save-dev @types/maplibre-gl
npm install firebase firebase-admin
npm install recharts  # for charts (Phase 3)
npm install axios     # for HTTP client
npm install zod       # for validation
```

### API Routes (stub structure ready)
- [ ] `/api/map/advisory-lots` (GET) — returns manifest
- [ ] `/api/map/lot-detail` (GET) — returns LotEnriched
- [ ] `/api/map/matching` (POST) — placeholder for AI
- [ ] `/api/leads/soft-lead` (POST) — watchlist
- [ ] `/api/leads/financial-lead` (POST) — calc results
- [ ] `/api/leads/advisory-lead` (POST) — form submission

### Component Structure (folders created)
- [ ] `components/map/` — MapContainer, MapTiles, FilterRail, LotPopover
- [ ] `components/leads/` — WatchlistButton, FinancialCalculator, AdvisoryForm
- [ ] `lib/map/` — lod-engine, pmtiles-adapter, matching-engine
- [ ] `lib/leads/` — lead-scoring, crm-sync, telegram-notifier

### Git & CI/CD
- [ ] Branch protection rules on `main` (require PR review)
- [ ] GitHub Actions workflow template ready for lint + typecheck + build
- [ ] Vercel deployment configured (branch: `hong-hac-city-platform`)

### Performance Baseline
- [ ] Lighthouse audit run on `/` page (target: >90 score)
- [ ] Core Web Vitals measured (LCP, INP, CLS)
- [ ] Bundle size check: main JS chunk <150KB

### Documentation
- [ ] README updated with Phase 1 instructions
- [ ] API documentation started (readme in `/api`)
- [ ] Component storybook plan (optional: Storybook setup)

## Phase 1 Success Criteria (End of Week 5)

- [ ] `/sa-ban` page loads < 2s on desktop
- [ ] Map renders all 1.074 lots without lag (60fps)
- [ ] Filter Rail updates lot count in <500ms
- [ ] Popover displays in <200ms after click
- [ ] Mobile responsiveness verified (filter drawer + bottom sheet)
- [ ] No console errors or type errors (`npm run typecheck` passes)
- [ ] Build succeeds: `npm run build`

## Deployment Readiness

### Pre-Deployment (Phase 1 end)
- [ ] All environment variables documented in `.env.example`
- [ ] Error handling + retry logic for external APIs
- [ ] Rate limiting configured on map endpoints
- [ ] Sentry DSN configured (error reporting)
- [ ] GA4 tag manager ready (will enable in Phase 5)

### Vercel Deployment
- [ ] `vercel.json` configured (if needed)
- [ ] Edge Config setup for feature flags
- [ ] ISR revalidation strategy tested
- [ ] Preview deployment successful

---

**Checklist Status:** Ready for Phase 1 kickoff  
**Last Updated:** 2026-05-22  
**Owner:** Development team / v0
