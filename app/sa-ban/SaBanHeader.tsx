/**
 * SaBanHeader — top bar for the /sa-ban map route.
 * Contains: logo/breadcrumb, subdivision tabs, theme switcher, fit-all button.
 */

'use client';

import Link from 'next/link';
import type { MapTheme } from '@/components/map/MapContainer';
import type { SubdivisionId } from '@/data/types/honghac';

interface SaBanHeaderProps {
  theme: MapTheme;
  onThemeChange: (theme: MapTheme) => void;
  activeSubdivision: SubdivisionId | null;
  onSubdivisionChange: (id: SubdivisionId | null) => void;
  onFitAll: () => void;
}

const SUBDIVISIONS: { id: SubdivisionId; label: string; available: boolean }[] = [
  { id: 'hong-phat', label: 'Hồng Phát', available: true },
  { id: 'hong-thinh', label: 'Hồng Thịnh', available: false },
  { id: 'hong-phuc', label: 'Hồng Phúc', available: false },
];

const THEMES: { id: MapTheme; label: string }[] = [
  { id: 'day',    label: 'Ngày' },
  { id: 'dusk',   label: 'Hoàng hôn' },
  { id: 'aerial', label: 'Vệ tinh' },
];

export default function SaBanHeader({
  theme,
  onThemeChange,
  activeSubdivision,
  onSubdivisionChange,
  onFitAll,
}: SaBanHeaderProps) {
  return (
    <header
      className="relative z-30 flex h-14 shrink-0 items-center justify-between gap-4 px-4"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      {/* Left: breadcrumb */}
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="text-sm font-semibold tracking-wide hover:opacity-80 transition-opacity"
          style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-primary)' }}
        >
          Hồng Hạc City
        </Link>
        <span style={{ color: 'var(--color-border)' }} aria-hidden>/</span>
        <span className="text-sm font-medium" style={{ color: 'var(--color-foreground-secondary)' }}>
          Sa Bàn
        </span>
      </div>

      {/* Center: subdivision tabs */}
      <nav className="hidden sm:flex items-center gap-1" aria-label="Chọn phân khu">
        <button
          onClick={onFitAll}
          className="rounded-md px-3 py-1.5 text-xs font-medium transition-colors hover:opacity-80"
          style={{
            backgroundColor: activeSubdivision === null ? 'var(--color-primary)' : 'transparent',
            color: activeSubdivision === null ? '#fff' : 'var(--color-foreground-secondary)',
            border: '1px solid var(--color-border)',
          }}
        >
          Toàn dự án
        </button>
        {SUBDIVISIONS.map(({ id, label, available }) => (
          <button
            key={id}
            onClick={() => available && onSubdivisionChange(id)}
            disabled={!available}
            className="rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
            style={{
              backgroundColor: activeSubdivision === id ? 'var(--color-primary)' : 'transparent',
              color: activeSubdivision === id
                ? '#fff'
                : available
                  ? 'var(--color-foreground-secondary)'
                  : 'var(--color-foreground-tertiary)',
              border: '1px solid var(--color-border)',
              opacity: available ? 1 : 0.5,
              cursor: available ? 'pointer' : 'default',
            }}
          >
            {label}
            {!available && (
              <span className="ml-1 rounded px-1 py-0.5 text-[10px]"
                style={{ backgroundColor: 'var(--color-surface-secondary)', color: 'var(--color-foreground-tertiary)' }}>
                Sắp ra
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Right: theme switcher */}
      <div className="flex items-center gap-1" role="group" aria-label="Chế độ bản đồ">
        {THEMES.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => onThemeChange(id)}
            className="rounded px-2.5 py-1 text-xs font-medium transition-colors"
            style={{
              backgroundColor: theme === id ? 'var(--color-primary)' : 'transparent',
              color: theme === id ? '#fff' : 'var(--color-foreground-tertiary)',
              border: '1px solid var(--color-border)',
            }}
            aria-pressed={theme === id}
          >
            {label}
          </button>
        ))}
      </div>
    </header>
  );
}
