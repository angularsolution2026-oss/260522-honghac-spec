/**
 * LOD Engine — State machine cho MapLibre GL layer visibility & lot render mode.
 *
 * Không import bất kỳ browser API nào — pure TypeScript, testable in Node.
 * MapContainer.tsx là nơi duy nhất gọi engine này rồi áp vào map instance.
 *
 * Flow:
 *   camera change → getLodLevel() → getLodLayerConfig() → applyLodToMap()
 */

import type { Map as MapLibreMap, ExpressionFilterSpecification } from 'maplibre-gl';

// Alias for brevity
type FilterSpecification = ExpressionFilterSpecification;
import type { LodLevel, LodRule, MapMode, SubdivisionId } from '@/data/types/honghac';
import {
  LOD_RULES,
  getLodLevel,
  getLodRule,
  MAP_MODE_TRANSITION,
  SUBDIVISION_BBOX,
  STAGING_LOT_LABEL,
} from '@/data/constants/map-config';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface LodLayerConfig {
  /** IDs of ALL layers that should be visible at this LOD. */
  visible_layers: readonly string[];
  /** IDs of ALL layers that should be hidden. */
  hidden_layers: readonly string[];
  /** MapLibre paint overrides keyed by layerId. */
  paint_overrides: Record<string, Record<string, unknown>>;
  /** MapLibre filter overrides keyed by layerId. */
  filter_overrides: Record<string, ExpressionFilterSpecification>;
  /** Current LOD level (for debugging / analytics). */
  lod: LodLevel;
  /** Current map mode. */
  mode: MapMode;
}

export interface CameraState {
  zoom: number;
  /** [west, south, east, north] in EPSG:4326 */
  viewport_bbox: [number, number, number, number];
  focused_subdivision: SubdivisionId | null;
}

export interface FilterState {
  subdivision: SubdivisionId | null;
  /** null = all phases */
  phase: string | null;
  privacy_min: number;       // 0-100
  greenery_min: number;      // 0-100
  sunlight_min: number;      // 0-100
  budget_max_vnd: number | null;
  /** If set, only show these 5 lot ids (AI matching spotlight) */
  spotlight_ids: string[] | null;
}

export const DEFAULT_FILTER_STATE: FilterState = {
  subdivision: null,
  phase: null,
  privacy_min: 0,
  greenery_min: 0,
  sunlight_min: 0,
  budget_max_vnd: null,
  spotlight_ids: null,
};

// ─────────────────────────────────────────────────────────────────────────────
// Core: resolveMapMode
// ─────────────────────────────────────────────────────────────────────────────

export function resolveMapMode(camera: CameraState): MapMode {
  if (
    camera.focused_subdivision === 'hong-phat' &&
    camera.zoom >= MAP_MODE_TRANSITION.enter_micro_zoom
  ) return 'micro';
  if (camera.zoom >= 18.5) return 'micro';
  return 'macro';
}

// ─────────────────────────────────────────────────────────────────────────────
// Core: buildLotFilter
// Builds a MapLibre FilterSpecification from FilterState.
// ─────────────────────────────────────────────────────────────────────────────

export function buildLotFilter(filters: FilterState): ExpressionFilterSpecification {
  const conditions: ExpressionFilterSpecification[] = [
    // Always exclude sold lots from interactive layers
    ['!=', ['get', 'status'], 'sold'] as ExpressionFilterSpecification,
  ];

  if (filters.subdivision) {
    conditions.push(['==', ['get', 'subdivision'], filters.subdivision] as ExpressionFilterSpecification);
  }

  if (filters.phase) {
    conditions.push(['==', ['get', 'phase'], filters.phase] as ExpressionFilterSpecification);
  }

  if (filters.privacy_min > 0) {
    conditions.push(['>=', ['get', 'privacy_score'], filters.privacy_min] as ExpressionFilterSpecification);
  }

  if (filters.greenery_min > 0) {
    conditions.push(['>=', ['get', 'greenery_score'], filters.greenery_min] as ExpressionFilterSpecification);
  }

  if (filters.sunlight_min > 0) {
    conditions.push(['>=', ['get', 'sunlight_score'], filters.sunlight_min] as ExpressionFilterSpecification);
  }

  if (filters.budget_max_vnd !== null) {
    conditions.push([
      'any',
      ['!', ['has', 'price_indicative_vnd']],
      ['<=', ['get', 'price_indicative_vnd'], filters.budget_max_vnd],
    ] as ExpressionFilterSpecification);
  }

  if (conditions.length === 1) return conditions[0];
  return ['all', ...conditions] as ExpressionFilterSpecification;
}

// ─────────────────────────────────────────────────────────────────────────────
// Core: getLodLayerConfig
// Returns the full layer config for a given camera + filter state.
// ─────────────────────────────────────────────────────────────────────────────

export function getLodLayerConfig(
  camera: CameraState,
  filters: FilterState,
): LodLayerConfig {
  const lod = getLodLevel(camera.zoom);
  const rule = getLodRule(camera.zoom);
  const mode = resolveMapMode(camera);

  const ALL_MANAGED_LAYERS = [
    'base-osm-context',
    'hhc-boundary-197ha',
    'subdivision-boundaries',
    'major-amenities',
    'vanh-dai-4-trace',
    'base-ortho',
    'block-grid',
    'roads',
    'parks',
    'amenities-detailed',
    'lots-fill',
    'lots-outline',
    'lots-dots',
    'lot-status-overlay',
    'lot-labels',
    'lots-staging-overlay',
    'lots-spotlight-pulse',
  ] as const;

  const visible = new Set<string>(rule.layers_visible);
  const hidden: string[] = [];

  for (const l of ALL_MANAGED_LAYERS) {
    if (!visible.has(l)) hidden.push(l);
  }

  // ── Lot sub-layers based on render mode ───────────────────────────────────
  const paintOverrides: Record<string, Record<string, unknown>> = {};
  const filterOverrides: Record<string, FilterSpecification> = {};
  const lotFilter = buildLotFilter(filters);

  switch (rule.lot_render_mode) {
    case 'hidden':
      hidden.push('lots-fill', 'lots-outline', 'lots-dots', 'lot-status-overlay', 'lot-labels');
      break;

    case 'dot':
      visible.add('lots-dots');
      hidden.push('lots-fill', 'lots-outline', 'lot-labels');
      filterOverrides['lots-dots'] = lotFilter;
      paintOverrides['lots-dots'] = {
        'circle-radius': 4,
        'circle-color': buildStatusColorExpression(),
        'circle-opacity': 0.85,
      };
      break;

    case 'simplified-polygon':
      visible.add('lots-fill');
      visible.add('lots-outline');
      hidden.push('lots-dots', 'lot-labels');
      filterOverrides['lots-fill'] = lotFilter;
      filterOverrides['lots-outline'] = lotFilter;
      paintOverrides['lots-fill'] = {
        'fill-color': buildStatusColorExpression(),
        'fill-opacity': 0.55,
        'fill-antialias': true,
      };
      paintOverrides['lots-outline'] = {
        'line-color': '#ffffff',
        'line-width': 0.8,
        'line-opacity': 0.7,
      };
      break;

    case 'full-polygon':
      visible.add('lots-fill');
      visible.add('lots-outline');
      visible.add('lot-labels');
      hidden.push('lots-dots');
      filterOverrides['lots-fill'] = lotFilter;
      filterOverrides['lots-outline'] = lotFilter;
      filterOverrides['lot-labels'] = lotFilter;
      paintOverrides['lots-fill'] = {
        'fill-color': buildStatusColorExpression(),
        'fill-opacity': 0.70,
        'fill-antialias': true,
      };
      paintOverrides['lots-outline'] = {
        'line-color': '#ffffff',
        'line-width': 1.2,
        'line-opacity': 0.9,
      };
      break;
  }

  // ── Staging overlay (dimming) ─────────────────────────────────────────────
  if (rule.staging_dimming) {
    visible.add('lots-staging-overlay');
    filterOverrides['lots-staging-overlay'] = [
      'all',
      ['==', ['get', 'listing'], 'staging'],
      lotFilter,
    ] as ExpressionFilterSpecification;
    paintOverrides['lots-staging-overlay'] = {
      'fill-color': '#000000',
      'fill-opacity': 1 - STAGING_LOT_LABEL.fill_opacity, // darken
      'fill-pattern': undefined,
    };
  } else {
    hidden.push('lots-staging-overlay');
  }

  // ── AI Matching spotlight ─────────────────────────────────────────────────
  if (filters.spotlight_ids && filters.spotlight_ids.length > 0) {
    visible.add('lots-spotlight-pulse');
    filterOverrides['lots-spotlight-pulse'] = [
      'in',
      ['get', 'internal_id'],
      ['literal', filters.spotlight_ids],
    ] as ExpressionFilterSpecification;
    // Dim non-spotlight lots
    paintOverrides['lots-fill'] = {
      ...paintOverrides['lots-fill'],
      'fill-opacity': [
        'case',
        ['in', ['get', 'internal_id'], ['literal', filters.spotlight_ids]],
        0.85,
        0.15,
      ],
    };
  } else {
    hidden.push('lots-spotlight-pulse');
  }

  return {
    visible_layers: Array.from(visible),
    hidden_layers: [...new Set(hidden)],
    paint_overrides: paintOverrides,
    filter_overrides: filterOverrides,
    lod,
    mode,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Core: applyLodToMap
// Applies a LodLayerConfig to a live MapLibre instance.
// Safe to call on every camera move (debounce upstream if needed).
// ─────────────────────────────────────────────────────────────────────────────

export function applyLodToMap(map: MapLibreMap, config: LodLayerConfig): void {
  // Visibility
  for (const id of config.visible_layers) {
    if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', 'visible');
  }
  for (const id of config.hidden_layers) {
    if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', 'none');
  }

  // Paint overrides
  for (const [layerId, paints] of Object.entries(config.paint_overrides)) {
    if (!map.getLayer(layerId)) continue;
    for (const [prop, value] of Object.entries(paints)) {
      try {
        map.setPaintProperty(layerId, prop, value);
      } catch {
        // Layer type mismatch — ignore (e.g. trying fill-opacity on a line layer)
      }
    }
  }

  // Filter overrides
  for (const [layerId, filter] of Object.entries(config.filter_overrides)) {
    if (map.getLayer(layerId)) map.setFilter(layerId, filter as ExpressionFilterSpecification);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: lot status color MapLibre expression
// Returns a match expression: status → fill-color.
// ─────────────────────────────────────────────────────────────────────────────

function buildStatusColorExpression(): ExpressionFilterSpecification {
  return [
    'match',
    ['get', 'status'],
    'available', '#22c55e',
    'reserved',  '#f59e0b',
    'sold',      '#ef4444',
    '#94a3b8',
  ] as unknown as ExpressionFilterSpecification;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: get subdivisions whose bbox intersects the current viewport
// Used to decide which PMTile source ranges to prefetch.
// ─────────────────────────────────────────────────────────────────────────────

export function getViewportSubdivisions(
  viewport_bbox: [number, number, number, number],
): SubdivisionId[] {
  const [vw, vs, ve, vn] = viewport_bbox;
  return (Object.keys(SUBDIVISION_BBOX) as SubdivisionId[]).filter((id) => {
    const { west, south, east, north } = SUBDIVISION_BBOX[id];
    // AABB intersection
    return !(ve < west || vw > east || vn < south || vs > north);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: compute LotEnriched count matching current FilterState
// Runs against map.querySourceFeatures() result — call after source loads.
// ─────────────────────────────────────────────────────────────────────────────

export function countMatchingLots(
  features: Array<{ properties: Record<string, unknown> | null }>,
  filters: FilterState,
): number {
  return features.filter((f) => {
    const p = f.properties;
    if (!p) return false;
    if (p['status'] === 'sold') return false;
    if (filters.subdivision && p['subdivision'] !== filters.subdivision) return false;
    if (filters.phase && p['phase'] !== filters.phase) return false;
    if (typeof p['privacy_score'] === 'number' && p['privacy_score'] < filters.privacy_min) return false;
    if (typeof p['greenery_score'] === 'number' && p['greenery_score'] < filters.greenery_min) return false;
    if (typeof p['sunlight_score'] === 'number' && p['sunlight_score'] < filters.sunlight_min) return false;
    if (
      filters.budget_max_vnd !== null &&
      typeof p['price_indicative_vnd'] === 'number' &&
      p['price_indicative_vnd'] > filters.budget_max_vnd
    ) return false;
    return true;
  }).length;
}
