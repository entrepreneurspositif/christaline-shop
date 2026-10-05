export type FeexPayMode = 'LIVE' | 'SANDBOX';
export type PaymentStatus = 'SUCCESS' | 'FAILED' | 'PENDING';

export interface FeexPayConfig {
  enabled: boolean;
  shopId: string;
  apiToken: string;
  mode: FeexPayMode;
  callbackUrl?: string;
}

export interface SubscriptionPaymentRecord {
  id: string;
  reference: string;
  feexpayTransactionId?: string;
  amountCFA: number;
  date: string;
  status: PaymentStatus;
  phoneNumber?: string;
  operator?: string;
  generatedPassword?: string;
  validUntil?: string;
}

export interface AdminSubscriptionData {
  superAdminPassword: string;
  monthlyFeeCFA: number;
  activeAdminPassword: string;
  passwordExpiresAt: string; // ISO date
  feexpayConfig: FeexPayConfig;
  paymentHistory: SubscriptionPaymentRecord[];
}

export interface PublicSubscriptionStatus {
  isExpired: boolean;
  expiresAt: string;
  daysRemaining: number;
  monthlyFeeCFA: number;
  feexpayConfigured: boolean;
  feexpayMode: FeexPayMode;
  feexpayShopId?: string;
}
