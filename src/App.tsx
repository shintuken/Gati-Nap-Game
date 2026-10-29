import React, { useState, useEffect } from 'react';
import {
  Game,
  GameServer,
  Character,
  GamePackage,
  PaymentMethodId,
  TransactionRecord,
  DemoEdgeCase,
  UserAccount,
  TransactionStatus,
} from './types';
import {
  MOCK_GAMES,
  MOCK_SERVERS,
  MOCK_CHARACTERS,
  MOCK_PACKAGES,
  MOCK_PAYMENT_METHODS,
  INITIAL_TRANSACTIONS,
  INITIAL_USER,
  LINK_NAP_DOI_TAC_3QPC,
  GATI_LOGO_SRC,
} from './data/mockData';
import { Header } from './components/Header';
import { Step1SelectGame } from './components/Step1SelectGame';
import { RechargeWorkspace } from './components/RechargeWorkspace';
import { PaymentProcessingView } from './components/PaymentProcessingView';
import { TransactionResult } from './components/TransactionResult';
import { PartnerModal } from './components/PartnerModal';
import { GuideModal } from './components/GuideModal';
import { LoginModal } from './components/LoginModal';
import { HistoryModal } from './components/HistoryModal';
import { SupportModal } from './components/SupportModal';
import { FinalConfirmModal } from './components/FinalConfirmModal';
import { DemoController } from './components/DemoController';

type StepNumber = 1 | 2 | 3;

export default function App() {
  const [savedDraft] = useState<any>(() => {
    try {
      return JSON.parse(sessionStorage.getItem('gati_recharge_draft_v1') || 'null');
    } catch {
      return null;
    }
  });
  // Authentication State
  const [user, setUser] = useState<UserAccount>(INITIAL_USER);

  // Stepper & View Navigation State (1. Chọn game, 2. Nạp game & Thanh toán, 3. Kết quả)
  const [currentStep, setCurrentStep] = useState<StepNumber>(savedDraft?.selectedGame && savedDraft?.currentStep === 2 ? 2 : 1);
  const [maxAccessibleStep, setMaxAccessibleStep] = useState<StepNumber>(savedDraft?.selectedGame && savedDraft?.currentStep === 2 ? 2 : 1);
  const [currentView, setCurrentView] = useState<'wizard' | 'processing' | 'result'>('wizard');

  // Selected Data (Defaults to Gati flagship game Chiến Giới 4D, user selects server & character in Step 2)
  const [selectedGame, setSelectedGame] = useState<Game | null>(savedDraft?.selectedGame ?? MOCK_GAMES[0]);
  const [selectedServer, setSelectedServer] = useState<GameServer | null>(savedDraft?.selectedServer ?? null);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(savedDraft?.selectedCharacter ?? null);
  const [isCharacterConfirmed, setIsCharacterConfirmed] = useState<boolean>(savedDraft?.isCharacterConfirmed ?? false);
  const [selectedPackage, setSelectedPackage] = useState<GamePackage | null>(savedDraft ? savedDraft.selectedPackage : MOCK_PACKAGES[1]);
  const [selectedQuantity, setSelectedQuantity] = useState<number>(savedDraft?.selectedQuantity ?? 1);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<PaymentMethodId | null>(savedDraft?.selectedPaymentMethodId ?? 'vietqr');

  useEffect(() => {
    try {
      sessionStorage.setItem('gati_recharge_draft_v1', JSON.stringify({
        currentStep: currentStep === 3 ? 2 : currentStep,
        selectedGame, selectedServer, selectedCharacter, isCharacterConfirmed,
        selectedPackage, selectedQuantity, selectedPaymentMethodId,
      }));
    } catch {
      // Storage can be unavailable in private or restricted browsers.
    }
  }, [currentStep, selectedGame, selectedServer, selectedCharacter, isCharacterConfirmed, selectedPackage, selectedQuantity, selectedPaymentMethodId]);

  // Transactions State
  const [transactions, setTransactions] = useState<TransactionRecord[]>(INITIAL_TRANSACTIONS);
  const [activeTransaction, setActiveTransaction] = useState<TransactionRecord | null>(null);

  // Edge Case Simulation
  const [edgeCase, setEdgeCase] = useState<DemoEdgeCase>('none');

  // Modals Visibility
  const [partnerModalOpen, setPartnerModalOpen] = useState(false);
  const [guideModalOpen, setGuideModalOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [finalConfirmModalOpen, setFinalConfirmModalOpen] = useState(false);

  // Target Game waiting for login
  const [pendingGameForLogin, setPendingGameForLogin] = useState<Game | null>(null);

  // Helper to compute total reward summary for a package & quantity
  const buildRewardSummary = (pkg: GamePackage, qty: number): string => {
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

  // When edgeCase changes to session_expired, simulate logging out
  // When edgeCase changes to limit_changed, ensure quantity > 1 if package allows so user can test immediately
  useEffect(() => {
    if (edgeCase === 'session_expired') {
      setUser((prev) => ({ ...prev, isLoggedIn: false }));
    } else if (edgeCase === 'limit_changed' && selectedPackage && selectedPackage.maxQuantity > 1 && selectedQuantity === 1) {
      setSelectedQuantity(Math.min(3, selectedPackage.maxQuantity));
    }
  }, [edgeCase]);

  // Rule 4: Switching package resets quantity to 1; passing null deselects package
  const handleSelectPackage = (pkg: GamePackage | null) => {
    if (!pkg) {
      setSelectedPackage(null);
      setSelectedQuantity(1);
      return;
    }
    setSelectedPackage((prev) => {
      if (prev?.id !== pkg.id) {
        setSelectedQuantity(1);
      }
      return pkg;
    });
  };

  // Handle Game Selection: clear server and character so user picks server first, then loads characters
  const handleSelectGame = (game: Game) => {
    setSelectedGame(game);
    setSelectedServer(null);
    setSelectedCharacter(null);
    setIsCharacterConfirmed(false);
    setSelectedPackage(null);
    setSelectedQuantity(1);
    setCurrentStep(2);
    setMaxAccessibleStep((prev: StepNumber): StepNumber => (prev < 2 ? 2 : prev));
  };

  // Rule 1: Popup nạp tại trang đối tác - Chỉ hiển thị lần đầu trong ngày, lần 2 sẽ không tiếp tục hiển thị mà chuyển thẳng
  const handleSelectPartnerGame = (game: Game) => {
    setSelectedGame(game);
    const today = new Date().toISOString().slice(0, 10);
    const seenToday = localStorage.getItem(`gati_partner_seen_today_${game.id}`);

    if (seenToday === today) {
      // Lần 2 trong ngày: Mở trực tiếp trang đối tác trong tab mới mà không hiện popup
      if (game.partnerUrl) {
        window.open(game.partnerUrl, '_blank', 'noopener,noreferrer');
      }
    } else {
      // Lần đầu trong ngày: Mở popup xác nhận
      setPartnerModalOpen(true);
    }
  };

  const handleRequireLogin = (game: Game) => {
    setPendingGameForLogin(game);
    setLoginModalOpen(true);
  };

  const handleLoginSuccess = (newUser: UserAccount) => {
    setUser(newUser);
    if (pendingGameForLogin) {
      handleSelectGame(pendingGameForLogin);
      setPendingGameForLogin(null);
    }
  };

  const handleLogout = () => {
    setSelectedServer(null);
    setSelectedCharacter(null);
    setSelectedPackage(null);
    setUser({
      id: '',
      username: '',
      displayName: '',
      email: '',
      isLoggedIn: false,
      avatar: '?',
    });
    setCurrentStep(1);
    setMaxAccessibleStep(1);
    setIsCharacterConfirmed(false);
  };

  // Step 2 Character handlers
  const handleConfirmCharacter = () => {
    if (selectedCharacter && selectedServer) {
      setIsCharacterConfirmed(true);
    }
  };

  const handleResetCharacterConfirmation = () => {
    setIsCharacterConfirmed(false);
  };

  // Payment handlers: Go directly to 3rd-party payment simulation screen without confirmation popup
  const handleInitiatePayment = () => {
    setCurrentView('processing');
  };

  const handleConfirmFinalPayment = () => {
    setFinalConfirmModalOpen(false);
    setCurrentView('processing');
  };

  // Transaction outcomes from PaymentProcessingView
  const handlePaymentSuccess = (txnCode: string) => {
    if (!selectedGame || !selectedServer || !selectedCharacter || !selectedPackage) return;

    const method = MOCK_PAYMENT_METHODS.find((m) => m.id === selectedPaymentMethodId) || MOCK_PAYMENT_METHODS[0];
    const unitPrice = selectedPackage.price;
    const origUnitPrice =
      selectedPackage.originalPrice && selectedPackage.originalPrice > unitPrice
        ? selectedPackage.originalPrice
        : undefined;
    const totalPrice = unitPrice * selectedQuantity;
    const discountTotal = origUnitPrice ? (origUnitPrice - unitPrice) * selectedQuantity : undefined;

    const newTxn: TransactionRecord = {
      id: `tx_${Date.now()}`,
      transactionCode: txnCode,
      timestamp: new Date().toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      gameId: selectedGame.id,
      gameName: selectedGame.name,
      serverId: selectedServer.id,
      serverName: selectedServer.name,
      characterName: selectedCharacter.name,
      roleId: selectedCharacter.roleId,
      packageId: selectedPackage.id,
      packageName: selectedPackage.name,
      quantity: selectedQuantity,
      unitPrice,
      originalUnitPrice: origUnitPrice,
      discountTotal,
      totalRewardSummary: buildRewardSummary(selectedPackage, selectedQuantity),
      price: totalPrice,
      paymentMethodId: method.id,
      paymentMethodName: method.name,
      status: 'success',
      isItemSynced: edgeCase !== 'item_pending',
    };

    setTransactions((prev) => [newTxn, ...prev]);
    setActiveTransaction(newTxn);
    setCurrentStep(3);
    setMaxAccessibleStep(3);
    setCurrentView('result');
  };

  const handlePaymentProcessing = (txnCode: string) => {
    if (!selectedGame || !selectedServer || !selectedCharacter || !selectedPackage) return;

    const method = MOCK_PAYMENT_METHODS.find((m) => m.id === selectedPaymentMethodId) || MOCK_PAYMENT_METHODS[0];
    const unitPrice = selectedPackage.price;
    const origUnitPrice =
      selectedPackage.originalPrice && selectedPackage.originalPrice > unitPrice
        ? selectedPackage.originalPrice
        : undefined;
    const totalPrice = unitPrice * selectedQuantity;
    const discountTotal = origUnitPrice ? (origUnitPrice - unitPrice) * selectedQuantity : undefined;

    const newTxn: TransactionRecord = {
      id: `tx_${Date.now()}`,
      transactionCode: txnCode,
      timestamp: new Date().toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      gameId: selectedGame.id,
      gameName: selectedGame.name,
      serverId: selectedServer.id,
      serverName: selectedServer.name,
      characterName: selectedCharacter.name,
      roleId: selectedCharacter.roleId,
      packageId: selectedPackage.id,
      packageName: selectedPackage.name,
      quantity: selectedQuantity,
      unitPrice,
      originalUnitPrice: origUnitPrice,
      discountTotal,
      totalRewardSummary: buildRewardSummary(selectedPackage, selectedQuantity),
      price: totalPrice,
      paymentMethodId: method.id,
      paymentMethodName: method.name,
      status: 'processing',
    };

    setTransactions((prev) => [newTxn, ...prev]);
    setActiveTransaction(newTxn);
    setCurrentStep(3);
    setMaxAccessibleStep(3);
    setCurrentView('result');
  };

  const handlePaymentFailed = (txnCode: string, reason: string) => {
    if (!selectedGame || !selectedServer || !selectedCharacter || !selectedPackage) return;

    const method = MOCK_PAYMENT_METHODS.find((m) => m.id === selectedPaymentMethodId) || MOCK_PAYMENT_METHODS[0];
    const unitPrice = selectedPackage.price;
    const origUnitPrice =
      selectedPackage.originalPrice && selectedPackage.originalPrice > unitPrice
        ? selectedPackage.originalPrice
        : undefined;
    const totalPrice = unitPrice * selectedQuantity;
    const discountTotal = origUnitPrice ? (origUnitPrice - unitPrice) * selectedQuantity : undefined;

    const newTxn: TransactionRecord = {
      id: `tx_${Date.now()}`,
      transactionCode: txnCode,
      timestamp: new Date().toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      gameId: selectedGame.id,
      gameName: selectedGame.name,
      serverId: selectedServer.id,
      serverName: selectedServer.name,
      characterName: selectedCharacter.name,
      roleId: selectedCharacter.roleId,
      packageId: selectedPackage.id,
      packageName: selectedPackage.name,
      quantity: selectedQuantity,
      unitPrice,
      originalUnitPrice: origUnitPrice,
      discountTotal,
      totalRewardSummary: buildRewardSummary(selectedPackage, selectedQuantity),
      price: totalPrice,
      paymentMethodId: method.id,
      paymentMethodName: method.name,
      status: 'failed',
      failureReason: reason,
    };

    setTransactions((prev) => [newTxn, ...prev]);
    setActiveTransaction(newTxn);
    setCurrentStep(3);
    setMaxAccessibleStep(3);
    setCurrentView('result');
  };

  // Result view actions
  const handleTopupAgainSameChar = () => {
    setCurrentView('wizard');
    setCurrentStep(2);
    setMaxAccessibleStep(2);
  };

  const handleSelectAnotherGame = () => {
    setCurrentView('wizard');
    setCurrentStep(1);
    setMaxAccessibleStep(1);
    setSelectedPackage(null);
    setSelectedQuantity(1);
  };

  const handleRetryPayment = () => {
    setCurrentView('wizard');
    setCurrentStep(2);
  };

  const handleChangePaymentMethod = () => {
    setCurrentView('wizard');
    setCurrentStep(2);
  };

  const handleCheckStatus = () => {
    if (activeTransaction) {
      const updatedTxn: TransactionRecord = {
        ...activeTransaction,
        status: 'success',
        isItemSynced: true,
      };
      setActiveTransaction(updatedTxn);
      setTransactions((prev) =>
        prev.map((t) => (t.id === updatedTxn.id ? updatedTxn : t))
      );
    }
  };

  // Demo direct result triggers
  const handleDirectResult = (status: TransactionStatus, customEdgeCase?: DemoEdgeCase) => {
    const dummyGame = selectedGame || MOCK_GAMES[0];
    const dummyServer =
      selectedServer ||
      (MOCK_SERVERS[dummyGame.id]
        ? MOCK_SERVERS[dummyGame.id][0]
        : MOCK_SERVERS['game_chien_gioi_4d'][0]);
    const dummyChar =
      selectedCharacter ||
      (MOCK_CHARACTERS[dummyServer.id]
        ? MOCK_CHARACTERS[dummyServer.id][0]
        : MOCK_CHARACTERS['cg_s1'][0]);
    const dummyPkg = selectedPackage || MOCK_PACKAGES[2];
    const dummyQty = selectedPackage ? selectedQuantity : 2;
    const dummyMethod =
      MOCK_PAYMENT_METHODS.find((m) => m.id === selectedPaymentMethodId) ||
      MOCK_PAYMENT_METHODS[0];
    const unitPrice = dummyPkg.price;
    const origUnitPrice =
      dummyPkg.originalPrice && dummyPkg.originalPrice > unitPrice
        ? dummyPkg.originalPrice
        : undefined;

    const effectiveCase = customEdgeCase !== undefined ? customEdgeCase : edgeCase;

    const txn: TransactionRecord = {
      id: `tx_direct_${Date.now()}`,
      transactionCode: `GATI-${Math.floor(100000 + Math.random() * 900000)}`,
      timestamp: new Date().toLocaleString('vi-VN'),
      gameId: dummyGame.id,
      gameName: dummyGame.name,
      serverId: dummyServer.id,
      serverName: dummyServer.name,
      characterName: dummyChar.name,
      roleId: dummyChar.roleId,
      packageId: dummyPkg.id,
      packageName: dummyPkg.name,
      quantity: dummyQty,
      unitPrice,
      originalUnitPrice: origUnitPrice,
      discountTotal: origUnitPrice ? (origUnitPrice - unitPrice) * dummyQty : undefined,
      totalRewardSummary: buildRewardSummary(dummyPkg, dummyQty),
      price: unitPrice * dummyQty,
      paymentMethodId: dummyMethod.id,
      paymentMethodName: dummyMethod.name,
      status: status,
      failureReason:
        status === 'failed'
          ? 'Giao dịch bị từ chối từ phía ngân hàng phát hành (Lỗi: BANK_REJECT_05).'
          : undefined,
      isItemSynced: status === 'success' && effectiveCase !== 'item_pending',
    };

    setSelectedGame(dummyGame);
    setSelectedServer(dummyServer);
    setSelectedCharacter(dummyChar);
    setSelectedPackage(dummyPkg);
    setActiveTransaction(txn);
    setTransactions((prev) => [txn, ...prev]);
    setCurrentStep(3);
    setMaxAccessibleStep(3);
    setCurrentView('result');
  };

  // Directly jump to the target screen and display the simulated edgeCase
  const handleSelectEdgeCase = (targetCase: DemoEdgeCase) => {
    setEdgeCase(targetCase);

    const defaultGame =
      selectedGame && selectedGame.status === 'portal' ? selectedGame : MOCK_GAMES[0];
    const serverList = MOCK_SERVERS[defaultGame.id] || MOCK_SERVERS['game_chien_gioi_4d'];
    const normalServer =
      selectedServer && !selectedServer.isMaintenance
        ? selectedServer
        : serverList.find((s) => !s.isMaintenance) || serverList[0];
    const defaultChar =
      selectedCharacter && selectedCharacter.serverId === normalServer.id
        ? selectedCharacter
        : (MOCK_CHARACTERS[normalServer.id] && MOCK_CHARACTERS[normalServer.id][0]) ||
          MOCK_CHARACTERS['cg_s1'][0];

    switch (targetCase) {
      case 'none': {
        setUser(INITIAL_USER);
        setLoginModalOpen(false);
        setSelectedGame(defaultGame);
        setSelectedServer(normalServer);
        setSelectedCharacter(defaultChar);
        setSelectedPackage(MOCK_PACKAGES[1]);
        setSelectedQuantity(1);
        setSelectedPaymentMethodId('vietqr');
        setCurrentStep(2);
        setMaxAccessibleStep(2);
        setCurrentView('wizard');
        break;
      }

      case 'limit_changed': {
        setUser(INITIAL_USER);
        setLoginModalOpen(false);
        setSelectedGame(defaultGame);
        setSelectedServer(normalServer);
        setSelectedCharacter(defaultChar);
        // Select package 30 Kim Phiếu (maxQuantity: 5, overridden to 2) and set quantity to 4
        setSelectedPackage(MOCK_PACKAGES[1]);
        setSelectedQuantity(4);
        setSelectedPaymentMethodId('vietqr');
        setCurrentStep(2);
        setMaxAccessibleStep(2);
        setCurrentView('wizard');
        break;
      }

      case 'server_maintenance': {
        setUser(INITIAL_USER);
        setLoginModalOpen(false);
        const maintServer = serverList.find((s) => s.isMaintenance) || normalServer;
        const maintChar =
          (MOCK_CHARACTERS[maintServer.id] && MOCK_CHARACTERS[maintServer.id][0]) ||
          defaultChar;
        setSelectedGame(defaultGame);
        setSelectedServer(maintServer);
        setSelectedCharacter(maintChar);
        setSelectedPackage(selectedPackage || MOCK_PACKAGES[1]);
        setSelectedQuantity(1);
        setSelectedPaymentMethodId('vietqr');
        setCurrentStep(2);
        setMaxAccessibleStep(2);
        setCurrentView('wizard');
        break;
      }

      case 'session_expired': {
        setUser((prev) => ({ ...prev, isLoggedIn: false }));
        setSelectedGame(defaultGame);
        setSelectedServer(normalServer);
        setSelectedCharacter(defaultChar);
        setSelectedPackage(selectedPackage || MOCK_PACKAGES[1]);
        setPendingGameForLogin(defaultGame);
        setLoginModalOpen(true);
        setCurrentStep(2);
        setMaxAccessibleStep(2);
        setCurrentView('wizard');
        break;
      }

      case 'package_sold_out': {
        setUser(INITIAL_USER);
        setLoginModalOpen(false);
        setSelectedGame(defaultGame);
        setSelectedServer(normalServer);
        setSelectedCharacter(defaultChar);
        // Select pkg_1 which is marked sold out in package_sold_out mode
        setSelectedPackage(MOCK_PACKAGES[0]);
        setSelectedQuantity(1);
        setSelectedPaymentMethodId('vietqr');
        setCurrentStep(2);
        setMaxAccessibleStep(2);
        setCurrentView('wizard');
        break;
      }

      case 'qr_expired': {
        setUser(INITIAL_USER);
        setLoginModalOpen(false);
        setSelectedGame(defaultGame);
        setSelectedServer(normalServer);
        setSelectedCharacter(defaultChar);
        setSelectedPackage(selectedPackage || MOCK_PACKAGES[1]);
        setSelectedQuantity(selectedQuantity || 1);
        setSelectedPaymentMethodId('vietqr');
        setCurrentStep(2);
        setMaxAccessibleStep(2);
        setCurrentView('processing');
        break;
      }

      case 'payment_delayed': {
        setUser(INITIAL_USER);
        setLoginModalOpen(false);
        handleDirectResult('processing', 'payment_delayed');
        break;
      }

      case 'item_pending': {
        setUser(INITIAL_USER);
        setLoginModalOpen(false);
        handleDirectResult('success', 'item_pending');
        break;
      }

      default:
        break;
    }
  };

  const handleResetAll = () => {
    setEdgeCase('none');
    setUser(INITIAL_USER);
    setLoginModalOpen(false);
    setSelectedGame(MOCK_GAMES[0]);
    setSelectedServer(null);
    setSelectedCharacter(null);
    setIsCharacterConfirmed(false);
    setSelectedPackage(MOCK_PACKAGES[1]);
    setSelectedQuantity(1);
    setSelectedPaymentMethodId('vietqr');
    setCurrentStep(1);
    setMaxAccessibleStep(1);
    setCurrentView('wizard');
  };

  const currentPaymentMethod =
    MOCK_PAYMENT_METHODS.find((m) => m.id === selectedPaymentMethodId) ||
    MOCK_PAYMENT_METHODS[0];

  return (
    <div className="min-h-screen bg-[#0d0d0f] text-[#fcfcfc] flex flex-col font-sans antialiased selection:bg-[#fb5503]/30 selection:text-white relative overflow-x-hidden">
      {/* Top ambient glow matching h5.itbee-gitlab.com */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1440px] h-[450px] pointer-events-none bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(251,85,3,0.18),transparent_70%)] -z-0" />

      {/* 1. Header (Gati Dark Theme with glassmorphism matching h5.itbee-gitlab.com) */}
      <Header
        user={user}
        onOpenHistory={() => setHistoryModalOpen(true)}
        onOpenSupport={() => setSupportModalOpen(true)}
        onOpenLogin={() => {
          setPendingGameForLogin(null);
          setLoginModalOpen(true);
        }}
        onLogout={handleLogout}
        onGoHome={() => {
          setCurrentView('wizard');
          setCurrentStep(1);
        }}
      />


      {/* 3. Main Content Container (Max width 1360px for high-end desktop presence) */}
      <main className="flex-1 max-w-[1360px] w-full mx-auto px-4 sm:px-6 py-6 md:py-8 relative z-10">
        {currentView === 'wizard' && (
          <>
            {/* Step 1: Chọn Game */}
            {currentStep === 1 && (
              <Step1SelectGame
                games={MOCK_GAMES}
                user={user}
                selectedGame={selectedGame}
                onSelectGame={handleSelectGame}
                onSelectPartnerGame={handleSelectPartnerGame}
                onRequireLogin={handleRequireLogin}
              />
            )}

            {/* Step 2: Nạp Game & Thanh Toán (Chọn nhân vật -> Tự động hiển thị Gói nạp & Phương thức thanh toán trên cùng 1 screen) */}
            {currentStep === 2 && selectedGame && (
              <RechargeWorkspace
                game={selectedGame}
                servers={MOCK_SERVERS[selectedGame.id] || []}
                charactersMap={MOCK_CHARACTERS}
                selectedServer={selectedServer}
                selectedCharacter={selectedCharacter}
                selectedPackage={selectedPackage}
                selectedQuantity={selectedQuantity}
                selectedPaymentMethodId={selectedPaymentMethodId}
                paymentMethods={MOCK_PAYMENT_METHODS}
                packages={MOCK_PACKAGES}
                edgeCase={edgeCase}
                onSelectServer={setSelectedServer}
                onSelectCharacter={setSelectedCharacter}
                onSelectPackage={handleSelectPackage}
                onChangeQuantity={setSelectedQuantity}
                onSelectPaymentMethod={setSelectedPaymentMethodId}
                onProceedToPayment={handleInitiatePayment}
                onChangeGame={() => {
                  setCurrentStep(1);
                  setMaxAccessibleStep(1);
                  setSelectedServer(null);
                  setSelectedCharacter(null);
                  setSelectedPackage(null);
                  setSelectedQuantity(1);
                }}
                onSessionExpired={() => {
                  setPendingGameForLogin(selectedGame);
                  setLoginModalOpen(true);
                }}
              />
            )}
          </>
        )}

        {/* Payment Processing (VietQR scan / simulated gateway) */}
        {currentView === 'processing' && selectedGame && selectedServer && selectedCharacter && selectedPackage && (
          <PaymentProcessingView
            game={selectedGame}
            server={selectedServer}
            character={selectedCharacter}
            pkg={selectedPackage}
            quantity={selectedQuantity}
            paymentMethod={currentPaymentMethod}
            edgeCase={edgeCase}
            onSuccess={handlePaymentSuccess}
            onProcessing={handlePaymentProcessing}
            onFailed={handlePaymentFailed}
            onCancelOrBack={() => setCurrentView('wizard')}
          />
        )}

        {/* Transaction Result View (Thành công, Đang xử lý, Thất bại) */}
        {currentView === 'result' && activeTransaction && (
          <TransactionResult
            transaction={activeTransaction}
            edgeCase={edgeCase}
            onTopupAgainSameChar={handleTopupAgainSameChar}
            onSelectAnotherGame={handleSelectAnotherGame}
            onOpenHistory={() => setHistoryModalOpen(true)}
            onOpenSupport={() => setSupportModalOpen(true)}
            onRetryPayment={handleRetryPayment}
            onChangePaymentMethod={handleChangePaymentMethod}
            onCheckStatus={handleCheckStatus}
          />
        )}
      </main>

      {/* 4. Footer Gati Games (Styled like SiteFooter on h5.itbee-gitlab.com) */}
      <footer className="w-full bg-black text-[#f5f5f5] pt-12 mt-auto relative overflow-hidden">
        {/* Ambient Footer Glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[200px] pointer-events-none bg-[radial-gradient(ellipse_at_bottom,rgba(251,85,3,0.12),transparent_70%)] -z-0" />

        {/* Curved Top Container (as in h5.itbee-gitlab.com: border-radius: 48px 48px 0 0) */}
        <div className="rounded-t-[40px] md:rounded-t-[56px] bg-[#18181b] border-t border-white/10 max-w-[1360px] mx-auto px-6 py-10 md:py-14 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 pb-10 border-b border-zinc-800">
            {/* Brand Column */}
            <div className="md:col-span-5 space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src={GATI_LOGO_SRC}
                  alt="Gati Games"
                  className="w-10 h-10 object-contain drop-shadow-[0_2px_12px_rgba(251,85,3,0.4)]"
                />
                <span className="font-extrabold text-2xl tracking-tight text-white uppercase">
                  GATI<span className="text-[#fb5503]">GAMES</span>
                </span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
                Cổng thanh toán & nạp game chính thức Gati Games. Tổng đài hỗ trợ từ 8:00–24:00 hàng ngày; yêu cầu được tiếp nhận trong 24 giờ.
              </p>
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Hệ thống máy chủ vận hành bình thường</span>
              </div>
            </div>

            {/* Navigation Columns */}
            <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs">
              <div className="space-y-3">
                <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
                  Danh mục game
                </h4>
                <ul className="space-y-2 text-zinc-400">
                  <li><button onClick={() => { setCurrentView('wizard'); setCurrentStep(1); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-[#fb5503] transition-colors cursor-pointer">Xem danh sách game</button></li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
                  Hỗ trợ khách hàng
                </h4>
                <ul className="space-y-2 text-zinc-400">
                  <li><button onClick={() => setSupportModalOpen(true)} className="hover:text-[#fb5503] transition-colors cursor-pointer">Hotline 1900 6600</button></li>
                  <li><button onClick={() => setSupportModalOpen(true)} className="hover:text-[#fb5503] transition-colors cursor-pointer">Email hotrogati@fpt.com</button></li>
                  <li><a href="https://docs.google.com/document/d/1xLWDCXZRCpS7egh0AzfT-OlzB2Vv1vgWtI9B1jC4Nh8/edit?tab=t.0" target="_blank" rel="noopener noreferrer" className="hover:text-[#fb5503] transition-colors cursor-pointer">Hướng dẫn nạp game</a></li>
                  <li><button onClick={() => setHistoryModalOpen(true)} className="hover:text-[#fb5503] transition-colors cursor-pointer">Tra cứu giao dịch</button></li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
                  Chính sách & Quy định
                </h4>
                <ul className="space-y-2 text-zinc-400">
                  <li><button onClick={() => setSupportModalOpen(true)} className="hover:text-[#fb5503] transition-colors cursor-pointer">Điều khoản thanh toán</button></li>
                  <li><button onClick={() => setSupportModalOpen(true)} className="hover:text-[#fb5503] transition-colors cursor-pointer">Chính sách bảo mật</button></li>
                  <li><button onClick={() => setSupportModalOpen(true)} className="hover:text-[#fb5503] transition-colors cursor-pointer">Quy chế hoạt động</button></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Copyright & Legal note */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
            <p>© {new Date().getFullYear()} Gati Games. All rights reserved. Bản quyền thuộc Công ty Cổ phần Gati.</p>
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 text-[10px] font-semibold">
                Giấy phép G1: Số 126/GP-BTTTT
              </span>
              <span className="px-2 py-0.5 rounded bg-[#fb5503]/15 text-[#fb5503] text-[10px] font-semibold border border-[#fb5503]/30">
                SSL 256-bit Secure
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* 5. Modals & Popups */}
      {/* Partner Confirmation Modal for Tam Quốc Phản Công */}
      {selectedGame && (
        <PartnerModal
          game={selectedGame}
          isOpen={partnerModalOpen}
          onClose={() => setPartnerModalOpen(false)}
          onOpenGuide={() => {
            setPartnerModalOpen(false);
            setGuideModalOpen(true);
          }}
        />
      )}

      {/* Guide Modal for Partner Game */}
      <GuideModal
        isOpen={guideModalOpen}
        onClose={() => setGuideModalOpen(false)}
        onProceedToPartner={() => {
          window.open(LINK_NAP_DOI_TAC_3QPC, '_blank', 'noopener,noreferrer');
        }}
      />

      {/* Login Modal */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        targetGameName={pendingGameForLogin?.name}
      />

      {/* History Modal */}
      <HistoryModal
        isOpen={historyModalOpen}
        transactions={transactions}
        onClose={() => setHistoryModalOpen(false)}
      />

      {/* Support Modal */}
      <SupportModal
        isOpen={supportModalOpen}
        onClose={() => setSupportModalOpen(false)}
      />

      {/* Final Confirm Modal before payment */}
      {selectedGame && selectedServer && selectedCharacter && selectedPackage && (
        <FinalConfirmModal
          isOpen={finalConfirmModalOpen}
          game={selectedGame}
          server={selectedServer}
          character={selectedCharacter}
          pkg={selectedPackage}
          quantity={selectedQuantity}
          paymentMethod={currentPaymentMethod}
          onClose={() => setFinalConfirmModalOpen(false)}
          onConfirmPayment={handleConfirmFinalPayment}
        />
      )}

      {/* 6. Demo Controller (Edge Case Simulator) */}
      <DemoController
        currentEdgeCase={edgeCase}
        onSelectEdgeCase={handleSelectEdgeCase}
        onResetAll={handleResetAll}
        onDirectResult={handleDirectResult}
      />
    </div>
  );
}
