import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import '@/styles/globals.css';

/* ============================================================================
   Font Loading (Section 11.2)
   ============================================================================ */

const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '600', '700'],
  variable: '--font-serif',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

/* ============================================================================
   Metadata (SEO / OG)
   ============================================================================ */

export const metadata: Metadata = {
  title: {
    default: 'Hồng Hạc City — Phú Mỹ Hưng × Nomura',
    template: '%s | Hồng Hạc City',
  },
  description:
    'Phát triển đô thị bền vững 197 hecta tại Bắc Ninh. 100% sổ hồng, quy hoạch 1/500, pháp lý hoàn chỉnh. Khám phá lô đất từ 45m² — Ở thực hoặc Đầu tư.',
  keywords: [
    'đất nền Bắc Ninh',
    'Hồng Hạc City',
    'Phú Mỹ Hưng',
    'đầu tư bất động sản',
    'Nomura',
    'dự án quy hoạch',
  ],
  authors: [{ name: 'Hồng Hạc City' }],
  creator: 'Hồng Hạc City',
  publisher: 'Hồng Hạc City',
  formatDetection: {
    email: true,
    telephone: true,
    address: true,
  },
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: 'https://bacninhhonghaccity.vn',
    siteName: 'Hồng Hạc City',
    title: 'Hồng Hạc City — Phú Mỹ Hưng × Nomura',
    description:
      'Phát triển đô thị bền vững 197 hecta tại Bắc Ninh. 100% sổ hồng, quy hoạch 1/500, pháp lý hoàn chỉnh.',
    images: [
      {
        url: 'https://bacninhhonghaccity.vn/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Hồng Hạc City — Phú Mỹ Hưng × Nomura',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@honghaccity',
    title: 'Hồng Hạc City — Phú Mỹ Hưng × Nomura',
    description:
      'Phát triển đô thị bền vững 197 hecta tại Bắc Ninh. 100% sổ hồng, quy hoạch 1/500.',
    images: ['https://bacninhhonghaccity.vn/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    'max-snippet': -1,
    'max-image-preview': 'large',
    'max-video-preview': -1,
  },
  alternates: {
    canonical: 'https://bacninhhonghaccity.vn',
    languages: {
      'vi-VN': 'https://bacninhhonghaccity.vn',
      'en-US': 'https://bacninhhonghaccity.vn/en',
    },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#faf8f5' },
    { media: '(prefers-color-scheme: dark)', color: '#131311' },
  ],
};

/* ============================================================================
   Root Layout
   ============================================================================ */

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="vi"
      className={`${cormorantGaramond.variable} ${inter.variable} bg-background`}
      suppressHydrationWarning
    >
      <body className="text-foreground">
        {children}
      </body>
    </html>
  );
}
