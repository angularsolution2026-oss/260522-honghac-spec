/**
 * Three Reasons Block — Why choose Hồng Hạc City
 * Per spec: Key differentiators without aggressive sales language
 */
export function ThreeReasonsBlock() {
  const reasons = [
    {
      number: '01',
      title: 'Vị trí chiến lược',
      description:
        'Nằm tại cửa ngõ phía Đông Hà Nội, kết nối trực tiếp cao tốc Hà Nội - Bắc Ninh. Chỉ 8km đến Samsung Complex.',
      highlight: '45 phút từ Hà Nội',
    },
    {
      number: '02',
      title: 'Quy hoạch đồng bộ',
      description:
        'Kinh nghiệm 30 năm của Phú Mỹ Hưng × Nomura. Hạ tầng hoàn thiện trước khi bàn giao. Không gian xanh 40%.',
      highlight: 'PMH × Nomura',
    },
    {
      number: '03',
      title: 'Pháp lý hoàn chỉnh',
      description:
        '100% sổ hồng riêng từng lô. Quy hoạch 1/500 được phê duyệt. Giao dịch an toàn, minh bạch.',
      highlight: '100% Sổ hồng',
    },
  ];

  return (
    <section className="bg-primary py-20 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-accent">
            Vì sao chọn Hồng Hạc
          </p>
          <h2 className="mt-2 font-serif text-3xl font-bold sm:text-4xl">
            3 lý do lựa chọn Hồng Hạc City
          </h2>
        </div>

        {/* Reasons Grid */}
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {reasons.map((reason) => (
            <div key={reason.number} className="relative">
              {/* Number */}
              <span className="font-serif text-7xl font-bold text-white/10">
                {reason.number}
              </span>
              
              {/* Content */}
              <div className="-mt-8 ml-4">
                <h3 className="font-serif text-xl font-semibold">
                  {reason.title}
                </h3>
                <p className="mt-3 text-white/80">
                  {reason.description}
                </p>
                <p className="mt-4 inline-block rounded-full bg-accent/20 px-4 py-1 text-sm font-semibold text-accent">
                  {reason.highlight}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
