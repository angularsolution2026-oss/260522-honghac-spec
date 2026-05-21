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
