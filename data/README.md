# `/data` — Hồng Hạc City Data Layer

Two coexisting layers — phân biệt rõ:

## Layer 1 — Verified facts (crawled reference data)

Đã có. Là raw facts verified từ 3 site tham chiếu chính thức.

```
data/
├── INDEX.md                              ← Map of all crawled facts + 17 spec corrections
├── honghacphumyhung/                     ← honghacphumyhung.vn (official CDT site)
│   ├── 01-homepage.md
│   ├── 02-ve-chung-toi.md                ← 7S framework chi tiết
│   ├── 03-tin-tuc.md                     ← News listing
│   ├── 04-lien-he.md
│   └── 05-article-standard-chartered.md  ← Financing structure verbatim
├── hongphat/
│   └── 01-overview.md                    ← 1.074 lots breakdown + 27 SKU codes
└── phumyhung/
    ├── 01-homepage.md
    ├── 02-gioi-thieu.md                  ← PMH founded 1993 + SOM credential
    └── 03-du-an-portfolio.md             ← 20 projects
```

**Đây là nguồn tham chiếu — KHÔNG phải runtime data.** Mọi claim trong `000-spec.md` truy được về 1 file ở đây.

---

## Layer 2 — Technical data layer (runtime / build artifacts)

Tầng kỹ thuật. Định nghĩa schema, geometry placeholders, SEO metadata templates, security config, map LOD constants.

```
data/
├── types/
│   └── honghac.ts                        ← Canonical TypeScript domain types
├── geometry/
│   ├── masterplan-197ha.geojson          ← 197ha boundary (PLACEHOLDER bbox)
│   ├── hong-phat-boundary.geojson        ← Subdivision boundary (PLACEHOLDER)
│   ├── hong-phat-lots-full.json          ← Skeleton cho 2830 polygons (EMPTY pending import)
│   └── hong-phat-lots-index.json         ← LOD-optimized index manifest
├── seo/
│   └── lot-seo-metadata.json             ← Template + sample cho programmatic 2830+ pages
├── security/
│   └── map-security-config.ts            ← 7-layer defense (signed URLs, precision, rate limit, canary, CSP, JWT)
└── constants/
    └── map-config.ts                     ← LOD rules + Macro/Micro mode logic
```

---

## Staging vs Official — distinction (CRITICAL)

| Aspect | Staging (`display_source: "internal"`) | Official (`display_source: "official"`) |
|---|---|---|
| Source | Batch `review_imported` / `geometry_verified` | CDT công bố qua 1/500 plan / API sync |
| Pháp lý | KHÔNG phải ranh thửa chính thức | Ranh thửa pháp lý chính thức |
| Listing trên UI | Polygon overlay mờ + tooltip "Thông tin tham khảo — chưa mở bán chính thức" | Hiển thị clear, full opacity |
| Click vào | Vẫn cho xem detail nhưng không cho generate offers/share-link | Full detail + offers + share-link |
| SEO indexability | `indexable: false` (noindex utility URL) | `indexable: true` nếu status !== "sold" |
| `last_official_sync` | `null` | ISO timestamp |
| Cache policy | `private, no-store` | Standard public/private theo auth tier |

---

## Import pipeline (when ready)

Hiện tại runtime project (localhost:3000) có **2830 polygons** staging via `/api/map/advisory-lots`. Import flow:

```
[runtime localhost:3000 /api/map/advisory-lots]
  ↓ fetch + dump
[data/geometry/hong-phat-lots-full.json]
  ↓ scripts/build-lots-index.mjs
[data/geometry/hong-phat-lots-index.json]
  ↓ payload/seed/003-lots-hong-phat.ts
[Postgres `lots` table]
  ↓ tippecanoe + PMTiles build
[public/tiles/hhc.v{YYYYMMDD}.pmtiles]
  ↓ scripts/generate-lot-seo.mjs
[2830+ programmatic SEO pages]
```

**Mỗi bước phải validate:**
- Geometry: SRID 4326, simple, non-self-intersecting, area sanity (10m² ≤ A ≤ 5000m²)
- Internal ID stable across imports (không regenerate ULID)
- SKU code matches one of 27 verified codes
- Canary lots filtered out of public outputs

---

## Current Status (2026-05-22)

| Artifact | State | Size | Records |
|---|---|---|---|
| `_raw-advisory-lots.geojson` | ✅ Imported | 1.86 MB | 2830 features (raw) |
| `hong-phat-lots-full.json` | ✅ Generated | 2.45 MB | 2449 lots (381 amenity excluded) |
| `hong-phat-lots-index.json` | ✅ Generated | 296 KB | 2449 entries (LOD-optimized, < 500KB budget) |
| `lot-seo-metadata.json` | ✅ Template + 5 samples | 23.9 KB | 0 pages emitted, 5 sample entries |
| `NUMBERING-SCHEME.md` | ✅ Locked | — | 4-tier scheme |
| `masterplan-197ha.geojson` | ⚠ PLACEHOLDER bbox | 1 KB | Pending 1/500 plan |
| `hong-phat-boundary.geojson` | ⚠ PLACEHOLDER bbox | 1 KB | Pending 1/500 plan |
| `types/honghac.ts` | ✅ Production | — | Canonical TS interfaces |
| `constants/map-config.ts` | ✅ Production | — | 5-LOD rules + Macro/Micro |
| `security/map-security-config.ts` | ✅ Production | — | 7-layer defense policy |
| `scripts/derive-lot-codes.ts` | ✅ Production | — | 4-tier derivation utilities (runtime) |
| `scripts/build-lots-index.mjs` | ✅ Production | — | Node ESM index builder (20ms / 2449 lots) |
| `scripts/_build-lots-from-raw.py` | ✅ One-shot | — | Initial import (already run; archived) |
| `scripts/_build-seo-metadata.py` | ✅ One-shot | — | SEO template generator (already run; archived) |

### Composition of the 2449 lots (verified facts)

**By status:**
- 1489 available (60.8%)
- 444 reserved (18.1%)
- 516 sold (21.1%)

**By kind (heuristic inference from area + frontage):**
- 1380 townhouse-compact (<200m²)
- 469 townhouse (200–336m²)
- 268 villa-song-lap (200–290m² wide frontage)
- 187 shophouse (≥336m²)
- 145 villa-don-lap (290–420m² with frontage ≥12m)

**By legacy subZone:**
- 846 in f2-2
- 615 in h1-3
- 465 in gcx2
- 273 in h2-3
- 250 in hong-phat

### Currently indexable for SEO

**0 lots.** All 2449 entries are `listing=staging`, `display_source=internal`. Indexability gate flips only when:
- CDT 1/500 plan delivered → polygon verified → `display_source=official`
- Phase status moves to `open` → `listing=public`
- Status ≠ `sold` (sold lots become noindex after 90 days)

Expected indexable count after CDT publishes Hồng Phát Phase 1: ~250–500 lots initially (the 250 `subZone=hong-phat` tagged + subset of others as phase opens).

---

## Migration Steps

### Phase A — Today (DONE)
- [x] Crawl 2830 polygons from runtime `/tiles/advisory-lots.geojson`
- [x] Generate `hong-phat-lots-full.json` with 4-tier numbering applied
- [x] Generate `hong-phat-lots-index.json` (LOD manifest)
- [x] Generate 5 SEO sample entries to validate template
- [x] Document numbering scheme + verification gaps

### Phase B — Next 1–2 days
- [ ] Confirm block → subdivision mapping with CDT (h1-3, f2-2, gcx2 → ?)
- [ ] Receive 1/500 plan PDF + extract verified polygon geometry
- [ ] Re-run `_build-lots-from-raw.py` against canonical coordinates (currently offset `+194m E, −114m N`)
- [ ] Filter canary lots and add 5 canary entries with `internal_id` prefix `cn-hhc-`
- [ ] Seed Payload Postgres `lots` collection via `payload/seed/003-lots-hong-phat.ts`

### Phase C — Tech infrastructure (1 week)
- [ ] Build PMTiles archive `hhc.v{YYYYMMDD}.pmtiles` via tippecanoe from full.json
- [ ] Implement `/api/map/manifest`, `/api/map/tile/[z]/[x]/[y]`, `/api/map/lot/[id]` per security config
- [ ] Mount MapLibre `<MapCanvas>` with 5-LOD layer rules from `constants/map-config.ts`
- [ ] Write `scripts/generate-lot-seo.mjs` → emit 2449 MDX or Payload Pages records
- [ ] Activate `0 3 * * 1` cron for canary detection

### Phase D — CDT data sync (2–4 weeks, dep. on CDT)
- [ ] Cross-reference each polygon with official 1/500 boundary
- [ ] For matched: flip `display_source=internal → official`, `last_official_sync=<timestamp>`
- [ ] Re-generate public_code for any block renames; emit 301 redirects in `lot_url_aliases`
- [ ] Populate `official_lot_code` when sales contract codes available

### Phase E — Public launch
- [ ] Phase status `announced → open` for Hồng Phát tiểu khu 1
- [ ] Lots in opened phase flip `listing=staging → public`
- [ ] Regenerate sitemap-sa-ban.xml; submit to GSC
- [ ] Monitor: indexed pages count, lot popover open rate, AI Matching usage

---

## Files explicitly marked PLACEHOLDER

Theo nguyên tắc "không bịa tọa độ":

| File | What's placeholder | What needs official data |
|---|---|---|
| `geometry/masterplan-197ha.geojson` | 4-corner bbox (from public Google Maps link) | Real irregular polygon từ 1/500 plan (20-50 vertices expected) |
| `geometry/hong-phat-boundary.geojson` | 4-corner bbox approximation | Real subdivision boundary |
| `geometry/hong-phat-lots-full.json` | 2 sample lots with marked `_placeholder: true` coords | Full 2830 polygons từ advisory-manifest / API |
| `geometry/hong-phat-lots-index.json` | Empty lots array, bbox approximate | Generated từ full.json by build script |
| `constants/map-config.ts → HHC_MASTERPLAN_BBOX` | `verification_status: 'approximate-bbox-from-public-maps-link'` | Replace with verified after 1/500 plan |
| `constants/map-config.ts → SUBDIVISION_BBOX` | All 3 marked `verification_status: 'approximate'` | Replace when CDT delivers polygons |

---

## Files that are PRODUCTION-READY

These contain logic only — no fabricated coordinates:

- `types/honghac.ts` — TypeScript interfaces, enums, SKU code template literal types
- `constants/map-config.ts` — LOD rules, mode transitions, themes (logic-only — bboxes marked separately)
- `security/map-security-config.ts` — 7-layer security policy as TypeScript constants
- `seo/lot-seo-metadata.json` — templates, schemas, generation pipeline definition (data array empty)
