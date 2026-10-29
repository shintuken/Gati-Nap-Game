import React, { useEffect } from 'react';
import { GamePackage } from '../types';
import { X, Sparkles, Check, Gem, Gift, Crown, Calendar } from 'lucide-react';

interface PackageDetailModalProps {
  pkg: GamePackage | null;
  isOpen: boolean;
  isSoldOut?: boolean;
  onClose: () => void;
  onAddToCart: (pkg: GamePackage) => void;
}

export const PackageDetailModal: React.FC<PackageDetailModalProps> = ({
  pkg,
  isOpen,
  isSoldOut = false,
  onClose,
  onAddToCart,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !pkg) return null;

  const formatVnd = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' VND';
  };

  const handleConfirmAdd = () => {
    if (isSoldOut) return;
    onAddToCart(pkg);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="package-detail-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#18181b] rounded-2xl shadow-2xl border border-zinc-800 overflow-hidden transform transition-all animate-in zoom-in-95 duration-150 text-[#fcfcfc]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative flex items-center justify-center px-6 py-4 border-b border-zinc-800">
          <h3
            id="package-detail-modal-title"
            className="text-base font-bold text-[#fcfcfc] tracking-tight text-center"
          >
            Chi tiết gói
          </h3>
          <button
            onClick={onClose}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-sm">
          {/* Top Package Snapshot */}
          <div className="flex items-center gap-3.5">
            {/* Golden banner card icon */}
            <div className="w-20 h-12 rounded-xl bg-gradient-to-br from-amber-700 via-amber-900 to-amber-950 p-1 flex items-center justify-center border border-amber-500/50 shadow-md shrink-0 relative overflow-hidden">
              <div className="absolute inset-0 bg-radial from-amber-400/20 to-transparent pointer-events-none" />
              <div className="flex items-center gap-1 text-[11px] font-black text-amber-300 drop-shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>{pkg.currencyAmount}</span>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-[#fcfcfc] text-sm">{pkg.name}</h4>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="font-extrabold text-[#fb5503] font-mono text-sm sm:text-base">
                  {formatVnd(pkg.price)}
                </span>
                {pkg.originalPrice && pkg.originalPrice > pkg.price && (
                  <>
                    <span className="line-through text-zinc-500 font-mono text-xs">
                      {formatVnd(pkg.originalPrice)}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-600/20 text-rose-400 border border-rose-500/30">
                      Tiết kiệm {formatVnd(pkg.originalPrice - pkg.price)}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Thông tin gói nạp */}
          <div className="space-y-2 pt-3 border-t border-zinc-800">
            <h5 className="font-bold text-zinc-200 text-xs tracking-wide">
              Thông tin gói nạp
            </h5>

            <div className="text-xs text-zinc-300 space-y-1.5 leading-relaxed">
              <p>
                Nạp nhận <strong className="text-[#fb5503] font-bold">{pkg.currencyAmount}</strong>
                {pkg.bonusAmount ? (
                  <span className="text-amber-400 font-semibold"> ({pkg.bonusAmount})</span>
                ) : null}
              </p>
              <p className="text-zinc-400">
                {pkg.detailDesc ||
                  'Kim Phiếu có thể dùng để mua các túi quà trong game như: Quà Tân Thủ, Quà Hạn Giờ, Quỹ Vòng Quay, Quà Đặc Biệt, Ưu Đãi Tuần...'}
              </p>

              {pkg.detailPerks && pkg.detailPerks.length > 0 && (
                <div className="bg-[#121214] border border-zinc-800 rounded-xl p-3 my-2 space-y-1.5">
                  <span className="font-bold text-amber-400 block text-[11px]">
                    Vật phẩm nhận kèm:
                  </span>
                  <ul className="space-y-1 text-zinc-300">
                    {pkg.detailPerks.map((perk, idx) => (
                      <li key={idx} className="flex items-center gap-1.5 text-[11px]">
                        <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="text-[11px] text-zinc-500 italic pt-1">
                {pkg.noteVIP ||
                  '*Lưu ý: mua Kim Phiếu sẽ không cộng điểm VIP, cần sử dụng Kim Phiếu mua các túi quà trong game mới có thể tăng điểm VIP.'}
              </p>
            </div>
          </div>

          {/* Action CTA: Thêm vào giỏ hàng */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleConfirmAdd}
              disabled={isSoldOut}
              className="w-full py-3 px-4 rounded-xl bg-[#fb5503] hover:bg-[#e04c02] active:bg-[#c44100] text-white font-bold text-sm shadow-[0_4px_16px_rgba(251,85,3,0.35)] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{isSoldOut ? 'Gói đã hết lượt mua' : 'Thêm vào giỏ hàng'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
