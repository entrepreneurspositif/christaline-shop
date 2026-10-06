import fs from 'fs';
import path from 'path';
import { GroupBuyItem, GroupBuyParticipant, GroupBuyStatus, ShippingModeType } from './types';
import { getAllTickets, saveTickets, generateTicketId, createDefaultTimeline } from './storage';
import { getDatabase } from './mongodb';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'group_buys.json');

declare global {
  // eslint-disable-next-line no-var
  var __cs_groupbuys_cache: GroupBuyItem[] | undefined;
}

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
        variant: 'Pointure 38 - Doré Champagne',
        notes: 'Pour mes demoiselles d’honneur',
        reservedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
        ticketId: 'CS-551203',
        depositPaid: false
      }
    ]
  },
  {
    id: 'gb-2',
    title: 'Set 2 Valises Trolley Ultra-Légères TSA',
    description: 'Ensemble de 2 valises rigides en polycarbonate incassable avec cadenas TSA intégré, 4 roues pivotantes 360° silencieuses et poignée télescopique.',
    imageUrl: 'https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?w=800&auto=format&fit=crop&q=80',
    priceCFA: 49000,
    originalPriceCFA: 75000,
    minQuantity: 8,
    currentQuantity: 8,
    orderDate: '2026-10-18',
    shippingMode: 'sea',
    platform: 'alibaba',
    variants: [
      'Gris Anthracite (Grand & Moyen)',
      'Rose Gold Glamour (Grand & Moyen)',
      'Noir Mat Élégant (Grand & Moyen)',
      'Bleu Nuit (Grand & Moyen)'
    ],
    status: 'goal_reached',
    createdAt: new Date(Date.now() - 5 * 86400 * 1000).toISOString(),
    participants: [
      {
        id: 'part-4',
        clientName: 'Gervais Agbessi',
        whatsapp: '0195223344',
        city: 'Porto-Novo',
        quantity: 2,
        variant: 'Noir Mat Élégant (Grand & Moyen)',
        notes: 'Prêt pour départ en mission',
        reservedAt: new Date(Date.now() - 4 * 86400 * 1000).toISOString(),
        ticketId: 'CS-551204',
        depositPaid: true
      },
      {
        id: 'part-5',
        clientName: 'Tatiana Hounkpatin',
        whatsapp: '0161884422',
        city: 'Cotonou - Haie Vive',
        quantity: 3,
        variant: 'Rose Gold Glamour (Grand & Moyen)',
        notes: 'Voyage familial',
        reservedAt: new Date(Date.now() - 3 * 86400 * 1000).toISOString(),
        ticketId: 'CS-551205',
        depositPaid: true
      },
      {
        id: 'part-6',
        clientName: 'Michel Houndé',
        whatsapp: '0197001199',
        city: 'Cotonou - Maro-Militaire',
        quantity: 3,
        variant: 'Gris Anthracite (Grand & Moyen)',
        notes: 'Acompte versé en agence',
        reservedAt: new Date(Date.now() - 1 * 86400 * 1000).toISOString(),
        ticketId: 'CS-551206',
        depositPaid: true
      }
    ]
  },
  {
    id: 'gb-3',
    title: 'Kit Studio Créateur Ring Light 45cm + Trépied Pro 2.1m',
    description: 'Anneau lumineux LED puissant 55W avec télécommande sans fil, réglage température 3000K-6000K, 3 supports téléphones pour tournages TikTok et Lives.',
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80',
    priceCFA: 22500,
    originalPriceCFA: 35000,
    minQuantity: 15,
    currentQuantity: 11,
    orderDate: '2026-10-22',
    shippingMode: 'air',
    platform: 'temu',
    variants: [
      'Pack Ring Light + Trépied + Télécommande',
      'Pack Pro avec Micro Cravate Sans Fil Inclus (+5000 F)'
    ],
    status: 'open',
    createdAt: new Date(Date.now() - 2 * 86400 * 1000).toISOString(),
    participants: [
      {
        id: 'part-7',
        clientName: 'Estelle Kpadonou',
        whatsapp: '0167332211',
        city: 'Cotonou - Sainte Rita',
        quantity: 2,
        variant: 'Pack Ring Light + Trépied + Télécommande',
        notes: 'Pour création de contenu boutique de perruques',
        reservedAt: new Date(Date.now() - 1 * 86400 * 1000).toISOString(),
        ticketId: 'CS-551207',
        depositPaid: true
      },
      {
        id: 'part-8',
        clientName: 'Bénédicte Alapini',
        whatsapp: '0196884433',
        city: 'Abomey-Calavi',
        quantity: 1,
        variant: 'Pack Ring Light + Trépied + Télécommande',
        notes: '',
        reservedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
        ticketId: 'CS-551208',
        depositPaid: false
      }
    ]
  },
  {
    id: 'gb-4',
    title: 'Mixeur Portable Smoothie Rechargeable USB-C',
    description: 'Mini blender 6 lames en acier inoxydable, batterie puissante 4000mAh, bol sans BPA 450ml étanche. Idéal sport, bureau et voyages.',
    imageUrl: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=800&auto=format&fit=crop&q=80',
    priceCFA: 9500,
    originalPriceCFA: 16000,
    minQuantity: 20,
    currentQuantity: 5,
    orderDate: '2026-10-25',
    shippingMode: 'air',
    platform: 'shein',
    variants: [
      'Vert Menthe Pastel',
      'Rose Poudré',
      'Blanc Épuré',
      'Noir Mat'
    ],
    status: 'open',
    createdAt: new Date(Date.now() - 1 * 86400 * 1000).toISOString(),
    participants: []
  }
];

function readLocalGroupBuys(): GroupBuyItem[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const data = JSON.parse(raw) as GroupBuyItem[];
      return data;
    }
  } catch (err) {
    console.error('Erreur lecture group_buys.json locale:', err);
  }
  return INITIAL_GROUP_BUYS;
}

function writeLocalGroupBuys(items: GroupBuyItem[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 2), 'utf-8');
  } catch (err) {
    // Environnement read-only (ex: Vercel serverless)
  }
}

function stripMongoId<T extends { _id?: any }>(item: T): Omit<T, '_id'> {
  const { _id, ...rest } = item;
  return rest as any;
}

export async function getAllGroupBuys(): Promise<GroupBuyItem[]> {
  try {
    const db = await getDatabase();
    if (db) {
      const docs = await db.collection('group_buys').find({}).toArray();
      const items = docs.map(stripMongoId) as GroupBuyItem[];
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      global.__cs_groupbuys_cache = items;
      return items;
    }
  } catch (err) {
    console.error('Erreur getAllGroupBuys MongoDB Atlas:', err);
  }

  if (global.__cs_groupbuys_cache && global.__cs_groupbuys_cache.length > 0) {
    return global.__cs_groupbuys_cache;
  }
  const local = readLocalGroupBuys();
  global.__cs_groupbuys_cache = local;
  return local;
}

export function getAllGroupBuysSync(): GroupBuyItem[] {
  if (global.__cs_groupbuys_cache && global.__cs_groupbuys_cache.length > 0) {
    return global.__cs_groupbuys_cache;
  }
  const local = readLocalGroupBuys();
  global.__cs_groupbuys_cache = local;
  return local;
}

export async function saveGroupBuys(items: GroupBuyItem[]): Promise<void> {
  global.__cs_groupbuys_cache = items;
  writeLocalGroupBuys(items);

  try {
    const db = await getDatabase();
    if (db) {
      const collection = db.collection('group_buys');
      await collection.deleteMany({});
      if (items.length > 0) {
        await collection.insertMany(items);
      }
    }
  } catch (err) {
    console.error('Erreur saveGroupBuys sur MongoDB Atlas:', err);
  }
}

export async function getGroupBuyById(id: string): Promise<GroupBuyItem | null> {
  const cleanId = id.trim().toLowerCase();
  try {
    const db = await getDatabase();
    if (db) {
      const doc = await db.collection('group_buys').findOne({ id: cleanId });
      if (doc) return stripMongoId(doc) as GroupBuyItem;
    }
  } catch (err) {
    console.error('Erreur getGroupBuyById sur MongoDB Atlas:', err);
  }

  const items = await getAllGroupBuys();
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

export async function createGroupBuy(payload: CreateGroupBuyPayload): Promise<GroupBuyItem> {
  const items = await getAllGroupBuys();
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

  try {
    const db = await getDatabase();
    if (db) {
      await db.collection('group_buys').insertOne({ ...newItem });
    }
  } catch (err) {
    console.error('Erreur createGroupBuy sur MongoDB Atlas:', err);
  }

  items.unshift(newItem);
  global.__cs_groupbuys_cache = items;
  writeLocalGroupBuys(items);

  return newItem;
}

export async function updateGroupBuy(id: string, updates: Partial<GroupBuyItem>): Promise<GroupBuyItem | null> {
  const cleanId = id.trim().toLowerCase();
  let updatedItem: GroupBuyItem | null = null;

  try {
    const db = await getDatabase();
    if (db) {
      const existing = await db.collection('group_buys').findOne({ id: cleanId });
      if (existing) {
        const merged = {
          ...stripMongoId(existing),
          ...updates
        } as GroupBuyItem;

        if (updates.participants) {
          merged.currentQuantity = updates.participants.reduce((acc, p) => acc + (p.quantity || 0), 0);
        }

        if (merged.status === 'open' && merged.currentQuantity >= merged.minQuantity) {
          merged.status = 'goal_reached';
        }

        await db.collection('group_buys').updateOne(
          { id: cleanId },
          { $set: merged }
        );
        updatedItem = merged;
      }
    }
  } catch (err) {
    console.error('Erreur updateGroupBuy sur MongoDB Atlas:', err);
  }

  const items = await getAllGroupBuys();
  const index = items.findIndex(item => item.id.toLowerCase() === cleanId);
  if (index !== -1) {
    const current = items[index];
    const merged: GroupBuyItem = {
      ...current,
      ...updates,
      currentQuantity: updates.participants 
        ? updates.participants.reduce((acc, p) => acc + (p.quantity || 0), 0)
        : (updates.currentQuantity !== undefined ? updates.currentQuantity : current.currentQuantity)
    };

    if (merged.status === 'open' && merged.currentQuantity >= merged.minQuantity) {
      merged.status = 'goal_reached';
    }

    items[index] = merged;
    global.__cs_groupbuys_cache = items;
    writeLocalGroupBuys(items);
    if (!updatedItem) updatedItem = merged;
  }

  return updatedItem;
}

export async function deleteGroupBuy(id: string): Promise<boolean> {
  const cleanId = id.trim().toLowerCase();
  let deleted = false;

  try {
    const db = await getDatabase();
    if (db) {
      const res = await db.collection('group_buys').deleteOne({ id: cleanId });
      if (res.deletedCount > 0) deleted = true;
    }
  } catch (err) {
    console.error('Erreur deleteGroupBuy sur MongoDB Atlas:', err);
  }

  const items = await getAllGroupBuys();
  const filtered = items.filter(item => item.id.toLowerCase() !== cleanId);
  if (filtered.length !== items.length) {
    deleted = true;
    global.__cs_groupbuys_cache = filtered;
    writeLocalGroupBuys(filtered);
  }

  return deleted;
}

export interface JoinGroupBuyPayload {
  clientName: string;
  whatsapp: string;
  city: string;
  quantity: number;
  variant?: string;
  notes?: string;
}

export async function joinGroupBuy(groupBuyId: string, payload: JoinGroupBuyPayload): Promise<{
  groupBuy: GroupBuyItem;
  participant: GroupBuyParticipant;
  ticketId: string;
}> {
  const groupBuy = await getGroupBuyById(groupBuyId);
  if (!groupBuy) {
    throw new Error('Vente en groupe introuvable.');
  }

  const qty = Number(payload.quantity) > 0 ? Number(payload.quantity) : 1;
  const now = new Date().toISOString();

  // 1. Créer le ticket officiel lié à la vente groupée
  const tickets = await getAllTickets();
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
  await saveTickets(tickets);

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

  const updatedParticipants = [participant, ...groupBuy.participants];
  const updated = await updateGroupBuy(groupBuyId, {
    participants: updatedParticipants
  });

  return {
    groupBuy: updated || groupBuy,
    participant,
    ticketId: newTicketId
  };
}
