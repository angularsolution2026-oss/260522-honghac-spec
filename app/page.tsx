export default function Home() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Header */}
      <header style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1
            className="text-5xl font-bold"
            style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-primary)' }}
          >
            Hồng Hạc City
          </h1>
          <p
            className="mt-2 text-lg"
            style={{ color: 'var(--color-foreground-secondary)' }}
          >
            Phát triển đô thị bền vững × Phú Mỹ Hưng × Nomura
          </p>
        </div>
      </header>

      {/* Hero section */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div
          className="rounded-lg p-8"
          style={{ backgroundColor: 'var(--color-surface-secondary)' }}
        >
          <h2
            className="mb-4 text-3xl font-bold"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Chào mừng
          </h2>
          <p
            className="mb-6 text-lg leading-relaxed"
            style={{ color: 'var(--color-foreground-secondary)' }}
          >
            Nền tảng tương tác khám phá và đầu tư đất nền tại Hồng Hạc City.
            100% sổ hồng, quy hoạch 1/500, pháp lý hoàn chỉnh.
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="/sa-ban"
              className="inline-block rounded-md px-6 py-3 font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              Khám phá bản đồ
            </a>
            <a
              href="/phap-ly"
              className="inline-block rounded-md px-6 py-3 font-semibold transition-opacity hover:opacity-90"
              style={{
                border: '2px solid var(--color-primary)',
                color: 'var(--color-primary)',
              }}
            >
              Tài liệu pháp lý
            </a>
          </div>
        </div>

        {/* Design token showcase — Phase 0 visual proof */}
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'Primary', bg: 'var(--color-primary)', text: '#fff' },
            { label: 'Accent (Gold)', bg: 'var(--color-accent)', text: '#1a1a1a' },
            { label: 'Surface', bg: 'var(--color-surface-secondary)', text: 'var(--color-foreground)' },
            { label: 'Muted', bg: 'var(--color-muted)', text: '#fff' },
          ].map(({ label, bg, text }) => (
            <div
              key={label}
              className="flex h-20 items-center justify-center rounded-lg text-sm font-medium"
              style={{ backgroundColor: bg, color: text }}
            >
              {label}
            </div>
          ))}
        </div>

        <p
          className="mt-6 text-sm"
          style={{ color: 'var(--color-foreground-tertiary)' }}
        >
          Phase 0 scaffold — design tokens active. Next: Phase 1 Map Integration.
        </p>
      </section>
    </main>
  );
}
