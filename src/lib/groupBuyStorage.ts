import fs from 'fs';
import path from 'path';
import { GroupBuyItem, GroupBuyParticipant, GroupBuyStatus, ShippingModeType } from './types';
import { getAllTickets, saveTickets, generateTicketId, createDefaultTimeline } from './storage';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'group_buys.json');

const INITIAL_GROUP_BUYS: GroupBuyItem[] = [
  {
    id: 'gb-1',
    title: 'Escarpins Luxe à Strass & Finition Soie',
    description: 'Superbes talons hauts de soirée ornés de strass étincelants, semelle confort et bride cheville élégante. Idéal pour mariages, galas et sorties chics.',
    imageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&auto=format&fit=crop&q=80',
    priceCFA: 18500,
    originalPriceCFA: 28000,
    minQuantity: 10,
    currentQuantity: 7,
    orderDate: '2026-10-16',
    shippingMode: 'air',
    platform: 'shein',
    variants: [
      'Pointure 37 - Doré Champagne',
      'Pointure 38 - Doré Champagne',
      'Pointure 38 - Argent Étincelant',
      'Pointure 39 - Argent Étincelant',
      'Pointure 40 - Doré Champagne'
    ],
    status: 'open',
    createdAt: new Date(Date.now() - 3 * 86400 * 1000).toISOString(),
    participants: [
      {
        id: 'part-1',
        clientName: 'Nadège Gnahoui',
        whatsapp: '0154072488',
        city: 'Cotonou - Akpakpa',
        quantity: 2,
        variant: 'Pointure 38 - Doré Champagne',
        notes: 'Commande urgente pour mariage fin du mois',
        reservedAt: new Date(Date.now() - 2 * 86400 * 1000).toISOString(),
        ticketId: 'CS-551201',
        depositPaid: true
      },
      {
        id: 'part-2',
        clientName: 'Carine Zinsou',
        whatsapp: '0165889900',
        city: 'Calavi - Arconville',
        quantity: 2,
        variant: 'Pointure 39 - Argent Étincelant',
        reservedAt: new Date(Date.now() - 1 * 86400 * 1000).toISOString(),
        ticketId: 'CS-551202',
        depositPaid: true
      },
      {
        id: 'part-3',
        clientName: 'Astride Dossou',
        whatsapp: '0197441122',
        city: 'Cotonou - Cadjehoun',
        quantity: 3,
        variant: 'Pointure 38 - Argent Étincelant',
        reservedAt: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
        ticketId: 'CS-551203',
        depositPaid: false
      }
    ]
  },
  {
    id: 'gb-2',
    title: 'Set 15 Pinceaux de Maquillage Pro + Trousse Velours',
    description: 'Set complet de pinceaux haute densité ultra-doux pour fond de teint, fards à paupières, contouring et lèvres. Livré avec sa trousse de rangement de luxe.',
    imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80',
    priceCFA: 7500,
    originalPriceCFA: 13500,
    minQuantity: 15,
    currentQuantity: 12,
    orderDate: '2026-10-18',
    shippingMode: 'air',
    platform: 'temu',
    variants: [
      'Manche Rose Gold & Poils Noirs',
      'Manche Or Impérial & Poils Blancs',
      'Manche Noir Mat & Poils Dégradés'
    ],
    status: 'open',
    createdAt: new Date(Date.now() - 4 * 86400 * 1000).toISOString(),
    participants: [
      {
        id: 'part-4',
        clientName: 'Rachelle Houngbo',
        whatsapp: '0161223344',
        city: 'Cotonou - Haie Vive',
        quantity: 4,
        variant: 'Manche Rose Gold & Poils Noirs',
        reservedAt: new Date(Date.now() - 3 * 86400 * 1000).toISOString(),
        ticketId: 'CS-610111',
        depositPaid: true
      },
      {
        id: 'part-5',
        clientName: 'Sonia Agbossou',
        whatsapp: '0195332211',
        city: 'Porto-Novo',
        quantity: 5,
        variant: 'Manche Or Impérial & Poils Blancs',
        reservedAt: new Date(Date.now() - 2 * 86400 * 1000).toISOString(),
        ticketId: 'CS-610112',
        depositPaid: true
      },
      {
        id: 'part-6',
        clientName: 'Prisca Bio',
        whatsapp: '0151998877',
        city: 'Calavi - Tankpè',
        quantity: 3,
        variant: 'Manche Noir Mat & Poils Dégradés',
        reservedAt: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
        ticketId: 'CS-610113',
        depositPaid: false
      }
    ]
  },
  {
    id: 'gb-3',
    title: 'Robe Longue de Soirée Satinée Plissée',
    description: 'Robe longue élégante à col en V plongeant et jupe fluide plissée. Matière satinée tombé lourd de haute qualité pour toutes vos cérémonies au Bénin.',
    imageUrl: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&auto=format&fit=crop&q=80',
    priceCFA: 21000,
    originalPriceCFA: 32000,
    minQuantity: 8,
    currentQuantity: 8,
    orderDate: '2026-10-14',
    shippingMode: 'air',
    platform: 'shein',
    variants: [
      'Taille S - Vert Émeraude',
      'Taille M - Vert Émeraude',
      'Taille M - Rouge Bordeaux',
      'Taille L - Bleu Roi',
      'Taille XL - Noir Chic'
    ],
    status: 'goal_reached',
    createdAt: new Date(Date.now() - 5 * 86400 * 1000).toISOString(),
    participants: [
      {
        id: 'part-7',
        clientName: 'Félicité Kiki',
        whatsapp: '0154072488',
        city: 'Cotonou - Sainte Rita',
        quantity: 2,
        variant: 'Taille M - Vert Émeraude',
        reservedAt: new Date(Date.now() - 4 * 86400 * 1000).toISOString(),
        ticketId: 'CS-720301',
        depositPaid: true
      },
      {
        id: 'part-8',
        clientName: 'Berthe Mensah',
        whatsapp: '0167221100',
        city: 'Cotonou - Fidjrossè',
        quantity: 3,
        variant: 'Taille L - Bleu Roi',
        reservedAt: new Date(Date.now() - 3 * 86400 * 1000).toISOString(),
        ticketId: 'CS-720302',
        depositPaid: true
      },
      {
        id: 'part-9',
        clientName: 'Mireille Lawson',
        whatsapp: '0190554433',
        city: 'Ouidah',
        quantity: 3,
        variant: 'Taille M - Rouge Bordeaux',
        reservedAt: new Date(Date.now() - 1 * 86400 * 1000).toISOString(),
        ticketId: 'CS-720303',
        depositPaid: true
      }
    ]
  },
  {
    id: 'gb-4',
    title: 'Ensemble Jogging Molletonné Streetwear Unisexe',
    description: 'Ensemble hoodie à capuche et bas de jogging molletonné épais grand confort. Coupe moderne oversize, élastiques cheville et poches profondes.',
    imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80',
    priceCFA: 12500,
    originalPriceCFA: 19500,
    minQuantity: 12,
    currentQuantity: 5,
    orderDate: '2026-10-22',
    shippingMode: 'air',
    platform: 'temu',
    variants: [
      'Taille M - Gris Chiné',
      'Taille L - Noir Intense',
      'Taille XL - Beige Sable',
      'Taille XXL - Vert Kaki'
    ],
    status: 'open',
    createdAt: new Date(Date.now() - 2 * 86400 * 1000).toISOString(),
    participants: [
      {
        id: 'part-10',
        clientName: 'Boris Houndété',
        whatsapp: '0196887766',
        city: 'Cotonou - Kouhounou',
        quantity: 3,
        variant: 'Taille L - Noir Intense',
        reservedAt: new Date(Date.now() - 1 * 86400 * 1000).toISOString(),
        ticketId: 'CS-840901',
        depositPaid: true
      },
      {
        id: 'part-11',
        clientName: 'Arnaud Soglo',
        whatsapp: '0153443322',
        city: 'Calavi - Zogbadjè',
        quantity: 2,
        variant: 'Taille M - Gris Chiné',
        reservedAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
        ticketId: 'CS-840902',
        depositPaid: false
      }
    ]
  }
];

function ensureGroupBuysFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(INITIAL_GROUP_BUYS, null, 2), 'utf-8');
    }
  } catch (err) {
    // Environnement read-only (ex: Vercel serverless)
  }
}

export function getAllGroupBuys(): GroupBuyItem[] {
  ensureGroupBuysFile();
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const data = JSON.parse(raw) as GroupBuyItem[];
    return data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.error('Erreur lecture group_buys.json:', err);
    return INITIAL_GROUP_BUYS;
  }
}

export function saveGroupBuys(items: GroupBuyItem[]): void {
  try {
    ensureGroupBuysFile();
    fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 2), 'utf-8');
  } catch (err) {
    console.error('Erreur écriture group_buys.json (environnement read-only):', err);
  }
}

export function getGroupBuyById(id: string): GroupBuyItem | null {
  const items = getAllGroupBuys();
  const cleanId = id.trim().toLowerCase();
  return items.find(item => item.id.toLowerCase() === cleanId) || null;
}

export interface CreateGroupBuyPayload {
  title: string;
  description: string;
  imageUrl: string;
  priceCFA: number;
  originalPriceCFA?: number;
  minQuantity: number;
  orderDate: string;
  shippingMode?: ShippingModeType;
  platform?: string;
  variants?: string[];
  status?: GroupBuyStatus;
}

export function createGroupBuy(payload: CreateGroupBuyPayload): GroupBuyItem {
  const items = getAllGroupBuys();
  const id = `gb-${Date.now().toString(36)}`;
  
  const newItem: GroupBuyItem = {
    id,
    title: payload.title.trim(),
    description: payload.description.trim(),
    imageUrl: payload.imageUrl.trim() || 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&auto=format&fit=crop&q=80',
    priceCFA: Number(payload.priceCFA) || 0,
    originalPriceCFA: payload.originalPriceCFA ? Number(payload.originalPriceCFA) : undefined,
    minQuantity: Number(payload.minQuantity) || 1,
    currentQuantity: 0,
    orderDate: payload.orderDate.trim(),
    shippingMode: payload.shippingMode === 'sea' ? 'sea' : 'air',
    platform: payload.platform?.trim() || 'shein',
    variants: payload.variants && payload.variants.length > 0 ? payload.variants : [],
    status: payload.status || 'open',
    createdAt: new Date().toISOString(),
    participants: []
  };

  items.unshift(newItem);
  saveGroupBuys(items);
  return newItem;
}

export function updateGroupBuy(id: string, updates: Partial<GroupBuyItem>): GroupBuyItem | null {
  const items = getAllGroupBuys();
  const index = items.findIndex(item => item.id.toLowerCase() === id.trim().toLowerCase());
  if (index === -1) return null;

  const current = items[index];
  const updated: GroupBuyItem = {
    ...current,
    ...updates,
    // recalculer automatiquement currentQuantity si participants est mis à jour
    currentQuantity: updates.participants 
      ? updates.participants.reduce((acc, p) => acc + (p.quantity || 0), 0)
      : (updates.currentQuantity !== undefined ? updates.currentQuantity : current.currentQuantity)
  };

  // Ajuster le statut si l'objectif est atteint
  if (updated.status === 'open' && updated.currentQuantity >= updated.minQuantity) {
    updated.status = 'goal_reached';
  }

  items[index] = updated;
  saveGroupBuys(items);
  return updated;
}

export function deleteGroupBuy(id: string): boolean {
  const items = getAllGroupBuys();
  const filtered = items.filter(item => item.id.toLowerCase() !== id.trim().toLowerCase());
  if (filtered.length === items.length) return false;
  saveGroupBuys(filtered);
  return true;
}

export interface JoinGroupBuyPayload {
  clientName: string;
  whatsapp: string;
  city: string;
  quantity: number;
  variant?: string;
  notes?: string;
}

export function joinGroupBuy(groupBuyId: string, payload: JoinGroupBuyPayload): {
  groupBuy: GroupBuyItem;
  participant: GroupBuyParticipant;
  ticketId: string;
} {
  const items = getAllGroupBuys();
  const index = items.findIndex(item => item.id.toLowerCase() === groupBuyId.trim().toLowerCase());
  if (index === -1) {
    throw new Error('Vente en groupe introuvable.');
  }

  const groupBuy = items[index];
  const qty = Number(payload.quantity) > 0 ? Number(payload.quantity) : 1;
  const now = new Date().toISOString();

  // 1. Créer le ticket officiel lié à la vente groupée
  const tickets = getAllTickets();
  let newTicketId = generateTicketId();
  while (tickets.some(t => t.id === newTicketId)) {
    newTicketId = generateTicketId();
  }

  const totalItemCFA = groupBuy.priceCFA * qty;
  const depositRequiredCFA = Math.round(totalItemCFA * 0.6); // 60% d'acompte
  const shippingDuration = groupBuy.shippingMode === 'sea' ? '2 à 3 mois' : 'Au plus 1 mois';

  const newTicket = {
    id: newTicketId,
    createdAt: now,
    updatedAt: now,
    shippingMode: groupBuy.shippingMode,
    client: {
      name: payload.clientName.trim(),
      phone: payload.whatsapp.trim(),
      whatsapp: payload.whatsapp.trim(),
      city: payload.city.trim(),
      address: '',
      notes: `Réservation pour la vente en groupe: "${groupBuy.title}". ${payload.notes ? `Note client: ${payload.notes}` : ''}`
    },
    items: [
      {
        id: `item-gb-${Date.now()}`,
        platform: groupBuy.platform || 'shein',
        url: '',
        name: `[Achat Groupé] ${groupBuy.title}`,
        variant: payload.variant?.trim() || '',
        quantity: qty,
        originalPrice: null,
        originalCurrency: 'CFA',
        notes: `Date prévue de passage commande chez le fournisseur : ${groupBuy.orderDate}`,
        unitPriceCFA: groupBuy.priceCFA,
        shippingFeeCFA: 0,
        serviceFeeCFA: 0,
        customsFeeCFA: 0,
        totalItemCFA: totalItemCFA,
        status: 'quoted' as const
      }
    ],
    quote: {
      status: 'ready' as const, // Devis prêt immédiatement avec le tarif négocié !
      subtotalItemsCFA: totalItemCFA,
      totalShippingCFA: 0,
      totalServiceFeeCFA: 0,
      totalCustomsCFA: 0,
      discountCFA: (groupBuy.originalPriceCFA ? (groupBuy.originalPriceCFA - groupBuy.priceCFA) * qty : 0),
      grandTotalCFA: totalItemCFA,
      depositRequiredCFA: depositRequiredCFA,
      depositPaidCFA: 0,
      balanceRemainingCFA: totalItemCFA,
      adminNote: `Tarif spécial Vente en Groupe : ${groupBuy.priceCFA.toLocaleString('fr-FR')} FCFA / unité. Commande déclenchée le ${groupBuy.orderDate}. Acompte de 60% requis pour garantir la réservation.`,
      quotedAt: now
    },
    tracking: {
      currentStatus: 'ready' as const,
      statusLabel: 'Devis Vente Groupée prêt (En attente d’acompte)',
      shippingMode: groupBuy.shippingMode,
      estimatedDelivery: shippingDuration,
      estimatedDeliveryDate: null,
      supplierOrderNumber: `GB-${groupBuy.id.toUpperCase()}`,
      carrierName: null,
      carrierTrackingNumber: null,
      carrierTrackingUrl: null,
      events: createDefaultTimeline('ready', now, groupBuy.shippingMode)
    }
  };

  tickets.unshift(newTicket);
  saveTickets(tickets);

  // 2. Créer l'enregistrement participant
  const participant: GroupBuyParticipant = {
    id: `part-${Date.now().toString(36)}`,
    clientName: payload.clientName.trim(),
    whatsapp: payload.whatsapp.trim(),
    city: payload.city.trim(),
    quantity: qty,
    variant: payload.variant?.trim(),
    notes: payload.notes?.trim(),
    reservedAt: now,
    ticketId: newTicketId,
    depositPaid: false
  };

  groupBuy.participants.unshift(participant);
  groupBuy.currentQuantity = groupBuy.participants.reduce((acc, p) => acc + (p.quantity || 0), 0);

  if (groupBuy.status === 'open' && groupBuy.currentQuantity >= groupBuy.minQuantity) {
    groupBuy.status = 'goal_reached';
  }

  items[index] = groupBuy;
  saveGroupBuys(items);

  return {
    groupBuy,
    participant,
    ticketId: newTicketId
  };
}
