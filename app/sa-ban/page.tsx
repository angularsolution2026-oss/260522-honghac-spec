/**
 * /sa-ban — Interactive Urban Decision Map
 *
 * Phase 1 MVP:
 *   - MapLoader (SSR-safe dynamic import of MapContainer)
 *   - Header with theme switcher + "Khám phá" CTA
 *   - LOT click state lifted here → will feed LotPopover (Phase 1 Task 5)
 *   - FilterRail state lifted here → will feed FilterRail (Phase 1 Task 6)
 *
 * Layout: full-viewport, no scroll — map fills 100dvh minus header
 */

import type { Metadata } from 'next';
import SaBanClient from './SaBanClient';

export const metadata: Metadata = {
  title: 'Sa Bàn Tương Tác — Hồng Hạc City',
  description:
    'Khám phá 1.074 lô đất quy hoạch tại Hồng Hạc City qua bản đồ tương tác. Lọc theo pháp lý, tiện ích, ngân sách, hướng nhà.',
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Sa Bàn Hồng Hạc City — Bản đồ lô đất tương tác',
    description: 'Xem chi tiết 1.074 lô đất, lọc theo tiêu chí, tính toán tài chính ngay trên bản đồ.',
    type: 'website',
  },
};

export default function SaBanPage() {
  return <SaBanClient />;
}
