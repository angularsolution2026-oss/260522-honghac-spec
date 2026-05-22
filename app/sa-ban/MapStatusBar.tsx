/**
 * MapStatusBar — bottom-left overlay showing current map mode + selected lot.
 */

'use client';

interface MapStatusBarProps {
  mode: 'macro' | 'micro';
  selectedLotId: string | null;
}

export default function MapStatusBar({ mode, selectedLotId }: MapStatusBarProps) {
  return (
    <div
      className="pointer-events-none absolute bottom-8 left-4 z-10 flex items-center gap-2"
    >
      {/* Mode badge */}
      <span
        className="rounded-full px-3 py-1 text-xs font-semibold tracking-wide"
        style={{
          backgroundColor: mode === 'micro' ? 'var(--color-primary)' : 'rgba(0,0,0,0.55)',
          color: '#fff',
          backdropFilter: 'blur(4px)',
        }}
      >
        {mode === 'micro' ? 'Chế độ vi mô' : 'Chế độ tổng quan'}
      </span>

      {/* Selected lot badge */}
      {selectedLotId && (
        <span
          className="rounded-full px-3 py-1 text-xs font-semibold"
          style={{
            backgroundColor: 'var(--color-accent)',
            color: '#1a1a1a',
          }}
        >
          Lô: {selectedLotId}
        </span>
      )}
    </div>
  );
}
