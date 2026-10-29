import React, { useEffect } from 'react';
import { Game, GameServer, Character, GamePackage, PaymentMethod } from '../types';
import { X, ShieldAlert, ArrowRight, ArrowLeft } from 'lucide-react';

interface FinalConfirmModalProps {
  isOpen: boolean;
  game: Game;
  server: GameServer;
  character: Character;
  pkg: GamePackage;
  quantity: number;
  paymentMethod: PaymentMethod;
  onClose: () => void;
  onConfirmPayment: () => void;
}

export const FinalConfirmModal: React.FC<FinalConfirmModalProps> = ({
  isOpen,
  game,
  server,
  character,
  pkg,
  quantity,
  paymentMethod,
  onClose,
  onConfirmPayment,
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

  if (!isOpen) return null;

  const formatVnd = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' VND';
  };

  const unitPrice = pkg.price;
  const originalUnitPrice =
    pkg.originalPrice && pkg.originalPrice > pkg.price ? pkg.originalPrice : pkg.price;
  const isSale = originalUnitPrice > unitPrice;
  const originalTotal = originalUnitPrice * quantity;
  const totalPrice = unitPrice * quantity;
  const discountTotal = isSale ? originalTotal - totalPrice : 0;

  const getRewardSummary = (): string => {
    if (pkg.baseCurrencyNumeric) {
      const totalBase = pkg.baseCurrencyNumeric * quantity;
      const totalBonus = pkg.bonusCurrencyNumeric ? pkg.bonusCurrencyNumeric * quantity : 0;
      const baseFormatted = new Intl.NumberFormat('vi-VN').format(totalBase);
      if (totalBonus > 0) {
        const bonusFormatted = new Intl.NumberFormat('vi-VN').format(totalBonus);
        return `${baseFormatted} Kim Phiếu (+${bonusFormatted} Kim Phiếu bonus)`;
      }
      return `${baseFormatted} Kim Phiếu`;
    }
    return pkg.bonusAmount ? `${pkg.currencyAmount} · ${pkg.bonusAmount}` : pkg.currencyAmount;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div
        className="w-full max-w-lg bg-[#18181b] rounded-2xl shadow-2xl border border-zinc-800 overflow-hidden transform transition-all text-[#fcfcfc]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-[#121214] text-white">
          <div>
            <h3 id="confirm-modal-title" className="text-base font-bold text-white">
              Xác nhận thông tin giao dịch Gati Games
            </h3>
            <p className="text-xs text-zinc-400">Bước kiểm tra cuối cùng trước khi chuyển sang cổng thanh toán</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content details */}
        <div className="p-6 space-y-4 text-sm">
          {/* Warning box */}
          <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-600/40 text-amber-200 text-xs flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p>
              Vui lòng kiểm tra kỹ <strong>Tên nhân vật</strong>, <strong>Máy chủ</strong> và <strong>Số lượng gói</strong>. Giao dịch sau khi thanh toán thành công sẽ nạp trực tiếp vào tài khoản và không thể hoàn hủy.
            </p>
          </div>

          {/* Itemized summary */}
          <div className="rounded-xl border border-zinc-800 bg-[#121214] divide-y divide-zinc-800 text-xs">
            <div className="flex items-center justify-between p-3">
              <span className="text-zinc-400">Tựa game:</span>
              <span className="font-bold text-white">{game.name}</span>
            </div>

            <div className="flex items-center justify-between p-3">
              <span className="text-zinc-400">Máy chủ:</span>
              <span className="font-bold text-[#fb5503]">{server.name}</span>
            </div>

            <div className="flex items-center justify-between p-3">
              <span className="text-zinc-400">Nhân vật:</span>
              <span className="font-semibold text-white text-right">
                {character.name} <span className="text-zinc-400 font-mono">(Role ID: {character.roleId})</span>
              </span>
            </div>

            <div className="flex items-center justify-between p-3">
              <span className="text-zinc-400">Tên gói:</span>
              <span className="font-bold text-white">{pkg.name}</span>
            </div>

            <div className="flex items-center justify-between p-3">
              <span className="text-zinc-400">Đơn giá:</span>
              <div className="flex items-center gap-1.5 font-mono tabular-nums">
                {isSale && (
                  <span className="line-through text-zinc-500 text-[11px]">
                    {formatVnd(originalUnitPrice)}
                  </span>
                )}
                <span className="font-semibold text-white">{formatVnd(unitPrice)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3">
              <span className="text-zinc-400">Số lượng:</span>
              <span className="font-mono tabular-nums font-bold text-[#fb5503]">× {quantity}</span>
            </div>

            {isSale && (
              <>
                <div className="flex items-center justify-between p-3">
                  <span className="text-zinc-400">Tổng giá gốc:</span>
                  <span className="font-mono tabular-nums line-through text-zinc-500">
                    {formatVnd(originalTotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3">
                  <span className="text-zinc-400">Giảm giá / Tiết kiệm:</span>
                  <span className="font-mono tabular-nums font-bold text-emerald-400">
                    -{formatVnd(discountTotal)}
                  </span>
                </div>
              </>
            )}

            <div className="flex items-center justify-between p-3">
              <span className="text-zinc-400">Tổng vật phẩm nhận:</span>
              <span className="font-semibold text-amber-400 text-right">{getRewardSummary()}</span>
            </div>

            <div className="flex items-center justify-between p-3">
              <span className="text-zinc-400">Phương thức thanh toán:</span>
              <span className="font-semibold text-white">{paymentMethod.name}</span>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-[#221814] border-t border-[#fb5503]/30">
              <span className="text-zinc-200 font-bold text-sm">Tổng tiền thanh toán:</span>
              <span className="text-xl font-black text-[#fb5503] font-mono tabular-nums">
                {formatVnd(totalPrice)}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-zinc-500 text-center">
            Bấm &ldquo;Tiếp tục thanh toán&rdquo; để khởi tạo mã QR và cổng xác nhận giao dịch.
          </p>

          {/* Action CTAs */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-zinc-700 bg-[#121214] hover:bg-zinc-800 text-zinc-300 hover:text-white font-semibold text-xs transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kiểm tra lại</span>
            </button>

            <button
              type="button"
              onClick={onConfirmPayment}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#fb5503] hover:bg-[#e04c02] active:bg-[#c44100] text-white font-bold text-xs shadow-[0_4px_16px_rgba(251,85,3,0.35)] transition-colors cursor-pointer"
            >
              <span>Tiếp tục thanh toán</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
