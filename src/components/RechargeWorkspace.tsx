import React, { useState, useEffect } from 'react';
import {
  Game,
  GameServer,
  Character,
  GamePackage,
  PaymentMethod,
  PaymentMethodId,
  DemoEdgeCase,
  PackageCategory,
} from '../types';
import {
  Server,
  User,
  ShieldAlert,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  ArrowLeft,
  Loader2,
  Sparkles,
  QrCode,
  Wallet,
  CreditCard,
  Coins,
  Ticket,
  Info,
  Lock,
  RotateCcw,
  ShieldCheck,
  Check,
  Minus,
  Plus,
} from 'lucide-react';
import { PackageDetailModal } from './PackageDetailModal';

interface RechargeWorkspaceProps {
  game: Game;
  servers: GameServer[];
  charactersMap: Record<string, Character[]>;
  selectedServer: GameServer | null;
  selectedCharacter: Character | null;
  selectedPackage: GamePackage | null;
  selectedQuantity: number;
  selectedPaymentMethodId: PaymentMethodId | null;
  paymentMethods: PaymentMethod[];
  packages: GamePackage[];
  edgeCase: DemoEdgeCase;
  onSelectServer: (server: GameServer | null) => void;
  onSelectCharacter: (char: Character | null) => void;
  onSelectPackage: (pkg: GamePackage | null) => void;
  onChangeQuantity: (qty: number) => void;
  onSelectPaymentMethod: (id: PaymentMethodId | null) => void;
  onProceedToPayment: () => void;
  onChangeGame: () => void;
  onSessionExpired: () => void;
}

export const RechargeWorkspace: React.FC<RechargeWorkspaceProps> = ({
  game,
  servers,
  charactersMap,
  selectedServer,
  selectedCharacter,
  selectedPackage,
  selectedQuantity,
  selectedPaymentMethodId,
  paymentMethods,
  packages,
  edgeCase,
  onSelectServer,
  onSelectCharacter,
  onSelectPackage,
  onChangeQuantity,
  onSelectPaymentMethod,
  onProceedToPayment,
  onChangeGame,
  onSessionExpired,
}) => {
  const [loadingCharacters, setLoadingCharacters] = useState(false);
  const [activeCategory, setActiveCategory] = useState<PackageCategory>('all');
  const [detailModalPackage, setDetailModalPackage] = useState<GamePackage | null>(null);
  const [agreementChecked, setAgreementChecked] = useState(true);
  const [syncNotice, setSyncNotice] = useState(false);
  const [maintenanceModalOpen, setMaintenanceModalOpen] = useState(edgeCase === 'server_maintenance');

  // Rule 8: Dynamic limit override when CMS changes maxQuantity before payment
  const [dynamicLimitOverride, setDynamicLimitOverride] = useState<number | null>(
    edgeCase === 'limit_changed' ? 2 : null
  );
  const [limitChangeWarning, setLimitChangeWarning] = useState<number | null>(
    edgeCase === 'limit_changed' ? 2 : null
  );

  const formatVnd = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' VND';
  };

  // Sync simulated edgeCase states immediately when edgeCase or package changes
  useEffect(() => {
    if (edgeCase === 'limit_changed') {
      const targetMax = selectedPackage && selectedPackage.maxQuantity > 2 ? 2 : 1;
      setDynamicLimitOverride(targetMax);
      setLimitChangeWarning(targetMax);
    } else {
      setDynamicLimitOverride(null);
      setLimitChangeWarning(null);
    }

    if (edgeCase === 'server_maintenance') {
      setMaintenanceModalOpen(true);
    } else {
      setMaintenanceModalOpen(false);
    }
  }, [selectedPackage?.id, edgeCase]);

  const isPackageSoldOut = (pkg: GamePackage | null): boolean => {
    if (!pkg) return false;
    if (pkg.isSoldOut) return true;
    if (edgeCase === 'package_sold_out' && (pkg.id === 'pkg_1' || pkg.id === 'pkg_2')) {
      return true;
    }
    return false;
  };

  const isSelectedPackageSoldOut = isPackageSoldOut(selectedPackage);

  const effectiveMaxQuantity =
    dynamicLimitOverride !== null
      ? dynamicLimitOverride
      : selectedPackage?.maxQuantity ?? 1;

  // Pricing & promotion calculations (Rule 5)
  const unitPrice = selectedPackage ? selectedPackage.price : 0;
  const originalUnitPrice =
    selectedPackage?.originalPrice && selectedPackage.originalPrice > selectedPackage.price
      ? selectedPackage.originalPrice
      : unitPrice;
  const isSalePackage = originalUnitPrice > unitPrice;
  const originalTotalAmount = originalUnitPrice * selectedQuantity;
  const totalAmount = unitPrice * selectedQuantity;
  const totalDiscountAmount = isSalePackage ? originalTotalAmount - totalAmount : 0;

  // Total reward summary calculation
  const getRewardSummary = (pkg: GamePackage, qty: number): string => {
    if (pkg.baseCurrencyNumeric) {
      const totalBase = pkg.baseCurrencyNumeric * qty;
      const totalBonus = pkg.bonusCurrencyNumeric ? pkg.bonusCurrencyNumeric * qty : 0;
      const baseFormatted = new Intl.NumberFormat('vi-VN').format(totalBase);
      if (totalBonus > 0) {
        const bonusFormatted = new Intl.NumberFormat('vi-VN').format(totalBonus);
        return `${baseFormatted} Kim Phiếu (+${bonusFormatted} Kim Phiếu tặng thêm)`;
      }
      return `${baseFormatted} Kim Phiếu`;
    }
    return pkg.bonusAmount ? `${pkg.currencyAmount} · ${pkg.bonusAmount}` : pkg.currencyAmount;
  };

  const handleServerChange = (serverId: string) => {
    onSelectCharacter(null);
    const foundServer = servers.find((s) => s.id === serverId) || null;
    onSelectServer(foundServer);

    if (foundServer) {
      setLoadingCharacters(true);
      setTimeout(() => {
        setLoadingCharacters(false);
      }, 400);
    }
  };

  const getCharactersForServer = (server: GameServer | null): Character[] => {
    if (!server) return [];
    return charactersMap[server.id] || [];
  };

  const availableCharacters = selectedServer ? getCharactersForServer(selectedServer) : [];

  const handleCharacterChange = (charId: string) => {
    if (!selectedServer) return;
    const list = getCharactersForServer(selectedServer);
    const found = list.find((c) => c.id === charId) || null;
    onSelectCharacter(found);
  };

  const isServerMaintenance = edgeCase === 'server_maintenance' || selectedServer?.isMaintenance;

  // Filter packages by tab category
  const filteredPackages = packages.filter((pkg) => {
    if (activeCategory === 'all') return true;
    return pkg.category === activeCategory;
  });

  // Filter payment methods supported by the selected package (maximum 5 methods displayed)
  const availablePaymentMethods = selectedPackage
    ? paymentMethods
        .filter((method) => selectedPackage.supportedPaymentMethodIds.includes(method.id))
        .slice(0, 5)
    : [];

  // Helper to check if a payment method supports the current totalAmount (Rule 6)
  const isMethodAmountValid = (method: PaymentMethod, amount: number): boolean => {
    if (method.minAmount !== undefined && amount < method.minAmount) return false;
    if (method.maxAmount !== undefined && amount > method.maxAmount) return false;
    return true;
  };

  // Rule 4: Keep payment method if it still supports the new package; if not supported, require user to re-select
  useEffect(() => {
    if (!selectedPackage) return;
    if (selectedPaymentMethodId) {
      const stillSupportedByPkg = availablePaymentMethods.some(
        (m) => m.id === selectedPaymentMethodId
      );
      if (!stillSupportedByPkg) {
        onSelectPaymentMethod(null);
      }
    }
  }, [selectedPackage?.id]);

  const currentSelectedMethodObj = availablePaymentMethods.find(
    (m) => m.id === selectedPaymentMethodId
  );
  const isCurrentPaymentMethodValid = Boolean(
    currentSelectedMethodObj && isMethodAmountValid(currentSelectedMethodObj, totalAmount)
  );

  const handleDecreaseQuantity = () => {
    if (selectedQuantity <= 1) return;
    const nextQty = selectedQuantity - 1;
    onChangeQuantity(nextQty);
    if (limitChangeWarning !== null && nextQty <= limitChangeWarning) {
      setLimitChangeWarning(null);
    }
  };

  const handleIncreaseQuantity = () => {
    if (selectedQuantity >= effectiveMaxQuantity) return;
    onChangeQuantity(selectedQuantity + 1);
  };

  const handleProceedClick = () => {
    if (!selectedPackage) return;

    // Case Server đang bảo trì: chỉ khi bấm thanh toán mới check thông báo bảo trì
    if (isServerMaintenance) {
      setMaintenanceModalOpen(true);
      return;
    }

    // Rule 8: Kiểm tra giới hạn số lượng trước khi thanh toán (giả lập CMS thay đổi giới hạn)
    if (edgeCase === 'limit_changed' && dynamicLimitOverride === null) {
      const simulatedNewMax =
        selectedQuantity > 1
          ? Math.max(1, selectedQuantity - 1)
          : 1;
      setDynamicLimitOverride(simulatedNewMax);
      setLimitChangeWarning(simulatedNewMax);
      return;
    }

    if (selectedQuantity > effectiveMaxQuantity) {
      setLimitChangeWarning(effectiveMaxQuantity);
      return;
    }

    if (!selectedPaymentMethodId || !isCurrentPaymentMethodValid) {
      return;
    }

    onProceedToPayment();
  };

  const getMethodIcon = (id: PaymentMethodId) => {
    switch (id) {
      case 'point':
        return <Coins className="w-5 h-5 text-amber-500" />;
      case 'vietqr':
        return <QrCode className="w-5 h-5 text-red-600" />;
      case 'zalopay':
        return <Wallet className="w-5 h-5 text-blue-600" />;
      case 'momo':
        return <Wallet className="w-5 h-5 text-pink-600" />;
      case 'bank':
        return <CreditCard className="w-5 h-5 text-emerald-600" />;
      case 'credit':
        return <CreditCard className="w-5 h-5 text-indigo-600" />;
      case 'gamecard':
        return <Ticket className="w-5 h-5 text-orange-600" />;
      default:
        return <CreditCard className="w-5 h-5 text-slate-600" />;
    }
  };

  const handleAddPackageFromCard = (e: React.MouseEvent, pkg: GamePackage) => {
    e.stopPropagation();
    if (isPackageSoldOut(pkg)) return;
    onSelectPackage(pkg);
  };

  const handleCardDecreaseQuantity = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedQuantity <= 1) {
      // Giảm về 0 -> bỏ chọn gói và trở lại nút "+" ban đầu
      onSelectPackage(null);
      return;
    }
    handleDecreaseQuantity();
  };

  const handleCardIncreaseQuantity = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleIncreaseQuantity();
  };

  const handleOpenDetailModal = (e: React.MouseEvent, pkg: GamePackage) => {
    e.stopPropagation();
    setDetailModalPackage(pkg);
  };

  const handleAddToCartFromModal = (pkg: GamePackage) => {
    if (isPackageSoldOut(pkg)) return;
    if (selectedPackage?.id === pkg.id) {
      if (selectedQuantity < effectiveMaxQuantity) {
        onChangeQuantity(selectedQuantity + 1);
      }
    } else {
      onSelectPackage(pkg);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Game Banner & Change Game Button */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#18181b] border border-zinc-800/90 shadow-md flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div
            className={`w-12 h-12 rounded-xl bg-gradient-to-br ${game.iconBg} text-white flex items-center justify-center text-xl shrink-0 shadow-md`}
          >
            {game.iconSymbol}
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-bold text-[#fb5503] uppercase tracking-wider block">
              Tựa game đang chọn
            </span>
            <h2 className="text-base sm:text-lg font-bold text-[#fcfcfc] truncate">
              {game.name}
            </h2>
          </div>
        </div>

        <button
          type="button"
          onClick={onChangeGame}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-zinc-700 bg-[#121214] hover:bg-zinc-800 text-zinc-300 hover:text-white font-semibold text-xs transition-colors shrink-0 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Đổi game</span>
        </button>
      </div>

      {/* Session Expired Alert if simulated */}
      {edgeCase === 'session_expired' && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-600/40 text-rose-200 text-sm flex items-start gap-3 animate-in fade-in">
          <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-rose-300">Phiên đăng nhập đã hết hạn</p>
            <p className="text-xs sm:text-sm text-rose-200/90 mt-0.5">
              Hệ thống Gati phát hiện phiên làm việc quá hạn. Vui lòng đăng nhập lại tài khoản Gati ID để tiếp tục.
            </p>
          </div>
          <button
            onClick={onSessionExpired}
            className="px-3.5 py-1.5 rounded-xl bg-[#fb5503] hover:bg-[#e04c02] text-white font-semibold text-xs cursor-pointer shrink-0 shadow-sm"
          >
            Đăng nhập lại
          </button>
        </div>
      )}

      {/* Limit Changed Alert if simulated */}
      {edgeCase === 'limit_changed' && (
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-600/40 text-amber-200 text-sm flex items-start gap-3 animate-in fade-in">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-amber-300">
              Mô phỏng: Giới hạn số lượng gói vừa thay đổi trên CMS
            </p>
            <p className="text-xs sm:text-sm text-amber-200/90 mt-0.5">
              Gói đang chọn đã giảm giới hạn xuống tối đa <strong>{effectiveMaxQuantity} gói / giao dịch</strong> trong khi bạn đang chọn <strong>x{selectedQuantity}</strong>. Xem cảnh báo ở cột phải và bấm nút <strong>[ − ]</strong> giảm xuống <strong>{effectiveMaxQuantity}</strong> để mở khóa nút Thanh toán.
            </p>
          </div>
        </div>
      )}

      {/* Server Maintenance Alert if simulated */}
      {edgeCase === 'server_maintenance' && (
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-600/40 text-amber-200 text-sm flex items-start justify-between gap-3 animate-in fade-in">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-300">
                Mô phỏng: Máy chủ đang bảo trì ({selectedServer?.name})
              </p>
              <p className="text-xs sm:text-sm text-amber-200/90 mt-0.5">
                Khi người chơi bấm nút Thanh toán cho máy chủ đang bảo trì, hệ thống sẽ hiển thị Popup thông báo bảo trì.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMaintenanceModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-[#fb5503] hover:bg-[#e04c02] text-white font-semibold text-xs cursor-pointer shrink-0 shadow-sm"
          >
            Mở Popup bảo trì
          </button>
        </div>
      )}

      {/* Package Sold Out Alert if simulated */}
      {edgeCase === 'package_sold_out' && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-600/40 text-rose-200 text-sm flex items-start gap-3 animate-in fade-in">
          <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-rose-300">
              Mô phỏng: Gói nạp đã hết lượt mua
            </p>
            <p className="text-xs sm:text-sm text-rose-200/90 mt-0.5">
              Các gói ưu đãi giới hạn đã đạt trần lượt mua. Các gói này hiển thị trạng thái <strong>Hết lượt mua</strong> và không thể thanh toán. Vui lòng chọn một gói khác còn lượt.
            </p>
          </div>
        </div>
      )}

      {/* Chọn máy chủ & nhân vật */}
      <div className="p-6 rounded-2xl bg-[#18181b] border border-zinc-800/90 shadow-md space-y-5">
        {(() => {
          const isLocked = Boolean(selectedCharacter && selectedServer);

          return (
            <>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#fcfcfc] flex items-center gap-2">
                    <Server className="w-5 h-5 text-[#fb5503]" />
                    <span>Chọn máy chủ & nhân vật</span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Chọn máy chủ để hệ thống tự động tải danh sách nhân vật thuộc tài khoản Gati của bạn
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Dropdown: Máy chủ */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span>Máy chủ (Server) <span className="text-[#fb5503]">*</span></span>
                    </span>
                  </label>
                  <div className="relative">
                    <select
                      value={selectedServer?.id || ''}
                      onChange={(e) => handleServerChange(e.target.value)}
                      disabled={isLocked}
                      className={`w-full pl-3.5 pr-10 py-2.5 text-sm rounded-xl border transition-all appearance-none shadow-inner ${
                        isLocked
                          ? 'bg-[#141416] border-zinc-800 text-zinc-500 cursor-not-allowed opacity-65 select-none'
                          : 'bg-[#121214] border-zinc-700 text-[#fcfcfc] hover:border-zinc-600 focus:outline-none focus:border-[#fb5503] focus:ring-1 focus:ring-[#fb5503]/30 cursor-pointer'
                      }`}
                    >
                      <option value="" className="bg-[#18181b] text-zinc-400">-- Chọn máy chủ --</option>
                      {servers.map((server) => (
                        <option key={server.id} value={server.id} className="bg-[#18181b] text-white">
                          {server.name} {server.isMaintenance ? '(Đang bảo trì)' : ''}
                        </option>
                      ))}
                    </select>
                    <Server className="w-4 h-4 text-zinc-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  {!selectedServer && (
                    <p className="text-xs text-zinc-400 mt-1">
                      Chọn máy chủ để xem nhân vật của bạn.
                    </p>
                  )}
                </div>

                {/* Dropdown: Nhân vật */}
                <div>
                  <label
                    className={`block text-xs font-semibold mb-1.5 flex items-center justify-between transition-colors ${
                      !selectedServer
                        ? 'text-zinc-500'
                        : isLocked
                        ? 'text-zinc-400'
                        : 'text-[#fcfcfc]'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span>Nhân vật <span className="text-[#fb5503]">*</span></span>
                    </span>
                    {loadingCharacters && (
                      <span className="text-[11px] text-[#fb5503] font-medium flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" /> Đang tải danh sách...
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <select
                      value={selectedCharacter?.id || ''}
                      onChange={(e) => handleCharacterChange(e.target.value)}
                      disabled={isLocked || !selectedServer || loadingCharacters}
                      className={`w-full pl-3.5 pr-10 py-2.5 text-sm rounded-xl border transition-all appearance-none shadow-inner ${
                        isLocked
                          ? 'bg-[#141416] border-zinc-800 text-zinc-500 cursor-not-allowed opacity-65 select-none'
                          : !selectedServer || loadingCharacters
                          ? 'bg-[#18181b]/60 text-zinc-600 border-zinc-800 cursor-not-allowed'
                          : 'bg-[#121214] border-zinc-600 text-[#fcfcfc] font-medium hover:border-[#fb5503] focus:outline-none focus:border-[#fb5503] focus:ring-1 focus:ring-[#fb5503]/30 cursor-pointer'
                      }`}
                    >
                      {!selectedServer ? (
                        <option value="" className="bg-[#18181b] text-zinc-500">-- Chọn nhân vật --</option>
                      ) : loadingCharacters ? (
                        <option value="" className="bg-[#18181b] text-zinc-400">Đang tải danh sách nhân vật...</option>
                      ) : availableCharacters.length === 0 ? (
                        <option value="" className="bg-[#18181b] text-zinc-500">-- Không có nhân vật trên máy chủ này --</option>
                      ) : (
                        <>
                          <option value="" className="bg-[#18181b] text-[#fcfcfc]">-- Chọn nhân vật --</option>
                          {availableCharacters.map((char) => (
                            <option key={char.id} value={char.id} className="bg-[#18181b] text-white">
                              {char.name} (Role ID: {char.roleId})
                            </option>
                          ))}
                        </>
                      )}
                    </select>
                    {loadingCharacters ? (
                      <Loader2 className="w-4 h-4 text-[#fb5503] animate-spin absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    ) : (
                      <User
                        className={`w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                          selectedServer && !isLocked ? 'text-[#fb5503]' : 'text-zinc-500'
                        }`}
                      />
                    )}
                  </div>

                </div>
              </div>

              {/* Selected Character Preview Badge */}
              {selectedCharacter && selectedServer && (
                <div className="p-4 rounded-xl bg-[#141417] border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#fb5503] to-[#c44100] text-white font-black flex items-center justify-center text-sm shadow-md shrink-0">
                      {selectedCharacter.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-sm text-[#fcfcfc]">{selectedCharacter.name}</h4>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-zinc-400 mt-0.5 flex-wrap">
                        <span>Máy chủ: <strong className="text-zinc-200">{selectedServer.name}</strong></span>
                        <span>·</span>
                        <span>Role ID: <strong className="font-mono text-zinc-200">{selectedCharacter.roleId}</strong></span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectCharacter(null)}
                    className="px-3.5 py-2 rounded-xl border border-zinc-700 bg-[#1c1c20] hover:bg-zinc-800 hover:border-zinc-500 text-zinc-200 hover:text-white font-semibold text-xs transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 shadow-sm"
                    title="Chọn lại máy chủ hoặc nhân vật khác"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-[#fb5503]" />
                    <span>Chọn lại</span>
                  </button>
                </div>
              )}
            </>
          );
        })()}
      </div>

      {/* 3. Phần 2: Tự động hiển thị Gói nạp & Phương thức thanh toán trên cùng screen khi đã chọn nhân vật */}
      {selectedCharacter && selectedServer ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-in fade-in slide-in-from-top-2 duration-300">
          {/* CỘT TRÁI (Lg: col-span-8): Danh sách gói nạp */}
          <div className="lg:col-span-8 bg-[#18181b] rounded-2xl border border-zinc-800/90 p-5 sm:p-6 shadow-md space-y-5">
            {/* Header: Chọn gói nạp */}
            <div>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#fb5503]" />
                  <h3 className="text-base sm:text-lg font-bold text-[#fcfcfc]">
                    Chọn gói nạp
                  </h3>
                </div>

                {/* Category filter tabs */}
                <div className="flex rounded-xl bg-[#121214] border border-zinc-800 p-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setActiveCategory('all')}
                    className={`px-3 py-1 font-semibold rounded-lg transition-colors cursor-pointer ${
                      activeCategory === 'all'
                        ? 'bg-[#fb5503] text-white shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Tất cả
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveCategory('standard')}
                    className={`px-3 py-1 font-semibold rounded-lg transition-colors cursor-pointer ${
                      activeCategory === 'standard'
                        ? 'bg-[#fb5503] text-white shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Kim Phiếu
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveCategory('sub')}
                    className={`px-3 py-1 font-semibold rounded-lg transition-colors cursor-pointer ${
                      activeCategory === 'sub'
                        ? 'bg-[#fb5503] text-white shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Thẻ tháng / tuần
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-[#fb5503] font-medium mt-2">
                <Sparkles className="w-3.5 h-3.5 text-[#fb5503]" />
                <span>Danh sách gói</span>
                <span className="text-zinc-400 font-normal">
                  (Mỗi giao dịch chọn 1 loại gói nạp · Có thể điều chỉnh số lượng ở cột phải)
                </span>
              </div>
            </div>

            {/* Grid of Package Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPackages.map((pkg) => {
                const isSelected = selectedPackage?.id === pkg.id;
                const soldOut = isPackageSoldOut(pkg);

                return (
                  <div
                    key={pkg.id}
                    className={`group relative rounded-2xl border transition-all text-left overflow-hidden flex flex-col justify-between ${
                      soldOut
                        ? 'border-zinc-800/80 bg-[#141417]/60 opacity-65'
                        : isSelected
                        ? 'border-[#fb5503] bg-[#221814] ring-1 ring-[#fb5503]/50 shadow-[0_8px_24px_rgba(251,85,3,0.3)] scale-[1.01]'
                        : 'border-zinc-800 bg-[#141417] hover:border-[#fb5503]/60 hover:shadow-md'
                    }`}
                  >
                    {/* Golden Banner Thumbnail: Bấm vào vùng hình ảnh phía trên card để mở popup Chi tiết gói */}
                    <div
                      onClick={(e) => handleOpenDetailModal(e, pkg)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setDetailModalPackage(pkg);
                        }
                      }}
                      title="Bấm vào ảnh để xem chi tiết gói"
                      aria-label={`Xem chi tiết ${pkg.name}`}
                      className="relative w-full h-32 bg-gradient-to-b from-[#2b160b] via-[#1c1008] to-[#120a05] p-3 flex flex-col items-center justify-center border-b border-zinc-800/80 overflow-hidden cursor-pointer"
                    >
                      {/* Background radial lighting */}
                      <div className="absolute inset-0 bg-radial from-[#fb5503]/20 via-transparent to-transparent pointer-events-none" />

                      {/* Mascot Ticket/Chest Visual Element */}
                      <div className="relative z-10 flex flex-col items-center">
                        <div className="w-16 h-12 bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 rounded-lg p-1 shadow-md border border-amber-300/40 flex items-center justify-center transform group-hover:scale-105 transition-transform">
                          <span className="text-[10px] font-black text-amber-950 uppercase tracking-tighter">
                            GATI PHIẾU
                          </span>
                        </div>
                        {/* Currency label over banner */}
                        <div className="mt-1.5 flex items-center gap-1.5 text-amber-300 font-black text-sm drop-shadow-md">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span>{pkg.currencyAmount}</span>
                        </div>
                      </div>

                      {/* Sale badge (nếu có sale) */}
                      {pkg.originalPrice && pkg.originalPrice > pkg.price && (
                        <div className="absolute top-2 right-2 pointer-events-none">
                          <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md uppercase tracking-tight">
                            Sale -{Math.round((1 - pkg.price / pkg.originalPrice) * 100)}%
                          </span>
                        </div>
                      )}

                      {/* Sold Out Overlay */}
                      {soldOut && (
                        <div className="absolute inset-0 z-20 bg-black/65 backdrop-blur-[1px] flex items-center justify-center">
                          <span className="px-3 py-1 rounded-lg bg-rose-600 text-white font-black text-xs uppercase tracking-wider shadow-lg border border-rose-400/50">
                            Hết lượt mua
                          </span>
                        </div>
                      )}

                      {/* Selected checkmark indicator */}
                      {isSelected && !soldOut && (
                        <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-[#fb5503] px-2 py-1 text-white shadow-xs text-[10px] font-bold">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Đã chọn</span>
                        </div>
                      )}
                    </div>

                    {/* Card Content & Action Bar */}
                    <div className="p-3.5 flex items-center justify-between gap-2 bg-[#141417]">
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs text-[#fcfcfc] group-hover:text-[#fb5503] transition-colors truncate">
                          {pkg.name}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          {/* Giá sale (giá thực tế cần thanh toán) */}
                          <span className="font-black text-[#fb5503] font-mono tabular-nums text-xs sm:text-sm">
                            {formatVnd(pkg.price)}
                          </span>
                          {/* Giá gốc gạch ngang (nếu gói có sale) */}
                          {pkg.originalPrice && pkg.originalPrice > pkg.price && (
                            <span className="line-through text-zinc-500 font-mono tabular-nums text-[11px]">
                              {formatVnd(pkg.originalPrice)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Điều chỉnh số lượng ngay trên card gói */}
                      {!isSelected || soldOut ? (
                        <button
                          type="button"
                          onClick={(e) => handleAddPackageFromCard(e, pkg)}
                          disabled={soldOut}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm transition-all shrink-0 ${
                            soldOut
                              ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                              : 'bg-[#fb5503] hover:bg-[#e04c02] active:bg-[#c44100] active:scale-95 text-white cursor-pointer'
                          }`}
                          title="Chọn gói này"
                          aria-label={`Chọn ${pkg.name}`}
                        >
                          <Plus className="w-4 h-4 stroke-[2.5]" />
                        </button>
                      ) : (
                        <div
                          className="flex items-center gap-1 bg-[#18181b] p-0.5 rounded-lg border border-[#fb5503]/50 shrink-0 shadow-xs"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={handleCardDecreaseQuantity}
                            aria-label="Giảm số lượng"
                            title="Giảm số lượng"
                            className="w-7 h-7 rounded-md font-bold flex items-center justify-center transition-all bg-[#fb5503]/15 border border-[#fb5503]/40 text-[#fb5503] hover:bg-[#fb5503] hover:text-white active:scale-95 cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                          </button>

                          <span
                            className="min-w-[22px] px-1 text-center font-mono tabular-nums font-black text-xs text-[#fcfcfc] select-none"
                            aria-live="polite"
                          >
                            {selectedQuantity}
                          </span>

                          <button
                            type="button"
                            onClick={handleCardIncreaseQuantity}
                            disabled={selectedQuantity >= effectiveMaxQuantity}
                            aria-label="Tăng số lượng"
                            title={
                              selectedQuantity >= effectiveMaxQuantity
                                ? `Tối đa ${effectiveMaxQuantity} gói / giao dịch`
                                : 'Tăng số lượng'
                            }
                            className={`w-7 h-7 rounded-md font-bold flex items-center justify-center transition-all border ${
                              selectedQuantity < effectiveMaxQuantity
                                ? 'bg-[#fb5503]/15 border-[#fb5503]/40 text-[#fb5503] hover:bg-[#fb5503] hover:text-white active:scale-95 cursor-pointer'
                                : 'bg-zinc-900/70 border-zinc-800 text-zinc-600 cursor-not-allowed'
                            }`}
                          >
                            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CỘT PHẢI (Lg: col-span-4): Phương thức thanh toán & Số lượng gói */}
          <div className="lg:col-span-4 bg-[#18181b] rounded-2xl border border-zinc-800/90 p-5 sm:p-6 shadow-md space-y-5 sticky top-24">
            {/* Header: Phương thức thanh toán */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="font-bold text-[#fcfcfc] text-base">
                Phương thức thanh toán
              </h3>

              {!selectedPackage && (
                <span className="text-xs text-zinc-500 italic font-medium">
                  Đơn hàng đang trống
                </span>
              )}
            </div>

            {/* If NO package selected: prompt user to pick package */}
            {!selectedPackage ? (
              <div className="p-8 text-center bg-[#121214] rounded-xl border border-dashed border-zinc-800 space-y-2">
                <Ticket className="w-8 h-8 text-zinc-600 mx-auto" />
                <p className="text-xs font-semibold text-zinc-300">
                  Chưa chọn gói nạp
                </p>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Vui lòng bấm chọn một gói nạp bên trái để hiển thị bộ chọn số lượng và danh sách phương thức thanh toán tương ứng.
                </p>
              </div>
            ) : (
              /* When package IS selected */
              <div className="space-y-4 animate-in fade-in">
                {/* 1. Selected package badge summary */}
                <div className="p-3.5 rounded-xl bg-[#221814] border border-[#fb5503]/30 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-semibold">
                      Gói đang chọn
                    </span>
                    <span className="font-bold text-xs sm:text-sm text-[#fcfcfc] truncate block mt-0.5">
                      {selectedPackage.name}
                    </span>
                    {selectedPackage.bonusAmount && (
                      <span className="text-[11px] text-amber-400 font-medium block mt-0.5">
                        {selectedPackage.bonusAmount}
                      </span>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono tabular-nums font-black text-sm text-[#fb5503] block">
                      {formatVnd(selectedPackage.price)}
                    </span>
                    {isSalePackage && (
                      <span className="line-through text-zinc-500 font-mono tabular-nums text-[11px] block">
                        {formatVnd(originalUnitPrice)}
                      </span>
                    )}
                  </div>
                </div>

                {isSelectedPackageSoldOut && (
                  <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-600/60 text-rose-200 text-xs flex items-start gap-2.5 animate-in fade-in">
                    <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span className="font-semibold leading-relaxed">
                      Gói nạp này đã hết lượt mua trong ngày. Vui lòng chọn một gói nạp khác ở cột bên trái.
                    </span>
                  </div>
                )}

                {/* 2. Khu vực "Số lượng" ngay dưới "Gói đang chọn" (Rule 2 & Rule 3) */}
                <div className="p-3.5 rounded-xl bg-[#121214] border border-zinc-800 space-y-2.5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold text-[#fcfcfc] block">
                        Số lượng
                      </span>
                      <span className="text-[11px] text-zinc-400">
                        Tối đa {effectiveMaxQuantity} gói / giao dịch
                      </span>
                    </div>

                    {/* Bộ điều khiển: [ − ]  1  [ + ] */}
                    <div className="flex items-center gap-1.5 bg-[#18181b] p-1 rounded-xl border border-zinc-800">
                      <button
                        type="button"
                        onClick={handleDecreaseQuantity}
                        disabled={selectedQuantity <= 1 || isSelectedPackageSoldOut}
                        aria-label="Giảm số lượng"
                        className={`w-9 h-9 rounded-lg font-bold flex items-center justify-center transition-all border ${
                          selectedQuantity > 1 && !isSelectedPackageSoldOut
                            ? 'bg-[#fb5503]/15 border-[#fb5503]/50 text-[#fb5503] hover:bg-[#fb5503] hover:text-white active:scale-95 cursor-pointer shadow-xs'
                            : 'bg-zinc-900/70 border-zinc-800 text-zinc-600 cursor-not-allowed'
                        }`}
                      >
                        <Minus className="w-4 h-4 stroke-[2.5]" />
                      </button>

                      <span
                        className="w-10 text-center font-mono tabular-nums font-black text-sm text-[#fcfcfc] select-none"
                        aria-live="polite"
                      >
                        {selectedQuantity}
                      </span>

                      <button
                        type="button"
                        onClick={handleIncreaseQuantity}
                        disabled={selectedQuantity >= effectiveMaxQuantity || isSelectedPackageSoldOut}
                        aria-label="Tăng số lượng"
                        className={`w-9 h-9 rounded-lg font-bold flex items-center justify-center transition-all border ${
                          selectedQuantity < effectiveMaxQuantity && !isSelectedPackageSoldOut
                            ? 'bg-[#fb5503]/15 border-[#fb5503]/50 text-[#fb5503] hover:bg-[#fb5503] hover:text-white active:scale-95 cursor-pointer shadow-xs'
                            : 'bg-zinc-900/70 border-zinc-800 text-zinc-600 cursor-not-allowed'
                        }`}
                      >
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                      </button>
                    </div>
                  </div>

                  {/* Thông báo giới hạn hiển thị sẵn ngay dưới bộ chọn (Rule 3 & Rule 8) */}
                  {limitChangeWarning !== null || selectedQuantity > effectiveMaxQuantity ? (
                    <div className="p-2.5 rounded-lg bg-rose-950/50 border border-rose-600/50 text-rose-200 text-[11px] flex items-start gap-2 animate-in fade-in">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <span className="font-semibold leading-relaxed">
                        Số lượng tối đa của gói đã thay đổi. Vui lòng điều chỉnh xuống tối đa {effectiveMaxQuantity} gói để tiếp tục.
                      </span>
                    </div>
                  ) : effectiveMaxQuantity === 1 ? (
                    <div className="pt-1 border-t border-zinc-800/80 flex items-center gap-1.5 text-[11px] text-amber-400 font-medium">
                      <Info className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                      <span>Gói này chỉ được mua 1 lần trong mỗi giao dịch.</span>
                    </div>
                  ) : selectedQuantity === effectiveMaxQuantity ? (
                    <div className="pt-1 border-t border-zinc-800/80 flex items-center gap-1.5 text-[11px] text-amber-400 font-medium">
                      <Info className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                      <span>Bạn đã chọn số lượng tối đa cho gói này.</span>
                    </div>
                  ) : null}
                </div>

                {/* 3. List of supported payment methods for this specific package (Rule 6) */}
                <fieldset className="space-y-2.5">
                  <legend className="sr-only">Chọn phương thức thanh toán</legend>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-zinc-400 font-semibold block">
                      Kênh thanh toán khả dụng cho gói này:
                    </span>
                    {!selectedPaymentMethodId && (
                      <span className="text-[11px] text-[#fb5503] font-semibold">
                        * Vui lòng chọn lại
                      </span>
                    )}
                  </div>

                  {availablePaymentMethods.map((method) => {
                    const isSelected = selectedPaymentMethodId === method.id;

                    return (
                      <label
                        key={method.id}
                        className={`p-3 rounded-xl border transition-all text-left flex items-center justify-between gap-3 cursor-pointer focus-within:ring-2 focus-within:ring-white ${
                          isSelected
                            ? 'border-[#fb5503] bg-[#fb5503]/10 ring-1 ring-[#fb5503]/30 shadow-xs'
                            : 'border-zinc-800 bg-[#121214] hover:border-zinc-700 hover:bg-zinc-800/60'
                        }`}
                      >
                        <input type="radio" name="payment-method" value={method.id} checked={isSelected} onChange={() => onSelectPaymentMethod(method.id)} className="sr-only" />
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                              isSelected ? 'bg-[#fb5503]/20' : 'bg-zinc-800'
                            }`}
                          >
                            {getMethodIcon(method.id)}
                          </div>

                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-bold text-xs text-[#fcfcfc] truncate">
                              {method.name}
                            </span>
                            {method.discountBadge && (
                              <span className="text-[10px] font-black text-white bg-gradient-to-r from-[#fb5503] to-rose-600 px-1.5 py-0.5 rounded uppercase tracking-tight shrink-0">
                                Hot
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Radio Checkbox */}
                        <div className="shrink-0">
                          {isSelected ? (
                            <div className="w-4 h-4 rounded-full bg-[#fb5503] text-white flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-zinc-700" />
                          )}
                        </div>
                      </label>
                    );
                  })}
                </fieldset>

                {/* 4. Chi tiết tính giá, khuyến mãi & CTA Button */}
                <div className="pt-3 border-t border-zinc-800 space-y-3">
                  <div className="p-3.5 rounded-xl bg-[#121214] border border-zinc-800/90 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between text-zinc-400">
                      <span>Số Lượng:</span>
                      <span className="font-mono tabular-nums font-bold text-white">
                        x{selectedQuantity}
                      </span>
                    </div>

                    {isSalePackage && (
                      <>
                        <div className="flex items-center justify-between text-zinc-400">
                          <span>Giá gốc:</span>
                          <span className="font-mono tabular-nums font-bold text-white">
                            {formatVnd(originalTotalAmount)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-emerald-400">
                          <span>Giảm Giá:</span>
                          <span className="font-mono tabular-nums font-bold">
                            -{formatVnd(totalDiscountAmount)}
                          </span>
                        </div>
                      </>
                    )}

                    <div className="flex items-baseline justify-between pt-2.5 border-t border-zinc-800">
                      <span className="text-zinc-200 font-bold">Tổng Thanh Toán:</span>
                      <span className="text-lg sm:text-xl font-black text-[#fb5503] font-mono tabular-nums">
                        {formatVnd(totalAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Terms Checkbox */}
                  <label className="flex items-start gap-2 cursor-pointer text-[11px] text-zinc-400 select-none">
                    <input
                      type="checkbox"
                      checked={agreementChecked}
                      onChange={(e) => setAgreementChecked(e.target.checked)}
                      className="mt-0.5 rounded border-zinc-700 bg-zinc-900 text-[#fb5503] focus:ring-[#fb5503] cursor-pointer"
                    />
                    <span>
                      Tôi đồng ý với điều khoản thanh toán và quy định nạp game của Gati Games.
                    </span>
                  </label>

                  {/* Primary CTA: Thanh toán ngay */}
                  <button
                    type="button"
                    onClick={handleProceedClick}
                    disabled={
                      !agreementChecked ||
                      !selectedPaymentMethodId ||
                      !isCurrentPaymentMethodValid ||
                      selectedQuantity > effectiveMaxQuantity ||
                      isSelectedPackageSoldOut
                    }
                    className="w-full py-3.5 px-4 rounded-xl bg-[#fb5503] hover:bg-[#ff681c] active:bg-[#e04c02] text-white font-bold text-sm shadow-[0_4px_20px_rgba(251,85,3,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span className="font-mono tabular-nums">
                      {isSelectedPackageSoldOut
                        ? 'Gói đã hết lượt mua'
                        : `Thanh toán ngay (${formatVnd(totalAmount)})`}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Prompt to select character in step 1 */
        <div className="p-4 rounded-xl bg-[#18181b] border border-zinc-800 text-center">
          <p className="text-sm text-zinc-400">
            Chọn nhân vật để xem gói nạp và phương thức thanh toán.
          </p>
        </div>
      )}

      {/* 4. Package Detail Modal */}
      <PackageDetailModal
        pkg={detailModalPackage}
        isOpen={!!detailModalPackage}
        isSoldOut={isPackageSoldOut(detailModalPackage)}
        onClose={() => setDetailModalPackage(null)}
        onAddToCart={handleAddToCartFromModal}
      />

      {/* 5. Server Maintenance Modal (Check khi bấm thanh toán -> Bấm xác nhận đá ra trang Chọn Game) */}
      {maintenanceModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
          aria-labelledby="server-maintenance-title"
        >
          <div
            className="w-full max-w-md bg-[#18181b] rounded-2xl border border-zinc-800 shadow-2xl p-6 text-[#fcfcfc] text-center space-y-5 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 rounded-full bg-[#fb5503]/15 text-[#fb5503] border border-[#fb5503]/30 flex items-center justify-center mx-auto shadow-lg shadow-[#fb5503]/10">
              <AlertTriangle className="w-9 h-9 stroke-[2.5]" />
            </div>

            <div className="space-y-2">
              <h3 id="server-maintenance-title" className="text-lg font-bold text-white tracking-tight">
                Máy chủ đang bảo trì
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                Máy chủ <strong className="text-white font-bold">{selectedServer?.name || 'đang chọn'}</strong> hiện đang trong thời gian bảo trì và nâng cấp định kỳ để hoàn thiện hệ thống.
              </p>
              <p className="text-xs text-zinc-400">
                Cổng thanh toán tạm ngưng tiếp nhận giao dịch nạp cho máy chủ này. Vui lòng quay lại sau hoặc chọn tựa game / máy chủ khác.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setMaintenanceModalOpen(false);
                  onChangeGame();
                }}
                className="w-full py-3 px-4 rounded-xl bg-[#fb5503] hover:bg-[#ff681c] active:bg-[#e04c02] text-white font-bold text-sm shadow-md shadow-[#fb5503]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Xác nhận</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
