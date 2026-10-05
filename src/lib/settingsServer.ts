import fs from 'fs';
import path from 'path';
import { AppSettings, DEFAULT_SETTINGS } from './settings';

const SETTINGS_FILE = path.join(process.cwd(), 'data', 'settings.json');

export function getSettings(): AppSettings {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
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
        paymentInstructions: {
          ...DEFAULT_SETTINGS.paymentInstructions,
          ...(parsed.paymentInstructions || {})
        }
      };
    }
  } catch (err) {
    console.error('Erreur lecture settings.json:', err);
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: AppSettings): AppSettings {
  try {
    const dir = path.dirname(SETTINGS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
  } catch (err) {
    console.error('Erreur sauvegarde settings.json:', err);
  }
  return settings;
}
