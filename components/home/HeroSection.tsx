import Link from 'next/link';

/**
 * Hero Section — Main landing hero with video background and CTAs
 * Per spec: "Hero video + CTA", no aggressive sales language
 */
export function HeroSection() {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Video Background Placeholder */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-primary-dark">
        {/* Video will be added later - for now gradient placeholder */}
        <div className="absolute inset-0 bg-[url('/images/hero-pattern.svg')] opacity-10" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-5xl px-4 text-center text-white sm:px-6 lg:px-8">
        {/* Tagline */}
        <p className="mb-4 text-sm font-medium uppercase tracking-widest text-accent">
          Phú Mỹ Hưng × Nomura
        </p>

        {/* Headline */}
        <h1 className="font-serif text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
          Hồng Hạc City
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-white/90 sm:text-xl">
          197 hecta đô thị bền vững tại cửa ngõ phía Đông Hà Nội.
          <br className="hidden sm:block" />
          Quy hoạch 1/500 hoàn chỉnh. 100% sổ hồng.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/kham-pha-do-thi"
            className="inline-flex items-center gap-2 rounded-md bg-accent px-8 py-4 font-semibold text-primary transition-all hover:bg-accent-light hover:shadow-lg"
          >
            Khám phá dự án
            <ArrowIcon />
          </Link>
          <Link
            href="/tu-van"
            className="inline-flex items-center gap-2 rounded-md border-2 border-white/30 bg-white/10 px-8 py-4 font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
          >
            Nhận tư vấn miễn phí
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 gap-6 sm:grid-cols-4">
          {[
            { value: '197', unit: 'ha', label: 'Quy mô' },
            { value: '2,449', unit: 'lô', label: 'Đất nền' },
            { value: '100%', unit: '', label: 'Sổ hồng' },
            { value: '45m²', unit: '+', label: 'Diện tích từ' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-serif text-3xl font-bold text-accent sm:text-4xl">
                {stat.value}
                <span className="text-lg text-white/70">{stat.unit}</span>
              </p>
              <p className="mt-1 text-sm text-white/70">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ChevronDownIcon className="h-8 w-8 text-white/50" />
      </div>
    </section>
  );
}

function ArrowIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}
