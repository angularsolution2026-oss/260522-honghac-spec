/**
 * SaBanClient — client-side shell for the /sa-ban route.
 *
 * Owns all interactive state:
 *   - activeSubdivision (which phan-khu is focused)
 *   - mapTheme (day / dusk / aerial)
 *   - filters (FilterState from FilterRail — Phase 1 Task 6)
 *   - selectedLot (clicked lot — feeds LotPopover — Phase 1 Task 5)
 *   - watchlist (mock Set — IndexedDB in Task 7)
 */

'use client';

import { useRef, useState, useCallback } from 'react';
import MapLoader from '@/components/map/MapLoader';
import LotPopover from '@/components/map/LotPopover';
import type { MapContainerHandle, LotClickPayload, MapTheme } from '@/components/map/map-types';
import type { LotPopoverData } from '@/components/map/LotPopover';
import type { SubdivisionId } from '@/data/types/honghac';
import type { FilterState } from '@/lib/map/lod-engine';
import { DEFAULT_FILTER_STATE } from '@/lib/map/lod-engine';
import SaBanHeader from './SaBanHeader';
import MapStatusBar from './MapStatusBar';
import FilterRail from '@/components/map/FilterRail';

// ─────────────────────────────────────────────────────────────────────────────
// Mock lot data — replaced by /api/map/lot-detail in Task 8
// ─────────────────────────────────────────────────────────────────────────────

function mockLotData(internal_id: string): LotPopoverData {
  return {
    internal_id,
    official_lot_code: internal_id.startsWith('HP') ? internal_id : null,
    sku: 'VILLA-A',
    kind: 'villa-don-lap',
    area_m2: 320,
    frontage_m: 12,
    orientation: 'SE',
    status: 'available',
    price_indicative_vnd: 18_500_000_000,
    is_corner_lot: false,
    is_park_facing: true,
    subdivision: 'hong-phat',
    listing: 'public',
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function SaBanClient() {
  const mapRef = useRef<MapContainerHandle>(null);

  // Map state
  const [theme, setTheme] = useState<MapTheme>('day');
  const [activeSubdivision, setActiveSubdivision] = useState<SubdivisionId | null>('hong-phat');
  const [mapMode, setMapMode] = useState<'macro' | 'micro'>('macro');
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTER_STATE);

  // Selected lot — opens LotPopover
  const [selectedLot, setSelectedLot] = useState<LotClickPayload | null>(null);

  // Watchlist (IndexedDB in Task 7 — mock Set for now)
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set());

  const handleWatchlist = useCallback((lotId: string) => {
    setWatchlist(prev => {
      const next = new Set(prev);
      if (next.has(lotId)) next.delete(lotId);
      else next.add(lotId);
      return next;
    });
  }, []);

  const handleLotClick = useCallback((payload: LotClickPayload) => {
    setSelectedLot(payload);
  }, []);

  const handleModeChange = useCallback((mode: 'macro' | 'micro') => {
    setMapMode(mode);
  }, []);

  const handleMapReady = useCallback(() => {
    mapRef.current?.fitSubdivision('hong-phat');
  }, []);

  return (
    <div
      className="fixed inset-0 flex flex-col overflow-hidden"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
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

      {/* ── Map area ────────────────────────────────────────────────────────── */}
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

        {/* ── Status bar — bottom-left ────────────────────────────────────── */}
        <MapStatusBar mode={mapMode} selectedLotId={selectedLot?.internal_id ?? null} />

        {/* ── Filter Rail — left panel (Desktop) / bottom drawer (Mobile) ─── */}
        <FilterRail
          filters={filters}
          onFiltersChange={setFilters}
          activeSubdivision={activeSubdivision}
          className="absolute left-4 top-4 z-10"
        />

        {/* ── Lot Popover ─────────────────────────────────────────────────── */}
        {selectedLot && (
          <LotPopover
            payload={selectedLot}
            data={mockLotData(selectedLot.internal_id)}
            loading={false}
            onClose={() => setSelectedLot(null)}
            onWatchlist={handleWatchlist}
            inWatchlist={watchlist.has(selectedLot.internal_id)}
          />
        )}
      </div>
    </div>
  );
}
