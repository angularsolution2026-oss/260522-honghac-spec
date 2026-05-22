import Link from 'next/link';

/**
 * CTA Section — Final call-to-action before footer
 * Per spec: Soft lead capture, no pressure
 */
export function CTASection() {
  return (
    <section className="bg-surface py-20">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="font-serif text-3xl font-bold text-foreground sm:text-4xl">
          Sẵn sàng khám phá Hồng Hạc City?
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-foreground-secondary">
          Đăng ký nhận thông tin chi tiết về dự án, cập nhật tiến độ và các chương trình ưu đãi.
        </p>
        
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/tu-van"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-8 py-4 font-semibold text-white no-underline transition-all hover:bg-primary-light hover:shadow-lg"
          >
            Nhận tư vấn miễn phí
          </Link>
          <Link
            href="/phap-ly"
            className="inline-flex items-center gap-2 rounded-md border-2 border-border px-8 py-4 font-semibold text-foreground no-underline transition-all hover:border-primary hover:text-primary"
          >
            Xem tài liệu pháp lý
          </Link>
        </div>

        <p className="mt-8 text-sm text-foreground-tertiary">
          Hoặc gọi trực tiếp: <a href="tel:+84123456789" className="font-semibold text-accent">+84 (123) 456-789</a>
        </p>
      </div>
    </section>
  );
}
