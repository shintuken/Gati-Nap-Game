import React, { useState } from 'react';
import { TransactionRecord, DemoEdgeCase } from '../types';
import { CheckCircle2, Clock, XCircle, ArrowRight, RefreshCw, Headphones, History, ShieldAlert, Sparkles, Copy, Check } from 'lucide-react';

interface TransactionResultProps {
  transaction: TransactionRecord;
  edgeCase: DemoEdgeCase;
  onTopupAgainSameChar: () => void;
  onSelectAnotherGame: () => void;
  onOpenHistory: () => void;
  onOpenSupport: () => void;
  onRetryPayment: () => void;
  onChangePaymentMethod: () => void;
  onCheckStatus: () => void;
}

export const TransactionResult: React.FC<TransactionResultProps> = ({
  transaction,
  edgeCase,
  onTopupAgainSameChar,
  onSelectAnotherGame,
  onOpenHistory,
  onOpenSupport,
  onCheckStatus,
}) => {
  const [copied, setCopied] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const formatVnd = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
  };

  const copyCode = () => {
    navigator.clipboard?.writeText(transaction.transactionCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleManualCheck = () => {
    setIsChecking(true);
    setTimeout(() => {
      setIsChecking(false);
      onCheckStatus();
    }, 800);
  };

  const isPendingSync = edgeCase === 'item_pending';
  const isDelayedPayment = edgeCase === 'payment_delayed';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="p-6 sm:p-8 rounded-2xl bg-[#18181b] border border-zinc-800 shadow-xl space-y-6 text-[#fcfcfc]">
        {/* Status Icon & Header */}
        <div className="text-center space-y-2">
          {transaction.status === 'success' && (
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </div>
          )}

          {transaction.status === 'processing' && (
            <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
              <Clock className="w-10 h-10 stroke-[2.5] animate-pulse" />
            </div>
          )}

          {transaction.status === 'failed' && (
            <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/10">
              <XCircle className="w-10 h-10 stroke-[2.5]" />
            </div>
          )}

          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {transaction.status === 'success' && 'Thanh toán thành công!'}
            {transaction.status === 'processing' && 'Giao dịch đang được xử lý'}
            {transaction.status === 'failed' && 'Thanh toán chưa thành công'}
          </h1>

          <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
            {transaction.status === 'success' && (isPendingSync
              ? 'Thanh toán đã được ghi nhận; vật phẩm đang được chuyển vào game.'
              : 'Vật phẩm của gói nạp đã được chuyển vào tài khoản nhân vật của bạn trong game.')}
            {transaction.status === 'processing' &&
              'Cổng thanh toán đang đối soát dữ liệu với ngân hàng. Vui lòng không nạp lại ngay để tránh trùng lặp giao dịch.'}
            {transaction.status === 'failed' &&
              'Giao dịch chưa hoàn tất. Bạn có thể thử lại hoặc đổi phương thức thanh toán. Nếu tài khoản đã bị trừ tiền, hãy liên hệ hỗ trợ kèm mã giao dịch.'}
          </p>
        </div>

        {/* Edge Case Alert: Success but Item Pending */}
        {transaction.status === 'success' && isPendingSync && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs sm:text-sm flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-100">Vật phẩm đang được hệ thống Gati đồng bộ</p>
              <p className="text-amber-200/80 mt-0.5 leading-relaxed">
                Thanh toán đã được ghi nhận thành công. Máy chủ game đang trong thời gian cao điểm, vật phẩm sẽ xuất hiện trong túi đồ nhân vật sau 1–3 phút.
              </p>
            </div>
          </div>
        )}

        {/* Edge Case Alert: Deducted but awaiting callback */}
        {transaction.status === 'processing' && isDelayedPayment && (
          <div className="p-4 rounded-xl bg-[#fb5503]/10 border border-[#fb5503]/30 text-orange-200 text-xs sm:text-sm flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-[#fb5503] shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-orange-100">Đã trừ tiền nhưng đang đợi phản hồi từ ngân hàng</p>
              <p className="text-orange-200/80 mt-0.5 leading-relaxed">
                Nếu tài khoản của bạn đã bị trừ tiền, xin an tâm! Hệ thống tự động kích hoạt gói ngay khi nhận được tín hiệu webhook từ phía ngân hàng.
              </p>
            </div>
          </div>
        )}

        {/* Transaction Summary Card */}
        <div className="rounded-xl border border-zinc-800 bg-[#121214] p-4 divide-y divide-zinc-800 text-xs space-y-2.5">
          <div className="flex items-center justify-between pb-2">
            <span className="text-zinc-400">Mã giao dịch Gati:</span>
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-bold text-white">{transaction.transactionCode}</span>
              <button
                onClick={copyCode}
                className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors cursor-pointer"
                title="Sao chép mã"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-zinc-400">Thời gian tạo:</span>
            <span className="text-zinc-200 font-medium">{transaction.timestamp}</span>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-zinc-400">Tựa game:</span>
            <span className="font-bold text-white">{transaction.gameName}</span>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-zinc-400">Máy chủ & Nhân vật:</span>
            <span className="font-semibold text-zinc-200">
              {transaction.characterName} · <span className="text-[#fb5503] font-bold">{transaction.serverName}</span>
            </span>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-zinc-400">Role ID:</span>
            <span className="font-mono text-zinc-300">{transaction.roleId}</span>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-zinc-400">Gói đã nạp:</span>
            <span className="font-bold text-white">{transaction.packageName}</span>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-zinc-400">Đơn giá:</span>
            <div className="flex items-center gap-1.5 font-mono tabular-nums">
              {transaction.originalUnitPrice &&
                transaction.originalUnitPrice > transaction.unitPrice && (
                  <span className="line-through text-zinc-500 text-[11px]">
                    {formatVnd(transaction.originalUnitPrice)}
                  </span>
                )}
              <span className="font-semibold text-zinc-200">
                {formatVnd(transaction.unitPrice)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-zinc-400">Số lượng:</span>
            <span className="font-mono tabular-nums font-bold text-[#fb5503]">
              × {transaction.quantity}
            </span>
          </div>

          {transaction.discountTotal && transaction.discountTotal > 0 ? (
            <div className="flex items-center justify-between pt-2">
              <span className="text-zinc-400">Giảm giá / Tiết kiệm:</span>
              <span className="font-mono tabular-nums font-bold text-emerald-400">
                -{formatVnd(transaction.discountTotal)}
              </span>
            </div>
          ) : null}

          {transaction.totalRewardSummary && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-zinc-400">Tổng vật phẩm nhận:</span>
              <span className="font-semibold text-amber-400 text-right">
                {transaction.totalRewardSummary}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <span className="text-zinc-400">Kênh thanh toán:</span>
            <span className="font-medium text-zinc-300">{transaction.paymentMethodName}</span>
          </div>

          <div className="flex items-center justify-between pt-3 text-sm">
            <span className="font-bold text-zinc-200">Tổng thanh toán:</span>
            <span className="font-black text-[#fb5503] font-mono tabular-nums text-base">
              {formatVnd(transaction.price)}
            </span>
          </div>
        </div>

        {/* Action Button Groups per status - Hiển thị 2 nút đồng nhất cho Thành công, Đang xử lý, Thất bại */}
        <div className="pt-2 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onOpenHistory}
              className="w-full py-3 px-4 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <History className="w-4 h-4 text-zinc-400" />
              <span>Xem lịch sử giao dịch</span>
            </button>

            <button
              type="button"
              onClick={transaction.status === 'success' ? onTopupAgainSameChar : onOpenSupport}
              className="w-full py-3 px-4 rounded-xl bg-[#fb5503] hover:bg-[#ff681c] active:bg-[#e04c02] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#fb5503]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{transaction.status === 'success' ? 'Nạp tiếp cho nhân vật này' : 'Liên hệ hỗ trợ'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="text-center pt-2">
            <button
              onClick={onSelectAnotherGame}
              className="text-xs text-zinc-400 hover:text-white font-semibold underline transition-colors cursor-pointer"
            >
              Quay về màn hình chọn game
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
