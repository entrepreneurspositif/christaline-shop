import fs from 'fs';
import path from 'path';
import { TicketOrder, QuoteStatus, OrderItem, TrackingEvent, TrackingInfo, QuoteDetails, STATUS_MAP, ShippingModeType } from './types';
import { getDatabase } from './mongodb';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'tickets.json');

declare global {
  // eslint-disable-next-line no-var
  var __cs_tickets_cache: TicketOrder[] | undefined;
}

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

function readLocalTickets(): TicketOrder[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const data = JSON.parse(raw) as TicketOrder[];
      return data;
    }
  } catch (err) {
    console.error('Erreur lecture locale tickets.json:', err);
  }
  return [];
}

function writeLocalTickets(tickets: TicketOrder[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(tickets, null, 2), 'utf-8');
  } catch (err) {
    // Environnement read-only (ex: Vercel serverless)
  }
}

function stripMongoId<T extends { _id?: any }>(item: T): Omit<T, '_id'> {
  const { _id, ...rest } = item;
  return rest as any;
}

export async function getAllTickets(): Promise<TicketOrder[]> {
  try {
    const db = await getDatabase();
    if (db) {
      const docs = await db.collection('tickets').find({}).toArray();
      const tickets = docs.map(stripMongoId) as TicketOrder[];
      tickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      global.__cs_tickets_cache = tickets;
      return tickets;
    }
  } catch (err) {
    console.error('Erreur getAllTickets depuis MongoDB Atlas:', err);
  }

  // Fallback cache mémoire puis fichier local
  if (global.__cs_tickets_cache && global.__cs_tickets_cache.length > 0) {
    return global.__cs_tickets_cache;
  }
  const local = readLocalTickets();
  global.__cs_tickets_cache = local;
  return local;
}

export function getAllTicketsSync(): TicketOrder[] {
  if (global.__cs_tickets_cache && global.__cs_tickets_cache.length > 0) {
    return global.__cs_tickets_cache;
  }
  const local = readLocalTickets();
  global.__cs_tickets_cache = local;
  return local;
}

export async function getTicketById(id: string): Promise<TicketOrder | null> {
  const cleanId = id.trim().toUpperCase();
  try {
    const db = await getDatabase();
    if (db) {
      const doc = await db.collection('tickets').findOne({ id: cleanId });
      if (doc) {
        return stripMongoId(doc) as TicketOrder;
      }
    }
  } catch (err) {
    console.error('Erreur getTicketById depuis MongoDB Atlas:', err);
  }

  const all = await getAllTickets();
  return all.find(t => t.id.toUpperCase() === cleanId) || null;
}

export async function saveTickets(tickets: TicketOrder[]): Promise<void> {
  global.__cs_tickets_cache = tickets;
  writeLocalTickets(tickets);

  try {
    const db = await getDatabase();
    if (db) {
      const collection = db.collection('tickets');
      await collection.deleteMany({});
      if (tickets.length > 0) {
        await collection.insertMany(tickets);
      }
    }
  } catch (err) {
    console.error('Erreur saveTickets sur MongoDB Atlas:', err);
  }
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

export async function createNewTicket(payload: CreateTicketPayload): Promise<TicketOrder> {
  const tickets = await getAllTickets();
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

  try {
    const db = await getDatabase();
    if (db) {
      await db.collection('tickets').insertOne({ ...newTicket });
    }
  } catch (err) {
    console.error('Erreur createNewTicket MongoDB Atlas:', err);
  }

  tickets.unshift(newTicket);
  global.__cs_tickets_cache = tickets;
  writeLocalTickets(tickets);

  return newTicket;
}

export async function updateTicket(id: string, updates: Partial<TicketOrder>): Promise<TicketOrder | null> {
  const cleanId = id.trim().toUpperCase();
  const now = new Date().toISOString();

  let updatedTicket: TicketOrder | null = null;

  try {
    const db = await getDatabase();
    if (db) {
      const existing = await db.collection('tickets').findOne({ id: cleanId });
      if (existing) {
        const merged = {
          ...stripMongoId(existing),
          ...updates,
          updatedAt: now
        } as TicketOrder;

        await db.collection('tickets').updateOne(
          { id: cleanId },
          { $set: { ...updates, updatedAt: now } }
        );
        updatedTicket = merged;
      }
    }
  } catch (err) {
    console.error('Erreur updateTicket sur MongoDB Atlas:', err);
  }

  const tickets = await getAllTickets();
  const index = tickets.findIndex(t => t.id.toUpperCase() === cleanId);
  if (index !== -1) {
    const merged = {
      ...tickets[index],
      ...updates,
      updatedAt: now
    };
    tickets[index] = merged;
    global.__cs_tickets_cache = tickets;
    writeLocalTickets(tickets);
    if (!updatedTicket) updatedTicket = merged;
  }

  return updatedTicket;
}

export async function deleteTicket(id: string): Promise<boolean> {
  const cleanId = id.trim().toUpperCase();
  let deleted = false;

  try {
    const db = await getDatabase();
    if (db) {
      const res = await db.collection('tickets').deleteOne({ id: cleanId });
      if (res.deletedCount > 0) deleted = true;
    }
  } catch (err) {
    console.error('Erreur deleteTicket sur MongoDB Atlas:', err);
  }

  const tickets = await getAllTickets();
  const filtered = tickets.filter(t => t.id.toUpperCase() !== cleanId);
  if (filtered.length !== tickets.length) {
    deleted = true;
    global.__cs_tickets_cache = filtered;
    writeLocalTickets(filtered);
  }

  return deleted;
}
