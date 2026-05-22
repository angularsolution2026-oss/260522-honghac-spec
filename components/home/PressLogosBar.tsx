import Image from 'next/image';

/**
 * Press Logos Bar — Social proof from trusted media/partners
 * Per spec: Build trust through recognized logos
 */
export function PressLogosBar() {
  const logos = [
    { name: 'VnExpress', width: 120 },
    { name: 'CafeF', width: 80 },
    { name: 'Báo Đầu Tư', width: 100 },
    { name: 'Forbes VN', width: 90 },
    { name: 'Vietnam Finance', width: 110 },
  ];

  return (
    <section className="border-y border-border bg-surface py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="mb-6 text-center text-sm font-medium uppercase tracking-widest text-foreground-tertiary">
          Được đưa tin bởi
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 opacity-60 grayscale transition-all hover:opacity-100 hover:grayscale-0 lg:gap-16">
          {logos.map((logo) => (
            <div
              key={logo.name}
              className="flex h-8 items-center justify-center"
              style={{ width: logo.width }}
            >
              {/* Placeholder for actual logos */}
              <span className="font-serif text-lg font-semibold text-foreground-secondary">
                {logo.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
