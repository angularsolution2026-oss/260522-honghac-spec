/**
 * FilterRail — Left floating filter panel (Desktop) / Bottom drawer (Mobile).
 *
 * Features:
 *   - Phase dropdown (Hong Phat + upcoming phases)
 *   - Sliders: Greenery, Sunlight, Privacy (0-100, step 5)
 *   - Budget range input (VND, formatted as "X ty")
 *   - Real-time lot count via mock countMatchingLots()
 *   - URL hash fragment persistence (#filter=greenery:60,phase:hong-phat)
 *   - Mobile: bottom drawer with pull handle
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { ChevronDown, ChevronUp, SlidersHorizontal, X } from 'lucide-react';
import type { FilterState } from '@/lib/map/lod-engine';
import type { SubdivisionId } from '@/data/types/honghac';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface FilterRailProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  activeSubdivision: SubdivisionId | null;
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const PHASES = [
  { id: null, label: 'Tất cả giai đoạn' },
  { id: 'hp-1', label: 'Hồng Phát - Đợt 1 (422 lô)' },
  { id: 'hp-2', label: 'Hồng Phát - Đợt 2 (328 lô)' },
  { id: 'hp-3', label: 'Hồng Phát - Đợt 3 (324 lô)' },
] as const;

const BUDGET_PRESETS = [
  { value: null, label: 'Không giới hạn' },
  { value: 10_000_000_000, label: 'Dưới 10 tỷ' },
  { value: 15_000_000_000, label: 'Dưới 15 tỷ' },
  { value: 20_000_000_000, label: 'Dưới 20 tỷ' },
  { value: 30_000_000_000, label: 'Dưới 30 tỷ' },
  { value: 50_000_000_000, label: 'Dưới 50 tỷ' },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Mock lot count — replaced by real countMatchingLots() in production
// ─────────────────────────────────────────────────────────────────────────────

function mockCountMatchingLots(filters: FilterState): number {
  // Simulated count based on filter strictness
  let base = 1074; // Total Hong Phat lots
  
  if (filters.phase) base = Math.floor(base / 3);
  if (filters.privacy_min > 0) base = Math.floor(base * (1 - filters.privacy_min / 150));
  if (filters.greenery_min > 0) base = Math.floor(base * (1 - filters.greenery_min / 150));
  if (filters.sunlight_min > 0) base = Math.floor(base * (1 - filters.sunlight_min / 150));
  if (filters.budget_max_vnd) base = Math.floor(base * 0.6);
  
  return Math.max(0, base);
}

// ─────────────────────────────────────────────────────────────────────────────
// URL Hash Sync
// ─────────────────────────────────────────────────────────────────────────────

function parseHashFilters(): Partial<FilterState> {
  if (typeof window === 'undefined') return {};
  
  const hash = window.location.hash.replace('#filter=', '');
  if (!hash) return {};
  
  const parsed: Partial<FilterState> = {};
  
  hash.split(',').forEach(pair => {
    const [key, value] = pair.split(':');
    if (!key || !value) return;
    
    switch (key) {
      case 'phase':
        parsed.phase = value === 'null' ? null : value;
        break;
      case 'greenery':
        parsed.greenery_min = parseInt(value, 10) || 0;
        break;
      case 'sunlight':
        parsed.sunlight_min = parseInt(value, 10) || 0;
        break;
      case 'privacy':
        parsed.privacy_min = parseInt(value, 10) || 0;
        break;
      case 'budget':
        parsed.budget_max_vnd = value === 'null' ? null : parseInt(value, 10);
        break;
    }
  });
  
  return parsed;
}

function serializeFiltersToHash(filters: FilterState): string {
  const parts: string[] = [];
  
  if (filters.phase) parts.push(`phase:${filters.phase}`);
  if (filters.greenery_min > 0) parts.push(`greenery:${filters.greenery_min}`);
  if (filters.sunlight_min > 0) parts.push(`sunlight:${filters.sunlight_min}`);
  if (filters.privacy_min > 0) parts.push(`privacy:${filters.privacy_min}`);
  if (filters.budget_max_vnd) parts.push(`budget:${filters.budget_max_vnd}`);
  
  return parts.length > 0 ? `#filter=${parts.join(',')}` : '';
}

// ─────────────────────────────────────────────────────────────────────────────
// Slider Component
// ─────────────────────────────────────────────────────────────────────────────

interface SliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

function Slider({ label, value, onChange, min = 0, max = 100, step = 5 }: SliderProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label
          className="text-xs font-medium"
          style={{ color: 'var(--color-foreground-secondary)' }}
        >
          {label}
        </label>
        <span
          className="text-xs font-semibold tabular-nums"
          style={{ color: value > 0 ? 'var(--color-primary)' : 'var(--color-foreground-tertiary)' }}
        >
          {value > 0 ? `≥ ${value}%` : 'Tất cả'}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="filter-slider w-full"
        style={{
          '--slider-progress': `${(value / max) * 100}%`,
        } as React.CSSProperties}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function FilterRail({
  filters,
  onFiltersChange,
  activeSubdivision,
  className = '',
}: FilterRailProps) {
  // Mobile drawer state
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isPhaseDropdownOpen, setIsPhaseDropdownOpen] = useState(false);
  const [isBudgetDropdownOpen, setIsBudgetDropdownOpen] = useState(false);

  // Lot count
  const matchingLotCount = useMemo(() => mockCountMatchingLots(filters), [filters]);

  // Sync URL hash on mount
  useEffect(() => {
    const hashFilters = parseHashFilters();
    if (Object.keys(hashFilters).length > 0) {
      onFiltersChange({ ...filters, ...hashFilters });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update URL hash when filters change
  useEffect(() => {
    const hash = serializeFiltersToHash(filters);
    if (hash) {
      window.history.replaceState(null, '', hash);
    } else if (window.location.hash.startsWith('#filter=')) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [filters]);

  // Filter update helpers
  const updateFilter = useCallback(<K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  }, [filters, onFiltersChange]);

  const resetFilters = useCallback(() => {
    onFiltersChange({
      subdivision: activeSubdivision,
      phase: null,
      privacy_min: 0,
      greenery_min: 0,
      sunlight_min: 0,
      budget_max_vnd: null,
      spotlight_ids: null,
    });
  }, [activeSubdivision, onFiltersChange]);

  const hasActiveFilters = useMemo(() => {
    return (
      filters.phase !== null ||
      filters.privacy_min > 0 ||
      filters.greenery_min > 0 ||
      filters.sunlight_min > 0 ||
      filters.budget_max_vnd !== null
    );
  }, [filters]);

  // ─────────────────────────────────────────────────────────────────────────────
  // Filter Panel Content (shared between desktop & mobile)
  // ─────────────────────────────────────────────────────────────────────────────

  const filterContent = (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} style={{ color: 'var(--color-primary)' }} />
          <h3
            className="text-sm font-semibold"
            style={{ color: 'var(--color-foreground)', fontFamily: 'var(--font-serif)' }}
          >
            Bộ lọc
          </h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="text-xs font-medium transition-colors hover:opacity-80"
            style={{ color: 'var(--color-accent)' }}
          >
            Đặt lại
          </button>
        )}
      </div>

      {/* Lot count badge */}
      <div
        className="flex items-center justify-center rounded-md py-2"
        style={{ backgroundColor: 'var(--color-surface-secondary)' }}
      >
        <span
          className="text-lg font-bold tabular-nums"
          style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-serif)' }}
        >
          {matchingLotCount.toLocaleString('vi-VN')}
        </span>
        <span
          className="ml-2 text-xs"
          style={{ color: 'var(--color-foreground-secondary)' }}
        >
          lô phù hợp
        </span>
      </div>

      {/* Phase dropdown */}
      <div className="space-y-2">
        <label
          className="text-xs font-medium"
          style={{ color: 'var(--color-foreground-secondary)' }}
        >
          Giai đoạn mở bán
        </label>
        <div className="relative">
          <button
            onClick={() => setIsPhaseDropdownOpen(!isPhaseDropdownOpen)}
            className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors"
            style={{
              backgroundColor: 'var(--color-surface-secondary)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-foreground)',
            }}
          >
            <span>{PHASES.find(p => p.id === filters.phase)?.label ?? 'Tất cả giai đoạn'}</span>
            {isPhaseDropdownOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          {isPhaseDropdownOpen && (
            <div
              className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-md shadow-lg"
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
              }}
            >
              {PHASES.map((phase) => (
                <button
                  key={phase.id ?? 'all'}
                  onClick={() => {
                    updateFilter('phase', phase.id);
                    setIsPhaseDropdownOpen(false);
                  }}
                  className="block w-full px-3 py-2 text-left text-sm transition-colors hover:opacity-80"
                  style={{
                    backgroundColor: filters.phase === phase.id ? 'var(--color-surface-secondary)' : 'transparent',
                    color: 'var(--color-foreground)',
                  }}
                >
                  {phase.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sliders */}
      <Slider
        label="Độ xanh (Greenery)"
        value={filters.greenery_min}
        onChange={(v) => updateFilter('greenery_min', v)}
      />
      <Slider
        label="Ánh sáng (Sunlight)"
        value={filters.sunlight_min}
        onChange={(v) => updateFilter('sunlight_min', v)}
      />
      <Slider
        label="Riêng tư (Privacy)"
        value={filters.privacy_min}
        onChange={(v) => updateFilter('privacy_min', v)}
      />

      {/* Budget dropdown */}
      <div className="space-y-2">
        <label
          className="text-xs font-medium"
          style={{ color: 'var(--color-foreground-secondary)' }}
        >
          Ngân sách tối đa
        </label>
        <div className="relative">
          <button
            onClick={() => setIsBudgetDropdownOpen(!isBudgetDropdownOpen)}
            className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors"
            style={{
              backgroundColor: 'var(--color-surface-secondary)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-foreground)',
            }}
          >
            <span>
              {BUDGET_PRESETS.find(b => b.value === filters.budget_max_vnd)?.label ?? 'Không giới hạn'}
            </span>
            {isBudgetDropdownOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          {isBudgetDropdownOpen && (
            <div
              className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-md shadow-lg"
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
              }}
            >
              {BUDGET_PRESETS.map((budget) => (
                <button
                  key={budget.value ?? 'unlimited'}
                  onClick={() => {
                    updateFilter('budget_max_vnd', budget.value);
                    setIsBudgetDropdownOpen(false);
                  }}
                  className="block w-full px-3 py-2 text-left text-sm transition-colors hover:opacity-80"
                  style={{
                    backgroundColor: filters.budget_max_vnd === budget.value ? 'var(--color-surface-secondary)' : 'transparent',
                    color: 'var(--color-foreground)',
                  }}
                >
                  {budget.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Desktop: Left floating panel */}
      <aside
        className={`pointer-events-auto hidden w-72 rounded-lg p-4 shadow-lg md:block ${className}`}
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
        }}
      >
        {filterContent}
      </aside>

      {/* Mobile: Bottom drawer toggle button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="pointer-events-auto fixed bottom-20 left-4 z-30 flex items-center gap-2 rounded-full px-4 py-2 shadow-lg md:hidden"
        style={{
          backgroundColor: 'var(--color-primary)',
          color: 'var(--color-primary-foreground)',
        }}
      >
        <SlidersHorizontal size={18} />
        <span className="text-sm font-medium">
          Lọc ({matchingLotCount.toLocaleString('vi-VN')})
        </span>
      </button>

      {/* Mobile: Bottom drawer */}
      {isMobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
          
          {/* Drawer */}
          <div
            className="fixed inset-x-0 bottom-0 z-50 max-h-[80vh] overflow-y-auto rounded-t-2xl p-4 pb-8 shadow-2xl md:hidden"
            style={{
              backgroundColor: 'var(--color-surface)',
              animation: 'hhc-sheet-in 320ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
            }}
          >
            {/* Pull handle */}
            <div className="mb-4 flex justify-center">
              <div
                className="h-1 w-10 rounded-full"
                style={{ backgroundColor: 'var(--color-border)' }}
              />
            </div>

            {/* Close button */}
            <button
              onClick={() => setIsMobileOpen(false)}
              className="absolute right-4 top-4 rounded-full p-2"
              style={{ backgroundColor: 'var(--color-surface-secondary)' }}
              aria-label="Đóng"
            >
              <X size={18} style={{ color: 'var(--color-foreground-secondary)' }} />
            </button>

            {filterContent}
          </div>
        </>
      )}
    </>
  );
}
