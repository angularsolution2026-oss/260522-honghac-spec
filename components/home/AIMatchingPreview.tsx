import Link from 'next/link';

/**
 * AI Matching Preview — Soft lead capture via AI-powered matching
 * Per spec: Non-aggressive lead gen through value-first approach
 */
export function AIMatchingPreview() {
  return (
    <section className="bg-background py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary-dark">
          <div className="grid items-center lg:grid-cols-2">
            {/* Content */}
            <div className="p-8 text-white sm:p-12 lg:p-16">
              <div className="inline-flex items-center gap-2 rounded-full bg-accent/20 px-4 py-1 text-sm font-semibold text-accent">
                <SparklesIcon className="h-4 w-4" />
                AI Matching
              </div>
              <h2 className="mt-6 font-serif text-3xl font-bold sm:text-4xl">
                Tìm lô đất phù hợp trong 2 phút
              </h2>
              <p className="mt-4 text-lg text-white/80">
                Trả lời vài câu hỏi đơn giản, hệ thống AI sẽ gợi ý những lô đất 
                phù hợp nhất với nhu cầu và ngân sách của bạn.
              </p>
              
              {/* Features */}
              <ul className="mt-8 space-y-4">
                {[
                  'Phân tích nhu cầu thông minh',
                  'Gợi ý lô đất theo budget',
                  'So sánh vị trí & tiện ích',
                  'Báo cáo chi tiết miễn phí',
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-white/90">
                    <CheckIcon className="h-5 w-5 flex-shrink-0 text-accent" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href="/tu-van/ai-matching"
                className="mt-10 inline-flex items-center gap-2 rounded-md bg-accent px-8 py-4 font-semibold text-primary no-underline transition-all hover:bg-accent-light hover:shadow-lg"
              >
                Bắt đầu tìm kiếm
                <ArrowIcon className="h-5 w-5" />
              </Link>
            </div>

            {/* Visual */}
            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-transparent" />
              <div className="flex h-full items-center justify-center p-12">
                {/* AI visualization placeholder */}
                <div className="relative h-64 w-64">
                  <div className="absolute inset-0 animate-pulse rounded-full bg-accent/20" />
                  <div className="absolute inset-4 animate-pulse rounded-full bg-accent/30" style={{ animationDelay: '0.2s' }} />
                  <div className="absolute inset-8 animate-pulse rounded-full bg-accent/40" style={{ animationDelay: '0.4s' }} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <SparklesIcon className="h-16 w-16 text-accent" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
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
