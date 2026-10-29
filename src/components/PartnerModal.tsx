import React, { useEffect } from 'react';
import { Game } from '../types';
import { ExternalLink, BookOpen, X, ShieldAlert } from 'lucide-react';

interface PartnerModalProps {
  game: Game;
  isOpen: boolean;
  onClose: () => void;
  onOpenGuide: () => void;
}

export const PartnerModal: React.FC<PartnerModalProps> = ({
  game,
  isOpen,
  onClose,
  onOpenGuide,
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

  const handlePartnerRedirect = () => {
    const today = new Date().toISOString().slice(0, 10);
    try {
      localStorage.setItem(`gati_partner_seen_today_${game.id}`, today);
    } catch {
      // ignore
    }
    if (game.partnerUrl) {
      window.open(game.partnerUrl, '_blank', 'noopener,noreferrer');
    }
    onClose();
  };

  const handleGuideClick = () => {
    const today = new Date().toISOString().slice(0, 10);
    try {
      localStorage.setItem(`gati_partner_seen_today_${game.id}`, today);
    } catch {
      // ignore
    }
    if (game.guideUrl && game.guideUrl.trim() !== '') {
      window.open(game.guideUrl, '_blank', 'noopener,noreferrer');
      onClose();
    } else {
      onOpenGuide();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="partner-modal-title"
    >
      <div
        className="w-full max-w-lg bg-[#18181b] rounded-2xl shadow-2xl border border-zinc-800 overflow-hidden transform transition-all text-[#fcfcfc]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-[#121214]">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${game.iconBg} text-white flex items-center justify-center text-lg shadow-sm`}>
              {game.iconSymbol}
            </div>
            <div>
              <h3 id="partner-modal-title" className="text-base font-bold text-white">
                Nạp game {game.name}
              </h3>
              <p className="text-xs text-zinc-400">Đối tác phân phối liên kết {game.partnerName || 'VNGGames'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
            aria-label="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-600/40 text-amber-200 text-sm flex gap-3 items-start">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-amber-300">
                Chuyển tiếp đến trang nạp chính thức của đối tác
              </p>
              <p className="text-amber-200/90 leading-relaxed text-xs sm:text-sm">
                <strong>{game.name}</strong> sử dụng cổng nạp chính thức của đối tác{' '}
                <strong>{game.partnerName || 'VNGGames'}</strong>. Bạn có thể xem hướng dẫn trước khi tiếp tục.
              </p>
            </div>
          </div>

          <div className="p-3 bg-[#121214] border border-zinc-800 rounded-xl text-xs text-zinc-300 flex items-center justify-between">
            <span>✨ <strong>Quy tắc hiển thị:</strong> Popup chỉ mở lần đầu trong ngày. Từ lần thứ 2, hệ thống sẽ mở trực tiếp trang đối tác.</span>
          </div>

          <p className="text-xs text-zinc-500 text-center">
            Bạn sẽ được chuyển sang website của đối tác trong tab mới. Gati Games không lưu trữ thông tin thanh toán cho tựa game này.
          </p>

          {/* Action CTAs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={handleGuideClick}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-700 bg-[#121214] hover:bg-zinc-800 text-zinc-300 hover:text-white font-semibold text-sm transition-colors cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-zinc-400" />
              <span>Xem hướng dẫn nạp</span>
            </button>

            <button
              type="button"
              onClick={handlePartnerRedirect}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#fb5503] hover:bg-[#e04c02] active:bg-[#c44100] text-white font-bold text-sm shadow-[0_4px_16px_rgba(251,85,3,0.35)] transition-colors cursor-pointer"
            >
              <span>Nạp tại {game.partnerName || 'VNGGames'}</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
