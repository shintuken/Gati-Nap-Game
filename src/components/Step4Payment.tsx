import React, { useState } from 'react';
import { Game, GameServer, Character, GamePackage, PaymentMethod, PaymentMethodId } from '../types';
import { QrCode, Wallet, CreditCard, Globe, Check, ShieldCheck, ArrowLeft, Loader2 } from 'lucide-react';

interface Step4PaymentProps {
  game: Game;
  server: GameServer;
  character: Character;
  pkg: GamePackage;
  paymentMethods: PaymentMethod[];
  selectedMethodId: PaymentMethodId | null;
  onSelectMethod: (id: PaymentMethodId) => void;
  onInitiatePayment: () => void;
  onBackToPackages: () => void;
}

export const Step4Payment: React.FC<Step4PaymentProps> = ({
  game,
  server,
  character,
  pkg,
  paymentMethods,
  selectedMethodId,
  onSelectMethod,
  onInitiatePayment,
  onBackToPackages,
}) => {
  const [agreementChecked, setAgreementChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatVnd = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
  };

  const selectedMethod = paymentMethods.find((m) => m.id === selectedMethodId);

  const getMethodIcon = (id: PaymentMethodId) => {
    switch (id) {
      case 'vietqr':
        return <QrCode className="w-5 h-5 text-orange-600" />;
      case 'ewallet':
        return <Wallet className="w-5 h-5 text-rose-600" />;
      case 'napas':
        return <CreditCard className="w-5 h-5 text-emerald-600" />;
      case 'intl':
        return <Globe className="w-5 h-5 text-indigo-600" />;
    }
  };

  const handleSubmit = () => {
    if (!selectedMethodId || !agreementChecked || isSubmitting) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onInitiatePayment();
    }, 450);
  };

  const isFormValid = !!selectedMethodId && agreementChecked && !isSubmitting;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Thanh toán gói nạp Gati Games
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Lựa chọn phương thức thanh toán an toàn và bảo mật qua cổng Gati chính thức
          </p>
        </div>

        <button
          type="button"
          onClick={onBackToPackages}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Chọn gói khác</span>
          <span className="sm:hidden">Đổi gói</span>
        </button>
      </div>

      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Payment Methods */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Chọn kênh thanh toán</span>
              </h2>
              <span className="text-xs text-slate-500 font-medium">Bảo mật SSL 256-bit</span>
            </div>

            <div className="space-y-3">
              {paymentMethods.map((method) => {
                const isSelected = selectedMethodId === method.id;

                return (
                  <div
                    key={method.id}
                    onClick={() => onSelectMethod(method.id)}
                    role="radio"
                    aria-checked={isSelected}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelectMethod(method.id);
                      }
                    }}
                    className={`p-4 rounded-xl border transition-all text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
                      isSelected
                        ? 'border-orange-600 bg-orange-50/40 ring-2 ring-orange-500/20 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3.5">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {getMethodIcon(method.id)}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-slate-900">
                              {method.name}
                            </span>
                            {method.discountBadge && (
                              <span className="text-[11px] font-bold text-orange-700 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-md">
                                {method.discountBadge}
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                            {method.shortDesc}
                          </p>

                          {/* Providers tags */}
                          <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                            {method.providers.map((p, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded"
                              >
                                {p}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Radio Indicator */}
                      <div className="shrink-0 mt-1">
                        {isSelected ? (
                          <div className="w-5 h-5 rounded-full bg-orange-600 text-white flex items-center justify-center shadow-2xs">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-5 sticky top-20">
            <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
              Thông tin đơn hàng
            </h2>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Tựa game:</span>
                <span className="font-bold text-slate-900">{game.name}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Máy chủ:</span>
                <span className="font-semibold text-slate-800">{server.name}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Tên nhân vật:</span>
                <span className="font-bold text-orange-600">{character.name}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Role ID:</span>
                <span className="font-mono font-medium text-slate-800">{character.roleId}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Cấp độ nhân vật:</span>
                <span className="font-semibold text-slate-800">Lv.{character.level}</span>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Gói nạp:</span>
                  <span className="font-bold text-slate-900 text-right">{pkg.name}</span>
                </div>

                {pkg.bonusAmount && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Ưu đãi tặng kèm:</span>
                    <span className="font-semibold text-emerald-600">{pkg.bonusAmount}</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Giá gói:</span>
                  <span className="font-semibold text-slate-800 font-mono">{formatVnd(pkg.price)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Phí giao dịch:</span>
                  <span className="font-semibold text-emerald-600">Miễn phí (0đ)</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Phương thức:</span>
                  <span className="font-semibold text-slate-900">
                    {selectedMethod ? selectedMethod.name : 'Chưa chọn'}
                  </span>
                </div>
              </div>

              {/* Total Row */}
              <div className="pt-3 border-t border-slate-200/80 flex items-baseline justify-between">
                <span className="font-bold text-sm text-slate-900">Tổng thanh toán:</span>
                <span className="text-2xl font-black text-orange-600 font-mono tracking-tight">
                  {formatVnd(pkg.price)}
                </span>
              </div>
            </div>

            {/* Checkbox Agreement */}
            <div className="pt-2 border-t border-slate-100">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700 leading-relaxed select-none">
                <input
                  type="checkbox"
                  checked={agreementChecked}
                  onChange={(e) => setAgreementChecked(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-orange-600 focus:ring-orange-500 cursor-pointer w-4 h-4"
                />
                <span>
                  Tôi đã kiểm tra đúng game, máy chủ và nhân vật, đồng thời đồng ý với điều khoản thanh toán Gati Games.
                </span>
              </label>
            </div>

            {/* Primary CTA */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!isFormValid}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 hover:from-orange-400 hover:to-red-500 active:from-orange-600 text-white font-black text-sm shadow-lg shadow-orange-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang khởi tạo đơn hàng...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Thanh toán ngay ({formatVnd(pkg.price)})</span>
                </>
              )}
            </button>

            {!selectedMethodId && (
              <p className="text-[11px] text-amber-600 text-center">
                * Vui lòng chọn một phương thức thanh toán bên cạnh
              </p>
            )}
            {selectedMethodId && !agreementChecked && (
              <p className="text-[11px] text-amber-600 text-center">
                * Vui lòng tích chọn xác nhận thông tin nhân vật và điều khoản
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
