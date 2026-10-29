import React, { useState } from 'react';
import { DemoEdgeCase } from '../types';
import { SlidersHorizontal, X, RotateCcw, CheckCircle2, Clock, XCircle } from 'lucide-react';

interface DemoControllerProps {
  currentEdgeCase: DemoEdgeCase;
  onSelectEdgeCase: (edgeCase: DemoEdgeCase) => void;
  onResetAll: () => void;
  onDirectResult: (status: 'success' | 'processing' | 'failed') => void;
}

export const DemoController: React.FC<DemoControllerProps> = ({
  currentEdgeCase,
  onSelectEdgeCase,
  onResetAll,
  onDirectResult,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [resetNotice, setResetNotice] = useState(false);

  const OPTIONS: { id: DemoEdgeCase; label: string; desc: string; category: string }[] = [
    { id: 'none', label: 'Happy case (Chuẩn Gati Games)', desc: 'Luồng nạp thông suốt, dữ liệu đầy đủ', category: 'Cơ bản' },
    { id: 'limit_changed', label: 'Thay đổi giới hạn SL gói (CMS)', desc: 'Giả lập giới hạn tối đa giảm xuống trước khi bấm Thanh toán', category: 'Số lượng gói' },
    { id: 'server_maintenance', label: 'Server đang bảo trì', desc: 'Chọn thông tin bình thường, check báo bảo trì khi bấm thanh toán', category: 'Bước 2: Nạp Game' },
    { id: 'session_expired', label: 'Session đăng nhập hết hạn', desc: 'Hết phiên làm việc, bắt buộc đăng nhập lại', category: 'Bảo mật' },
    { id: 'package_sold_out', label: 'Gói hết lượt mua', desc: 'Gói ưu đãi đã chạm giới hạn mua', category: 'Bước 2: Gói nạp' },
    { id: 'qr_expired', label: 'Mã QR hết hạn', desc: 'Quá thời gian hiệu lực 10 phút thanh toán', category: 'Bước 3: Thanh toán' },
    { id: 'payment_delayed', label: 'Trừ tiền chưa nhận callback', desc: 'Đã thanh toán ngân hàng nhưng đợi đối soát', category: 'Bước 3: Thanh toán' },
    { id: 'item_pending', label: 'Thành công nhưng vật phẩm chưa cộng', desc: 'KNB đang được xếp hàng đồng bộ vào game', category: 'Kết quả' },
  ];

  const activeOption = OPTIONS.find((o) => o.id === currentEdgeCase);

  return (
    <div className="fixed bottom-4 right-4 z-50 select-none">
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-900/95 hover:bg-slate-900 text-slate-200 border border-slate-700 shadow-xl backdrop-blur-xs text-xs font-semibold hover:text-white transition-all cursor-pointer group"
          title="Bảng điều khiển thử nghiệm trạng thái edge cases"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-orange-500 group-hover:rotate-45 transition-transform" />
          <span>
            {currentEdgeCase !== 'none' && activeOption
              ? `Demo: ${activeOption.label}`
              : 'Demo trạng thái'}
          </span>
          {currentEdgeCase !== 'none' && (
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          )}
        </button>
      ) : (
        <div className="w-80 max-h-[85vh] flex flex-col bg-slate-900/95 text-slate-100 rounded-2xl border border-slate-700 shadow-2xl backdrop-blur-md overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-150">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-orange-500" />
              <div>
                <span className="text-xs font-bold text-white block">Giả lập Trạng thái (Gati Games)</span>
                <span className="text-[10px] text-slate-400">Bấm chọn để chuyển thẳng tới màn hình</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Direct Results Jumps */}
          <div className="p-3 bg-slate-800/40 border-b border-slate-800 space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Chuyển nhanh màn kết quả:
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  onDirectResult('success');
                  setIsOpen(false);
                }}
                className="py-1.5 px-2 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 hover:bg-emerald-900 text-[11px] font-semibold flex items-center justify-center gap-1 cursor-pointer"
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Thành công</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onDirectResult('processing');
                  setIsOpen(false);
                }}
                className="py-1.5 px-2 rounded-lg bg-amber-950/60 border border-amber-800/60 text-amber-300 hover:bg-amber-900 text-[11px] font-semibold flex items-center justify-center gap-1 cursor-pointer"
              >
                <Clock className="w-3 h-3 text-amber-400" />
                <span>Đang xử lý</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onDirectResult('failed');
                  setIsOpen(false);
                }}
                className="py-1.5 px-2 rounded-lg bg-rose-950/60 border border-rose-800/60 text-rose-300 hover:bg-rose-900 text-[11px] font-semibold flex items-center justify-center gap-1 cursor-pointer"
              >
                <XCircle className="w-3 h-3 text-rose-400" />
                <span>Thất bại</span>
              </button>
            </div>
          </div>

          {/* Scrollable list of edge cases */}
          <div className="p-3 overflow-y-auto space-y-2 flex-1 text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Chọn tình huống mô phỏng (Mở trực tiếp):
            </span>

            {OPTIONS.map((opt) => {
              const isSelected = currentEdgeCase === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    onSelectEdgeCase(opt.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-orange-600/30 border-orange-500 text-white font-bold ring-1 ring-orange-400'
                      : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs">{opt.label}</span>
                    {isSelected && (
                      <span className="text-[10px] bg-orange-600 text-white px-1.5 py-0.2 rounded font-mono">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                    {opt.desc}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Footer Reset */}
          <div className="p-3 bg-slate-950/80 border-t border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[11px]">
                Đang chọn: <strong className="text-white">{currentEdgeCase}</strong>
              </span>
              <button
                onClick={onResetAll}
                className="flex items-center gap-1 text-[11px] font-semibold text-orange-400 hover:text-orange-300 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Khôi phục mặc định</span>
              </button>
            </div>

            {/* Quick helper for Rule 1: Reset partner daily popup */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">Quy tắc 1 (Popup đối tác):</span>
              <button
                type="button"
                onClick={() => {
                  try {
                    localStorage.removeItem('gati_partner_seen_today_game_3q_phan_cong');
                    setResetNotice(true);
                    setTimeout(() => setResetNotice(false), 2000);
                  } catch {
                    // ignore
                  }
                }}
                className="text-[10px] text-amber-400 hover:underline cursor-pointer font-medium"
              >
                {resetNotice ? '✓ Đã xóa bộ nhớ popup' : '🔄 Reset popup lần đầu'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
