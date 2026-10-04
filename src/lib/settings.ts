import fs from 'fs';
import path from 'path';

export interface PaymentAccount {
  id: string;
  operator: string;
  number: string;
  holderName: string;
  badgeColor: string;
}

export interface StorePlatform {
  id: string;
  name: string;
  logoText: string;
  bg: string;
  border: string;
  color: string;
  enabled: boolean;
}

export interface ShippingModeOption {
  id: 'air' | 'sea';
  name: string;
  duration: string;
  description: string;
}

export interface AppSettings {
  storeName: string;
  phone: string;
  whatsappNumber: string;
  country: string;
  defaultCity: string;
  platforms: StorePlatform[];
  shippingModes: ShippingModeOption[];
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
  platforms: [
    {
      id: 'shein',
      name: 'Shein',
      logoText: 'SHEIN',
      bg: 'bg-black text-white',
      border: 'border-black',
      color: 'text-black',
      enabled: true
    },
    {
      id: 'temu',
      name: 'Temu',
      logoText: 'TEMU',
      bg: 'bg-gradient-to-r from-orange-500 to-amber-600 text-white',
      border: 'border-orange-500',
      color: 'text-amber-600',
      enabled: true
    },
    {
      id: 'alibaba',
      name: 'Alibaba',
      logoText: 'ALIBABA',
      bg: 'bg-orange-500 text-white',
      border: 'border-orange-500',
      color: 'text-orange-600',
      enabled: false // Désactivé par défaut comme demandé
    },
    {
      id: 'autre',
      name: 'Autre plateforme',
      logoText: 'AUTRE',
      bg: 'bg-rose-500 text-white',
      border: 'border-rose-400',
      color: 'text-rose-600',
      enabled: true
    }
  ],
  shippingModes: [
    {
      id: 'air',
      name: 'Voie Aérienne (Fret Aérien)',
      duration: 'Au plus 1 mois',
      description: 'Expédition rapide par avion • Idéal pour vêtements, chaussures et articles légers'
    },
    {
      id: 'sea',
      name: 'Voie Maritime (Bateau)',
      duration: '2 à 3 mois',
      description: 'Expédition par conteneur maritime • Idéal pour colis volumineux ou lourds'
    }
  ],
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
      const parsed = JSON.parse(data);
      return { 
        ...DEFAULT_SETTINGS, 
        ...parsed,
        platforms: parsed.platforms || DEFAULT_SETTINGS.platforms,
        shippingModes: parsed.shippingModes || DEFAULT_SETTINGS.shippingModes,
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
