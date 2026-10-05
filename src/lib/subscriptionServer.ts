import fs from 'fs';
import path from 'path';
import { 
  AdminSubscriptionData, 
  PublicSubscriptionStatus, 
  SubscriptionPaymentRecord,
  FeexPayConfig 
} from './subscription';

const SUBSCRIPTION_FILE = path.join(process.cwd(), 'data', 'subscription.json');

// Date d'expiration initiale : 30 jours à partir de maintenant
const initialExpiration = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

const DEFAULT_SUBSCRIPTION: AdminSubscriptionData = {
  superAdminPassword: 'superadmin2026',
  monthlyFeeCFA: 15000, // 15 000 FCFA par défaut (modifiable par le Super Admin)
  activeAdminPassword: 'admin123', // Mot de passe initial
  passwordExpiresAt: initialExpiration,
  feexpayConfig: {
    enabled: true,
    shopId: '',
    apiToken: '',
    mode: 'SANDBOX',
    callbackUrl: ''
  },
  paymentHistory: []
};

export function readSubscriptionData(): AdminSubscriptionData {
  try {
    if (fs.existsSync(SUBSCRIPTION_FILE)) {
      const raw = fs.readFileSync(SUBSCRIPTION_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_SUBSCRIPTION,
        ...parsed,
        feexpayConfig: {
          ...DEFAULT_SUBSCRIPTION.feexpayConfig,
          ...(parsed.feexpayConfig || {})
        },
        paymentHistory: Array.isArray(parsed.paymentHistory) ? parsed.paymentHistory : []
      };
    }
  } catch (error) {
    console.error('Erreur lecture subscription.json:', error);
  }
  return DEFAULT_SUBSCRIPTION;
}

export function writeSubscriptionData(data: AdminSubscriptionData) {
  try {
    const dir = path.dirname(SUBSCRIPTION_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(SUBSCRIPTION_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Erreur écriture subscription.json:', error);
  }
}

/**
 * Retourne le statut public d'expiration pour l'Admin et le formulaire de paiement
 */
export function getPublicSubscriptionStatus(): PublicSubscriptionStatus {
  const data = readSubscriptionData();
  const now = Date.now();
  const expiresAtMs = new Date(data.passwordExpiresAt).getTime();
  const isExpired = now >= expiresAtMs;
  const daysRemaining = Math.max(0, Math.ceil((expiresAtMs - now) / (1000 * 60 * 60 * 24)));

  return {
    isExpired,
    expiresAt: data.passwordExpiresAt,
    daysRemaining,
    monthlyFeeCFA: data.monthlyFeeCFA,
    feexpayConfigured: !!(data.feexpayConfig.shopId && data.feexpayConfig.apiToken),
    feexpayMode: data.feexpayConfig.mode,
    feexpayShopId: data.feexpayConfig.shopId || undefined
  };
}

/**
 * Génère un mot de passe Admin sécurisé et simple à saisir (ex: CS-84K9P2)
 */
export function generateRandomAdminPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let randomPart = '';
  for (let i = 0; i < 6; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `CS-${randomPart}`;
}

/**
 * Vérification du mot de passe saisi par l'administrateur
 */
export function verifyAdminLogin(password: string): {
  success: boolean;
  expired?: boolean;
  expiresAt?: string;
  daysRemaining?: number;
  monthlyFeeCFA?: number;
  isSuperAdmin?: boolean;
  error?: string;
} {
  const data = readSubscriptionData();
  const now = Date.now();
  const expiresAtMs = new Date(data.passwordExpiresAt).getTime();
  const isExpired = now >= expiresAtMs;
  const daysRemaining = Math.max(0, Math.ceil((expiresAtMs - now) / (1000 * 60 * 60 * 24)));

  // Super Admin a toujours un accès permanent
  if (password === data.superAdminPassword) {
    return {
      success: true,
      expired: false,
      expiresAt: data.passwordExpiresAt,
      daysRemaining,
      monthlyFeeCFA: data.monthlyFeeCFA,
      isSuperAdmin: true
    };
  }

  // Vérification mot de passe Admin actif
  if (password === data.activeAdminPassword) {
    if (isExpired) {
      return {
        success: false,
        expired: true,
        expiresAt: data.passwordExpiresAt,
        daysRemaining: 0,
        monthlyFeeCFA: data.monthlyFeeCFA,
        error: `Votre abonnement mensuel d'administration a expiré le ${new Date(data.passwordExpiresAt).toLocaleDateString('fr-FR')}. Veuillez régler la cotisation mensuelle de ${data.monthlyFeeCFA.toLocaleString('fr-FR')} FCFA via FeexPay pour générer votre nouveau mot de passe.`
      };
    }

    return {
      success: true,
      expired: false,
      expiresAt: data.passwordExpiresAt,
      daysRemaining,
      monthlyFeeCFA: data.monthlyFeeCFA,
      isSuperAdmin: false
    };
  }

  return {
    success: false,
    error: 'Mot de passe incorrect.'
  };
}

/**
 * Enregistre un paiement FeexPay et génère un nouveau mot de passe Admin valable 1 mois (30 jours)
 */
export function processSuccessfulPayment(params: {
  amountCFA: number;
  reference: string;
  feexpayTransactionId?: string;
  phoneNumber?: string;
  operator?: string;
}): {
  newPassword: string;
  expiresAt: string;
  record: SubscriptionPaymentRecord;
} {
  const data = readSubscriptionData();
  const newPassword = generateRandomAdminPassword();

  // Prolongation de 30 jours
  // Si le mot de passe actuel n'était pas encore expiré, on ajoute 30 jours à la date existante
  const currentExpiry = new Date(data.passwordExpiresAt).getTime();
  const baseTime = currentExpiry > Date.now() ? currentExpiry : Date.now();
  const newExpiresAt = new Date(baseTime + 30 * 24 * 60 * 60 * 1000).toISOString();

  const record: SubscriptionPaymentRecord = {
    id: `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    reference: params.reference,
    feexpayTransactionId: params.feexpayTransactionId,
    amountCFA: params.amountCFA,
    date: new Date().toISOString(),
    status: 'SUCCESS',
    phoneNumber: params.phoneNumber,
    operator: params.operator,
    generatedPassword: newPassword,
    validUntil: newExpiresAt
  };

  data.activeAdminPassword = newPassword;
  data.passwordExpiresAt = newExpiresAt;
  data.paymentHistory.unshift(record);

  writeSubscriptionData(data);

  return {
    newPassword,
    expiresAt: newExpiresAt,
    record
  };
}

/**
 * Actions manuelles pour le Super Admin
 */
export function superAdminManualGeneratePassword(): { newPassword: string; expiresAt: string } {
  const data = readSubscriptionData();
  const newPassword = generateRandomAdminPassword();
  const newExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const record: SubscriptionPaymentRecord = {
    id: `manual_${Date.now()}`,
    reference: 'GENERATION_SUPER_ADMIN',
    amountCFA: 0,
    date: new Date().toISOString(),
    status: 'SUCCESS',
    operator: 'Super Admin Manuel',
    generatedPassword: newPassword,
    validUntil: newExpiresAt
  };

  data.activeAdminPassword = newPassword;
  data.passwordExpiresAt = newExpiresAt;
  data.paymentHistory.unshift(record);

  writeSubscriptionData(data);

  return { newPassword, expiresAt: newExpiresAt };
}

export function superAdminExtendDays(days: number): { expiresAt: string; daysRemaining: number } {
  const data = readSubscriptionData();
  const currentExpiry = new Date(data.passwordExpiresAt).getTime();
  const baseTime = currentExpiry > Date.now() ? currentExpiry : Date.now();
  const newExpiresAt = new Date(baseTime + days * 24 * 60 * 60 * 1000).toISOString();

  data.passwordExpiresAt = newExpiresAt;
  writeSubscriptionData(data);

  const daysRemaining = Math.max(0, Math.ceil((new Date(newExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
  return { expiresAt: newExpiresAt, daysRemaining };
}

export function superAdminRevokeAccess(): { isExpired: boolean } {
  const data = readSubscriptionData();
  // Expirer immédiatement (hier)
  data.passwordExpiresAt = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  writeSubscriptionData(data);
  return { isExpired: true };
}
