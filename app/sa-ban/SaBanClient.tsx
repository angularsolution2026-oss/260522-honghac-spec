/**
 * SaBanClient — client-side shell for the /sa-ban route.
 *
 * Owns all interactive state:
 *   - activeSubdivision (which phan-khu is focused)
 *   - mapTheme (day / dusk / aerial)
 *   - filters (FilterState from FilterRail — Phase 1 Task 6)
 *   - selectedLot (clicked lot id — feeds LotPopover — Phase 1 Task 5)
 *
 * Renders:
 *   - Fixed full-viewport layout
 *   - MapLoader (SSR-safe MapContainer)
 *   - SaBanHeader (theme switcher + breadcrumb)
 *   - MapStatusBar (mode indicator + lot count)
 *   - Placeholder slots for FilterRail + LotPopover (next tasks)
 */

'use client';

import { useRef, useState, useCallback } from 'react';
import MapLoader from '@/components/map/MapLoader';
import type { MapContainerHandle, LotClickPayload, MapTheme } from '@/components/map/map-types';
import type { SubdivisionId } from '@/data/types/honghac';
import type { FilterState } from '@/lib/map/lod-engine';
import { DEFAULT_FILTER_STATE } from '@/lib/map/lod-engine';
import SaBanHeader from './SaBanHeader';
import MapStatusBar from './MapStatusBar';

export default function SaBanClient() {
  const mapRef = useRef<MapContainerHandle>(null);

  // Map state
  const [theme, setTheme] = useState<MapTheme>('day');
  const [activeSubdivision, setActiveSubdivision] = useState<SubdivisionId | null>('hong-phat');
  const [mapMode, setMapMode] = useState<'macro' | 'micro'>('macro');
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTER_STATE);

  // Selected lot — will open LotPopover
  const [selectedLot, setSelectedLot] = useState<LotClickPayload | null>(null);

  const handleLotClick = useCallback((payload: LotClickPayload) => {
    setSelectedLot(payload);
  }, []);

  const handleModeChange = useCallback((mode: 'macro' | 'micro') => {
    setMapMode(mode);
  }, []);

  const handleMapReady = useCallback(() => {
    // Fly to Hồng Phát on load
    mapRef.current?.fitSubdivision('hong-phat');
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* ── Header ───────────────────────────────────────────────────── */}
      <SaBanHeader
        theme={theme}
        onThemeChange={setTheme}
        activeSubdivision={activeSubdivision}
        onSubdivisionChange={(id) => {
          setActiveSubdivision(id);
          if (id) mapRef.current?.fitSubdivision(id);
        }}
        onFitAll={() => mapRef.current?.fitMasterplan()}
      />

      {/* ── Map area ─────────────────────────────────────────────────── */}
      <div className="relative flex-1 overflow-hidden">
        {/* Map canvas */}
        <MapLoader
          ref={mapRef}
          activeSubdivision={activeSubdivision}
          filters={filters}
          theme={theme}
          onLotClick={handleLotClick}
          onModeChange={handleModeChange}
          onMapReady={handleMapReady}
          className="absolute inset-0"
        />

        {/* ── Status bar ── bottom-left ─────────────────────────────── */}
        <MapStatusBar mode={mapMode} selectedLotId={selectedLot?.internal_id ?? null} />

        {/* ── Filter Rail placeholder ── left rail ──────────────────── */}
        <aside
          className="pointer-events-none absolute left-4 top-4 z-10 w-64 rounded-lg p-4 opacity-70"
          style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-foreground-tertiary)' }}>
            Filter Rail
          </p>
          <p className="mt-1 text-xs" style={{ color: 'var(--color-foreground-secondary)' }}>
            Phase 1 Task 6 — coming next
          </p>
        </aside>

        {/* ── Lot Popover placeholder ── right ──────────────────────── */}
        {selectedLot && (
          <div
            className="pointer-events-auto absolute right-4 top-4 z-20 w-72 rounded-lg p-4 shadow-lg"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-primary)' }}>
                Lô: {selectedLot.internal_id}
              </p>
              <button
                onClick={() => setSelectedLot(null)}
                className="rounded p-1 text-xs hover:opacity-70"
                style={{ color: 'var(--color-foreground-tertiary)' }}
                aria-label="Đóng"
              >
                ✕
              </button>
            </div>
            <p className="mt-1 text-xs" style={{ color: 'var(--color-foreground-secondary)' }}>
              LotPopover component — Phase 1 Task 5
            </p>
            <p className="mt-1 text-xs font-mono" style={{ color: 'var(--color-foreground-tertiary)' }}>
              [{selectedLot.lnglat[0].toFixed(5)}, {selectedLot.lnglat[1].toFixed(5)}]
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
