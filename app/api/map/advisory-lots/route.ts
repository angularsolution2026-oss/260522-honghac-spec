import { NextResponse } from 'next/server';
import type { LotEnriched } from '@/data/types/honghac';

/**
 * GET /api/map/advisory-lots
 * Returns all lots for advisory rendering on map.
 * Filters by subdivision + status if query params provided.
 *
 * Query params:
 *   - subdivision?: string (e.g., "hong-phat")
 *   - status?: "available" | "reserved" | "sold"
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const subdivision = searchParams.get('subdivision');
  const status = searchParams.get('status');

  console.log(`[v0] GET /api/map/advisory-lots: subdivision=${subdivision}, status=${status}`);

  // Mock response with sample lot data
  const mockLots: LotEnriched[] = [
    {
      internal_id: 'HP-001',
      official_lot_code: 'HP-A-001',
      current_geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [105.8, 21.0],
            [105.81, 21.0],
            [105.81, 21.01],
            [105.8, 21.01],
            [105.8, 21.0],
          ],
        ],
      },
      official_geometry: undefined,
      display_source: 'internal',
      last_official_sync: null,
      phase: 'hp-2026-q4',
      status: 'available',
      area_m2: 300,
      subdivision: 'hong-phat',
      sku: 'VILLA-A',
      kind: 'villa-don-lap',
      centroid: { type: 'Point', coordinates: [105.805, 21.005] },
      orientation: 'SE',
      frontage_m: 12,
      area_label: '300m²',
      is_corner_lot: false,
      is_park_facing: true,
      is_water_facing: false,
      privacy_score: 75,
      greenery_score: 80,
      sunlight_score: 70,
      park_distance_m: 120,
      price_indicative_vnd: 18500000000,
      listing: 'public',
      updated_at: new Date().toISOString(),
    },
  ];

  // Filter by subdivision if provided
  let result = mockLots;
  if (subdivision) {
    result = result.filter((lot) => lot.subdivision === subdivision);
  }
  if (status) {
    result = result.filter((lot) => lot.status === status);
  }

  return NextResponse.json(
    { data: result, count: result.length },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
