import fs from 'fs';
import path from 'path';
import { TicketOrder, QuoteStatus, OrderItem, TrackingEvent, TrackingInfo, QuoteDetails, STATUS_MAP, ShippingModeType } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'tickets.json');

export function generateTicketId(): string {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `CS-${randomNum}`;
}

export function createDefaultTimeline(status: QuoteStatus, createdAt: string, shippingMode: ShippingModeType = 'air'): TrackingEvent[] {
  const now = new Date(createdAt);
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const currentStep = STATUS_MAP[status]?.stepIndex ?? 0;
  const isSea = shippingMode === 'sea';

  return [
    {
      id: 'step-0',
      title: 'Demande enregistrée',
      description: 'Vos liens et choix d\'articles ont été reçus par l\'équipe Christaline Shop Bénin.',
      date: formatDate(now),
      location: 'Christaline Shop - Réception Cotonou',
      completed: currentStep >= 0,
      current: currentStep === 0,
    },
    {
      id: 'step-1',
      title: 'Devis calculé par Christaline',
      description: 'L\'équipe a vérifié la disponibilité et calculé le prix total de vos articles en FCFA.',
      date: currentStep >= 1 ? formatDate(new Date(now.getTime() + 2 * 3600 * 1000)) : 'À venir',
      location: 'Christaline Shop Bénin - Gestion Devis',
      completed: currentStep >= 1,
      current: currentStep === 1,
    },
    {
      id: 'step-2',
      title: 'Devis validé & Acompte reçu',
      description: 'Acompte confirmé via Mobile Money (MTN / Moov / Celtiis Bénin).',
      date: currentStep >= 3 ? formatDate(new Date(now.getTime() + 6 * 3600 * 1000)) : 'En attente validation',
      location: 'Christaline Shop - Trésorerie',
      completed: currentStep >= 3,
      current: currentStep === 2 || currentStep === 3,
    },
    {
      id: 'step-3',
      title: 'Commande validée chez le fournisseur',
      description: 'Articles commandés avec succès auprès de la plateforme partenaire.',
      date: currentStep >= 4 ? formatDate(new Date(now.getTime() + 24 * 3600 * 1000)) : 'À venir',
      location: 'Plateforme Fournisseur',
      completed: currentStep >= 4,
      current: currentStep === 4,
    },
    {
      id: 'step-4',
      title: isSea ? 'Traversée Maritime (Bateau / Conteneur)' : 'Expédition Aérienne (Vol Fret Régulier)',
      description: isSea 
        ? 'Conteneur chargé et expédié par bateau vers le Port de Cotonou. Délai maritime : 2 à 3 mois.'
        : 'Colis groupé expédié en vol fret aérien international vers Cotonou. Délai aérien : au plus 1 mois.',
      date: currentStep >= 5 ? formatDate(new Date(now.getTime() + 48 * 3600 * 1000)) : (isSea ? 'Délai 2 à 3 mois' : 'Délai au plus 1 mois'),
      location: isSea ? 'Fret Maritime International (Bateau)' : 'Fret Aérien International (Avion)',
      completed: currentStep >= 5,
      current: currentStep === 5,
    },
    {
      id: 'step-5',
      title: 'Arrivée au Bénin & Dédouanement',
      description: isSea 
        ? 'Arrivée au Port Autonome de Cotonou, déchargement et formalités douanières.'
        : 'Atterrissage à l\'Aéroport International de Cotonou (Cadjehoun), inspection et tri.',
      date: currentStep >= 6 ? formatDate(new Date(now.getTime() + (isSea ? 60 : 15) * 86400 * 1000)) : 'En cours de transit',
      location: isSea ? 'Port Autonome de Cotonou' : 'Aéroport Cadjehoun Cotonou',
      completed: currentStep >= 6,
      current: currentStep === 6,
    },
    {
      id: 'step-6',
      title: 'Prêt pour livraison / retrait',
      description: 'Colis disponible à l\'agence Christaline Shop Cotonou ou confié au livreur.',
      date: currentStep >= 7 ? formatDate(new Date(now.getTime() + (isSea ? 65 : 18) * 86400 * 1000)) : 'À venir',
      location: 'Agence Christaline Shop Cotonou',
      completed: currentStep >= 7,
      current: currentStep === 7,
    },
    {
      id: 'step-7',
      title: 'Colis remis au client',
      description: 'Commande remise en main propre. Merci de faire confiance à Christaline Shop !',
      date: currentStep >= 8 ? formatDate(new Date(now.getTime() + (isSea ? 70 : 20) * 86400 * 1000)) : 'En attente de remise',
      location: 'Client (Bénin)',
      completed: currentStep >= 8,
      current: currentStep === 8,
    },
  ];
}

const SEED_DATA: TicketOrder[] = [
  {
    id: 'CS-784210',
    createdAt: new Date(Date.now() - 5 * 86400 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400 * 1000).toISOString(),
    shippingMode: 'air',
    client: {
      name: 'Sophie Tossou',
      phone: '0154072488',
      whatsapp: '0154072488',
      city: 'Cotonou - Haie Vive',
      address: 'Près du restaurant Livingstone',
      notes: 'Merci de bien vérifier la taille 38 pour les talons s’il vous plaît.'
    },
    items: [
      {
        id: 'item-1',
        platform: 'shein',
        url: 'https://shein.com/fr/robe-cocktail-satin-rose-poudree-p-2938472.html',
        name: 'Robe de cocktail satin rose poudrée plissée',
        variant: 'Taille M / Rose poudré',
        quantity: 1,
        originalPrice: 28.99,
        originalCurrency: 'EUR',
        notes: 'Prendre exactement le rose du flyer Christaline',
        unitPriceCFA: 31000,
        shippingFeeCFA: 0,
        serviceFeeCFA: 0,
        customsFeeCFA: 0,
        totalItemCFA: 31000,
        status: 'ordered'
      },
      {
        id: 'item-2',
        platform: 'shein',
        url: 'https://shein.com/fr/escarpins-talons-hauts-dore-strass-p-1092837.html',
        name: 'Escarpins dorés à strass élégants talons 9cm',
        variant: 'Pointure 38 / Doré champagne',
        quantity: 1,
        originalPrice: 24.50,
        originalCurrency: 'EUR',
        notes: 'Bien emballer pour ne pas abîmer la boîte',
        unitPriceCFA: 27500,
        shippingFeeCFA: 0,
        serviceFeeCFA: 0,
        customsFeeCFA: 0,
        totalItemCFA: 27500,
        status: 'ordered'
      }
    ],
    quote: {
      status: 'in_transit',
      subtotalItemsCFA: 58500,
      totalShippingCFA: 0,
      totalServiceFeeCFA: 0,
      totalCustomsCFA: 0,
      discountCFA: 0,
      grandTotalCFA: 58500,
      depositRequiredCFA: 35000,
      depositPaidCFA: 35000,
      balanceRemainingCFA: 23500,
      adminNote: 'Articles commandés avec succès sur Shein ! Colis groupé en vol fret aérien vers Cotonou.',
      quotedAt: new Date(Date.now() - 4 * 86400 * 1000).toISOString()
    },
    tracking: {
      currentStatus: 'in_transit',
      statusLabel: 'En transit international (Vol Aérien vers Cotonou)',
      shippingMode: 'air',
      estimatedDelivery: 'Au plus 1 mois',
      estimatedDeliveryDate: new Date(Date.now() + 10 * 86400 * 1000).toISOString().split('T')[0],
      supplierOrderNumber: 'SHEIN-FR-98230192',
      carrierName: 'Christaline Air Cargo Bénin',
      carrierTrackingNumber: 'CST-BEN-2026-98124',
      carrierTrackingUrl: 'https://www.17track.net',
      events: createDefaultTimeline('in_transit', new Date(Date.now() - 5 * 86400 * 1000).toISOString(), 'air')
    }
  },
  {
    id: 'CS-918234',
    createdAt: new Date(Date.now() - 1 * 86400 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    shippingMode: 'air',
    client: {
      name: 'Aïcha Hounkpatin',
      phone: '0154072488',
      whatsapp: '0154072488',
      city: 'Abomey-Calavi - Arconville',
      address: 'Carrefour Kpota, face pharmacie',
      notes: 'C’est pour un anniversaire le mois prochain.'
    },
    items: [
      {
        id: 'item-1',
        platform: 'temu',
        url: 'https://temu.com/fr/kit-pinceaux-maquillage-professionnel-18-pieces.html',
        name: 'Set de pinceaux de maquillage luxe 18 pièces avec étui cuir',
        variant: 'Couleur Or Rose / 18 pcs',
        quantity: 2,
        originalPrice: 12.99,
        originalCurrency: 'EUR',
        notes: '2 coffrets identiques',
        unitPriceCFA: 12500,
        shippingFeeCFA: 0,
        serviceFeeCFA: 0,
        customsFeeCFA: 0,
        totalItemCFA: 25000,
        status: 'quoted'
      },
      {
        id: 'item-2',
        platform: 'temu',
        url: 'https://temu.com/fr/palette-fards-a-paupieres-nude-glamour.html',
        name: 'Palette fards à paupières 35 teintes nudes & paillettes',
        variant: 'Modèle Glamour Nude',
        quantity: 1,
        originalPrice: 14.50,
        originalCurrency: 'EUR',
        notes: 'Attention produit fragile',
        unitPriceCFA: 17000,
        shippingFeeCFA: 0,
        serviceFeeCFA: 0,
        customsFeeCFA: 0,
        totalItemCFA: 17000,
        status: 'quoted'
      }
    ],
    quote: {
      status: 'ready',
      subtotalItemsCFA: 42000,
      totalShippingCFA: 0,
      totalServiceFeeCFA: 0,
      totalCustomsCFA: 0,
      discountCFA: 0,
      grandTotalCFA: 42000,
      depositRequiredCFA: 25000,
      depositPaidCFA: 0,
      balanceRemainingCFA: 42000,
      adminNote: 'Votre devis Temu est prêt ! Réglez l\'acompte de 25 000 FCFA pour valider l\'achat immédiat.',
      quotedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString()
    },
    tracking: {
      currentStatus: 'ready',
      statusLabel: 'Devis prêt (En attente de paiement acompte)',
      shippingMode: 'air',
      estimatedDelivery: 'Au plus 1 mois dès validation',
      estimatedDeliveryDate: null,
      supplierOrderNumber: null,
      carrierName: null,
      carrierTrackingNumber: null,
      carrierTrackingUrl: null,
      events: createDefaultTimeline('ready', new Date(Date.now() - 1 * 86400 * 1000).toISOString(), 'air')
    }
  },
  {
    id: 'CS-334912',
    createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    shippingMode: 'sea', // Bateau
    client: {
      name: 'Marc Gbaguidi',
      phone: '0154072488',
      whatsapp: '0154072488',
      city: 'Porto-Novo - Ouando',
      address: 'Près du grand marché Ouando',
      notes: 'Commande volumineuse choisie par voie maritime.'
    },
    items: [
      {
        id: 'item-1',
        platform: 'shein',
        url: 'https://shein.com/fr/lot-vestes-costumes-homme-mariage.html',
        name: 'Lot vestes & costumes complets homme',
        variant: 'Taille Veste 52 / Bleu Nuit',
        quantity: 3,
        originalPrice: 35.00,
        originalCurrency: 'EUR',
        notes: 'Expédition par conteneur bateau',
        unitPriceCFA: 0,
        shippingFeeCFA: 0,
        serviceFeeCFA: 0,
        customsFeeCFA: 0,
        totalItemCFA: 0,
        status: 'pending'
      }
    ],
    quote: {
      status: 'pending',
      subtotalItemsCFA: 0,
      totalShippingCFA: 0,
      totalServiceFeeCFA: 0,
      totalCustomsCFA: 0,
      discountCFA: 0,
      grandTotalCFA: 0,
      depositRequiredCFA: 0,
      depositPaidCFA: 0,
      balanceRemainingCFA: 0,
      adminNote: 'Demande par voie maritime reçue ! Notre équipe prépare votre chiffrage économique.',
      quotedAt: null
    },
    tracking: {
      currentStatus: 'pending',
      statusLabel: 'En attente de chiffrage par Christaline Shop',
      shippingMode: 'sea',
      estimatedDelivery: '2 à 3 mois (Voie maritime)',
      estimatedDeliveryDate: null,
      supplierOrderNumber: null,
      carrierName: null,
      carrierTrackingNumber: null,
      carrierTrackingUrl: null,
      events: createDefaultTimeline('pending', new Date(Date.now() - 35 * 60 * 1000).toISOString(), 'sea')
    }
  },
  {
    id: 'CS-652190',
    createdAt: new Date(Date.now() - 25 * 86400 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400 * 1000).toISOString(),
    shippingMode: 'air',
    client: {
      name: 'Grace Dossou',
      phone: '0154072488',
      whatsapp: '0154072488',
      city: 'Cotonou - Cadjehoun',
      address: 'Près de l\'Aéroport International',
      notes: 'Livraison impeccable effectuée.'
    },
    items: [
      {
        id: 'item-1',
        platform: 'shein',
        url: 'https://shein.com/fr/jogging-polaire-ensemble-femme-p-382910.html',
        name: 'Ensemble jogging sweat capuche beige molletonné',
        variant: 'Taille L / Couleur Beige',
        quantity: 1,
        originalPrice: 19.99,
        originalCurrency: 'EUR',
        notes: 'Parfait',
        unitPriceCFA: 23000,
        shippingFeeCFA: 0,
        serviceFeeCFA: 0,
        customsFeeCFA: 0,
        totalItemCFA: 23000,
        status: 'ordered'
      }
    ],
    quote: {
      status: 'delivered',
      subtotalItemsCFA: 23000,
      totalShippingCFA: 0,
      totalServiceFeeCFA: 0,
      totalCustomsCFA: 0,
      discountCFA: 0,
      grandTotalCFA: 23000,
      depositRequiredCFA: 15000,
      depositPaidCFA: 23000,
      balanceRemainingCFA: 0,
      adminNote: 'Colis livré à Cotonou et solde entièrement réglé. Merci pour votre fidélité !',
      quotedAt: new Date(Date.now() - 24 * 86400 * 1000).toISOString()
    },
    tracking: {
      currentStatus: 'delivered',
      statusLabel: 'Colis livré avec succès',
      shippingMode: 'air',
      estimatedDelivery: 'Au plus 1 mois (Respecté)',
      estimatedDeliveryDate: new Date(Date.now() - 2 * 86400 * 1000).toISOString().split('T')[0],
      supplierOrderNumber: 'SHEIN-FR-889123',
      carrierName: 'Christaline Express Cotonou',
      carrierTrackingNumber: 'CST-LIV-0921',
      carrierTrackingUrl: null,
      events: createDefaultTimeline('delivered', new Date(Date.now() - 25 * 86400 * 1000).toISOString(), 'air')
    }
  }
];

function ensureDataFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(SEED_DATA, null, 2), 'utf-8');
    }
  } catch (err) {
    // Environnement read-only (ex: Vercel serverless)
  }
}

export function getAllTickets(): TicketOrder[] {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const data = JSON.parse(raw) as TicketOrder[];
    return data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.error('Erreur lecture tickets.json:', err);
    return SEED_DATA;
  }
}

export function saveTickets(tickets: TicketOrder[]): void {
  try {
    ensureDataFile();
    fs.writeFileSync(DATA_FILE, JSON.stringify(tickets, null, 2), 'utf-8');
  } catch (err) {
    console.error('Erreur écriture tickets.json (environnement read-only):', err);
  }
}

export function getTicketById(id: string): TicketOrder | null {
  const tickets = getAllTickets();
  const cleanId = id.trim().toUpperCase();
  return tickets.find(t => t.id.toUpperCase() === cleanId) || null;
}

export interface CreateTicketPayload {
  shippingMode?: ShippingModeType;
  client: {
    name: string;
    phone: string;
    whatsapp: string;
    city: string;
    address?: string;
    notes?: string;
  };
  items: Array<{
    platform: string;
    url: string;
    name: string;
    variant?: string;
    quantity: number;
    originalPrice?: number | null;
    originalCurrency?: string;
    notes?: string;
  }>;
}

export function createNewTicket(payload: CreateTicketPayload): TicketOrder {
  const tickets = getAllTickets();
  const now = new Date().toISOString();
  const shippingMode = payload.shippingMode === 'sea' ? 'sea' : 'air';
  
  let newId = generateTicketId();
  while (tickets.some(t => t.id === newId)) {
    newId = generateTicketId();
  }

  const items: OrderItem[] = payload.items.map((it, idx) => ({
    id: `item-${idx + 1}-${Date.now()}`,
    platform: it.platform,
    url: it.url.trim(),
    name: it.name.trim() || `Article ${it.platform.toUpperCase()} #${idx + 1}`,
    variant: it.variant?.trim() || '',
    quantity: Number(it.quantity) > 0 ? Number(it.quantity) : 1,
    originalPrice: it.originalPrice ? Number(it.originalPrice) : null,
    originalCurrency: it.originalCurrency || 'EUR',
    notes: it.notes?.trim() || '',
    unitPriceCFA: 0,
    shippingFeeCFA: 0,
    serviceFeeCFA: 0,
    customsFeeCFA: 0,
    totalItemCFA: 0,
    status: 'pending'
  }));

  const estimatedDelivery = shippingMode === 'sea' ? '2 à 3 mois' : 'Au plus 1 mois';

  const newTicket: TicketOrder = {
    id: newId,
    createdAt: now,
    updatedAt: now,
    shippingMode,
    client: {
      name: payload.client.name.trim(),
      phone: payload.client.phone.trim(),
      whatsapp: payload.client.whatsapp.trim() || payload.client.phone.trim(),
      city: payload.client.city.trim(),
      address: payload.client.address?.trim() || '',
      notes: payload.client.notes?.trim() || ''
    },
    items,
    quote: {
      status: 'pending',
      subtotalItemsCFA: 0,
      totalShippingCFA: 0,
      totalServiceFeeCFA: 0,
      totalCustomsCFA: 0,
      discountCFA: 0,
      grandTotalCFA: 0,
      depositRequiredCFA: 0,
      depositPaidCFA: 0,
      balanceRemainingCFA: 0,
      adminNote: `Demande reçue par Christaline Shop Bénin (Mode : ${shippingMode === 'sea' ? 'Voie Maritime' : 'Voie Aérienne'}). Chiffrage en cours.`,
      quotedAt: null
    },
    tracking: {
      currentStatus: 'pending',
      statusLabel: 'En attente de chiffrage par l\'équipe Christaline',
      shippingMode,
      estimatedDelivery,
      estimatedDeliveryDate: null,
      supplierOrderNumber: null,
      carrierName: null,
      carrierTrackingNumber: null,
      carrierTrackingUrl: null,
      events: createDefaultTimeline('pending', now, shippingMode)
    }
  };

  tickets.unshift(newTicket);
  saveTickets(tickets);
  return newTicket;
}

export function updateTicket(id: string, updates: Partial<TicketOrder>): TicketOrder | null {
  const tickets = getAllTickets();
  const index = tickets.findIndex(t => t.id.toUpperCase() === id.trim().toUpperCase());
  if (index === -1) return null;

  const current = tickets[index];
  const updated: TicketOrder = {
    ...current,
    ...updates,
    updatedAt: new Date().toISOString()
  };

  tickets[index] = updated;
  saveTickets(tickets);
  return updated;
}
