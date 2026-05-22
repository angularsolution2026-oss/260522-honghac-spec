import { X } from 'lucide-react';
import { useState } from 'react';

interface DisambiguationBannerProps {
  onDismiss?: () => void;
}

export function DisambiguationBanner({ onDismiss }: DisambiguationBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  return (
    <div className="bg-accent-dark text-white">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm font-semibold">
              ⚠️ Hồng Hạc City là dự án phát triển đô thị bền vững. Không phải
              là sản phẩm chứng chỉ hay hợp đồng tương lai.
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 rounded-md p-1 hover:bg-white/20 transition-colors"
            aria-label="Dismiss"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
