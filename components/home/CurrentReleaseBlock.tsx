import Link from 'next/link';

/**
 * Current Release Block — Hồng Phát subdivision highlight
 * Per spec: Current phase being sold, key info without price pressure
 */
export function CurrentReleaseBlock() {
  return (
    <section className="bg-surface-secondary py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Image */}
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-surface">
            <div className="absolute inset-0 flex items-center justify-center text-foreground-tertiary">
              <span className="text-lg">Hồng Phát subdivision image</span>
            </div>
            {/* Phase Badge */}
            <div className="absolute left-4 top-4 rounded-full bg-accent px-4 py-1 text-sm font-semibold text-primary">
              Đang mở bán
            </div>
          </div>

          {/* Content */}
          <div>
            <p className="text-sm font-medium uppercase tracking-widest text-accent">
              Giai đoạn hiện tại
            </p>
            <h2 className="mt-2 font-serif text-3xl font-bold text-foreground sm:text-4xl">
              Phân khu Hồng Phát
            </h2>
            <p className="mt-4 text-lg text-foreground-secondary">
              Phân khu đầu tiên với 1.074 lô đất nền, đa dạng diện tích từ 45m² đến 200m².
              Vị trí đắc địa ngay trục đường chính, tiện ích đầy đủ.
            </p>

            {/* Stats */}
            <div className="mt-8 grid grid-cols-3 gap-6">
              {[
                { value: '1,074', label: 'Lô đất' },
                { value: '45-200', label: 'm² diện tích' },
                { value: '80%', label: 'Đã có chủ' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="font-serif text-2xl font-bold text-primary">
                    {stat.value}
                  </p>
                  <p className="text-sm text-foreground-secondary">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Features */}
            <ul className="mt-8 space-y-3">
              {[
                'Mặt tiền đường 13.5m',
                'Hạ tầng hoàn thiện 100%',
                'Sổ hồng riêng từng lô',
                'Cách Samsung Display 8km',
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-foreground-secondary">
                  <CheckCircleIcon className="h-5 w-5 text-accent" />
                  {feature}
                </li>
              ))}
            </ul>

            {/* CTA */}
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/tu-van"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 font-semibold text-white no-underline transition-all hover:bg-primary-light hover:shadow-md"
              >
                Nhận thông tin chi tiết
              </Link>
              <Link
                href="/tien-do"
                className="inline-flex items-center gap-2 rounded-md border-2 border-primary px-6 py-3 font-semibold text-primary no-underline transition-all hover:bg-primary/5"
              >
                Xem tiến độ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
