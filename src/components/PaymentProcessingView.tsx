import React, { useState, useEffect } from 'react';
import { Game, GameServer, Character, GamePackage, PaymentMethod, DemoEdgeCase } from '../types';
import { Copy, Check, Clock, AlertTriangle, ArrowLeft, RefreshCw, CheckCircle2, Loader2 } from 'lucide-react';
import { GATI_LOGO_SRC } from '../data/mockData';

interface PaymentProcessingViewProps {
  game: Game;
  server: GameServer;
  character: Character;
  pkg: GamePackage;
  quantity: number;
  paymentMethod: PaymentMethod;
  edgeCase: DemoEdgeCase;
  onSuccess: (txnCode: string) => void;
  onProcessing: (txnCode: string) => void;
  onFailed: (txnCode: string, reason: string) => void;
  onCancelOrBack: () => void;
}

export const PaymentProcessingView: React.FC<PaymentProcessingViewProps> = ({
  game,
  server,
  character,
  pkg,
  quantity,
  paymentMethod,
  edgeCase,
  onSuccess,
  onProcessing,
  onFailed,
  onCancelOrBack,
}) => {
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes countdown
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isExpired, setIsExpired] = useState(edgeCase === 'qr_expired');

  const [txnCode] = useState(() => `GATI-${Math.floor(100000 + Math.random() * 900000)}`);
  const transferContent = `GATI ${character.roleId} KNB`;

  const formatVnd = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' VND';
  };

  const totalAmount = pkg.price * quantity;
  const originalTotalAmount =
    pkg.originalPrice && pkg.originalPrice > pkg.price
      ? pkg.originalPrice * quantity
      : totalAmount;

  useEffect(() => {
    setIsExpired(edgeCase === 'qr_expired');
  }, [edgeCase]);

  useEffect(() => {
    if (isExpired) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isExpired]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const handleManualCheck = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      if (edgeCase === 'payment_delayed' || edgeCase === 'result_processing') {
        onProcessing(txnCode);
      } else if (edgeCase === 'result_failed') {
        onFailed(txnCode, 'Giao dịch bị từ chối từ phía ngân hàng hoặc số dư không đủ thanh toán.');
      } else {
        onSuccess(txnCode);
      }
    }, 1000);
  };

  const handleSimulateFail = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      onFailed(txnCode, 'Tài khoản không đủ số dư hoặc người dùng đã hủy giao dịch trên app ngân hàng.');
    }, 500);
  };

  const handleSimulatePending = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      onProcessing(txnCode);
    }, 500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex items-center justify-between pb-2">
        <button
          onClick={onCancelOrBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Hủy & Đổi kênh thanh toán</span>
        </button>

        <span className="text-xs text-zinc-400 font-mono">
          Mã đơn: <strong className="text-white">{txnCode}</strong>
        </span>
      </div>

      <div className="p-6 sm:p-10 rounded-2xl bg-[#18181b] border border-zinc-800 shadow-xl space-y-8 text-[#fcfcfc]">
        {/* Header Status */}
        <div className="text-center space-y-1.5">
          <span className="text-xs font-black text-[#fb5503] uppercase tracking-wider">
            {paymentMethod.name}
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            {isExpired ? 'Mã thanh toán Gati đã hết hạn' : 'Màn hình giả lập thanh toán bên thứ 3'}
          </h2>
        </div>

        {/* Expired State */}
        {isExpired ? (
          <div className="p-6 text-center rounded-2xl bg-rose-950/30 border border-rose-800/60 space-y-4">
            <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
            <div>
              <h3 className="font-bold text-rose-200 text-base">Hết thời gian hiệu lực mã thanh toán</h3>
              <p className="text-xs text-rose-300/80 mt-1 max-w-sm mx-auto">
                Phiên thanh toán đã hết hạn để đảm bảo an toàn giao dịch. Vui lòng bấm tạo lại hoặc quay lại chọn phương thức khác.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  setIsExpired(false);
                  setTimeLeft(600);
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#fb5503] hover:bg-[#ff681c] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#fb5503]/25 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Tạo phiên thanh toán mới</span>
              </button>
              <button
                onClick={onCancelOrBack}
                className="px-4 py-2 border border-rose-700/60 bg-rose-900/30 hover:bg-rose-900/50 text-rose-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Đổi phương thức
              </button>
            </div>
          </div>
        ) : (
          /* Single rotating loading circle with Gati robot head logo centered inside */
          <div className="py-10 flex flex-col items-center justify-center">
            <div className="relative w-32 h-32 flex items-center justify-center">
              {/* Single rotating circle */}
              <svg
                className="w-32 h-32 animate-spin"
                style={{ animationDuration: '1.6s' }}
                viewBox="0 0 120 120"
                fill="none"
              >
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  stroke="rgba(251, 85, 3, 0.16)"
                  strokeWidth="6"
                />
                <path
                  d="M60 8 A52 52 0 0 1 112 60"
                  stroke="#fb5503"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
              </svg>

              {/* Center Gati robot head logo */}
              <img
                src={GATI_LOGO_SRC}
                alt="Gati Logo"
                referrerPolicy="no-referrer"
                className="w-14 h-14 object-contain absolute"
              />
            </div>

            <div className="mt-5 text-center space-y-1">
              <p className="text-xs sm:text-sm font-semibold text-zinc-300">
                Đang chờ xác nhận thanh toán từ cổng <span className="text-[#fb5503] font-bold">{paymentMethod.name}</span>...
              </p>
              <p className="text-xs text-zinc-400 font-mono tabular-nums">
                {pkg.name} <span className="text-[#fb5503] font-bold">x{quantity}</span> · Tổng thanh toán:{' '}
                <strong className="text-[#fb5503]">{formatVnd(totalAmount)}</strong>
              </p>
            </div>
          </div>
        )}

        {/* Verification and Simulation Trigger Area */}
        <div className="pt-4 border-t border-zinc-800 space-y-3">
          <button
            type="button"
            onClick={handleManualCheck}
            disabled={isVerifying || isExpired}
            className="w-full py-3.5 px-4 rounded-xl bg-[#fb5503] hover:bg-[#ff681c] active:bg-[#e04c02] text-white font-black text-sm shadow-lg shadow-[#fb5503]/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isVerifying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang kiểm tra giao dịch với ngân hàng...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Tôi đã chuyển tiền thành công (Kiểm tra ngay)</span>
              </>
            )}
          </button>

          {/* Quick Simulation Options */}
          <div className="p-3 rounded-xl bg-[#121214] border border-zinc-800 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-zinc-400 font-medium">Mô phỏng kết quả:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSimulatePending}
                className="px-2.5 py-1 rounded-lg border border-amber-500/40 bg-amber-500/10 text-amber-300 font-semibold hover:bg-amber-500/20 cursor-pointer"
              >
                Giả lập Đang xử lý
              </button>
              <button
                type="button"
                onClick={handleSimulateFail}
                className="px-2.5 py-1 rounded-lg border border-rose-500/40 bg-rose-500/10 text-rose-300 font-semibold hover:bg-rose-500/20 cursor-pointer"
              >
                Giả lập Thất bại
              </button>
              <button
                type="button"
                onClick={() => setIsExpired(true)}
                className="px-2.5 py-1 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold cursor-pointer"
              >
                QR hết hạn
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
