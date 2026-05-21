/**
 * Hồng Hạc City — Canonical Domain Types
 *
 * Source of truth cho data layer. Mọi component, API route, và Payload CMS
 * collection PHẢI import từ đây — không redeclare.
 *
 * Hai trạng thái dữ liệu được phân tách rõ:
 *   - "internal" (staging): polygon từ batch review_imported / geometry_verified.
 *                            KHÔNG phải ranh thửa pháp lý. KHÔNG phải tồn kho chính thức.
 *   - "official":             dữ liệu được CDT (Phú Mỹ Hưng × Nomura) công bố/đồng bộ.
 */

import type { Feature, FeatureCollection, Polygon, Point } from 'geojson';

// ─────────────────────────────────────────────────────────────────────────────
// Core enums & primitives
// ─────────────────────────────────────────────────────────────────────────────

export type SubdivisionId = 'hong-phat' | 'hong-thinh' | 'hong-phuc';

export type LotStatus = 'available' | 'reserved' | 'sold';

export type DisplaySource = 'internal' | 'official';

export type LotKind = 'villa-don-lap' | 'villa-song-lap' | 'shophouse' | 'townhouse';

export type LotOrientation =
  | 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';

/**
 * 27 SKU codes verified from official Hồng Phát detail page.
 * Format: VILLA-{A|A1|B|C|D}[-M] | SD-{A|B}[-M] | SH-{A|A1-A4|A-G1|A-G1.1|A-G2|B|B1|B-G1|B-G2|C}[-M] | TH-{A|A1|A2|A-G1|A-G2|B|B-G2}[-M]
 * Suffix "-M" = mirrored variant.
 */
export type LotSkuCode =
  | `VILLA-${'A' | 'A1' | 'B' | 'C' | 'D'}${'' | '-M'}`
  | `SD-${'A' | 'B'}${'' | '-M'}`
  | `SH-${'A' | 'A1' | 'A2' | 'A3' | 'A4' | 'A-G1' | 'A-G1.1' | 'A-G2' | 'B' | 'B1' | 'B-G1' | 'B-G2' | 'C'}${'' | '-M'}`
  | `TH-${'A' | 'A1' | 'A2' | 'A-G1' | 'A-G2' | 'B' | 'B-G2'}${'' | '-M'}`;

// ─────────────────────────────────────────────────────────────────────────────
// Lot — interface bắt buộc (theo spec người dùng), mở rộng tối thiểu cần thiết
// ─────────────────────────────────────────────────────────────────────────────

export interface Lot {
  /** ID nội bộ, cố định suốt vòng đời. KHÔNG đổi khi CDT đổi mã chính thức. */
  internal_id: string;

  /** Mã lô chính thức từ CDT (vd "HP-A-12"). null nếu chưa được sync. */
  official_lot_code: string | null;

  /** Polygon hiện đang render trên map. Source quyết định bởi display_source. */
  current_geometry: Polygon;

  /** Polygon chính thức từ CDT (nếu đã sync). Optional. */
  official_geometry?: Polygon;

  /** Cho biết current_geometry đến từ đâu. */
  display_source: DisplaySource;

  /** Timestamp lần cuối sync với CDT. null nếu chưa từng sync. */
  last_official_sync: Date | null;

  /** Phase ID (vd "hp-2026-q4"). */
  phase: string;

  /** Trạng thái bán hàng. */
  status: LotStatus;

  /** Diện tích m². */
  area_m2: number;
}

/**
 * LotEnriched — Lot + metadata cần để render UI và generate SEO pages.
 * Dùng cho /api/map/advisory-lots response và Postgres `lots` table.
 */
export interface LotEnriched extends Lot {
  subdivision: SubdivisionId;
  sku: LotSkuCode;
  kind: LotKind;
  centroid: Point;
  orientation: LotOrientation;
  frontage_m: number;
  area_label: string;              // "300m²" precomputed for SEO/UI
  is_corner_lot: boolean;
  is_park_facing: boolean;
  is_water_facing: boolean;
  privacy_score: number;           // 0-100
  greenery_score: number;          // 0-100
  sunlight_score: number;          // 0-100
  park_distance_m: number;
  price_indicative_vnd: number | null;  // null until CDT publishes
  /** Trạng thái niêm yết public. Lot có status="available" nhưng listing="staging" → hiển thị mờ + ghi chú. */
  listing: 'staging' | 'public';
  updated_at: string;              // ISO 8601
}

// ─────────────────────────────────────────────────────────────────────────────
// Phase & Subdivision
// ─────────────────────────────────────────────────────────────────────────────

export interface Phase {
  id: string;
  subdivision: SubdivisionId;
  name: string;
  status: 'draft' | 'announced' | 'open' | 'closing' | 'closed';
  start_at: string;
  end_at: string | null;
  total_lots: number;
  available_lots: number;
  price_range_vnd: { min: number; max: number } | null;
  geometry: Polygon;
  description: string;
}

export interface Subdivision {
  id: SubdivisionId;
  name: string;
  tagline: string;
  total_products_planned: number;
  build_density_pct: number;
  geometry: Polygon;
  description: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// SEO metadata (used to generate 2830+ programmatic pages)
// ─────────────────────────────────────────────────────────────────────────────

export interface LotSeoMetadata {
  internal_id: string;
  slug: string;                    // /sa-ban/hong-phat/lo/{slug}
  canonical_url: string;
  indexable: boolean;              // true ONLY when listing="public" AND status != "sold"

  title: string;                   // ≤ 60 chars
  description: string;             // ≤ 155 chars
  h1: string;
  og_image_url: string;

  primary_keyword: string;
  secondary_keywords: string[];
  long_tail_keywords: string[];    // generated via template — see /data/seo/keyword-templates.md

  jsonld: Record<string, unknown>; // RealEstateListing or Product schema
  breadcrumbs: Array<{ name: string; url: string }>;

  internal_links: Array<{ url: string; anchor: string; priority: 'P0' | 'P1' | 'P2' }>;

  body_blocks: Array<
    | { kind: 'specs'; data: Pick<LotEnriched, 'area_m2' | 'frontage_m' | 'orientation' | 'kind' | 'sku'> }
    | { kind: 'location'; nearby_amenities: Array<{ name: string; distance_m: number }> }
    | { kind: 'lifestyle_match'; personas: Array<'gia-dinh' | 'dau-tu' | 'o-thuc' | 'nghi-duong'> }
    | { kind: 'financing'; ltv_max: number; promo_months: number }
    | { kind: 'evidence'; doc_kinds: Array<'so-hong' | 'quy-hoach-1-500' | 'gpxd'> }
  >;

  last_generated_at: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Map Level-of-Detail (LOD) system
// ─────────────────────────────────────────────────────────────────────────────

export type LodLevel = 'macro-far' | 'macro-mid' | 'macro-close' | 'micro' | 'micro-extreme';

export interface LodRule {
  level: LodLevel;
  zoom_min: number;
  zoom_max: number;
  layers_visible: string[];
  lot_render_mode: 'hidden' | 'dot' | 'simplified-polygon' | 'full-polygon';
  /** Khi true: lot có listing="staging" được phủ overlay mờ + tooltip "Thông tin tham khảo — chưa mở bán chính thức". */
  staging_dimming: boolean;
}

export type MapMode = 'macro' | 'micro';

export interface MapModeTransition {
  /** Trigger zoom level vào Micro. Dưới mức này → Macro. */
  enter_micro_zoom: number;
  /** Bbox phải bao trùm < N% diện tích Hồng Phát thì enter Micro. */
  enter_micro_bbox_coverage_pct: number;
  /** Camera bay mất bao lâu khi switch mode. */
  transition_duration_ms: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// AI Matching (Micro mode spotlight)
// ─────────────────────────────────────────────────────────────────────────────

export interface MatchingCriteria {
  budget_vnd: { min: number; max: number };
  birth_year: number | null;
  intent: 'o-thuc' | 'dau-tu' | 'gia-dinh' | 'nghi-duong';
  preferences: Array<
    | 'yen-tinh'
    | 'view-cong-vien'
    | 'lo-goc'
    | 'gan-mat-nuoc'
    | 'gan-truong'
    | 'huong-mat-troi'
  >;
}

export interface MatchingResult {
  lot: LotEnriched;
  score: number;                   // 0-100
  reasons: Array<{ key: string; label: string; weight: number }>;
  rank: number;                    // 1-5 for spotlight
}

// ─────────────────────────────────────────────────────────────────────────────
// Tile manifest (lightweight LOD index served at /tiles/advisory-manifest.json)
// ─────────────────────────────────────────────────────────────────────────────

export interface LotIndexEntry {
  internal_id: string;
  subdivision: SubdivisionId;
  phase: string;
  kind: LotKind;
  /** Centroid [lng, lat] — đủ cho dot rendering ở macro-close. */
  c: [number, number];
  /** Bbox compact [west, south, east, north] — đủ cho culling. */
  b: [number, number, number, number];
  /** Status + listing rút gọn 2 chars: "as" = available+staging, "ap" = available+public, "rs/rp", "ss/sp". */
  s: string;
  area: number;
}

export interface AdvisoryManifest {
  generated_at: string;
  source: 'internal-staging' | 'official-sync';
  feature_count: number;
  bbox: [number, number, number, number];
  lots: LotIndexEntry[];
}

// ─────────────────────────────────────────────────────────────────────────────
// GeoJSON helpers (re-export for ergonomic imports)
// ─────────────────────────────────────────────────────────────────────────────

export type LotFeature = Feature<Polygon, LotEnriched>;
export type LotFeatureCollection = FeatureCollection<Polygon, LotEnriched>;
