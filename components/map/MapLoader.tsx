/**
 * MapLoader — dynamic import wrapper for MapContainer.
 *
 * MapLibre GL JS accesses `window` and `WebGL` on import, which crashes
 * Next.js SSR. This wrapper uses `next/dynamic` with `ssr: false` so the
 * component is only evaluated in the browser.
 *
 * Usage:
 *   import MapLoader from '@/components/map/MapLoader'
 *   <MapLoader activeSubdivision="hong-phat" onLotClick={...} />
 */

'use client';

import dynamic from 'next/dynamic';
import type { MapContainerProps } from './MapContainer';
import type { MapContainerHandle } from './map-types';
import { forwardRef } from 'react';
import type { ForwardRefExoticComponent, RefAttributes } from 'react';

// Dynamically import MapContainer with SSR disabled
const DynamicMap = dynamic(() => import('./MapContainer'), {
  ssr: false,
  loading: () => <MapLoadingPlaceholder />,
}) as ForwardRefExoticComponent<MapContainerProps & RefAttributes<MapContainerHandle>>;

// Re-export with forwardRef support preserved
const MapLoader = forwardRef<MapContainerHandle, MapContainerProps>(
  function MapLoader(props, ref) {
    return <DynamicMap {...props} ref={ref} />;
  },
);

MapLoader.displayName = 'MapLoader';
export default MapLoader;

// ─────────────────────────────────────────────────────────────────────────────
// Loading placeholder — shown while MapLibre GL chunk is downloading
// ─────────────────────────────────────────────────────────────────────────────

function MapLoadingPlaceholder() {
  return (
    <div
      className="flex h-full w-full items-center justify-center"
      style={{ backgroundColor: 'var(--color-surface-secondary)' }}
      aria-label="Bản đồ đang tải"
      role="status"
    >
      <div className="flex flex-col items-center gap-3">
        {/* Spinner */}
        <div
          className="h-10 w-10 animate-spin rounded-full border-4 border-t-transparent"
          style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }}
        />
        <p
          className="text-sm font-medium"
          style={{ color: 'var(--color-foreground-secondary)' }}
        >
          Đang tải bản đồ...
        </p>
      </div>
    </div>
  );
}
