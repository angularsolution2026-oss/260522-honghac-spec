/**
 * map-types.ts — shared type definitions for map components.
 *
 * Intentionally has ZERO imports from maplibre-gl.
 * This allows server components and SaBanClient.tsx (which SSR-renders its shell)
 * to import these types without triggering maplibre-gl's browser-only side-effects.
 */

export type MapTheme = 'day' | 'dusk' | 'aerial';

export interface LotClickPayload {
  internal_id: string;
  /** Pixel position of click — used to position the popover. */
  screen_x: number;
  screen_y: number;
  /** Lot centroid [lng, lat] */
  lnglat: [number, number];
}

export interface MapContainerHandle {
  flyTo(center: [number, number], zoom: number, duration?: number): void;
  fitSubdivision(id: string): void;
  fitMasterplan(): void;
  /** Returns null before map has initialised. */
  getMap(): unknown;
}
