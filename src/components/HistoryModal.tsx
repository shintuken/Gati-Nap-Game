import React, { useState, useEffect } from 'react';
import { TransactionRecord, TransactionStatus } from '../types';
import { X, History, CheckCircle2, Clock, XCircle, Copy, Check } from 'lucide-react';

interface HistoryModalProps {
  isOpen: boolean;
  transactions: TransactionRecord[];
  onClose: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  transactions,
  onClose,
}) => {
  const [filter, setFilter] = useState<'all' | TransactionStatus>('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

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
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
  };

  const copyCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 1500);
  };

  const filtered = transactions.filter((t) => {
    if (filter === 'all') return true;
    return t.status === filter;
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="history-modal-title"
    >
      <div
        className="w-full max-w-2xl bg-[#18181b] rounded-2xl shadow-2xl border border-zinc-800 overflow-hidden transform transition-all max-h-[90vh] flex flex-col text-[#fcfcfc]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-[#121214] text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#fb5503]/20 border border-[#fb5503]/40 text-[#fb5503] flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 id="history-modal-title" className="text-base font-bold tracking-tight text-white">
                Lịch sử giao dịch Gati Games
              </h3>
              <p className="text-xs text-zinc-400">Tra cứu các lệnh nạp gần nhất của tài khoản</p>
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

        {/* Filter buttons with Gati Orange active state */}
        <div className="px-6 py-3 border-b border-zinc-800 flex items-center justify-between flex-wrap gap-2 bg-[#141417]">
          <div className="flex items-center gap-1.5 p-1 bg-[#121214] border border-zinc-800 rounded-xl text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                filter === 'all' ? 'bg-[#fb5503] text-white shadow-xs' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Tất cả ({transactions.length})
            </button>
            <button
              onClick={() => setFilter('success')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                filter === 'success' ? 'bg-[#fb5503] text-white shadow-xs' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Thành công
            </button>
            <button
              onClick={() => setFilter('processing')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                filter === 'processing' ? 'bg-[#fb5503] text-white shadow-xs' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Đang xử lý
            </button>
            <button
              onClick={() => setFilter('failed')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                filter === 'failed' ? 'bg-[#fb5503] text-white shadow-xs' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Thất bại
            </button>
          </div>
        </div>

        {/* Transactions List */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1 bg-[#18181b]">
          {filtered.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-zinc-500 text-sm">Chưa có giao dịch nào trong mục này</p>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-zinc-800 bg-[#121214] hover:border-zinc-700 transition-colors space-y-2.5 text-xs"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-zinc-200">{item.transactionCode}</span>
                    <button
                      onClick={() => copyCode(item.transactionCode)}
                      className="p-1 hover:bg-zinc-800 rounded text-zinc-500 hover:text-zinc-300 cursor-pointer"
                      title="Sao chép mã"
                    >
                      {copiedCode === item.transactionCode ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <span className="text-zinc-500">{item.timestamp}</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-zinc-800/80">
                  <div>
                    <p className="font-bold text-[#fcfcfc] text-sm">{item.gameName}</p>
                    <p className="text-zinc-400 mt-0.5">
                      Nhân vật: <strong className="text-zinc-200">{item.characterName}</strong> · {item.serverName} (Role ID: {item.roleId})
                    </p>
                    <p className="text-zinc-400 mt-0.5">
                      Gói:{' '}
                      <strong className="text-zinc-200">{item.packageName}</strong>{' '}
                      <span className="text-[#fb5503] font-mono font-bold">
                        × {item.quantity || 1}
                      </span>{' '}
                      <span className="text-zinc-500 font-mono">
                        ({formatVnd(item.unitPrice || item.price)}/gói)
                      </span>{' '}
                      · {item.paymentMethodName}
                    </p>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <span className="font-mono tabular-nums font-black text-base text-[#fb5503] block">
                      {formatVnd(item.price)}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full mt-1 ${
                        item.status === 'success'
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-700/50'
                          : item.status === 'processing'
                          ? 'bg-amber-950/60 text-amber-400 border border-amber-700/50'
                          : 'bg-rose-950/60 text-rose-400 border border-rose-700/50'
                      }`}
                    >
                      {item.status === 'success' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                      {item.status === 'processing' && <Clock className="w-3 h-3 text-amber-400" />}
                      {item.status === 'failed' && <XCircle className="w-3 h-3 text-rose-400" />}
                      <span>
                        {item.status === 'success'
                          ? 'Thành công'
                          : item.status === 'processing'
                          ? 'Đang xử lý'
                          : 'Thất bại'}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
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
