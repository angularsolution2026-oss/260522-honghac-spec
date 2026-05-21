/**
 * Map Configuration — LOD + Macro/Micro mode logic
 *
 * Quy tắc:
 *   - 5 LOD levels mapping zoom 0-22 → layer visibility + lot render mode
 *   - 2 modes (macro|micro) auto-switch dựa trên (zoom, bbox-coverage, focus-subdivision)
 *   - Staging lots dimmed ở mọi level — chỉ public lots hiển thị clear
 */

import type { LodRule, LodLevel, MapMode, MapModeTransition, SubdivisionId } from '../types/honghac';

// ─────────────────────────────────────────────────────────────────────────────
// Master plan bbox (approximate, derived from Google Maps link on official site)
// Verify against 1/500 plan khi CDT cấp PDF.
// Source link: https://maps.app.goo.gl/gmdHomzDsijESLSS7
// ─────────────────────────────────────────────────────────────────────────────

export const HHC_MASTERPLAN_BBOX = {
  west: 106.0512,
  south: 21.0198,
  east: 106.0794,
  north: 21.0372,
  center: [106.0653, 21.0285] as [number, number],
  /** TODO: replace with verified polygon từ official 1/500 plan PDF */
  verification_status: 'approximate-bbox-from-public-maps-link' as const,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// LOD Rules — 5 levels
//
// Reference (mobile-first, đo trên Moto G Power):
//   z 10-12: country/region — không relevant cho HHC
//   z 13-14: city overview — boundary only
//   z 15-16: district — phase + amenities
//   z 17-18: block — lots visible as dots → simplified polygons
//   z 19-21: lot detail — full polygon + 3D buildings nếu có
// ─────────────────────────────────────────────────────────────────────────────

export const LOD_RULES: readonly LodRule[] = [
  {
    level: 'macro-far',
    zoom_min: 0,
    zoom_max: 13.99,
    layers_visible: ['base-osm-context', 'hhc-boundary-197ha'],
    lot_render_mode: 'hidden',
    staging_dimming: false,
  },
  {
    level: 'macro-mid',
    zoom_min: 14,
    zoom_max: 15.99,
    layers_visible: [
      'base-osm-context',
      'hhc-boundary-197ha',
      'subdivision-boundaries',
      'major-amenities',
      'vanh-dai-4-trace',
    ],
    lot_render_mode: 'hidden',
    staging_dimming: false,
  },
  {
    level: 'macro-close',
    zoom_min: 16,
    zoom_max: 17.49,
    layers_visible: [
      'base-ortho',
      'subdivision-boundaries',
      'block-grid',
      'roads',
      'parks',
      'amenities-detailed',
    ],
    lot_render_mode: 'dot',
    staging_dimming: true,
  },
  {
    level: 'micro',
    zoom_min: 17.5,
    zoom_max: 19.49,
    layers_visible: [
      'base-ortho',
      'subdivision-boundaries',
      'block-grid',
      'roads',
      'parks',
      'amenities-detailed',
      'lots',
      'lot-status-overlay',
    ],
    lot_render_mode: 'simplified-polygon',
    staging_dimming: true,
  },
  {
    level: 'micro-extreme',
    zoom_min: 19.5,
    zoom_max: 22,
    layers_visible: [
      'base-ortho',
      'subdivision-boundaries',
      'block-grid',
      'roads',
      'parks',
      'amenities-detailed',
      'lots',
      'lot-status-overlay',
      'lot-labels',
      'buildings-3d',
      'sunlight-overlay',
    ],
    lot_render_mode: 'full-polygon',
    staging_dimming: true,
  },
] as const;

export function getLodLevel(zoom: number): LodLevel {
  for (const rule of LOD_RULES) {
    if (zoom >= rule.zoom_min && zoom <= rule.zoom_max) return rule.level;
  }
  return 'macro-far';
}

export function getLodRule(zoom: number): LodRule {
  return LOD_RULES.find((r) => zoom >= r.zoom_min && zoom <= r.zoom_max) ?? LOD_RULES[0];
}

// ─────────────────────────────────────────────────────────────────────────────
// Macro ↔ Micro mode transition logic
// ─────────────────────────────────────────────────────────────────────────────

export const MAP_MODE_TRANSITION: MapModeTransition = {
  enter_micro_zoom: 17,
  enter_micro_bbox_coverage_pct: 35, // viewport bbox phải ≤ 35% diện tích Hồng Phát → enter Micro
  transition_duration_ms: 1200,
};

/**
 * Quyết định mode hiện tại dựa trên zoom + bbox + focus subdivision.
 * Pure function — UI gọi mỗi khi camera đổi.
 */
export function resolveMapMode(args: {
  zoom: number;
  viewport_bbox: [number, number, number, number];
  focused_subdivision: SubdivisionId | null;
}): MapMode {
  // Rule 1: Nếu user explicit focus Hồng Phát + zoom ≥ enter_micro_zoom → Micro
  if (args.focused_subdivision === 'hong-phat' && args.zoom >= MAP_MODE_TRANSITION.enter_micro_zoom) {
    return 'micro';
  }
  // Rule 2: Zoom rất gần (z ≥ 18.5) bất kể focus → Micro
  if (args.zoom >= 18.5) {
    return 'micro';
  }
  return 'macro';
}

// ─────────────────────────────────────────────────────────────────────────────
// Subdivision bboxes (approximate)
// TODO: replace với verified polygons từ 1/500 plan
// ─────────────────────────────────────────────────────────────────────────────

export const SUBDIVISION_BBOX: Record<SubdivisionId, {
  west: number; south: number; east: number; north: number;
  verification_status: 'approximate' | 'verified';
}> = {
  'hong-phat': {
    west: 106.0512, south: 21.0198, east: 106.0628, north: 21.0290,
    verification_status: 'approximate',
  },
  'hong-thinh': {
    west: 106.0628, south: 21.0210, east: 106.0720, north: 21.0335,
    verification_status: 'approximate',
  },
  'hong-phuc': {
    west: 106.0700, south: 21.0260, east: 106.0794, north: 21.0372,
    verification_status: 'approximate',
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Map style themes
// ─────────────────────────────────────────────────────────────────────────────

export const MAP_THEMES = ['day', 'dusk', 'aerial'] as const;
export type MapTheme = typeof MAP_THEMES[number];

export const MAP_STYLE_URLS: Record<MapTheme, string> = {
  day:    '/styles/hhc-day.json',
  dusk:   '/styles/hhc-dusk.json',
  aerial: '/styles/hhc-aerial.json',
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Initial camera state per route
// ─────────────────────────────────────────────────────────────────────────────

export const INITIAL_CAMERA = {
  '/sa-ban': {
    center: HHC_MASTERPLAN_BBOX.center,
    zoom: 15,
    bearing: 0,
    pitch: 0,
  },
  '/sa-ban/hong-phat': {
    center: [
      (SUBDIVISION_BBOX['hong-phat'].west + SUBDIVISION_BBOX['hong-phat'].east) / 2,
      (SUBDIVISION_BBOX['hong-phat'].south + SUBDIVISION_BBOX['hong-phat'].north) / 2,
    ] as [number, number],
    zoom: 16.5,
    bearing: 0,
    pitch: 30,
  },
  '/sa-ban/hong-thinh': {
    center: [
      (SUBDIVISION_BBOX['hong-thinh'].west + SUBDIVISION_BBOX['hong-thinh'].east) / 2,
      (SUBDIVISION_BBOX['hong-thinh'].south + SUBDIVISION_BBOX['hong-thinh'].north) / 2,
    ] as [number, number],
    zoom: 16,
    bearing: 0,
    pitch: 0,
  },
  '/sa-ban/hong-phuc': {
    center: [
      (SUBDIVISION_BBOX['hong-phuc'].west + SUBDIVISION_BBOX['hong-phuc'].east) / 2,
      (SUBDIVISION_BBOX['hong-phuc'].south + SUBDIVISION_BBOX['hong-phuc'].north) / 2,
    ] as [number, number],
    zoom: 16,
    bearing: 0,
    pitch: 0,
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Staging overlay micro-copy
// ─────────────────────────────────────────────────────────────────────────────

export const STAGING_LOT_LABEL = {
  vi: 'Thông tin tham khảo — chưa mở bán chính thức',
  en: 'Reference data — not officially listed yet',
  fill_opacity: 0.25,
  stroke_dash: [4, 4] as const,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// AI Matching spotlight (Micro mode)
// ─────────────────────────────────────────────────────────────────────────────

export const SPOTLIGHT_CONFIG = {
  max_results: 5,
  /** Pulse animation timing (ms) cho top-5 lots. */
  pulse_duration_ms: 600,
  pulse_loop_count: 2,
  /** Dim những lot ngoài top-5 xuống fill opacity 0.15. */
  non_matched_fill_opacity: 0.15,
  /** Camera tự bay framing top-5 bbox + padding 80px. */
  auto_frame_padding_px: 80,
  /** Throttle re-compute matching khi user đổi criteria. */
  match_debounce_ms: 250,
} as const;
