import { NextResponse } from 'next/server';
import type { LotEnriched } from '@/data/types/honghac';

/**
 * GET /api/map/lot-detail/[id]
 * Returns detailed information for a single lot.
 *
 * URL params:
 *   - id: string (internal_id)
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  console.log(`[v0] GET /api/map/lot-detail/${id}`);

  // Mock response
  const mockLot: LotEnriched = {
    internal_id: id || 'HP-001',
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
  };

  return NextResponse.json(
    { data: mockLot },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
