import Link from 'next/link';

/**
 * Evidence Block — 3 Trust Cards (Sổ hồng, Quy hoạch, Phê duyệt)
 * Per spec: E-E-A-T signals, transparency, legal proof
 */
export function EvidenceBlock() {
  const evidenceCards = [
    {
      icon: DocumentIcon,
      title: 'Sổ hồng vĩnh viễn',
      description: '100% lô đất đã có sổ hồng riêng. Pháp lý minh bạch, giao dịch an toàn.',
      link: '/phap-ly/so-hong',
      linkText: 'Xem mẫu sổ hồng',
    },
    {
      icon: MapIcon,
      title: 'Quy hoạch 1/500',
      description: 'Quy hoạch chi tiết được UBND tỉnh phê duyệt. Hạ tầng đồng bộ hoàn chỉnh.',
      link: '/phap-ly/quy-hoach',
      linkText: 'Xem quy hoạch',
    },
    {
      icon: ShieldIcon,
      title: 'Phê duyệt chính thức',
      description: 'Quyết định phê duyệt số 123/QĐ-UBND. Dự án hợp pháp, đủ điều kiện kinh doanh.',
      link: '/phap-ly',
      linkText: 'Tài liệu pháp lý',
    },
  ];

  return (
    <section className="bg-surface-secondary py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-accent">
            Pháp lý minh bạch
          </p>
          <h2 className="mt-2 font-serif text-3xl font-bold text-foreground sm:text-4xl">
            Yên tâm đầu tư với pháp lý hoàn chỉnh
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-foreground-secondary">
            Hồng Hạc City là một trong số ít dự án tại Bắc Ninh có đầy đủ pháp lý ngay từ ngày đầu mở bán.
          </p>
        </div>

        {/* Cards */}
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {evidenceCards.map((card) => (
            <div
              key={card.title}
              className="group rounded-xl border border-border bg-surface p-8 transition-all hover:border-accent hover:shadow-lg"
            >
              <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3 text-primary">
                <card.icon className="h-6 w-6" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-foreground">
                {card.title}
              </h3>
              <p className="mt-2 text-foreground-secondary">
                {card.description}
              </p>
              <Link
                href={card.link}
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-accent no-underline transition-colors hover:text-accent-light"
              >
                {card.linkText}
                <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DocumentIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function MapIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  );
}
