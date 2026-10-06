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
  subscriptionDurationDays?: number; // Durée configurable de l'abonnement en jours (ex: 30)
  activeAdminPassword: string;
  passwordExpiresAt: string; // ISO date
  feexpayConfig: FeexPayConfig;
  paymentHistory: SubscriptionPaymentRecord[];
  adminTelegramChatId?: string;
  adminTelegramBotToken?: string;
}

export interface PublicSubscriptionStatus {
  isExpired: boolean;
  expiresAt: string;
  daysRemaining: number;
  monthlyFeeCFA: number;
  subscriptionDurationDays?: number; // Durée d'un cycle en jours (ex: 30)
  feexpayConfigured: boolean;
  feexpayMode: FeexPayMode;
  feexpayShopId?: string;
}
