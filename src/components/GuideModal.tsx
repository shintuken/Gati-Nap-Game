import React, { useEffect } from 'react';
import { X, ExternalLink, AlertTriangle } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToPartner: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({
  isOpen,
  onClose,
  onProceedToPartner,
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="guide-modal-title"
    >
      <div
        className="w-full max-w-xl bg-[#18181b] rounded-2xl shadow-2xl border border-zinc-800 overflow-hidden transform transition-all max-h-[90vh] flex flex-col text-[#fcfcfc]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-[#121214] text-white">
          <div>
            <h3 id="guide-modal-title" className="text-base font-bold text-white">
              Hướng dẫn nạp Tam Quốc Phản Công
            </h3>
            <p className="text-xs text-zinc-400">Các bước nạp an toàn tại cổng đối tác VNGGames</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-sm text-zinc-300">
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#121214] border border-zinc-800">
              <span className="w-6 h-6 rounded-full bg-[#fb5503] text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                1
              </span>
              <div>
                <p className="font-semibold text-zinc-200">Truy cập trang nạp chính thức</p>
                <p className="text-xs text-zinc-400 mt-1">
                  Nhấp vào nút &ldquo;Nạp tại VNGGames&rdquo; để mở trang nạp chính thức có tiền tố <code>shop.vnggames.com</code>.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#121214] border border-zinc-800">
              <span className="w-6 h-6 rounded-full bg-[#fb5503] text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                2
              </span>
              <div>
                <p className="font-semibold text-zinc-200">Đăng nhập tài khoản chơi game</p>
                <p className="text-xs text-zinc-400 mt-1">
                  Chọn phương thức đăng nhập bạn đã liên kết với game (Zing ID, Google, Facebook, hoặc Apple ID).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#121214] border border-zinc-800">
              <span className="w-6 h-6 rounded-full bg-[#fb5503] text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                3
              </span>
              <div>
                <p className="font-semibold text-zinc-200">Chọn máy chủ và nhân vật</p>
                <p className="text-xs text-zinc-400 mt-1">
                  Kiểm tra kỹ đúng tên máy chủ và tên nhân vật nhận vật phẩm trước khi tiến hành thanh toán.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#121214] border border-zinc-800">
              <span className="w-6 h-6 rounded-full bg-[#fb5503] text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                4
              </span>
              <div>
                <p className="font-semibold text-zinc-200">Chọn gói KNB & thanh toán</p>
                <p className="text-xs text-zinc-400 mt-1">
                  Lựa chọn phương thức thanh toán tiện lợi (ZaloPay, VietQR, Thẻ ATM, v.v.) và hoàn tất giao dịch.
                </p>
              </div>
            </div>
          </div>

          {/* Safety Notice */}
          <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-600/40 text-rose-200 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <p>
              <strong>Cảnh báo lừa đảo:</strong> Tuyệt đối không nạp tại các website giả mạo, không chia sẻ mật khẩu hoặc mã OTP cho bất kỳ ai kể cả người tự xưng là Admin hay CSKH.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-800 bg-[#121214]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-zinc-700 bg-[#18181b] hover:bg-zinc-800 text-zinc-300 hover:text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={() => {
              onProceedToPartner();
              onClose();
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#fb5503] hover:bg-[#e04c02] text-white font-bold text-xs shadow-[0_4px_16px_rgba(251,85,3,0.35)] transition-colors cursor-pointer"
          >
            <span>Tiếp tục sang VNGGames</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
