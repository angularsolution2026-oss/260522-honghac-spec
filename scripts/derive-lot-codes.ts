/**
 * Lot Code Derivation — pure TS utilities
 *
 * Implements the 4-tier numbering scheme from data/geometry/NUMBERING-SCHEME.md
 *   Tier 0 internal_id   = lot_NNNNN (immutable PK)
 *   Tier 1 public_code   = {sub}/{block}-{row}-{lot} (SEO URL slug)
 *   Tier 2 display_label = localized UI badge (vi + en)
 *   Tier 3 official_code = CDT-assigned (handled elsewhere)
 *
 * Pure functions — no side effects, deterministic. Safe to import from build
 * scripts (Node), Payload hooks (Next.js runtime), or unit tests (vitest).
 */

import type { SubdivisionId } from '../data/types/honghac';

// ─────────────────────────────────────────────────────────────────────────────
// SubZone → subdivision mapping
//
// Provisional — confirm với CDT 1/500 plan. Current data has 6 subZones,
// all live within the Hồng Hạc City master plan footprint, but only
// "hong-phat" is officially tagged. Other 5 are legacy block names.
// Until verified, route all to 'hong-phat' (the only currently-launched phase).
// ─────────────────────────────────────────────────────────────────────────────

export const SUBZONE_TO_SUBDIVISION: Record<string, SubdivisionId> = {
  'hong-phat': 'hong-phat',
  'h2-3':      'hong-phat',
  'h1-3':      'hong-phat',  // TODO: verify — may be Hồng Thịnh (H1 prefix)
  'f2-2':      'hong-phat',  // TODO: verify
  'gcx2':      'hong-phat',  // TODO: verify (G* may be Hồng Phúc)
  'project':   'hong-phat',  // amenity — handled separately (excluded from lot pages)
};

export function subdivisionOf(subZone: string): SubdivisionId {
  return SUBZONE_TO_SUBDIVISION[subZone] ?? 'hong-phat';
}

// ─────────────────────────────────────────────────────────────────────────────
// Tier 0 — internal_id derivation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns existing lot_NNNNN if legacy code matches the pattern.
 * Otherwise emits next sequential ID from counter.
 *
 * Caller maintains the counter to ensure no collisions during a full re-import.
 */
export function deriveInternalId(args: {
  legacyCode: string;
  legacyFeatureId: string;
  counter: { next: number };  // mutable — incremented when fresh ID issued
}): string {
  // Pattern A: legacy code already lot_NNNNN — keep as-is
  const m = args.legacyCode.match(/^lot_(\d{5})$/);
  if (m) return args.legacyCode;

  // Pattern B: legacyFeatureId encodes a lot_NNNNN — extract
  const m2 = args.legacyFeatureId.match(/lot_(\d{5})/);
  if (m2) return `lot_${m2[1]}`;

  // Pattern C: no numeric ID found — emit next sequential
  const id = `lot_${String(args.counter.next).padStart(5, '0')}`;
  args.counter.next += 1;
  return id;
}

// ─────────────────────────────────────────────────────────────────────────────
// Tier 1 — public_code derivation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Derives SEO-friendly URL slug from legacy lot code.
 *
 * Pattern A (preferred): legacyCode follows {Letter}n.n.{letter}.n structure
 *   "H2.3.A.16"  → "hong-phat/h2-3-a-16"
 *   "G2.3.a.11"  → "hong-phat/g2-3-a-11"  (case-normalized)
 *   "F2.2.b.13"  → "hong-phat/f2-2-b-13"
 *
 * Pattern B: legacyCode is {Letter}{Number}.{Number} (no row)
 *   "FCX2.30"    → "hong-phat/fcx2-30"
 *   "GCX3.8"     → "hong-phat/gcx3-8"
 *
 * Pattern C: legacyCode is lot_NNNNN — derive from subZone + sequence
 *   subZone="f2-2", sequenceInSubZone=42  → "hong-phat/f2-2-042"
 *
 * Pattern D: garbage codes ("g", "AO", "DC-18") — fall back to subZone+sequence
 *   (also covers anything not matching A/B/C)
 */
export function derivePublicCode(args: {
  subdivision: SubdivisionId;
  legacyCode: string;
  subZone: string;
  sequenceInSubZone: number;
}): string {
  const sub = args.subdivision;
  const code = args.legacyCode.trim();

  // Pattern A — full {Letter}n.n.{letter}.n
  const ma = code.match(/^([A-Za-z]+\d+)\.(\d+)\.([A-Za-z])\.(\d+)$/);
  if (ma) {
    const [, block, blockSub, row, lot] = ma;
    return `${sub}/${block.toLowerCase()}-${blockSub}-${row.toLowerCase()}-${lot}`;
  }

  // Pattern B — {Letter+Number}.{Number} (no row letter)
  const mb = code.match(/^([A-Za-z]+\d+)\.(\d+)$/);
  if (mb) {
    const [, block, lot] = mb;
    return `${sub}/${block.toLowerCase()}-${lot}`;
  }

  // Pattern C/D — fallback to subZone + sequence
  const seq = String(args.sequenceInSubZone).padStart(3, '0');
  return `${sub}/${args.subZone}-${seq}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Tier 2 — display_label (localized UI badge)
// ─────────────────────────────────────────────────────────────────────────────

const SUBDIVISION_LABEL: Record<SubdivisionId, { vi: string; en: string }> = {
  'hong-phat':  { vi: 'Hồng Phát',  en: 'Hong Phat' },
  'hong-thinh': { vi: 'Hồng Thịnh', en: 'Hong Thinh' },
  'hong-phuc':  { vi: 'Hồng Phúc',  en: 'Hong Phuc' },
};

export function deriveDisplayLabel(args: {
  subdivision: SubdivisionId;
  publicCode: string;       // e.g. "hong-phat/h2-3-a-16" or "hong-phat/f2-2-042"
}): { vi: string; en: string } {
  const subLabel = SUBDIVISION_LABEL[args.subdivision];
  const localPart = args.publicCode.split('/')[1] ?? args.publicCode;
  const parts = localPart.split('-');

  // 4 parts → block-sub-row-lot (Pattern A)
  if (parts.length === 4) {
    const [block, sub, row, lot] = parts;
    return {
      vi: `Lô ${block.toUpperCase()}-${sub} · Hàng ${row.toUpperCase()} · Số ${lot} — ${subLabel.vi}`,
      en: `Lot ${block.toUpperCase()}-${sub} · Row ${row.toUpperCase()} · #${lot} — ${subLabel.en}`,
    };
  }

  // 2 parts → block-lot (Pattern B)
  if (parts.length === 2) {
    const [block, lot] = parts;
    return {
      vi: `Lô ${block.toUpperCase()} · Số ${lot} — ${subLabel.vi}`,
      en: `Lot ${block.toUpperCase()} · #${lot} — ${subLabel.en}`,
    };
  }

  // 3 parts → likely subZone-NNN sequence fallback
  if (parts.length === 3) {
    const [a, b, seq] = parts;
    return {
      vi: `Lô ${a.toUpperCase()}-${b} · Vị trí ${seq} — ${subLabel.vi}`,
      en: `Lot ${a.toUpperCase()}-${b} · Position ${seq} — ${subLabel.en}`,
    };
  }

  // Unknown — render the raw
  return {
    vi: `Lô ${localPart} — ${subLabel.vi}`,
    en: `Lot ${localPart} — ${subLabel.en}`,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Kind inference from area + frontage
//
// Verified ranges from official Hồng Phát product spec:
//   townhouse:        295.87 – 336.01 m²  (frontage ~6m)
//   shophouse:        382.22 – 775.36 m²  (frontage 6-10m, corner lots wider)
//   villa song lập:   256.12 – 284.53 m²
//   villa đơn lập:    325.06 – 418.38 m²
//
// Current dataset includes smaller lots (down to ~105m²) — likely staging
// includes future phases or non-residential. Conservative banding:
// ─────────────────────────────────────────────────────────────────────────────

export type LotKind =
  | 'townhouse-compact' // <200m² (staging/future)
  | 'townhouse'         // 200-336
  | 'villa-song-lap'    // 256-285 (overlaps townhouse; use frontage to disambiguate)
  | 'shophouse'         // 336-775
  | 'villa-don-lap'     // 325-418
  | 'unclassified';

export function inferKind(args: { areaM2: number; frontageM: number }): LotKind {
  const { areaM2: a, frontageM: f } = args;
  if (a < 200) return 'townhouse-compact';
  if (a >= 200 && a < 290) {
    // Frontage > 8 → song lập; otherwise townhouse
    return f >= 8 ? 'villa-song-lap' : 'townhouse';
  }
  if (a >= 290 && a < 336) return 'townhouse';
  if (a >= 336 && a < 420) {
    return f >= 12 ? 'villa-don-lap' : 'shophouse';
  }
  if (a >= 420) return 'shophouse';
  return 'unclassified';
}

// ─────────────────────────────────────────────────────────────────────────────
// Orientation from heading degrees
// ─────────────────────────────────────────────────────────────────────────────

export type Orientation = 'N'|'NE'|'E'|'SE'|'S'|'SW'|'W'|'NW';

export function orientationOf(deg: number): Orientation {
  const d = ((deg % 360) + 360) % 360;
  if (d < 22.5  || d >= 337.5) return 'N';
  if (d < 67.5)  return 'NE';
  if (d < 112.5) return 'E';
  if (d < 157.5) return 'SE';
  if (d < 202.5) return 'S';
  if (d < 247.5) return 'SW';
  if (d < 292.5) return 'W';
  return 'NW';
}

// ─────────────────────────────────────────────────────────────────────────────
// SEO tags — heuristic from available signals (area, frontage, direction).
// Real lifestyle scores (privacy/greenery/sunlight) require GIS analysis;
// for staging dataset we emit conservative best-effort tags.
// ─────────────────────────────────────────────────────────────────────────────

export function deriveTags(args: {
  areaM2: number;
  frontageM: number;
  directionDeg: number;
  status: 'available' | 'reserved' | 'sold';
  subZone: string;
}): string[] {
  const tags: string[] = [];

  // Area buckets
  if (args.areaM2 < 200) tags.push('compact');
  else if (args.areaM2 < 300) tags.push('medium');
  else if (args.areaM2 < 450) tags.push('large');
  else tags.push('extra-large');

  // Frontage buckets
  if (args.frontageM >= 10) tags.push('wide-frontage');
  if (args.frontageM >= 15) tags.push('villa-grade-frontage');

  // Orientation
  const o = orientationOf(args.directionDeg);
  tags.push(`face-${o.toLowerCase()}`);

  // Favourable orientations in VN feng-shui: S, SE, SW
  if (['S', 'SE', 'SW'].includes(o)) tags.push('huong-tot');

  // Status
  tags.push(`status-${args.status}`);

  // Kind hint
  const kind = inferKind({ areaM2: args.areaM2, frontageM: args.frontageM });
  tags.push(`kind-${kind}`);

  // Block tag (for SEO clustering)
  tags.push(`block-${args.subZone}`);

  return tags;
}

// ─────────────────────────────────────────────────────────────────────────────
// Status normalization
// ─────────────────────────────────────────────────────────────────────────────

export type LotStatus = 'available' | 'reserved' | 'sold';

export function normalizeStatus(s: string | undefined): LotStatus {
  if (s === 'sold' || s === 'reserved' || s === 'available') return s;
  return 'available'; // conservative default
}

// ─────────────────────────────────────────────────────────────────────────────
// Centroid from polygon (planar approximation — fine for HHC's small footprint)
// ─────────────────────────────────────────────────────────────────────────────

export function centroidOf(polygon: { coordinates: number[][][] }): [number, number] {
  const ring = polygon.coordinates[0];
  let sx = 0, sy = 0, n = 0;
  // Skip last vertex (closes ring, equals first)
  for (let i = 0; i < ring.length - 1; i++) {
    sx += ring[i][0];
    sy += ring[i][1];
    n += 1;
  }
  return [sx / n, sy / n];
}
