import React, { useState } from 'react';
import { GamePackage, PackageCategory, Character, GameServer, Game, DemoEdgeCase } from '../types';
import { Sparkles, ArrowRight, ArrowLeft, Gem, Crown, Gift, Calendar, Check, ShieldAlert } from 'lucide-react';

interface Step3SelectPackageProps {
  game: Game;
  server: GameServer;
  character: Character;
  packages: GamePackage[];
  selectedPackage: GamePackage | null;
  edgeCase: DemoEdgeCase;
  onSelectPackage: (pkg: GamePackage) => void;
  onProceedToPayment: () => void;
  onBackToCharacter: () => void;
}

export const Step3SelectPackage: React.FC<Step3SelectPackageProps> = ({
  game,
  server,
  character,
  packages,
  selectedPackage,
  edgeCase,
  onSelectPackage,
  onProceedToPayment,
  onBackToCharacter,
}) => {
  const [activeTab, setActiveTab] = useState<PackageCategory>('all');
  const [priceChangeWarning, setPriceChangeWarning] = useState(false);

  const formatVnd = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
  };

  const filteredPackages = packages.filter((pkg) => {
    if (activeTab === 'all') return true;
    return pkg.category === activeTab;
  });

  const getPackageIcon = (type: GamePackage['iconType']) => {
    switch (type) {
      case 'crown':
        return <Crown className="w-6 h-6 text-amber-500" />;
      case 'card':
        return <Calendar className="w-6 h-6 text-purple-500" />;
      case 'chest':
        return <Gift className="w-6 h-6 text-orange-500" />;
      case 'scroll':
        return <Sparkles className="w-6 h-6 text-rose-500" />;
      case 'gem':
      default:
        return <Gem className="w-6 h-6 text-orange-600" />;
    }
  };

  const handleSelect = (pkg: GamePackage) => {
    if (pkg.isSoldOut || edgeCase === 'package_sold_out') {
      return;
    }

    setPriceChangeWarning(false);

    onSelectPackage(pkg);
  };

  return (
    <div className="space-y-6">
      {/* Target Character Verification Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 text-white font-black flex items-center justify-center text-sm shadow-xs shrink-0">
            {character.name.charAt(0)}
          </div>
          <div>
            <span className="text-[11px] font-bold text-orange-600 uppercase tracking-wider block">
              Nạp cho nhân vật Gati Games
            </span>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <strong className="text-slate-900">{character.name}</strong>
              <span className="text-slate-400">·</span>
              <span className="text-slate-600">{server.name}</span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-500 text-xs">Role ID: {character.roleId}</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onBackToCharacter}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Đổi nhân vật</span>
        </button>
      </div>

      {/* Price Change Warning Edge Case */}
      {priceChangeWarning && selectedPackage && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-start gap-3 animate-in fade-in">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-amber-950">Thông báo điều chỉnh tỷ giá gói Gati</p>
            <p className="text-amber-800 mt-0.5 leading-relaxed">
              Giá gói <strong>{selectedPackage.name}</strong> vừa được cập nhật từ{' '}
              <span className="line-through">{formatVnd(selectedPackage.price)}</span> sang{' '}
              <strong className="text-amber-950">{formatVnd(selectedPackage.price + 20000)}</strong> theo quy định tỷ giá mới. Vui lòng xác nhận trước khi thanh toán.
            </p>
          </div>
          <button
            onClick={() => setPriceChangeWarning(false)}
            className="text-xs font-semibold text-amber-700 hover:text-amber-900 cursor-pointer"
          >
            Đồng ý
          </button>
        </div>
      )}

      {/* Package Selection Area */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-6">
        <div>
          <h2 className="text-xl font-black text-slate-900">
            Chọn gói nạp Kim Nguyên Bảo Gati
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Vật phẩm sẽ được nạp trực tiếp vào hòm thư hoặc túi đồ của nhân vật {character.name}
          </p>
        </div>

        {/* Category Filter Tabs with Orange-Red Active State */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-xl max-w-fit">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tất cả gói
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('standard')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'standard'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Gói nạp thường
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('promo')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'promo'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Gói ưu đãi Hot
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sub')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'sub'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Thẻ tuần / tháng
          </button>
        </div>

        {/* Package Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPackages.map((pkg) => {
            const isSelected = selectedPackage?.id === pkg.id;
            const isSoldOut = pkg.isSoldOut || (edgeCase === 'package_sold_out' && pkg.category === 'promo');

            return (
              <div
                key={pkg.id}
                onClick={() => !isSoldOut && handleSelect(pkg)}
                role="button"
                tabIndex={isSoldOut ? -1 : 0}
                onKeyDown={(e) => {
                  if (!isSoldOut && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    handleSelect(pkg);
                  }
                }}
                className={`relative flex flex-col justify-between p-5 rounded-2xl border transition-all text-left ${
                  isSoldOut
                    ? 'border-slate-200 bg-slate-100/60 opacity-65 cursor-not-allowed'
                    : isSelected
                    ? 'border-orange-600 bg-orange-50/40 ring-2 ring-orange-500/20 shadow-md cursor-pointer'
                    : 'border-slate-200/90 bg-white hover:border-orange-400 hover:shadow-xs cursor-pointer'
                }`}
              >
                {/* Header Tag / Badge */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                    {getPackageIcon(pkg.iconType)}
                  </div>

                  {pkg.tag && (
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                        isSoldOut
                          ? 'bg-slate-200 text-slate-600'
                          : 'bg-orange-50 text-orange-600 border border-orange-200/80'
                      }`}
                    >
                      {pkg.tag}
                    </span>
                  )}
                </div>

                {/* Package details */}
                <div className="space-y-1.5 flex-1">
                  <h3 className="font-extrabold text-base text-slate-900">
                    {pkg.name}
                  </h3>

                  <p className="text-xs text-slate-600 font-medium">
                    Nhận: <span className="text-orange-600 font-bold">{pkg.currencyAmount}</span>
                  </p>

                  {pkg.bonusAmount && (
                    <p className="text-xs text-emerald-600 font-semibold">
                      {pkg.bonusAmount}
                    </p>
                  )}

                  {pkg.limitText && (
                    <p className="text-[11px] text-slate-500 italic pt-0.5">
                      {pkg.limitText}
                    </p>
                  )}
                </div>

                {/* Price & Selection Footer */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-lg font-black text-slate-900 tracking-tight font-mono">
                      {formatVnd(pkg.price)}
                    </span>
                    {pkg.originalPrice && (
                      <span className="block text-[11px] text-slate-400 line-through">
                        {formatVnd(pkg.originalPrice)}
                      </span>
                    )}
                  </div>

                  {isSoldOut ? (
                    <span className="text-xs font-semibold text-slate-400 bg-slate-200 px-2.5 py-1 rounded-lg">
                      Hết lượt
                    </span>
                  ) : isSelected ? (
                    <div className="w-7 h-7 rounded-full bg-orange-600 text-white flex items-center justify-center shadow-xs">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-slate-300" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Navigation */}
        <div className="pt-3 flex items-center justify-between border-t border-slate-100">
          <button
            type="button"
            onClick={onBackToCharacter}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            ← Quay lại chọn nhân vật
          </button>

          <button
            type="button"
            onClick={onProceedToPayment}
            disabled={!selectedPackage || selectedPackage.isSoldOut}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 hover:from-orange-400 hover:to-red-500 active:from-orange-600 text-white font-bold text-sm shadow-md shadow-orange-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <span>Tiếp tục thanh toán</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
