'use client';

import { useState } from 'react';
import Link from 'next/link';

/**
 * Segmented Path Switch — "Ở thực" vs "Đầu tư" personas
 * Per spec: Two primary personas with different needs/content
 */
export function SegmentedPathSwitch() {
  const [activeTab, setActiveTab] = useState<'family' | 'investor'>('family');

  const tabs = {
    family: {
      label: 'Ở thực',
      headline: 'Không gian sống lý tưởng cho gia đình',
      description:
        'Môi trường trong lành, trường học quốc tế, tiện ích đầy đủ. Chỉ 45 phút từ trung tâm Hà Nội.',
      features: [
        'Trường học liên cấp quốc tế',
        'Công viên & hồ điều hòa 15ha',
        'Bệnh viện & trung tâm y tế',
        'Khu thương mại & giải trí',
      ],
      cta: 'Tìm lô phù hợp gia đình',
      ctaLink: '/tu-van?segment=family',
    },
    investor: {
      label: 'Đầu tư',
      headline: 'Cơ hội đầu tư sinh lời bền vững',
      description:
        'Vị trí chiến lược kết nối Samsung Complex. Tiềm năng tăng giá khi hạ tầng hoàn thiện.',
      features: [
        'Cách Samsung Display 8km',
        'Cao tốc Hà Nội - Bắc Ninh',
        'Dự báo tăng giá 15-20%/năm',
        'Thanh khoản cao, dễ chuyển nhượng',
      ],
      cta: 'Xem phân tích đầu tư',
      ctaLink: '/tu-van?segment=investor',
    },
  };

  const activeContent = tabs[activeTab];

  return (
    <section className="bg-background py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-accent">
            Bạn đang tìm kiếm điều gì?
          </p>
          <h2 className="mt-2 font-serif text-3xl font-bold text-foreground sm:text-4xl">
            Chọn hành trình của bạn
          </h2>
        </div>

        {/* Tab Switcher */}
        <div className="mx-auto mt-10 flex max-w-md rounded-full border border-border bg-surface p-1">
          {(Object.keys(tabs) as Array<keyof typeof tabs>).map((key) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 rounded-full py-3 text-sm font-semibold transition-all ${
                activeTab === key
                  ? 'bg-primary text-white shadow-md'
                  : 'text-foreground-secondary hover:text-foreground'
              }`}
            >
              {tabs[key].label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="mt-12 grid items-center gap-12 lg:grid-cols-2">
          {/* Text */}
          <div>
            <h3 className="font-serif text-2xl font-bold text-foreground sm:text-3xl">
              {activeContent.headline}
            </h3>
            <p className="mt-4 text-lg text-foreground-secondary">
              {activeContent.description}
            </p>
            <ul className="mt-8 space-y-4">
              {activeContent.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <CheckIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent" />
                  <span className="text-foreground-secondary">{feature}</span>
                </li>
              ))}
            </ul>
            <Link
              href={activeContent.ctaLink}
              className="mt-8 inline-flex items-center gap-2 rounded-md bg-accent px-6 py-3 font-semibold text-primary no-underline transition-all hover:bg-accent-light hover:shadow-md"
            >
              {activeContent.cta}
              <ArrowIcon className="h-4 w-4" />
            </Link>
          </div>

          {/* Image Placeholder */}
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-surface-secondary">
            <div className="absolute inset-0 flex items-center justify-center text-foreground-tertiary">
              <span className="text-lg">
                {activeTab === 'family' ? 'Family lifestyle image' : 'Investment growth image'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  );
}
