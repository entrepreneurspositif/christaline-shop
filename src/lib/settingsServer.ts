import fs from 'fs';
import path from 'path';
import { AppSettings, DEFAULT_SETTINGS } from './settings';
import { getDatabase } from './mongodb';

const SETTINGS_FILE = path.join(process.cwd(), 'data', 'settings.json');

declare global {
  // eslint-disable-next-line no-var
  var __cs_settings_cache: AppSettings | undefined;
}

function normalizeSettings(parsed: any): AppSettings {
  return { 
    ...DEFAULT_SETTINGS, 
    ...parsed,
    whatsappGroupLink: parsed.whatsappGroupLink ?? DEFAULT_SETTINGS.whatsappGroupLink,
    whatsappButtonTarget: parsed.whatsappButtonTarget ?? DEFAULT_SETTINGS.whatsappButtonTarget,
    platforms: parsed.platforms || DEFAULT_SETTINGS.platforms,
    shippingModes: parsed.shippingModes || DEFAULT_SETTINGS.shippingModes,
    telegram: {
      ...DEFAULT_SETTINGS.telegram,
      ...(parsed.telegram || {})
    },
    marketing: {
      facebookPixel: {
        ...DEFAULT_SETTINGS.marketing.facebookPixel,
        ...(parsed.marketing?.facebookPixel || {})
      },
      tiktokPixel: {
        ...DEFAULT_SETTINGS.marketing.tiktokPixel,
        ...(parsed.marketing?.tiktokPixel || {})
      },
      googleAnalytics: {
        ...DEFAULT_SETTINGS.marketing.googleAnalytics,
        ...(parsed.marketing?.googleAnalytics || {})
      }
    },
    paymentInstructions: {
      ...DEFAULT_SETTINGS.paymentInstructions,
      ...(parsed.paymentInstructions || {})
    }
  };
}

function readLocalSettings(): AppSettings {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      return normalizeSettings(parsed);
    }
  } catch (err) {
    console.error('Erreur lecture locale settings.json:', err);
  }
  return DEFAULT_SETTINGS;
}

function writeLocalSettings(settings: AppSettings): void {
  try {
    const dir = path.dirname(SETTINGS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
  } catch (err) {
    // Environnement read-only (ex: Vercel)
  }
}

export async function getSettingsAsync(): Promise<AppSettings> {
  try {
    const db = await getDatabase();
    if (db) {
      const doc = await db.collection('settings').findOne({ _id: 'app_settings' as any });
      if (doc) {
        const { _id, ...rest } = doc;
        const normalized = normalizeSettings(rest);
        global.__cs_settings_cache = normalized;
        return normalized;
      }
    }
  } catch (err) {
    console.error('Erreur getSettingsAsync MongoDB Atlas:', err);
  }

  if (global.__cs_settings_cache) {
    return global.__cs_settings_cache;
  }
  const local = readLocalSettings();
  global.__cs_settings_cache = local;
  return local;
}

export function getSettings(): AppSettings {
  if (global.__cs_settings_cache) {
    return global.__cs_settings_cache;
  }
  const local = readLocalSettings();
  global.__cs_settings_cache = local;
  return local;
}

export function saveSettings(settings: AppSettings): AppSettings {
  const normalized = normalizeSettings(settings);
  global.__cs_settings_cache = normalized;
  writeLocalSettings(normalized);

  // Synchronisation asynchrone avec MongoDB Atlas en arrière-plan
  getDatabase().then(db => {
    if (db) {
      db.collection('settings').updateOne(
        { _id: 'app_settings' as any },
        { $set: { ...normalized, _id: 'app_settings' } },
        { upsert: true }
      ).catch(e => console.error('Erreur écriture settings MongoDB:', e));
    }
  }).catch(e => console.error('Erreur db settings:', e));

  return normalized;
}

export async function saveSettingsAsync(settings: AppSettings): Promise<AppSettings> {
  const normalized = normalizeSettings(settings);
  global.__cs_settings_cache = normalized;
  writeLocalSettings(normalized);

  try {
    const db = await getDatabase();
    if (db) {
      await db.collection('settings').updateOne(
        { _id: 'app_settings' as any },
        { $set: { ...normalized, _id: 'app_settings' } },
        { upsert: true }
      );
    }
  } catch (err) {
    console.error('Erreur saveSettingsAsync sur MongoDB Atlas:', err);
  }

  return normalized;
}
