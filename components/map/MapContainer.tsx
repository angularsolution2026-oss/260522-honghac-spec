'use client';

/**
 * MapContainer — MapLibre GL JS host component.
 *
 * Responsibilities:
 *   1. Init MapLibre GL instance + PMTiles protocol registration.
 *   2. Add GeoJSON / PMTiles sources and managed layer stack.
 *   3. Drive LOD engine on every camera change.
 *   4. Expose onLotClick + onLotHover callbacks up to the page.
 *   5. Sync FilterState → LOD engine → live map layers.
 *
 * What this component does NOT do:
 *   - Render any React children inside the map canvas.
 *   - Store lead / watchlist state (lifted to /sa-ban/page.tsx).
 *   - Handle popover rendering (sibling component, positioned via portal).
 */

import {
  useEffect,
  useRef,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react';
import type { Map as MapLibreMap, MapMouseEvent, MapGeoJSONFeature } from 'maplibre-gl';
import type { SubdivisionId } from '@/data/types/honghac';
import type { MapTheme, LotClickPayload, MapContainerHandle } from './map-types';
export type { MapTheme, LotClickPayload, MapContainerHandle };
import {
  HHC_MASTERPLAN_BBOX,
  INITIAL_CAMERA,
  MAP_STYLE_URLS,
  MAP_MODE_TRANSITION,
  SUBDIVISION_BBOX,
} from '@/data/constants/map-config';
import {
  getLodLayerConfig,
  applyLodToMap,
  resolveMapMode,
  DEFAULT_FILTER_STATE,
} from '@/lib/map/lod-engine';
import type { FilterState, CameraState } from '@/lib/map/lod-engine';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface MapContainerProps {
  /** Which subdivision is "in focus" — controls LOD transitions. */
  activeSubdivision: SubdivisionId | null;
  /** Filter state from FilterRail. */
  filters?: FilterState;
  /** Map color theme. */
  theme?: MapTheme;
  /** Called when user clicks a lot polygon or dot. */
  onLotClick?: (payload: LotClickPayload) => void;
  /** Called when map mode transitions macro ↔ micro. */
  onModeChange?: (mode: 'macro' | 'micro') => void;
  /** Called after map + sources fully loaded. */
  onMapReady?: (map: MapLibreMap) => void;
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// PMTiles URL — defaults to local /tiles/hhc.pmtiles for dev, CDN for production
// ─────────────────────────────────────────────────────────────────────────────

const PMTILES_URL =
  process.env.NEXT_PUBLIC_PMTILES_URL || '/tiles/hhc.pmtiles';

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

const MapContainer = forwardRef<MapContainerHandle, MapContainerProps>(
  function MapContainer(
    {
      activeSubdivision,
      filters = DEFAULT_FILTER_STATE,
      theme = 'day',
      onLotClick,
      onModeChange,
      onMapReady,
      className = '',
    },
    ref,
  ) {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<MapLibreMap | null>(null);
    const currentModeRef = useRef<'macro' | 'micro'>('macro');
    const filtersRef = useRef<FilterState>(filters);
    const activeSubdivisionRef = useRef<SubdivisionId | null>(activeSubdivision);

    // Keep refs in sync with latest props (avoids stale closures in event handlers)
    filtersRef.current = filters;
    activeSubdivisionRef.current = activeSubdivision;

    // ── Imperative handle ──────────────────────────────────────────────────
    useImperativeHandle(ref, () => ({
      flyTo(center, zoom, duration = MAP_MODE_TRANSITION.transition_duration_ms) {
        mapRef.current?.flyTo({ center, zoom, duration });
      },
      fitSubdivision(id) {
        const bbox = SUBDIVISION_BBOX[id as SubdivisionId];
        mapRef.current?.fitBounds(
          [bbox.west, bbox.south, bbox.east, bbox.north],
          { padding: 60, duration: MAP_MODE_TRANSITION.transition_duration_ms },
        );
      },
      fitMasterplan() {
        const b = HHC_MASTERPLAN_BBOX;
        mapRef.current?.fitBounds(
          [b.west, b.south, b.east, b.north],
          { padding: 40, duration: MAP_MODE_TRANSITION.transition_duration_ms },
        );
      },
      getMap() {
        return mapRef.current as MapLibreMap | null;
      },
    }));

    // ── Camera change handler (LOD + mode) ────────────────────────────────
    const handleCameraChange = useCallback(() => {
      const map = mapRef.current;
      if (!map) return;

      const zoom = map.getZoom();
      const bounds = map.getBounds();
      const camera: CameraState = {
        zoom,
        viewport_bbox: [
          bounds.getWest(),
          bounds.getSouth(),
          bounds.getEast(),
          bounds.getNorth(),
        ],
        focused_subdivision: activeSubdivisionRef.current,
      };

      // Compute new mode and emit if changed
      const newMode = resolveMapMode(camera);
      if (newMode !== currentModeRef.current) {
        currentModeRef.current = newMode;
        onModeChange?.(newMode);
      }

      // Apply LOD config
      const lodConfig = getLodLayerConfig(camera, filtersRef.current);
      applyLodToMap(map, lodConfig);
    }, [onModeChange]);

    // ── Lot click handler ─────────────────────────────────────────────────
    const handleLotClick = useCallback(
      (e: MapMouseEvent & { features?: MapGeoJSONFeature[] }) => {
        const feature = e.features?.[0];
        if (!feature || !feature.properties) return;

        const internal_id = feature.properties['internal_id'] as string | undefined;
        if (!internal_id) return;

        onLotClick?.({
          internal_id,
          screen_x: e.point.x,
          screen_y: e.point.y,
          lnglat: [e.lngLat.lng, e.lngLat.lat],
        });
      },
      [onLotClick],
    );

    // ── Map initialization ────────────────────────────────────────────────
    useEffect(() => {
      if (!containerRef.current || mapRef.current) return;

      let map: MapLibreMap;

      async function initMap() {
        console.log('[v0] MapContainer: starting initMap');
        
        // Dynamic imports — MapLibre GL is heavy (~600KB), load on demand
        const maplibregl = await import('maplibre-gl');
        const { Map, NavigationControl } = maplibregl;
        console.log('[v0] MapContainer: maplibre-gl imported');

        const initial = INITIAL_CAMERA['/sa-ban'];
        const styleUrl = MAP_STYLE_URLS[theme] ?? MAP_STYLE_URLS['day'];
        console.log('[v0] MapContainer: using styleUrl =', styleUrl);

        map = new Map({
          container: containerRef.current!,
          // When no style file exists yet (dev), fall back to a reliable blank style
          style: styleUrl,
          center: initial.center,
          zoom: initial.zoom,
          bearing: initial.bearing,
          pitch: initial.pitch,
          maxBounds: [
            HHC_MASTERPLAN_BBOX.west - 0.05,
            HHC_MASTERPLAN_BBOX.south - 0.05,
            HHC_MASTERPLAN_BBOX.east + 0.05,
            HHC_MASTERPLAN_BBOX.north + 0.05,
          ],
          // Performance: disable unnecessary features
          antialias: false,
          refreshExpiredTiles: false,
          attributionControl: false,
        });

        mapRef.current = map;
        console.log('[v0] MapContainer: Map instance created');

        // Handle map errors (e.g., failed tile fetches) gracefully
        map.on('error', (e) => {
          console.warn('[v0] MapLibre error (non-fatal):', e.error?.message || e);
          // Don't crash — map continues with base OSM tiles
        });

        // Navigation controls
        map.addControl(new NavigationControl({ showCompass: true }), 'top-right');

        map.on('load', () => {
          console.log('[v0] MapContainer: map.load event fired');
          clearTimeout(loadTimeout);
          try {
            addSources(map);
            addLayers(map);

            // Run LOD engine for initial state
            const bounds = map.getBounds();
            const camera: CameraState = {
              zoom: map.getZoom(),
              viewport_bbox: [
                bounds.getWest(), bounds.getSouth(),
                bounds.getEast(), bounds.getNorth(),
              ],
              focused_subdivision: activeSubdivisionRef.current,
            };
            const lodConfig = getLodLayerConfig(camera, filtersRef.current);
            applyLodToMap(map, lodConfig);
          } catch (err) {
            console.warn('[v0] Error adding sources/layers (non-fatal):', err);
          }
          onMapReady?.(map);
        });

        // Fallback: if load event doesn't fire within 8s, call onMapReady anyway
        // This handles cases where style/tiles fail but we still want to show the map shell
        const loadTimeout = setTimeout(() => {
          if (!map.isStyleLoaded()) {
            console.warn('[v0] Map load timeout — forcing onMapReady without full style');
            onMapReady?.(map);
          }
        }, 8000);

        // Camera events → LOD recalc
        map.on('zoom', handleCameraChange);
        map.on('move', handleCameraChange);

        // Lot click on fill + dots layers
        map.on('click', 'lots-fill', handleLotClick);
        map.on('click', 'lots-dots', handleLotClick);

        // Pointer cursor on hover
        map.on('mouseenter', 'lots-fill', () => {
          map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', 'lots-fill', () => {
          map.getCanvas().style.cursor = '';
        });
        map.on('mouseenter', 'lots-dots', () => {
          map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', 'lots-dots', () => {
          map.getCanvas().style.cursor = '';
        });
      }

      initMap().catch((err) => {
        console.error('[v0] MapContainer init failed:', err);
      });

      // Timeout fallback — if map doesn't load within 10s, log error
      const timeout = setTimeout(() => {
        if (!mapRef.current?.isStyleLoaded()) {
          console.error('[v0] MapContainer timeout: style not loaded after 10s');
        }
      }, 10000);

      return () => {
        clearTimeout(timeout);
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run once on mount

    // ── Re-apply LOD when filters / activeSubdivision change ─────────────
    useEffect(() => {
      const map = mapRef.current;
      if (!map || !map.isStyleLoaded()) return;

      const bounds = map.getBounds();
      const camera: CameraState = {
        zoom: map.getZoom(),
        viewport_bbox: [
          bounds.getWest(), bounds.getSouth(),
          bounds.getEast(), bounds.getNorth(),
        ],
        focused_subdivision: activeSubdivision,
      };
      const lodConfig = getLodLayerConfig(camera, filters);
      applyLodToMap(map, lodConfig);
    }, [filters, activeSubdivision]);

    // ── Theme change — reload style ───────────────────────────────────────
    useEffect(() => {
      const map = mapRef.current;
      if (!map) return;
      const styleUrl = MAP_STYLE_URLS[theme] ?? MAP_STYLE_URLS['day'];
      map.setStyle(styleUrl);
      // Re-add sources/layers after style reload
      map.once('styledata', () => {
        addSources(map);
        addLayers(map);
      });
    }, [theme]);

    return (
      <div
        ref={containerRef}
        className={`relative w-full h-full ${className}`}
        aria-label="Bản đồ tương tác Hồng Hạc City"
        role="application"
      />
    );
  },
);

MapContainer.displayName = 'MapContainer';
export default MapContainer;

// ─────────────────────────────────────────────────────────────────────────────
// addSources — idempotent, safe to call after style reload
// ─────────────────────────────────────────────────────────────────────────────

function addSources(map: MapLibreMap): void {
  // GeoJSON source — load Hong Phat lots directly from public/data/
  if (!map.getSource('hhc-lots')) {
    try {
      map.addSource('hhc-lots', {
        type: 'geojson',
        data: '/data/hong-phat-lots.geojson',
        promoteId: 'internal_id',
        generateId: false,
      });
      console.log('[v0] GeoJSON source loaded from /data/hong-phat-lots.geojson');
    } catch (err) {
      console.warn('[v0] Failed to add GeoJSON source:', err);
      // Fallback to empty GeoJSON if file fails
      map.addSource('hhc-lots', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
        promoteId: 'internal_id',
        generateId: false,
      });
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// addLayers — adds all managed layers with initial visibility = 'none'.
// LOD engine controls visibility at runtime.
// ─────────────��─────��─────────────────────────────────────────────────────────

function addLayers(map: MapLibreMap): void {
  // Lots fill polygon
  if (!map.getLayer('lots-fill')) {
    map.addLayer({
      id: 'lots-fill',
      type: 'fill',
      source: 'hhc-lots',
      layout: { visibility: 'none' },
      paint: {
        'fill-color': '#22c55e',
        'fill-opacity': 0.55,
      },
    });
  }

  // Lots outline
  if (!map.getLayer('lots-outline')) {
    map.addLayer({
      id: 'lots-outline',
      type: 'line',
      source: 'hhc-lots',
      layout: { visibility: 'none' },
      paint: {
        'line-color': '#ffffff',
        'line-width': 0.8,
        'line-opacity': 0.7,
      },
    });
  }

  // Lots dots (macro-close mode)
  if (!map.getLayer('lots-dots')) {
    map.addLayer({
      id: 'lots-dots',
      type: 'circle',
      source: 'hhc-lots',
      
      layout: { visibility: 'none' },
      paint: {
        'circle-radius': 4,
        'circle-color': '#22c55e',
        'circle-opacity': 0.85,
      },
    });
  }

  // Lot status overlay (reserved / sold dim)
  if (!map.getLayer('lot-status-overlay')) {
    map.addLayer({
      id: 'lot-status-overlay',
      type: 'fill',
      source: 'hhc-lots',
      
      layout: { visibility: 'none' },
      paint: {
        'fill-color': [
          'match',
          ['get', 'status'],
          'reserved', '#f59e0b',
          'sold',     '#ef4444',
          'transparent',
        ],
        'fill-opacity': [
          'match',
          ['get', 'status'],
          'available', 0,
          0.35,
        ],
      },
    });
  }

  // Staging dimming overlay
  if (!map.getLayer('lots-staging-overlay')) {
    map.addLayer({
      id: 'lots-staging-overlay',
      type: 'fill',
      source: 'hhc-lots',
      
      filter: ['==', ['get', 'listing'], 'staging'],
      layout: { visibility: 'none' },
      paint: {
        'fill-color': '#000000',
        'fill-opacity': 0.35,
      },
    });
  }

  // Spotlight pulse (AI matching)
  if (!map.getLayer('lots-spotlight-pulse')) {
    map.addLayer({
      id: 'lots-spotlight-pulse',
      type: 'line',
      source: 'hhc-lots',
      
      layout: { visibility: 'none' },
      paint: {
        'line-color': '#d4af37', // gold accent
        'line-width': 3,
        'line-opacity': 0.95,
      },
    });
  }

  // Lot labels (micro-extreme)
  if (!map.getLayer('lot-labels')) {
    map.addLayer({
      id: 'lot-labels',
      type: 'symbol',
      source: 'hhc-lots',
      
      layout: {
        visibility: 'none',
        'text-field': ['get', 'area_label'],
        'text-font': ['Open Sans Regular'],
        'text-size': 10,
        'text-anchor': 'center',
      },
      paint: {
        'text-color': '#ffffff',
        'text-halo-color': 'rgba(0,0,0,0.6)',
        'text-halo-width': 1,
      },
    });
  }
}
