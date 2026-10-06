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

export interface TelegramConfig {
  enabled: boolean;
  botToken: string;
  chatId: string;
  notifyNewOrders: boolean;
  notifyGroupBuys: boolean;
  notifyPayments: boolean;
}

export interface PixelSetting {
  enabled: boolean;
  pixelId: string;
}

export interface MarketingConfig {
  facebookPixel: PixelSetting;
  tiktokPixel: PixelSetting;
  googleAnalytics: {
    enabled: boolean;
    measurementId: string;
  };
}

export interface AppSettings {
  storeName: string;
  phone: string;
  whatsappNumber: string;
  whatsappGroupLink?: string;
  whatsappButtonTarget?: 'group' | 'direct';
  country: string;
  defaultCity: string;
  platforms: StorePlatform[];
  shippingModes: ShippingModeOption[];
  homepageFlyerUrl?: string;
  telegram: TelegramConfig;
  marketing: MarketingConfig;
  paymentInstructions: {
    title: string;
    instructionsText: string;
    accounts: PaymentAccount[];
    confirmationNote: string;
  };
}

export const DEFAULT_SETTINGS: AppSettings = {
  storeName: 'Christaline Shop',
  homepageFlyerUrl: '/images/christaline-flyer.jpg',
  phone: '0154072488',
  whatsappNumber: '2290154072488',
  whatsappGroupLink: '',
  whatsappButtonTarget: 'group',
  country: 'Bénin',
  defaultCity: 'Cotonou',
  telegram: {
    enabled: false,
    botToken: '',
    chatId: '',
    notifyNewOrders: true,
    notifyGroupBuys: true,
    notifyPayments: true
  },
  marketing: {
    facebookPixel: {
      enabled: false,
      pixelId: ''
    },
    tiktokPixel: {
      enabled: false,
      pixelId: ''
    },
    googleAnalytics: {
      enabled: false,
      measurementId: ''
    }
  },
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

/**
 * Formate un numéro de téléphone béninois (ex: "0154072488" -> "01 54 07 24 88")
 */
export function formatPhoneNumber(phone?: string): string {
  if (!phone) return '01 54 07 24 88';
  const cleaned = phone.replace(/\s+/g, '');
  if (cleaned.length === 10 && cleaned.startsWith('01')) {
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8, 10)}`;
  }
  if (cleaned.length === 8) {
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 6)} ${cleaned.slice(6, 8)}`;
  }
  return phone;
}

/**
 * Nettoie le numéro WhatsApp pour le lien wa.me (ajoute indicatif 229 si absent)
 */
export function cleanWhatsAppDigits(num?: string): string {
  if (!num) return '2290154072488';
  const digits = num.replace(/\D/g, '');
  if (!digits) return '2290154072488';
  if (digits.startsWith('229')) return digits;
  if (digits.length === 10 && digits.startsWith('01')) return `229${digits}`;
  if (digits.length === 8) return `229${digits}`;
  return digits;
}

/**
 * Génère le lien direct de discussion WhatsApp
 */
export function getWhatsAppDirectUrl(num?: string, message?: string): string {
  const digits = cleanWhatsAppDigits(num);
  const text = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${digits}${text}`;
}

/**
 * Génère le lien d'action pour le bouton WhatsApp selon la configuration :
 * Si le lien du groupe WhatsApp est renseigné et configuré comme cible, on renvoie le lien du groupe.
 * Sinon, renvoie le lien de discussion direct wa.me.
 */
export function getWhatsAppActionUrl(
  settings?: Partial<AppSettings> | null, 
  defaultMessage?: string
): string {
  if (!settings) return getWhatsAppDirectUrl('0154072488', defaultMessage);
  
  const hasGroup = !!(settings.whatsappGroupLink && settings.whatsappGroupLink.trim());
  const target = settings.whatsappButtonTarget || (hasGroup ? 'group' : 'direct');
  
  if (target === 'group' && hasGroup) {
    return settings.whatsappGroupLink!.trim();
  }
  
  return getWhatsAppDirectUrl(settings.whatsappNumber || '0154072488', defaultMessage);
}
