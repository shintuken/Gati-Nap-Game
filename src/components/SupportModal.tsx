import React, { useState, useEffect } from 'react';
import { X, Headphones, Phone, MessageSquare, Mail, HelpCircle, Send, CheckCircle2 } from 'lucide-react';
import { GATI_LOGO_SRC } from '../data/mockData';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
  const [ticketSent, setTicketSent] = useState(false);
  const [txnCode, setTxnCode] = useState('');
  const [issue, setIssue] = useState('');
  const [email, setEmail] = useState('');
  const [issueTitle, setIssueTitle] = useState('');

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (![txnCode, email, issueTitle, issue].every(value => value.trim())) return;
    setTicketSent(true);
    setTimeout(() => {
      setTicketSent(false);
      setTxnCode('');
      setIssue('');
      setEmail('');
      setIssueTitle('');
      onClose();
    }, 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="support-modal-title"
    >
      <div
        className="w-full max-w-xl bg-[#18181b] rounded-2xl shadow-2xl border border-zinc-800 overflow-hidden transform transition-all max-h-[90vh] flex flex-col text-[#fcfcfc]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-[#121214] text-white">
          <div className="flex items-center gap-2.5">
            <img
              src={GATI_LOGO_SRC}
              alt="Gati Games"
              className="w-8 h-8 object-contain drop-shadow-[0_2px_8px_rgba(251,85,3,0.35)]"
            />
            <div>
              <h3 id="support-modal-title" className="text-base font-bold tracking-tight text-white">
                Trung tâm hỗ trợ Gati Games
              </h3>
              <p className="text-xs text-zinc-400">Giải đáp thắc mắc và hỗ trợ tra soát giao dịch nạp game Gati</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-zinc-300 flex-1">
          {/* Quick Contact Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-[#121214] border border-zinc-800 flex flex-col items-center text-center">
              <Phone className="w-5 h-5 text-[#fb5503] mb-1" />
              <span className="font-bold text-[#fcfcfc] text-xs">Tổng đài Gati</span>
              <a href="tel:19006600" className="text-[#fb5503] font-black font-mono mt-0.5 text-sm">1900 6600</a>
              <span className="text-[10px] text-zinc-500">8:00 - 24:00 hàng ngày</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#121214] border border-zinc-800 flex flex-col items-center text-center">
              <MessageSquare className="w-5 h-5 text-emerald-400 mb-1" />
              <span className="font-bold text-[#fcfcfc] text-xs">Fanpage</span>
              <a href="https://www.facebook.com/choigamecunggati" target="_blank" rel="noopener noreferrer" className="text-emerald-400 font-bold mt-0.5 underline">Chơi Game Cùng Gati</a>
              <span className="text-[10px] text-zinc-500">Hỗ trợ trực tuyến</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#121214] border border-zinc-800 flex flex-col items-center text-center">
              <Mail className="w-5 h-5 text-blue-400 mb-1" />
              <span className="font-bold text-[#fcfcfc] text-xs">Email khiếu nại</span>
              <a href="mailto:hotrogati@fpt.com" className="text-blue-400 font-bold truncate max-w-full mt-0.5">hotrogati@fpt.com</a>
              <span className="text-[10px] text-zinc-500">Xử lý trong 24 giờ</span>
            </div>
          </div>

          {/* Frequently Asked Questions */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-[#fcfcfc] flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-[#fb5503]" />
              <span>Câu hỏi thường gặp về nạp game Gati</span>
            </h4>

            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-[#121214] border border-zinc-800 space-y-1">
                <p className="font-semibold text-zinc-200">
                  1. Tài khoản ngân hàng đã trừ tiền nhưng trong game chưa nhận vật phẩm?
                </p>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  Thông thường giao dịch hoàn tất trong 30 giây. Vào giờ cao điểm có thể mất 1–3 phút để máy chủ game đồng bộ. Hãy đăng xuất nhân vật và đăng nhập lại game để kiểm tra hòm thư.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#121214] border border-zinc-800 space-y-1">
                <p className="font-semibold text-zinc-200">
                  2. Lỡ nạp nhầm nhân vật hoặc máy chủ thì xử lý thế nào?
                </p>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  Nếu nạp nhầm nhân vật hoặc máy chủ, vui lòng liên hệ tổng đài 1900 6600 và cung cấp mã giao dịch để được hỗ trợ kiểm tra.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#121214] border border-zinc-800 space-y-1">
                <p className="font-semibold text-zinc-200">
                  3. Vì sao game &ldquo;Tam Quốc Phản Công&rdquo; chuyển sang VNGGames?
                </p>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  Tựa game này được phát hành theo thỏa thuận hợp tác đối tác và sử dụng hệ thống thanh toán chính thức của VNGGames nhằm bảo vệ quyền lợi người chơi.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Request Ticket */}
          <div className="p-4 rounded-xl border border-zinc-800 bg-[#121214] space-y-3">
            <h4 className="font-bold text-xs text-[#fb5503] uppercase tracking-wide">
              Gửi yêu cầu tra soát giao dịch Gati Games
            </h4>

            {ticketSent ? (
              <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-700/50 text-emerald-300 flex items-center gap-2 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Đã ghi nhận yêu cầu trên bản demo. Thời gian tiếp nhận dự kiến: trong 24 giờ.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-2.5">
                <div>
                  <label htmlFor="support-txn" className="block mb-1 font-semibold">Mã giao dịch *</label>
                  <input
                    id="support-txn"
                    type="text"
                    required
                    pattern=".*\S.*"
                    value={txnCode}
                    onChange={(e) => setTxnCode(e.target.value)}
                    placeholder="Mã giao dịch (VD: GATI-123456)..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-700 bg-[#18181b] text-[#fcfcfc] focus:outline-none focus:border-[#fb5503]"
                  />
                </div>
                <div>
                  <label htmlFor="support-email" className="block mb-1 font-semibold">Email *</label>
                  <input id="support-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email liên hệ" className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-700 bg-[#18181b] text-[#fcfcfc] focus:outline-none focus:border-[#fb5503]" />
                </div>
                <div>
                  <label htmlFor="support-title" className="block mb-1 font-semibold">Tiêu đề lỗi *</label>
                  <input id="support-title" type="text" required pattern=".*\S.*" value={issueTitle} onChange={(e) => setIssueTitle(e.target.value)} placeholder="Tiêu đề lỗi" className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-700 bg-[#18181b] text-[#fcfcfc] focus:outline-none focus:border-[#fb5503]" />
                </div>
                <div>
                  <label htmlFor="support-content" className="block mb-1 font-semibold">Nội dung *</label>
                  <textarea
                    id="support-content"
                    rows={2}
                    required
                    value={issue}
                    onChange={(e) => setIssue(e.target.value)}
                    placeholder="Mô tả sự cố bạn đang gặp phải..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-700 bg-[#18181b] text-[#fcfcfc] focus:outline-none focus:border-[#fb5503]"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#fb5503] hover:bg-[#e04c02] text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Gửi yêu cầu tra soát</span>
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-[#121214] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold cursor-pointer transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
