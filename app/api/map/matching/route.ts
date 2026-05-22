import { NextResponse } from 'next/server';

/**
 * POST /api/map/matching
 * Returns count of lots matching given filter criteria.
 *
 * Request body:
 * {
 *   phase?: string
 *   greenery_min?: number (0-100)
 *   greenery_max?: number (0-100)
 *   sunlight_min?: number (0-100)
 *   sunlight_max?: number (0-100)
 *   privacy_min?: number (0-100)
 *   privacy_max?: number (0-100)
 *   budget_max_vnd?: number
 *   status?: "available" | "reserved" | "sold"
 * }
 */
export async function POST(request: Request) {
  const body = await request.json();

  console.log('[v0] POST /api/map/matching:', body);

  // Mock: return a reasonable count
  const mockCount = 1074;

  return NextResponse.json(
    { data: { matching_lot_count: mockCount }, count: mockCount },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
