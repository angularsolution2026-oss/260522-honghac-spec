export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-muted">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-serif font-bold text-primary">
            Hồng Hạc City
          </h1>
          <p className="mt-2 text-foreground-secondary">
            Phát triển đô thị bền vững × Phú Mỹ Hưng × Nomura
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-surface-secondary p-8">
          <h2 className="mb-4 text-3xl font-serif font-bold">
            Chào mừng
          </h2>
          <p className="mb-4 text-lg leading-relaxed text-foreground-secondary">
            Nền tảng tương tác khám phá và đầu tư đất nền tại Hồng Hạc City.
            100% sổ hồng, quy hoạch 1/500, pháp lý hoàn chỉnh.
          </p>
          <div className="flex gap-4">
            <a
              href="/sa-ban"
              className="inline-block rounded-md bg-primary px-6 py-3 font-semibold text-white hover:bg-primary-light transition-colors"
            >
              Khám phá bản đồ
            </a>
            <a
              href="/phap-ly"
              className="inline-block rounded-md border-2 border-primary px-6 py-3 font-semibold text-primary hover:bg-primary-light hover:text-white transition-colors"
            >
              Tài liệu pháp lý
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
