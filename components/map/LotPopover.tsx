/**
 * LotPopover — Task 5 (Phase 1)
 *
 * Desktop  : Fixed side-panel anchored near screen_x/y from LotClickPayload,
 *             smart-flips left/right to stay inside viewport.
 * Mobile   : Bottom sheet (slides up from bottom edge).
 *
 * Animation budget (from 000-spec.md §animation):
 *   spring(stiffness: 260, damping: 28) — max 320ms
 *   prefers-reduced-motion: instant open, no spring.
 *
 * Status badge colours use --color-phase-* tokens from globals.css.
 */

'use client';

import { useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { LotClickPayload } from './map-types';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type LotStatus = 'available' | 'reserved' | 'sold';

export interface LotPopoverData {
  internal_id: string;
  official_lot_code: string | null;
  sku: string;
  kind: string;
  area_m2: number;
  frontage_m: number;
  orientation: string;
  status: LotStatus;
  price_indicative_vnd: number | null;
  is_corner_lot: boolean;
  is_park_facing: boolean;
  subdivision: string;
  listing: 'staging' | 'public';
}

export interface LotPopoverProps {
  /** Click payload from MapContainer — provides position + id. */
  payload: LotClickPayload;
  /** Enriched lot data. Pass null while loading. */
  data: LotPopoverData | null;
  loading?: boolean;
  onClose: () => void;
  onWatchlist: (lotId: string) => void;
  /** Whether this lot is already saved to watchlist. */
  inWatchlist?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatVnd(vnd: number): string {
  const ty = vnd / 1_000_000_000;
  if (ty >= 1) return `${ty.toFixed(ty % 1 === 0 ? 0 : 1)} tỷ`;
  return `${(vnd / 1_000_000).toFixed(0)} triệu`;
}

const ORIENTATION_LABEL: Record<string, string> = {
  N: 'Bắc', NE: 'Đông Bắc', E: 'Đông', SE: 'Đông Nam',
  S: 'Nam', SW: 'Tây Nam',  W: 'Tây',  NW: 'Tây Bắc',
};

const KIND_LABEL: Record<string, string> = {
  'villa-don-lap': 'Villa đơn lập',
  'villa-song-lap': 'Villa song lập',
  shophouse: 'Shophouse',
  townhouse: 'Townhouse',
};

const STATUS_META: Record<LotStatus, { label: string; color: string; bg: string }> = {
  available: { label: 'Còn bán',  color: 'var(--color-phase-available)', bg: 'oklch(0.95 0.05 142)' },
  reserved:  { label: 'Đã giữ',  color: 'var(--color-phase-reserved)',  bg: 'oklch(0.96 0.06 59)'  },
  sold:      { label: 'Đã bán',  color: 'var(--color-phase-sold)',      bg: 'oklch(0.96 0.05 29)'  },
};

/** Calculate smart popover position (desktop): flip if too close to right/bottom edge. */
function calcDesktopPosition(sx: number, sy: number): { top: number; left: number } {
  const PW = 320; // popover width px
  const PH = 480; // approx popover height px
  const PAD = 16;
  const vw = typeof window !== 'undefined' ? window.innerWidth  : 1440;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 900;

  const left = sx + PAD + PW > vw ? sx - PW - PAD : sx + PAD;
  const top  = sy + PH > vh - 40  ? Math.max(PAD, vh - PH - 40) : Math.max(PAD, sy - 40);
  return { top, left };
}

// ─────────────────────────────────────────────────────────────────────────────
// Spec rows — keeps markup lean
// ─────────────────────────────────────────────────────────────────────────────

function SpecRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-2 py-2" style={{ borderBottom: '1px solid var(--color-border)' }}>
      <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--color-foreground-tertiary)', minWidth: 90 }}>
        {label}
      </span>
      <span className="text-sm font-medium text-right" style={{ color: 'var(--color-foreground)', fontFamily: 'var(--font-serif)' }}>
        {value}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton — shown while data is loading
// ─────────────────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="h-4 w-24 rounded animate-pulse" style={{ backgroundColor: 'var(--color-surface-tertiary)' }} />
      <div className="aspect-video w-full rounded-lg animate-pulse" style={{ backgroundColor: 'var(--color-surface-tertiary)' }} />
      <div className="h-3 w-full rounded animate-pulse" style={{ backgroundColor: 'var(--color-surface-secondary)' }} />
      <div className="h-3 w-3/4 rounded animate-pulse" style={{ backgroundColor: 'var(--color-surface-secondary)' }} />
      <div className="h-3 w-2/3 rounded animate-pulse" style={{ backgroundColor: 'var(--color-surface-secondary)' }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Popover content — same markup for both desktop & mobile
// ─────────────────────────────────────────────────────────────────────────────

function PopoverContent({
  data,
  loading,
  onClose,
  onWatchlist,
  inWatchlist,
}: Pick<LotPopoverProps, 'data' | 'loading' | 'onClose' | 'onWatchlist' | 'inWatchlist'>) {
  const status = data?.status ?? 'available';
  const statusMeta = STATUS_META[status];

  return (
    <>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-2 px-4 pt-4 pb-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div className="flex flex-col gap-0.5">
          <p
            className="text-base font-bold leading-tight"
            style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-primary)' }}
          >
            {data ? (data.official_lot_code ?? data.internal_id) : '—'}
          </p>
          {data && (
            <p className="text-xs" style={{ color: 'var(--color-foreground-tertiary)' }}>
              {KIND_LABEL[data.kind] ?? data.kind} &middot; {data.sku}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {data && (
            <span
              className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
              style={{ color: statusMeta.color, backgroundColor: statusMeta.bg }}
            >
              {statusMeta.label}
            </span>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Dong popover"
            className="rounded-md p-1.5 transition-colors"
            style={{ color: 'var(--color-foreground-tertiary)' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-surface-secondary)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      {loading || !data ? (
        <Skeleton />
      ) : (
        <>
          {/* View simulation thumbnail — 16:9 placeholder */}
          <div className="relative mx-4 mt-3 overflow-hidden rounded-lg" style={{ aspectRatio: '16/9' }}>
            <Image
              src={`/images/lot-view-placeholder.jpg`}
              alt={`Mô phỏng tầm nhìn lô ${data.official_lot_code ?? data.internal_id}`}
              fill
              className="object-cover"
              sizes="320px"
              priority={false}
            />
            {/* Staging watermark */}
            {data.listing === 'staging' && (
              <div
                className="absolute inset-0 flex items-end p-2"
                style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 60%)' }}
              >
                <span className="rounded px-1.5 py-0.5 text-xs font-medium text-white" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
                  Thông tin tham khảo
                </span>
              </div>
            )}
          </div>

          {/* Specs grid */}
          <div className="px-4 pt-2 pb-3">
            <SpecRow label="Dien tich"  value={`${data.area_m2} m²`} />
            <SpecRow label="Mat tien"   value={`${data.frontage_m} m`} />
            <SpecRow label="Huong"      value={ORIENTATION_LABEL[data.orientation] ?? data.orientation} />
            {data.price_indicative_vnd !== null && (
              <SpecRow label="Gia tham khao" value={formatVnd(data.price_indicative_vnd)} />
            )}
            {/* Badges */}
            {(data.is_corner_lot || data.is_park_facing) && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {data.is_corner_lot && (
                  <span className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                    style={{ backgroundColor: 'var(--color-surface-secondary)', color: 'var(--color-foreground-secondary)' }}>
                    Lo goc
                  </span>
                )}
                {data.is_park_facing && (
                  <span className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                    style={{ backgroundColor: 'var(--color-surface-secondary)', color: 'var(--color-foreground-secondary)' }}>
                    Huong cong vien
                  </span>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* ── CTAs ───────────────────────────────────────────────────────────── */}
      <div className="flex gap-2 px-4 pb-4 pt-1">
        {/* Primary: Luu lot */}
        <button
          type="button"
          onClick={() => data && onWatchlist(data.internal_id)}
          disabled={!data || status === 'sold'}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-semibold transition-opacity disabled:opacity-40"
          style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-surface)' }}
          onMouseEnter={e => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = 'var(--color-primary-dark)')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--color-primary)')}
        >
          {inWatchlist ? (
            <>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
                <path d="M7 1.5l1.5 3 3.5.5-2.5 2.5.5 3.5L7 9.5l-3 1.5.5-3.5L2 5l3.5-.5L7 1.5z" />
              </svg>
              Da luu
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                <path d="M7 1.5l1.5 3 3.5.5-2.5 2.5.5 3.5L7 9.5l-3 1.5.5-3.5L2 5l3.5-.5L7 1.5z" />
              </svg>
              Luu lot
            </>
          )}
        </button>

        {/* Secondary: Xem chi tiet */}
        <Link
          href={data ? `/lot/${data.internal_id}` : '#'}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-2.5 text-sm font-semibold no-underline transition-colors"
          style={{
            borderColor: 'var(--color-border)',
            color: 'var(--color-foreground-secondary)',
            backgroundColor: 'var(--color-surface)',
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-surface-secondary)')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--color-surface)')}
          tabIndex={data ? 0 : -1}
          aria-disabled={!data}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
            <path d="M2 7h10M8 3l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Xem chi tiet
        </Link>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────────────────────────────────────

export default function LotPopover({
  payload,
  data,
  loading = false,
  onClose,
  onWatchlist,
  inWatchlist = false,
}: LotPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const { top, left } = calcDesktopPosition(payload.screen_x, payload.screen_y);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Focus trap: focus the panel on open for a11y
  useEffect(() => {
    popoverRef.current?.focus();
  }, []);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );

  const contentProps = { data, loading, onClose, onWatchlist, inWatchlist };

  return (
    <>
      {/* ── CSS animation keyframes (injected once) ──────────────────────── */}
      <style>{`
        @keyframes hhc-popover-in {
          from { opacity: 0; transform: translateY(6px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
        @keyframes hhc-sheet-in {
          from { transform: translateY(100%); }
          to   { transform: translateY(0);    }
        }
        @media (prefers-reduced-motion: reduce) {
          .hhc-popover-animate { animation: none !important; }
          .hhc-sheet-animate   { animation: none !important; }
        }
      `}</style>

      {/* ================================================================== */}
      {/* DESKTOP — fixed side panel (>= 768px)                              */}
      {/* ================================================================== */}
      <div
        ref={popoverRef}
        role="dialog"
        aria-modal="false"
        aria-label="Chi tiet lo dat"
        tabIndex={-1}
        className="hhc-popover-animate pointer-events-auto hidden md:block"
        style={{
          position: 'fixed',
          top,
          left,
          width: 320,
          zIndex: 'var(--z-popover)',
          backgroundColor: 'var(--color-popover-bg)',
          border: '1px solid var(--color-popover-border)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-popover)',
          outline: 'none',
          animation: 'hhc-popover-in 0.28s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
          /* spring(stiffness:260, damping:28) approximated as cubic-bezier overshoot */
        }}
      >
        <PopoverContent {...contentProps} />
      </div>

      {/* ================================================================== */}
      {/* MOBILE — bottom sheet (< 768px)                                    */}
      {/* ================================================================== */}
      {/* Backdrop */}
      <div
        className="pointer-events-auto fixed inset-0 md:hidden"
        style={{ zIndex: 'var(--z-modal-backdrop)', backgroundColor: 'rgba(0,0,0,0.35)' }}
        onClick={handleBackdropClick}
        aria-hidden="true"
      />
      {/* Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Chi tiet lo dat"
        tabIndex={-1}
        className="hhc-sheet-animate pointer-events-auto fixed bottom-0 left-0 right-0 md:hidden"
        style={{
          zIndex: 'var(--z-modal)',
          backgroundColor: 'var(--color-popover-bg)',
          borderTopLeftRadius:  'var(--radius-2xl)',
          borderTopRightRadius: 'var(--radius-2xl)',
          boxShadow: '0 -8px 32px -4px rgb(0 0 0 / 0.18)',
          animation: 'hhc-sheet-in 0.32s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
          outline: 'none',
          maxHeight: '82dvh',
          overflowY: 'auto',
        }}
      >
        {/* Pull handle */}
        <div className="flex justify-center pt-3 pb-1" aria-hidden="true">
          <div className="h-1 w-10 rounded-full" style={{ backgroundColor: 'var(--color-muted)' }} />
        </div>
        <PopoverContent {...contentProps} />
      </div>
    </>
  );
}
