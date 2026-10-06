import fs from 'fs';
import path from 'path';
import { 
  AdminSubscriptionData, 
  PublicSubscriptionStatus, 
  SubscriptionPaymentRecord,
  FeexPayConfig 
} from './subscription';

const SUBSCRIPTION_FILE = path.join(process.cwd(), 'data', 'subscription.json');
const TMP_SUBSCRIPTION_FILE = path.join(process.platform === 'win32' ? (process.env.TEMP || 'C:\\Windows\\Temp') : '/tmp', 'subscription.json');

// Cache global en mémoire (persiste entre requêtes sur la même instance Lambda Vercel)
declare global {
  // eslint-disable-next-line no-var
  var __cs_subscription_data: AdminSubscriptionData | undefined;
}

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
  paymentHistory: [],
  adminTelegramChatId: '',
  adminTelegramBotToken: ''
};

import { getDatabase } from './mongodb';

let isMongoHydrated = false;

function hydrateFromMongoBackground() {
  if (isMongoHydrated) return;
  isMongoHydrated = true;
  getDatabase().then(async db => {
    if (db) {
      const doc = await db.collection('subscription').findOne({ _id: 'admin_subscription' as any });
      if (doc) {
        const { _id, ...rest } = doc;
        const current = globalThis.__cs_subscription_data || DEFAULT_SUBSCRIPTION;
        globalThis.__cs_subscription_data = {
          ...current,
          ...rest,
          feexpayConfig: {
            ...current.feexpayConfig,
            ...(rest.feexpayConfig || {})
          }
        };
      }
    }
  }).catch(() => {});
}

export async function readSubscriptionDataAsync(): Promise<AdminSubscriptionData> {
  try {
    const db = await getDatabase();
    if (db) {
      const doc = await db.collection('subscription').findOne({ _id: 'admin_subscription' as any });
      if (doc) {
        const { _id, ...rest } = doc;
        const current = readSubscriptionData();
        const merged: AdminSubscriptionData = {
          ...current,
          ...rest,
          feexpayConfig: {
            ...current.feexpayConfig,
            ...(rest.feexpayConfig || {})
          }
        };
        globalThis.__cs_subscription_data = merged;
        return merged;
      }
    }
  } catch (err) {
    console.error('Erreur readSubscriptionDataAsync MongoDB:', err);
  }
  return readSubscriptionData();
}

export function readSubscriptionData(): AdminSubscriptionData {
  hydrateFromMongoBackground();
  let result: AdminSubscriptionData = { ...DEFAULT_SUBSCRIPTION };

  // 1. Essai de lecture depuis data/subscription.json (fichier initial du projet)
  try {
    if (fs.existsSync(SUBSCRIPTION_FILE)) {
      const raw = fs.readFileSync(SUBSCRIPTION_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      result = {
        ...result,
        ...parsed,
        feexpayConfig: {
          ...result.feexpayConfig,
          ...(parsed.feexpayConfig || {})
        },
        paymentHistory: Array.isArray(parsed.paymentHistory) ? parsed.paymentHistory : [],
        adminTelegramChatId: parsed.adminTelegramChatId || '',
        adminTelegramBotToken: parsed.adminTelegramBotToken || ''
      };
    }
  } catch (error) {
    // ignore
  }

  // 2. Essai de lecture depuis /tmp/subscription.json (modifications runtime sur Vercel serverless)
  try {
    if (fs.existsSync(TMP_SUBSCRIPTION_FILE)) {
      const rawTmp = fs.readFileSync(TMP_SUBSCRIPTION_FILE, 'utf-8');
      const parsedTmp = JSON.parse(rawTmp);
      result = {
        ...result,
        ...parsedTmp,
        feexpayConfig: {
          ...result.feexpayConfig,
          ...(parsedTmp.feexpayConfig || {})
        },
        paymentHistory: Array.isArray(parsedTmp.paymentHistory) ? parsedTmp.paymentHistory : result.paymentHistory,
        adminTelegramChatId: parsedTmp.adminTelegramChatId ?? result.adminTelegramChatId,
        adminTelegramBotToken: parsedTmp.adminTelegramBotToken ?? result.adminTelegramBotToken
      };
    }
  } catch (error) {
    // ignore
  }

  // 3. Essai de lecture depuis la mémoire globale (même instance Lambda active)
  if (globalThis.__cs_subscription_data) {
    result = {
      ...result,
      ...globalThis.__cs_subscription_data,
      feexpayConfig: {
        ...result.feexpayConfig,
        ...(globalThis.__cs_subscription_data.feexpayConfig || {})
      }
    };
  }

  // 4. Overrides via Variables d'Environnement Vercel (Recommandé pour persistance garantie)
  if (process.env.FEEXPAY_SHOP_ID && process.env.FEEXPAY_SHOP_ID.trim()) {
    result.feexpayConfig.shopId = process.env.FEEXPAY_SHOP_ID.trim();
  }
  if (process.env.FEEXPAY_API_TOKEN && process.env.FEEXPAY_API_TOKEN.trim()) {
    result.feexpayConfig.apiToken = process.env.FEEXPAY_API_TOKEN.trim();
  }
  if (process.env.FEEXPAY_MODE) {
    const m = process.env.FEEXPAY_MODE.trim().toUpperCase();
    if (m === 'LIVE' || m === 'SANDBOX') {
      result.feexpayConfig.mode = m as 'LIVE' | 'SANDBOX';
    }
  }
  if (process.env.FEEXPAY_MONTHLY_FEE && Number(process.env.FEEXPAY_MONTHLY_FEE) > 0) {
    result.monthlyFeeCFA = Number(process.env.FEEXPAY_MONTHLY_FEE);
  }
  if (process.env.SUPER_ADMIN_PASSWORD && process.env.SUPER_ADMIN_PASSWORD.trim()) {
    result.superAdminPassword = process.env.SUPER_ADMIN_PASSWORD.trim();
  }
  if (process.env.ADMIN_TELEGRAM_CHAT_ID && process.env.ADMIN_TELEGRAM_CHAT_ID.trim()) {
    result.adminTelegramChatId = process.env.ADMIN_TELEGRAM_CHAT_ID.trim();
  }
  if (process.env.ADMIN_TELEGRAM_BOT_TOKEN && process.env.ADMIN_TELEGRAM_BOT_TOKEN.trim()) {
    result.adminTelegramBotToken = process.env.ADMIN_TELEGRAM_BOT_TOKEN.trim();
  }

  return result;
}

export function writeSubscriptionData(data: AdminSubscriptionData) {
  // 1. Mettre à jour le cache mémoire
  globalThis.__cs_subscription_data = JSON.parse(JSON.stringify(data));

  // 2. Écrire dans /tmp (toujours autorisé sur Vercel serverless / Lambda)
  try {
    const tmpDir = path.dirname(TMP_SUBSCRIPTION_FILE);
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }
    fs.writeFileSync(TMP_SUBSCRIPTION_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Impossible d’écrire dans TMP_SUBSCRIPTION_FILE:', err);
  }

  // 3. Écrire dans data/subscription.json (en local ou si filesystem accessible)
  try {
    const dir = path.dirname(SUBSCRIPTION_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(SUBSCRIPTION_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    // Normal sur environnement serverless read-only
  }

  // 4. Écrire dans MongoDB Atlas
  getDatabase().then(db => {
    if (db) {
      db.collection('subscription').updateOne(
        { _id: 'admin_subscription' as any },
        { $set: { ...data, _id: 'admin_subscription' } },
        { upsert: true }
      ).catch(e => console.error('Erreur écriture subscription MongoDB:', e));
    }
  }).catch(() => {});
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
