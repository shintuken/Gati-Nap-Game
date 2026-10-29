export type GameStatus = 'portal' | 'partner' | 'maintenance';

export interface Game {
  id: string;
  name: string;
  shortName: string;
  genre: string;
  status: GameStatus;
  statusLabel: string;
  partnerName?: string;
  partnerUrl?: string;
  guideUrl?: string;
  iconBg: string;
  bannerGradient: string;
  iconSymbol: string;
  description: string;
  isRecent?: boolean;
  tag?: string;
  categoryTag?: string;
}

export interface GameServer {
  id: string;
  name: string;
  code: string;
  isMaintenance?: boolean;
}

export interface Character {
  id: string;
  name: string;
  roleId: string;
  level: number;
  serverId: string;
  serverName: string;
  avatarBg?: string;
}

export type PackageCategory = 'all' | 'standard' | 'promo' | 'sub';

export type PaymentMethodId =
  | 'point'
  | 'vietqr'
  | 'zalopay'
  | 'momo'
  | 'bank'
  | 'credit'
  | 'gamecard'
  | 'ewallet'
  | 'napas'
  | 'intl';

export interface GamePackage {
  id: string;
  name: string;
  category: PackageCategory;
  currencyAmount: string;
  bonusAmount?: string;
  baseCurrencyNumeric?: number;
  bonusCurrencyNumeric?: number;
  price: number;
  originalPrice?: number;
  maxQuantity: number;
  isSoldOut?: boolean;
  limitText?: string;
  tag?: string;
  iconType: 'gem' | 'chest' | 'crown' | 'card' | 'scroll';
  detailDesc?: string;
  detailPerks?: string[];
  noteVIP?: string;
  imageThumb?: string;
  supportedPaymentMethodIds: PaymentMethodId[];
}

export interface PaymentMethod {
  id: PaymentMethodId;
  name: string;
  shortDesc: string;
  discountBadge?: string;
  feeText: string;
  minAmount?: number;
  maxAmount?: number;
  providers: string[];
  iconType?: 'point' | 'vietqr' | 'zalopay' | 'momo' | 'bank' | 'credit' | 'gamecard';
}

export type TransactionStatus = 'success' | 'processing' | 'failed';

export interface TransactionRecord {
  id: string;
  transactionCode: string;
  timestamp: string;
  gameId: string;
  gameName: string;
  serverId: string;
  serverName: string;
  characterName: string;
  roleId: string;
  packageId: string;
  packageName: string;
  quantity: number;
  unitPrice: number;
  originalUnitPrice?: number;
  discountTotal?: number;
  totalRewardSummary?: string;
  price: number;
  paymentMethodId: PaymentMethodId;
  paymentMethodName: string;
  status: TransactionStatus;
  failureReason?: string;
  isItemSynced?: boolean;
}

export type DemoEdgeCase =
  | 'none'
  | 'server_maintenance'
  | 'session_expired'
  | 'package_sold_out'
  | 'limit_changed'
  | 'qr_expired'
  | 'payment_delayed'
  | 'item_pending'
  | 'result_success'
  | 'result_processing'
  | 'result_failed';

export interface UserAccount {
  id: string;
  username: string;
  displayName: string;
  email: string;
  isLoggedIn: boolean;
  avatar: string;
}
