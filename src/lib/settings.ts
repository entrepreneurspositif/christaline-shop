import fs from 'fs';
import path from 'path';

export interface PaymentAccount {
  id: string;
  operator: string; // Ex: "MTN Mobile Money Bénin", "Moov Money Bénin", "Celtiis Cash"
  number: string;
  holderName: string;
  badgeColor: string;
}

export interface AppSettings {
  storeName: string;
  phone: string;
  whatsappNumber: string; // Format international sans '+' pour wa.me, ex: "2290154072488"
  country: string; // "Bénin"
  defaultCity: string; // "Cotonou"
  paymentInstructions: {
    title: string;
    instructionsText: string;
    accounts: PaymentAccount[];
    confirmationNote: string;
  };
}

const SETTINGS_FILE = path.join(process.cwd(), 'data', 'settings.json');

const DEFAULT_SETTINGS: AppSettings = {
  storeName: 'Christaline Shop',
  phone: '0154072488',
  whatsappNumber: '2290154072488',
  country: 'Bénin',
  defaultCity: 'Cotonou',
  paymentInstructions: {
    title: 'Instructions de Règlement de l\'Acompte',
    instructionsText: 'Pour valider votre réservation et lancer l\'achat immédiat de vos articles auprès des fournisseurs, veuillez effectuer le transfert de votre acompte sur l\'un de nos comptes Mobile Money officiels ci-dessous. Mentionnez impérativement votre N° de ticket en motif de transaction.',
    accounts: [
      {
        id: 'acc-1',
        operator: 'MTN Mobile Money Bénin',
        number: '0154072488',
        holderName: 'Christaline Shop Bénin',
        badgeColor: 'bg-yellow-400 text-stone-900 border-yellow-500'
      },
      {
        id: 'acc-2',
        operator: 'Moov Money Bénin',
        number: '0154072488',
        holderName: 'Christaline Shop Bénin',
        badgeColor: 'bg-blue-600 text-white border-blue-700'
      },
      {
        id: 'acc-3',
        operator: 'Celtiis Cash Bénin',
        number: '0154072488',
        holderName: 'Christaline Shop Bénin',
        badgeColor: 'bg-purple-600 text-white border-purple-700'
      }
    ],
    confirmationNote: 'Une fois le transfert effectué, veuillez nous envoyer la capture d\'écran ou le SMS de confirmation sur notre WhatsApp pour validation immédiate de votre commande.'
  }
};

export function getSettings(): AppSettings {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
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
