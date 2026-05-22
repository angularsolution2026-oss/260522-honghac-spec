import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-muted bg-surface-secondary text-foreground-secondary">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          {/* About */}
          <div>
            <h3 className="font-serif text-lg font-semibold text-foreground">
              Hồng Hạc City
            </h3>
            <p className="mt-2 text-sm">
              Phát triển đô thị bền vững 197 hecta tại Bắc Ninh.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground">Khám phá</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/sa-ban" className="no-underline hover:text-accent">
                  Bản đồ
                </Link>
              </li>
              <li>
                <Link href="/phong-cach-song" className="no-underline hover:text-accent">
                  Lifestyle
                </Link>
              </li>
              <li>
                <Link href="/tiem-nang" className="no-underline hover:text-accent">
                  Tiềm năng
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-foreground">Pháp lý</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/phap-ly/quy-hoach" className="no-underline hover:text-accent">
                  Quy hoạch
                </Link>
              </li>
              <li>
                <Link href="/phap-ly/so-hong" className="no-underline hover:text-accent">
                  Sổ hồng
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="no-underline hover:text-accent">
                  Chính sách
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-foreground">Liên hệ</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <a href="tel:+84123456789" className="no-underline hover:text-accent">
                  +84 (123) 456-789
                </a>
              </li>
              <li>
                <a href="mailto:info@bacninhhonghaccity.vn" className="no-underline hover:text-accent">
                  info@bacninhhonghaccity.vn
                </a>
              </li>
              <li>
                <a href="mailto:privacy@bacninhhonghaccity.vn" className="no-underline hover:text-accent">
                  privacy@bacninhhonghaccity.vn
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 border-t border-muted pt-8 flex items-center justify-between text-sm">
          <p>
            © {currentYear} Hồng Hạc City. All rights reserved. Quy hoạch & Phát triển bởi{' '}
            <span className="font-semibold text-accent">Phú Mỹ Hưng</span> ×{' '}
            <span className="font-semibold text-accent">Nomura</span>.
          </p>
        </div>
      </div>
    </footer>
  );
}
