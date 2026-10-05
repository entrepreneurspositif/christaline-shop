export type PlatformType = string;

export type ShippingModeType = 'air' | 'sea';

export type QuoteStatus = 
  | 'pending'          // En attente de chiffrage par l'admin
  | 'ready'            // Devis calculé par l'admin, en attente de paiement acompte
  | 'accepted'         // Devis validé par le client
  | 'paid_deposit'     // Acompte reçu par Christaline Shop
  | 'ordered'          // Commande passée auprès du fournisseur
  | 'in_transit'       // En cours d'acheminement international
  | 'customs'          // Arrivé au Bénin / En dédouanement
  | 'ready_for_pickup' // Disponible / En cours de livraison client
  | 'delivered'        // Colis livré au client
  | 'cancelled';       // Annulée

export interface OrderItem {
  id: string;
  platform: string; // 'shein' | 'temu' | 'alibaba' | custom platform
  url: string;
  name: string;
  variant?: string; // Taille, couleur, modèle
  quantity: number;
  originalPrice?: number | null; // Prix indicatif affiché sur la plateforme
  originalCurrency?: string; // EUR, USD, etc.
  notes?: string;
  
  // Devis en FCFA
  unitPriceCFA: number;       // Prix de l'article en FCFA
  shippingFeeCFA: number;     // Fret éventuel
  serviceFeeCFA: number;      // Commission éventuelle
  customsFeeCFA: number;      // Douane éventuelle
  totalItemCFA: number;       // Total net pour cet article affiché au client
  status: 'pending' | 'quoted' | 'ordered' | 'unavailable';
}

export interface TrackingEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  location?: string;
  completed: boolean;
  current: boolean;
}

export interface TrackingInfo {
  currentStatus: QuoteStatus;
  statusLabel: string;
  shippingMode: ShippingModeType; // 'air' (au plus 1 mois) ou 'sea' (2 à 3 mois)
  estimatedDelivery: string; // Ex: "Au plus 1 mois" ou "2 à 3 mois"
  estimatedDeliveryDate?: string | null;
  supplierOrderNumber?: string | null;
  carrierName?: string | null;
  carrierTrackingNumber?: string | null;
  carrierTrackingUrl?: string | null;
  events: TrackingEvent[];
}

export interface ClientInfo {
  name: string;
  phone: string;
  whatsapp: string;
  city: string;
  address?: string;
  notes?: string;
}

export interface QuoteDetails {
  status: QuoteStatus;
  subtotalItemsCFA: number;
  totalShippingCFA: number;
  totalServiceFeeCFA: number;
  totalCustomsCFA: number;
  discountCFA: number;
  grandTotalCFA: number;
  depositRequiredCFA: number;
  depositPaidCFA: number;
  balanceRemainingCFA: number;
  adminNote?: string;
  quotedAt?: string | null;
}

export interface TicketOrder {
  id: string; // Ex: CS-489215
  createdAt: string;
  updatedAt: string;
  shippingMode: ShippingModeType; // 'air' | 'sea'
  client: ClientInfo;
  items: OrderItem[];
  quote: QuoteDetails;
  tracking: TrackingInfo;
}

export const PLATFORM_CONFIG: Record<string, { name: string; color: string; bg: string; border: string; logoText: string }> = {
  shein: {
    name: 'Shein',
    color: 'text-black',
    bg: 'bg-black text-white',
    border: 'border-black',
    logoText: 'SHEIN'
  },
  temu: {
    name: 'Temu',
    color: 'text-amber-600',
    bg: 'bg-gradient-to-r from-orange-500 to-amber-600 text-white',
    border: 'border-orange-500',
    logoText: 'TEMU'
  },
  alibaba: {
    name: 'Alibaba',
    color: 'text-orange-600',
    bg: 'bg-orange-500 text-white',
    border: 'border-orange-500',
    logoText: 'ALIBABA'
  },
  autre: {
    name: 'Autre plateforme',
    color: 'text-rose-600',
    bg: 'bg-rose-500 text-white',
    border: 'border-rose-400',
    logoText: 'AUTRE'
  }
};

export const STATUS_MAP: Record<QuoteStatus, { label: string; badgeClass: string; stepIndex: number; icon: string }> = {
  pending: {
    label: 'Devis en attente',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
    stepIndex: 0,
    icon: 'Clock'
  },
  ready: {
    label: 'Devis prêt (À valider)',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
    stepIndex: 1,
    icon: 'FileText'
  },
  accepted: {
    label: 'Devis validé par le client',
    badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    stepIndex: 2,
    icon: 'CheckCircle'
  },
  paid_deposit: {
    label: 'Acompte reçu',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    stepIndex: 3,
    icon: 'CreditCard'
  },
  ordered: {
    label: 'Commande validée fournisseur',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-300',
    stepIndex: 4,
    icon: 'ShoppingBag'
  },
  in_transit: {
    label: 'En transit international',
    badgeClass: 'bg-cyan-100 text-cyan-800 border-cyan-300',
    stepIndex: 5,
    icon: 'Plane'
  },
  customs: {
    label: 'Arrivé au Bénin (Dédouanement)',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-400',
    stepIndex: 6,
    icon: 'Building'
  },
  ready_for_pickup: {
    label: 'Prêt pour livraison / retrait',
    badgeClass: 'bg-lime-100 text-lime-800 border-lime-400',
    stepIndex: 7,
    icon: 'Truck'
  },
  delivered: {
    label: 'Colis livré avec succès',
    badgeClass: 'bg-green-100 text-green-800 border-green-400',
    stepIndex: 8,
    icon: 'PackageCheck'
  },
  cancelled: {
    label: 'Commande annulée',
    badgeClass: 'bg-red-100 text-red-800 border-red-300',
    stepIndex: -1,
    icon: 'XCircle'
  }
};

// ==========================================
// VENTES EN GROUPE (ACHATS GROUPÉS)
// ==========================================
export type GroupBuyStatus = 'open' | 'goal_reached' | 'ordered' | 'closed';

export interface GroupBuyParticipant {
  id: string;
  clientName: string;
  whatsapp: string;
  city: string;
  quantity: number;
  variant?: string;
  notes?: string;
  reservedAt: string;
  ticketId?: string;
  depositPaid?: boolean;
}

export interface GroupBuyItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  priceCFA: number;
  originalPriceCFA?: number;
  minQuantity: number;
  currentQuantity: number;
  orderDate: string; // Date où la commande sera passée chez le fournisseur
  shippingMode: ShippingModeType; // 'air' (au plus 1 mois) ou 'sea' (2 à 3 mois)
  platform?: string;
  variants?: string[];
  status: GroupBuyStatus;
  createdAt: string;
  participants: GroupBuyParticipant[];
}
