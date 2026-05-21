# Lot Numbering Scheme — 2830 Polygons

**Verified facts from `/tiles/advisory-lots.geojson` (1.86 MB, 2830 features):**

## Tình trạng thực tế

### Code format distribution (chaos)

| Style | Count | % | Example |
|---|---|---|---|
| `lot_NNNNN` | 2580 | 91.2% | `lot_00026` |
| `Hx.x.x.NN` legacy | 45 | 1.6% | `H2.3.A.16` |
| `{Letter}x.x.{a\|A}.x` mixed-case | ~150 | 5.3% | `G2.3.a.11`, `F2.3.A.5`, `g2.2.a.5` |
| `{Letter}CXn.NN` | ~20 | 0.7% | `FCX2.30`, `GCX3.8` |
| Amenity codes | ~5 | 0.2% | `DC-18`, `AO` |
| Placeholder garbage | ~5 | 0.2% | `g`, single letters |
| Unknown | 25 | 0.9% | — |

### SubZone distribution (6 unique, all mixed-style inside)

| subZone | Lots | available | sold | reserved | Notes |
|---|---|---|---|---|---|
| `f2-2` | 846 | 519 | 170 | 157 | Largest block — likely Hồng Phát phase 1 expansion |
| `h1-3` | 615 | 377 | 123 | 115 | |
| `gcx2` | 465 | 281 | 105 | 79 | Likely amenity/commercial block |
| `project` | 381 | 233 | 81 | 67 | **Suspect: amenity + roads + utility — not for sale** |
| `h2-3` | 273 | 164 | 63 | 46 | |
| `hong-phat` | 250 | 148 | 55 | 47 | **Only block already tagged with official subdivision name** |

### Real geographic bbox (CORRECTED — spec had wrong center)

```
west:   106.003255°
east:   106.024726°    → span 2,216m E-W
south:  21.007683°
north:  21.022656°     → span 1,662m N-S
center: [106.013990, 21.015170]  ← ACTUAL CENTER (spec said 106.0653, 21.0285 — WRONG)
```

Bbox area ~ 368 ha rectangular; project 197.76 ha = ~54% of bbox (rest = surrounding land, roads).

### Lot size distribution

```
min:  104.6 m²   (small townhouse)
p50:  180.9 m²   (typical townhouse)
p95:  440.0 m²
max:  598.2 m²   (largest villa)
```

→ Phần lớn là townhouse-sized; villa-don-lap (333–418m²) chỉ ở p90+.

---

## Khuyến nghị (4-tier scheme)

### Tier 0 — `internal_id` (永遠 immutable, PK)

**Format:** `lot_NNNNN` zero-padded 5 digits
**Range:** `lot_00001`..`lot_99999` (capacity for future expansion)
**Rule:** Generated once at first import. **Never re-numbered.** Even if lot deleted, ID retired (not reused).

**Source mapping for current 2830:**
- 2580 already have `lot_NNNNN` → keep as-is
- 250 với legacy `Hx.x.x.NN` style → assign new `lot_NNNNN` (continue sequence from 2581)
- Filter out 381 `subZone=project` (amenity/road) → NOT lots, mark `kind: 'amenity'` in separate table

**Used in:**
- Postgres `lots.internal_id` PK
- Firestore lot keys (`lots/{internal_id}`)
- Watchlist tokens
- Internal API references
- **NOT in URLs** (no semantic value for SEO)

### Tier 1 — `public_code` (SEO URL slug — Tier 1 chính thức)

**Format:** `{subdivision}/{block}-{row}-{lot}` slug
**Examples:**
- `hong-phat/h2-3-a-16` (slugified from `H2.3.A.16`)
- `hong-phat/f2-2-846` (when only sequence-in-block known)

**Generation rules:**
1. **If legacy code matches `[A-Z]\d+\.\d+\.[a-zA-Z]\.\d+`** (vd `H2.3.A.16`):
   → Slugify lowercase + dash: `h2-3-a-16`
2. **If legacy code is `lot_NNNNN`**: derive from `subZone + sequence-within-subZone`:
   → `f2-2-001`..`f2-2-846` (sorted by area or by import order)
3. **Always prefix subdivision** for URL hierarchy + SEO clarity
4. **Block name → subdivision mapping** (proposed — verify với CDT):
   ```
   subZone     →   subdivision      (proposed mapping)
   ───────────────────────────────────────────────────
   hong-phat   →   hong-phat        (already tagged)
   h2-3        →   hong-phat        (HP block 2-3)
   h1-3        →   hong-thinh?      (need CDT confirm — H1 = Hồng Thịnh?)
   f2-2        →   hong-phat?       (verify với 1/500 plan)
   gcx2        →   hong-phuc?       (G* = Greenery commercial? Need verify)
   project     →   <amenity>        (NOT subdivision — exclude from /sa-ban/[sub]/lo/)
   ```

**Used in:**
- URLs: `/sa-ban/hong-phat/lo/h2-3-a-16`
- Canonical tag (must be stable)
- Sitemap entries (~2830 - 381 amenity = ~2449 indexable lots)
- Internal anchor text

**Stable across lifecycle UNLESS:**
- CDT renames block → 301 redirect old → new + log in `lot_url_aliases` table
- Lot merged/split → new `public_code` issued, old → 410 Gone OR redirect to parent

### Tier 2 — `display_label` (UI badge, what users see)

**Format (localized):**
- VI: `Lô H2-3 / Hàng A / Số 16 — Hồng Phát`
- EN: `Lot H2-3 / Row A / Plot 16 — Hong Phat`

**Used in:**
- Map popover header
- Watchlist UI rows
- Email confirmations
- Brochure PDF lot list

**Computed from public_code** — never stored separately.

### Tier 3 — `official_code` (CDT-assigned legal, optional)

**Format:** TBD by Phú Mỹ Hưng × Nomura (likely contract-tied)
**Used to bridge:**
- Sales contract documents
- Sổ hồng paperwork
- Legal references on `/phap-ly/evidence/*`

**Storage:** `lots.official_code` (nullable). Link via `official_code → internal_id`.

**When set:**
- `display_source` flips `internal` → `official`
- Public_code may stay (if compatible) or get aliased

---

## So sánh với Cursor AI proposal (panel bên phải)

Cursor proposal | My delta | Reason |
|---|---|---|
| Tier 1 `lot_code` = `h2-3-a-16` | ✓ Agree on slug | Same |
| URL: `/sa-ban/[lot-code]` flat | ❌ Use `/sa-ban/{sub}/lo/[lot-code]` hierarchical | Better IA, breadcrumbs, sitemap segmentation |
| Default từ legacy_lot_code | ✓ Agree | Same |
| Fallback `hp-lot-00026` cho lots không có legacy | ❌ Use `hp/f2-2-NNN` instead | `lot-00026` looks like DB ID, no SEO value |
| `staging_id` composite + `legacy_feature_id` riêng | ✓ Agree | Defensive — keep traceability |
| Chỉ có 1 tier public | ❌ Need 4 tiers (internal/public/display/official) | Different lifetimes + use cases |

---

## Migration path

```
Phase 1 — Now (staging, không pháp lý):
  - All 2449 lots (excluding 381 amenity) get:
      internal_id      = generated (preserve existing lot_NNNNN where valid)
      public_code      = derived per rules above
      display_source   = "internal"
      listing          = "staging"
      indexable        = false (noindex utility URL)
  - URL accessible but noindex
  - Tooltip "Thông tin tham khảo — chưa mở bán chính thức"

Phase 2 — CDT 1/500 plan delivered:
  - Verify block→subdivision mapping
  - Cross-reference each polygon against official boundary
  - For matched: display_source="official", listing="public", indexable=true
  - For unmatched (geometry mismatch): flag for review, keep staging

Phase 3 — Per-phase sale launches:
  - phase.status="open" → all available lots in that phase become indexable
  - Sold lots: indexable=false after 90 days, redirect to /sa-ban/{sub}

Phase 4 — CDT official_code rollout:
  - Populate lots.official_code from contract data
  - If official_code differs from public_code: create url_alias, 301 redirect
```

---

## URL hierarchy (finalized)

```
/sa-ban                              — master sa bàn (all subdivisions)
/sa-ban/hong-phat                    — subdivision focus
/sa-ban/hong-phat/lo/h2-3-a-16       — single lot detail (indexable when public)
/sa-ban/hong-phat/lo/f2-2-846        — single lot (sequence-derived public_code)
/sa-ban/hong-thinh                   — announce-only (theo dõi phase)
/sa-ban/hong-phuc                    — announce-only
/sa-ban/he-sinh-thai-tien-ich        — amenity overlay (uses project subZone data)
```

Sitemap impact:
- ~2449 lot detail URLs (eligible for index)
- ~250 currently public-eligible (`hong-phat` subZone tagged + status=available)
- Remainder noindex utility URLs until phase opens

---

## What I need from CDT to finalize

1. **Block → subdivision mapping** — confirm `h2-3 → hong-phat`, `h1-3 → ?`, `f2-2 → ?`, `gcx2 → ?`
2. **1/500 plan PDF** — verify polygon geometry alignment + block names
3. **Coordinate epoch correction** — current data has offset `+194m Đông, −114m Bắc` per disclaimer. Need official transform to apply
4. **Official lot codes (when published)** — to populate Tier 3
5. **Confirmation of 381 `project` subZone** — assume amenity, but verify

---

## Implementation snippets

```ts
// lib/lots/code.ts

export function deriveInternalId(legacyCode: string, existingMap: Map<string, string>): string {
  // If legacy is already lot_NNNNN, reuse
  if (/^lot_\d{5}$/.test(legacyCode) && existingMap.has(legacyCode)) {
    return legacyCode;
  }
  // Otherwise assign next sequential
  const max = Math.max(0, ...[...existingMap.values()]
    .map(v => parseInt(v.replace('lot_',''),10))
    .filter(n => !isNaN(n)));
  return `lot_${String(max + 1).padStart(5, '0')}`;
}

export function derivePublicCode(opts: {
  subdivision: SubdivisionId;
  legacyCode: string;
  subZone: string;
  sequenceInSubZone: number;
}): string {
  // Pattern A: legacy has block-row-lot structure
  const m = opts.legacyCode.match(/^([A-Z]\d+)\.(\d+)\.([a-zA-Z])\.(\d+)$/i);
  if (m) {
    const [, block, sub, row, lot] = m;
    return `${opts.subdivision}/${block.toLowerCase()}-${sub}-${row.toLowerCase()}-${lot}`;
  }
  // Pattern B: legacy is lot_NNNNN — derive from subZone + sequence
  return `${opts.subdivision}/${opts.subZone}-${String(opts.sequenceInSubZone).padStart(3,'0')}`;
}

export function deriveDisplayLabel(publicCode: string, locale: 'vi'|'en'): string {
  const parts = publicCode.split('/').pop()!.split('-');
  if (parts.length === 4) {
    const [block, sub, row, lot] = parts;
    return locale === 'vi'
      ? `Lô ${block.toUpperCase()}-${sub} / Hàng ${row.toUpperCase()} / Số ${lot}`
      : `Lot ${block.toUpperCase()}-${sub} / Row ${row.toUpperCase()} / Plot ${lot}`;
  }
  // Sequence-based fallback
  return locale === 'vi' ? `Lô #${parts.join('-')}` : `Lot #${parts.join('-')}`;
}
```

---

**TL;DR — chốt với CDT:**

> "2830 polygon → loại 381 amenity (`subZone=project`) còn 2449 lot. Mỗi lot có 4 ID:
> (1) `lot_NNNNN` immutable PK,
> (2) `{sub}/{block}-{row}-{lot}` SEO URL slug,
> (3) display label `Lô H2-3 / Hàng A / Số 16 — Hồng Phát` cho UI,
> (4) `official_code` từ CDT cho legal — nullable cho đến khi CDT cấp.
> URL public bật indexable chỉ khi `listing=public` AND `status≠sold` AND `display_source=official`."
