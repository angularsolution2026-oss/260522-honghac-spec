/**
 * Map Data Security Configuration
 *
 * Goal: bảo vệ geometry (polygon, coordinates) ở mức cao nhất MÀ không lag UX.
 *
 * Threat model:
 *   T1. Competitor scrape toàn bộ 2830 polygons để clone sa bàn
 *   T2. Bot crawl /api/map/* và đánh cắp full dataset
 *   T3. Reverse engineer phase status sớm hơn CDT công bố
 *   T4. Mass-download tiles để host bản đồ riêng
 *
 * Defense in depth:
 *   L1. Tile proxy + signed URLs (15-min HMAC, scoped by deviceId + IP-prefix)
 *   L2. Coordinate precision throttling theo zoom + auth tier
 *   L3. Rate limiting per device + per IP
 *   L4. Edge cache tiles BUT NOT raw GeoJSON
 *   L5. Honeypot lots (canary detection) — nếu xuất hiện ở site khác → scraper biết
 *   L6. CSP + CORS strict
 *   L7. JWT scoped per session cho micro-level polygons (z >= 18)
 *
 * Performance constraint: signed URL verify < 5ms p99. Tile proxy adds < 12ms overhead.
 */

// ─────────────────────────────────────────────────────────────────────────────
// L1 — Signed URL configuration
// ─────────────────────────────────────────────────────────────────────────────

export const SIGNED_URL_CONFIG = {
  /** HMAC-SHA256 with rotating secret (rotate weekly via Vercel cron). */
  algorithm: 'HS256',
  /** Token TTL — 15 minutes balance UX (long enough for browsing) vs theft window. */
  ttl_seconds: 15 * 60,
  /** Token includes: deviceId, ip_prefix (first 3 octets v4 / first 64 bits v6), zoom_max, sub_scope. */
  token_claims: ['device_id', 'ip_prefix', 'zoom_max', 'sub_scope', 'iat', 'exp'] as const,
  /** Refresh threshold — client requests new token at 80% TTL elapsed. */
  refresh_at_pct: 80,
  /** Key rotation cadence (Vercel cron: 0 4 * * 0). */
  key_rotation_cron: '0 4 * * 0',
  /** Keep old key valid for 1 hour after rotation to prevent mid-session failures. */
  key_grace_period_seconds: 3600,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// L2 — Coordinate precision tiers
//
// Decimal places of EPSG:4326 precision vs real-world:
//   3 decimals = ~111 m  (block-level)
//   4 decimals = ~11 m   (parcel-rough)
//   5 decimals = ~1.1 m  (parcel-good)
//   6 decimals = ~0.11 m (sub-meter)
//   7 decimals = ~0.011 m (cm-level — needed for surveyor precision)
//
// Strategy: serve degraded precision to anonymous/low-trust requests.
// Surveyor precision requires authenticated session + watermarking.
// ─────────────────────────────────────────────────────────────────────────────

export type AuthTier = 'anonymous' | 'soft-lead' | 'verified-lead' | 'sales-staff';

export const COORDINATE_PRECISION: Record<AuthTier, {
  z0_to_z16: number;
  z17_to_z18: number;
  z19_plus: number;
}> = {
  // Anonymous: chỉ thấy đủ chi tiết cho navigation, không reverse-engineer được polygon shape
  anonymous:       { z0_to_z16: 4, z17_to_z18: 5, z19_plus: 5 },
  // Soft lead (đã submit email/phone): được precision cao hơn ở zoom xa
  'soft-lead':     { z0_to_z16: 5, z17_to_z18: 5, z19_plus: 6 },
  // Verified lead (Telegram/CRM confirmed): full precision tại micro
  'verified-lead': { z0_to_z16: 5, z17_to_z18: 6, z19_plus: 6 },
  // Sales staff (Payload admin auth): full surveyor precision
  'sales-staff':   { z0_to_z16: 6, z17_to_z18: 7, z19_plus: 7 },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// L3 — Rate limiting
// ─────────────────────────────────────────────────────────────────────────────

export const RATE_LIMITS = {
  // /api/map/advisory-lots — server-rendered manifest (cacheable)
  manifest: {
    anonymous:       { requests_per_minute: 6,  burst: 12 },
    'soft-lead':     { requests_per_minute: 20, burst: 40 },
    'verified-lead': { requests_per_minute: 60, burst: 120 },
    'sales-staff':   { requests_per_minute: 600, burst: 1200 },
  },
  // /api/map/tile/[z]/[x]/[y] — per-tile proxy
  tile: {
    anonymous:       { requests_per_minute: 240,  burst: 480 },
    'soft-lead':     { requests_per_minute: 600,  burst: 1200 },
    'verified-lead': { requests_per_minute: 1800, burst: 3600 },
    'sales-staff':   { requests_per_minute: 6000, burst: 12000 },
  },
  // /api/map/lot/[internal_id] — single lot detail (full geometry)
  lot_detail: {
    anonymous:       { requests_per_minute: 30,  burst: 60 },
    'soft-lead':     { requests_per_minute: 120, burst: 240 },
    'verified-lead': { requests_per_minute: 360, burst: 720 },
    'sales-staff':   { requests_per_minute: 3600, burst: 7200 },
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// L4 — Edge cache rules
// ─────────────────────────────────────────────────────────────────────────────

export const EDGE_CACHE = {
  // PMTiles — long cache, immutable URL (versioned filename)
  pmtiles: {
    cache_control: 'public, max-age=31536000, immutable',
    versioning: 'filename-hash', // hhc.v20260521.pmtiles
  },
  // Manifest — short cache, must revalidate (status changes)
  manifest: {
    cache_control: 'public, max-age=60, s-maxage=60, stale-while-revalidate=30',
  },
  // Per-tile proxy — moderate cache, varies by tier
  tile_anonymous: {
    cache_control: 'public, max-age=300, s-maxage=300',
  },
  tile_authenticated: {
    // private — cannot be shared between users
    cache_control: 'private, max-age=600',
  },
  // Lot detail — never cache CDN (full geometry returned)
  lot_detail: {
    cache_control: 'private, no-store',
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// L5 — Canary lots (honeypot detection)
//
// 3-5 lots cố ý không tồn tại trên thực địa, có internal_id format đặc biệt.
// Nếu xuất hiện trên site khác → scraper bị detect. Báo cáo legal.
// ─────────────────────────────────────────────────────────────────────────────

export const CANARY_LOT_CONFIG = {
  /** Prefix dễ grep trong dataset bị steal. */
  internal_id_prefix: 'cn-hhc-',
  /** Số lượng canary lots. */
  count: 5,
  /** Render mode: hidden (zero opacity, không click được) — chỉ tồn tại trong API response. */
  render_mode: 'hidden' as const,
  /** Mỗi canary tags với location ở rìa boundary, không xung đột với lot thật. */
  placement: 'boundary-fringe' as const,
  /** Cron quét weekly search engines for canary IDs. */
  monitoring_cron: '0 5 * * 1',
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// L6 — CSP & CORS
// ─────────────────────────────────────────────────────────────────────────────

export const CSP_HEADER = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://www.googletagmanager.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https://cdn.bacninhhonghaccity.vn https://www.google-analytics.com",
  "font-src 'self' https://fonts.gstatic.com",
  "connect-src 'self' https://*.firestore.googleapis.com https://www.google-analytics.com https://api.resend.com",
  "frame-src https://challenges.cloudflare.com",
  "worker-src 'self' blob:",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "base-uri 'self'",
  "upgrade-insecure-requests",
].join('; ');

export const CORS_ALLOWED_ORIGINS = [
  'https://bacninhhonghaccity.vn',
  'https://staging.bacninhhonghaccity.vn',
  // Preview deployments allowed via regex pattern matched in middleware
] as const;

export const CORS_PREVIEW_PATTERN = /^https:\/\/pr-\d+-hhc\.vercel\.app$/;

// ─────────────────────────────────────────────────────────────────────────────
// L7 — JWT scopes per session
// ─────────────────────────────────────────────────────────────────────────────

export const SESSION_JWT = {
  /** Issued on first visit, refreshed silently. */
  cookie_name: 'hhc_session',
  cookie_attrs: 'HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400',
  /** Anonymous JWT scope. */
  scope_anonymous: ['map:macro', 'map:micro:precision-5'],
  /** Soft lead. */
  scope_soft_lead: ['map:macro', 'map:micro:precision-5', 'lot:detail:limited'],
  /** Verified lead. */
  scope_verified_lead: [
    'map:macro',
    'map:micro:precision-6',
    'lot:detail:full',
    'evidence:download',
    'brochure:investment-memorandum',
  ],
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// API route → required scope mapping
// ─────────────────────────────────────────────────────────────────────────────

export const API_SCOPE_REQUIREMENTS = {
  'GET /api/map/manifest':            { scope: 'map:macro',            tier: 'anonymous' as const },
  'GET /api/map/tile/[z]/[x]/[y]':    { scope: 'map:macro',            tier: 'anonymous' as const },
  'GET /api/map/lot/[id]':            { scope: 'lot:detail:limited',   tier: 'soft-lead' as const },
  'GET /api/map/lot/[id]?full=true':  { scope: 'lot:detail:full',      tier: 'verified-lead' as const },
  'POST /api/match/lots':             { scope: 'map:micro:precision-5', tier: 'anonymous' as const },
  'GET /api/evidence/[doc-id]':       { scope: 'evidence:download',    tier: 'verified-lead' as const },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Operational guards
// ─────────────────────────────────────────────────────────────────────────────

export const OPERATIONAL_GUARDS = {
  /** Maximum bbox area request to /api/map/manifest — chống full-dataset dump. */
  max_bbox_area_sqm: 5_000_000, // 5 km² (= 25% of HHC). Request lớn hơn → 413
  /** Max lot IDs per /api/map/lots-batch request. */
  max_lot_ids_per_request: 100,
  /** Block if user agent contains known scraper signatures. */
  blocked_user_agent_substrings: [
    'bot', 'crawler', 'spider', 'scrape', 'curl', 'wget',
    // Whitelisted exceptions for legit crawlers
  ] as const,
  user_agent_whitelist: [
    'Googlebot', 'Bingbot', 'DuckDuckBot', 'facebookexternalhit',
    'LinkedInBot', 'Twitterbot', 'Slackbot', 'Discordbot',
  ] as const,
  /** Suspicious traffic patterns trigger Cloudflare Turnstile mid-session. */
  trigger_turnstile_thresholds: {
    rapid_pan_zoom_per_minute: 200,
    unique_lots_clicked_per_minute: 50,
    api_429s_per_session: 3,
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Watermarking for downloaded artifacts (PDF brochures, screenshots from share/*)
// ─────────────────────────────────────────────────────────────────────────────

export const WATERMARK_CONFIG = {
  /** Investment Memorandum PDF gets per-user watermark. */
  pdf_watermark_template: 'Hồng Hạc City • {leadId} • {timestamp}',
  /** Share token URL screenshots also tagged. */
  share_url_qr_watermark: true,
  /** Stored mapping {leadId → downloaded artifacts} cho forensic trace. */
  audit_trail_collection: 'evidence_downloads',
} as const;
