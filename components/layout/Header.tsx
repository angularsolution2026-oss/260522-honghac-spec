import Link from 'next/link';

export function Header() {
  return (
    <header className="sticky top-0 z-sticky border-b border-muted bg-surface shadow-sm">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="no-underline">
            <div className="flex flex-col">
              <span className="font-serif text-2xl font-bold text-primary">
                Hồng Hạc
              </span>
              <span className="text-xs text-foreground-secondary">
                Phú Mỹ Hưng × Nomura
              </span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden gap-8 md:flex">
            <Link
              href="/sa-ban"
              className="font-semibold text-foreground hover:text-primary transition-colors"
            >
              Bản đồ
            </Link>
            <Link
              href="/kham-pha-do-thi"
              className="font-semibold text-foreground hover:text-primary transition-colors"
            >
              Khám phá
            </Link>
            <Link
              href="/phap-ly"
              className="font-semibold text-foreground hover:text-primary transition-colors"
            >
              Pháp lý
            </Link>
            <Link
              href="/tu-van"
              className="font-semibold text-foreground hover:text-primary transition-colors"
            >
              Tư vấn
            </Link>
          </nav>

          {/* CTA */}
          <button className="rounded-md bg-accent px-4 py-2 font-semibold text-primary hover:bg-accent-light transition-colors">
            Liên hệ
          </button>
        </div>
      </div>
    </header>
  );
}
