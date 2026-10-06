import fs from 'fs';
import path from 'path';
import { 
  AdminSubscriptionData, 
  PublicSubscriptionStatus, 
  SubscriptionPaymentRecord,
  FeexPayConfig 
} from './subscription';
import { getDatabase } from './mongodb';

const SUBSCRIPTION_FILE = path.join(process.cwd(), 'data', 'subscription.json');
const TMP_SUBSCRIPTION_FILE = path.join(
  process.platform === 'win32' ? (process.env.TEMP || 'C:\\Windows\\Temp') : '/tmp', 
  'subscription.json'
);

// Cache global en mémoire (persiste entre requêtes sur la même instance Lambda Vercel ou Node)
declare global {
  // eslint-disable-next-line no-var
  var __cs_subscription_data: AdminSubscriptionData | undefined;
}

// Date d'expiration initiale : 30 jours à partir de maintenant
const initialExpiration = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

const DEFAULT_SUBSCRIPTION: AdminSubscriptionData = {
  superAdminPassword: process.env.SUPER_ADMIN_PASSWORD?.trim() || 'superadmin2026',
  monthlyFeeCFA: Number(process.env.FEEXPAY_MONTHLY_FEE) || 15000,
  subscriptionDurationDays: Number(process.env.SUBSCRIPTION_DURATION_DAYS) || 30, // 30 jours par défaut
  activeAdminPassword: 'admin123',
  passwordExpiresAt: initialExpiration,
  feexpayConfig: {
    enabled: true,
    shopId: process.env.FEEXPAY_SHOP_ID?.trim() || '',
    apiToken: process.env.FEEXPAY_API_TOKEN?.trim() || '',
    mode: (process.env.FEEXPAY_MODE?.toUpperCase() === 'LIVE' ? 'LIVE' : 'SANDBOX'),
    callbackUrl: ''
  },
  paymentHistory: [],
  adminTelegramChatId: process.env.ADMIN_TELEGRAM_CHAT_ID?.trim() || '',
  adminTelegramBotToken: process.env.ADMIN_TELEGRAM_BOT_TOKEN?.trim() || ''
};

function sanitizeData(raw: any, fallback: AdminSubscriptionData): AdminSubscriptionData {
  if (!raw || typeof raw !== 'object') return fallback;
  return {
    superAdminPassword: raw.superAdminPassword || fallback.superAdminPassword,
    monthlyFeeCFA: Number(raw.monthlyFeeCFA) > 0 ? Number(raw.monthlyFeeCFA) : fallback.monthlyFeeCFA,
    subscriptionDurationDays: Number(raw.subscriptionDurationDays) > 0 
      ? Number(raw.subscriptionDurationDays) 
      : (fallback.subscriptionDurationDays || 30),
    activeAdminPassword: raw.activeAdminPassword || fallback.activeAdminPassword,
    passwordExpiresAt: raw.passwordExpiresAt || fallback.passwordExpiresAt,
    feexpayConfig: {
      enabled: raw.feexpayConfig?.enabled !== undefined ? Boolean(raw.feexpayConfig.enabled) : fallback.feexpayConfig.enabled,
      shopId: raw.feexpayConfig?.shopId !== undefined ? String(raw.feexpayConfig.shopId).trim() : fallback.feexpayConfig.shopId,
      apiToken: raw.feexpayConfig?.apiToken !== undefined ? String(raw.feexpayConfig.apiToken).trim() : fallback.feexpayConfig.apiToken,
      mode: (raw.feexpayConfig?.mode === 'LIVE' || raw.feexpayConfig?.mode === 'SANDBOX') ? raw.feexpayConfig.mode : fallback.feexpayConfig.mode,
      callbackUrl: raw.feexpayConfig?.callbackUrl !== undefined ? String(raw.feexpayConfig.callbackUrl).trim() : fallback.feexpayConfig.callbackUrl
    },
    paymentHistory: Array.isArray(raw.paymentHistory) ? raw.paymentHistory : fallback.paymentHistory,
    adminTelegramChatId: raw.adminTelegramChatId !== undefined ? String(raw.adminTelegramChatId).trim() : fallback.adminTelegramChatId,
    adminTelegramBotToken: raw.adminTelegramBotToken !== undefined ? String(raw.adminTelegramBotToken).trim() : fallback.adminTelegramBotToken
  };
}

/**
 * Lecture asynchrone garantie : consulte MongoDB Atlas (autorité primaire)
 * et fusionne avec le cache local/tmp.
 */
export async function readSubscriptionDataAsync(): Promise<AdminSubscriptionData> {
  try {
    const dbPromise = getDatabase();
    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 2000));
    const db = await Promise.race([dbPromise, timeoutPromise]);

    if (db) {
      const doc = await db.collection('subscription').findOne({ _id: 'admin_subscription' as any });
      if (doc) {
        const { _id, ...rest } = doc;
        const current = globalThis.__cs_subscription_data || readSubscriptionData();
        const merged = sanitizeData(rest, current);
        globalThis.__cs_subscription_data = merged;

        // Synchroniser /tmp et local en tâche de fond
        try {
          const tmpDir = path.dirname(TMP_SUBSCRIPTION_FILE);
          if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
          fs.writeFileSync(TMP_SUBSCRIPTION_FILE, JSON.stringify(merged, null, 2), 'utf-8');
        } catch {}

        return merged;
      }
    }
  } catch (err) {
    console.warn('Erreur lecture MongoDB Atlas pour subscription (fallback local actif):', err);
  }

  return readSubscriptionData();
}

/**
 * Lecture synchrone immédiate (0ms) : /tmp -> data/subscription.json -> globalThis
 * Note : les variables d'environnement servent uniquement de valeur par défaut initiale
 * et N'ÉCRASENT JAMAIS les réglages enregistrés en mémoire ou en base de données.
 */
export function readSubscriptionData(): AdminSubscriptionData {
  let result: AdminSubscriptionData = { ...DEFAULT_SUBSCRIPTION };

  // 1. Essai de lecture depuis data/subscription.json
  try {
    if (fs.existsSync(SUBSCRIPTION_FILE)) {
      const raw = fs.readFileSync(SUBSCRIPTION_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      result = sanitizeData(parsed, result);
    }
  } catch {}

  // 2. Essai de lecture depuis /tmp/subscription.json (modifications runtime Lambda)
  try {
    if (fs.existsSync(TMP_SUBSCRIPTION_FILE)) {
      const rawTmp = fs.readFileSync(TMP_SUBSCRIPTION_FILE, 'utf-8');
      const parsedTmp = JSON.parse(rawTmp);
      result = sanitizeData(parsedTmp, result);
    }
  } catch {}

  // 3. Essai de lecture depuis la mémoire globale (prioritaire sur les fichiers)
  if (globalThis.__cs_subscription_data) {
    result = sanitizeData(globalThis.__cs_subscription_data, result);
  }

  return result;
}

/**
 * Écriture asynchrone complète : met à jour la mémoire, le fichier /tmp,
 * le fichier local, et attend la confirmation d'écriture dans MongoDB Atlas.
 */
export async function writeSubscriptionDataAsync(data: AdminSubscriptionData): Promise<void> {
  const sanitized = sanitizeData(data, DEFAULT_SUBSCRIPTION);

  // 1. Mettre à jour le cache mémoire immédiatement
  globalThis.__cs_subscription_data = JSON.parse(JSON.stringify(sanitized));

  // 2. Écrire dans /tmp (toujours autorisé sur Vercel serverless / Lambda)
  try {
    const tmpDir = path.dirname(TMP_SUBSCRIPTION_FILE);
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }
    fs.writeFileSync(TMP_SUBSCRIPTION_FILE, JSON.stringify(sanitized, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Impossible d’écrire dans TMP_SUBSCRIPTION_FILE:', err);
  }

  // 3. Écrire dans data/subscription.json (en local ou si filesystem accessible)
  try {
    const dir = path.dirname(SUBSCRIPTION_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(SUBSCRIPTION_FILE, JSON.stringify(sanitized, null, 2), 'utf-8');
  } catch {}

  // 4. Écrire dans MongoDB Atlas avec timeout
  try {
    const dbPromise = getDatabase();
    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000));
    const db = await Promise.race([dbPromise, timeoutPromise]);

    if (db) {
      await db.collection('subscription').updateOne(
        { _id: 'admin_subscription' as any },
        { $set: { ...sanitized, _id: 'admin_subscription' } },
        { upsert: true }
      );
    }
  } catch (e) {
    console.warn('Note : Écriture MongoDB non effectuée (stockage local/tmp actif) :', e);
  }
}

/**
 * Écriture synchrone pour compatibilité immédiate
 */
export function writeSubscriptionData(data: AdminSubscriptionData) {
  const sanitized = sanitizeData(data, DEFAULT_SUBSCRIPTION);
  globalThis.__cs_subscription_data = JSON.parse(JSON.stringify(sanitized));

  try {
    const tmpDir = path.dirname(TMP_SUBSCRIPTION_FILE);
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
    fs.writeFileSync(TMP_SUBSCRIPTION_FILE, JSON.stringify(sanitized, null, 2), 'utf-8');
  } catch {}

  try {
    const dir = path.dirname(SUBSCRIPTION_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(SUBSCRIPTION_FILE, JSON.stringify(sanitized, null, 2), 'utf-8');
  } catch {}

  // MongoDB en tâche de fond
  getDatabase().then(db => {
    if (db) {
      db.collection('subscription').updateOne(
        { _id: 'admin_subscription' as any },
        { $set: { ...sanitized, _id: 'admin_subscription' } },
        { upsert: true }
      ).catch(() => {});
    }
  }).catch(() => {});
}

/**
 * Retourne le statut public d'expiration pour l'Admin et le formulaire de paiement (Async)
 */
export async function getPublicSubscriptionStatusAsync(): Promise<PublicSubscriptionStatus> {
  const data = await readSubscriptionDataAsync();
  const now = Date.now();
  const expiresAtMs = new Date(data.passwordExpiresAt).getTime();
  const isExpired = now >= expiresAtMs;
  const daysRemaining = Math.max(0, Math.ceil((expiresAtMs - now) / (1000 * 60 * 60 * 24)));

  return {
    isExpired,
    expiresAt: data.passwordExpiresAt,
    daysRemaining,
    monthlyFeeCFA: data.monthlyFeeCFA,
    subscriptionDurationDays: data.subscriptionDurationDays || 30,
    feexpayConfigured: !!(data.feexpayConfig.shopId && data.feexpayConfig.apiToken),
    feexpayMode: data.feexpayConfig.mode,
    feexpayShopId: data.feexpayConfig.shopId || undefined
  };
}

/**
 * Retourne le statut public d'expiration pour l'Admin (Sync)
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
    subscriptionDurationDays: data.subscriptionDurationDays || 30,
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
 * Vérification du mot de passe saisi par l'administrateur (Async)
 */
export async function verifyAdminLoginAsync(password: string): Promise<{
  success: boolean;
  expired?: boolean;
  expiresAt?: string;
  daysRemaining?: number;
  monthlyFeeCFA?: number;
  subscriptionDurationDays?: number;
  isSuperAdmin?: boolean;
  error?: string;
}> {
  const data = await readSubscriptionDataAsync();
  const now = Date.now();
  const expiresAtMs = new Date(data.passwordExpiresAt).getTime();
  const isExpired = now >= expiresAtMs;
  const daysRemaining = Math.max(0, Math.ceil((expiresAtMs - now) / (1000 * 60 * 60 * 24)));
  const duration = data.subscriptionDurationDays || 30;

  // Super Admin a toujours un accès permanent
  if (password === data.superAdminPassword) {
    return {
      success: true,
      expired: false,
      expiresAt: data.passwordExpiresAt,
      daysRemaining,
      monthlyFeeCFA: data.monthlyFeeCFA,
      subscriptionDurationDays: duration,
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
        subscriptionDurationDays: duration,
        error: `Votre abonnement d'administration (${duration} jours) a expiré le ${new Date(data.passwordExpiresAt).toLocaleDateString('fr-FR')}. Veuillez régler la cotisation de ${data.monthlyFeeCFA.toLocaleString('fr-FR')} FCFA via FeexPay pour générer votre nouveau mot de passe.`
      };
    }

    return {
      success: true,
      expired: false,
      expiresAt: data.passwordExpiresAt,
      daysRemaining,
      monthlyFeeCFA: data.monthlyFeeCFA,
      subscriptionDurationDays: duration,
      isSuperAdmin: false
    };
  }

  return {
    success: false,
    error: 'Mot de passe incorrect.'
  };
}

/**
 * Vérification synchrone du mot de passe
 */
export function verifyAdminLogin(password: string) {
  const data = readSubscriptionData();
  const now = Date.now();
  const expiresAtMs = new Date(data.passwordExpiresAt).getTime();
  const isExpired = now >= expiresAtMs;
  const daysRemaining = Math.max(0, Math.ceil((expiresAtMs - now) / (1000 * 60 * 60 * 24)));
  const duration = data.subscriptionDurationDays || 30;

  if (password === data.superAdminPassword) {
    return {
      success: true,
      expired: false,
      expiresAt: data.passwordExpiresAt,
      daysRemaining,
      monthlyFeeCFA: data.monthlyFeeCFA,
      subscriptionDurationDays: duration,
      isSuperAdmin: true
    };
  }

  if (password === data.activeAdminPassword) {
    if (isExpired) {
      return {
        success: false,
        expired: true,
        expiresAt: data.passwordExpiresAt,
        daysRemaining: 0,
        monthlyFeeCFA: data.monthlyFeeCFA,
        subscriptionDurationDays: duration,
        error: `Votre abonnement d'administration (${duration} jours) a expiré le ${new Date(data.passwordExpiresAt).toLocaleDateString('fr-FR')}. Veuillez régler la cotisation de ${data.monthlyFeeCFA.toLocaleString('fr-FR')} FCFA via FeexPay pour générer votre nouveau mot de passe.`
      };
    }

    return {
      success: true,
      expired: false,
      expiresAt: data.passwordExpiresAt,
      daysRemaining,
      monthlyFeeCFA: data.monthlyFeeCFA,
      subscriptionDurationDays: duration,
      isSuperAdmin: false
    };
  }

  return {
    success: false,
    error: 'Mot de passe incorrect.'
  };
}

/**
 * Enregistre un paiement FeexPay et génère un nouveau mot de passe Admin valable pour la durée configurée
 */
export async function processSuccessfulPaymentAsync(params: {
  amountCFA: number;
  reference: string;
  feexpayTransactionId?: string;
  phoneNumber?: string;
  operator?: string;
}): Promise<{
  newPassword: string;
  expiresAt: string;
  record: SubscriptionPaymentRecord;
}> {
  const data = await readSubscriptionDataAsync();
  const newPassword = generateRandomAdminPassword();

  const durationDays = data.subscriptionDurationDays && data.subscriptionDurationDays > 0 ? data.subscriptionDurationDays : 30;
  const currentExpiry = new Date(data.passwordExpiresAt).getTime();
  const baseTime = currentExpiry > Date.now() ? currentExpiry : Date.now();
  const newExpiresAt = new Date(baseTime + durationDays * 24 * 60 * 60 * 1000).toISOString();

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

  await writeSubscriptionDataAsync(data);

  return {
    newPassword,
    expiresAt: newExpiresAt,
    record
  };
}

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

  const durationDays = data.subscriptionDurationDays && data.subscriptionDurationDays > 0 ? data.subscriptionDurationDays : 30;
  const currentExpiry = new Date(data.passwordExpiresAt).getTime();
  const baseTime = currentExpiry > Date.now() ? currentExpiry : Date.now();
  const newExpiresAt = new Date(baseTime + durationDays * 24 * 60 * 60 * 1000).toISOString();

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
export async function superAdminManualGeneratePasswordAsync(): Promise<{ newPassword: string; expiresAt: string }> {
  const data = await readSubscriptionDataAsync();
  const newPassword = generateRandomAdminPassword();
  const durationDays = data.subscriptionDurationDays && data.subscriptionDurationDays > 0 ? data.subscriptionDurationDays : 30;
  const newExpiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();

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

  await writeSubscriptionDataAsync(data);

  return { newPassword, expiresAt: newExpiresAt };
}

export function superAdminManualGeneratePassword(): { newPassword: string; expiresAt: string } {
  const data = readSubscriptionData();
  const newPassword = generateRandomAdminPassword();
  const durationDays = data.subscriptionDurationDays && data.subscriptionDurationDays > 0 ? data.subscriptionDurationDays : 30;
  const newExpiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();

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

export async function superAdminExtendDaysAsync(days?: number): Promise<{ expiresAt: string; daysRemaining: number }> {
  const data = await readSubscriptionDataAsync();
  const extensionDays = (days && days > 0) ? days : (data.subscriptionDurationDays || 30);
  const currentExpiry = new Date(data.passwordExpiresAt).getTime();
  const baseTime = currentExpiry > Date.now() ? currentExpiry : Date.now();
  const newExpiresAt = new Date(baseTime + extensionDays * 24 * 60 * 60 * 1000).toISOString();

  data.passwordExpiresAt = newExpiresAt;
  await writeSubscriptionDataAsync(data);

  const daysRemaining = Math.max(0, Math.ceil((new Date(newExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
  return { expiresAt: newExpiresAt, daysRemaining };
}

export function superAdminExtendDays(days?: number): { expiresAt: string; daysRemaining: number } {
  const data = readSubscriptionData();
  const extensionDays = (days && days > 0) ? days : (data.subscriptionDurationDays || 30);
  const currentExpiry = new Date(data.passwordExpiresAt).getTime();
  const baseTime = currentExpiry > Date.now() ? currentExpiry : Date.now();
  const newExpiresAt = new Date(baseTime + extensionDays * 24 * 60 * 60 * 1000).toISOString();

  data.passwordExpiresAt = newExpiresAt;
  writeSubscriptionData(data);

  const daysRemaining = Math.max(0, Math.ceil((new Date(newExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
  return { expiresAt: newExpiresAt, daysRemaining };
}

export async function superAdminRevokeAccessAsync(): Promise<{ isExpired: boolean }> {
  const data = await readSubscriptionDataAsync();
  data.passwordExpiresAt = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  await writeSubscriptionDataAsync(data);
  return { isExpired: true };
}

export function superAdminRevokeAccess(): { isExpired: boolean } {
  const data = readSubscriptionData();
  data.passwordExpiresAt = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  writeSubscriptionData(data);
  return { isExpired: true };
}
