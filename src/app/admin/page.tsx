'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  TicketOrder, 
  OrderItem, 
  QuoteStatus, 
  STATUS_MAP, 
  PLATFORM_CONFIG,
  ShippingModeType,
  GroupBuyItem,
  GroupBuyParticipant,
  GroupBuyStatus
} from '@/lib/types';
import { AppSettings, PaymentAccount, StorePlatform } from '@/lib/settings';
import { 
  ShieldCheck, 
  Lock, 
  Search, 
  Edit3, 
  ExternalLink, 
  Save, 
  X, 
  CheckCircle2, 
  Clock, 
  ShoppingBag, 
  MessageCircle, 
  DollarSign, 
  Trash2, 
  AlertCircle,
  Eye,
  RefreshCw,
  Plus,
  Plane,
  Ship,
  CreditCard,
  Settings,
  Layers,
  ToggleLeft,
  ToggleRight,
  Users,
  Calendar,
  TrendingUp,
  Percent,
  Sparkles
} from 'lucide-react';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Données Tickets
  const [tickets, setTickets] = useState<TicketOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeAdminTab, setActiveAdminTab] = useState<'tickets' | 'group_buys' | 'platforms' | 'settings'>('tickets');

  // Ventes en Groupe
  const [groupBuys, setGroupBuys] = useState<GroupBuyItem[]>([]);
  const [loadingGb, setLoadingGb] = useState(false);
  const [showGbModal, setShowGbModal] = useState(false);
  const [editingGb, setEditingGb] = useState<GroupBuyItem | null>(null);
  const [viewingParticipantsGb, setViewingParticipantsGb] = useState<GroupBuyItem | null>(null);

  // Formulaire Vente en Groupe
  const [gbTitle, setGbTitle] = useState('');
  const [gbDescription, setGbDescription] = useState('');
  const [gbImageUrl, setGbImageUrl] = useState('');
  const [gbPriceCFA, setGbPriceCFA] = useState<number | ''>('');
  const [gbOriginalPriceCFA, setGbOriginalPriceCFA] = useState<number | ''>('');
  const [gbMinQty, setGbMinQty] = useState<number>(10);
  const [gbOrderDate, setGbOrderDate] = useState('');
  const [gbShippingMode, setGbShippingMode] = useState<ShippingModeType>('air');
  const [gbPlatform, setGbPlatform] = useState('shein');
  const [gbVariants, setGbVariants] = useState('');
  const [gbStatus, setGbStatus] = useState<GroupBuyStatus>('open');
  const [gbError, setGbError] = useState<string | null>(null);
  const [gbSuccess, setGbSuccess] = useState(false);

  // Paramètres & Plateformes
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Formulaire d'ajout de nouvelle plateforme
  const [newPlatformName, setNewPlatformName] = useState('');
  const [newPlatformBadge, setNewPlatformBadge] = useState('');
  const [newPlatformBg, setNewPlatformBg] = useState('bg-purple-600 text-white');

  // Modal d'édition Ticket
  const [selectedTicket, setSelectedTicket] = useState<TicketOrder | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Formulaire d'édition dans le modal
  const [editStatus, setEditStatus] = useState<QuoteStatus>('pending');
  const [editShippingMode, setEditShippingMode] = useState<ShippingModeType>('air');
  const [editItems, setEditItems] = useState<OrderItem[]>([]);
  const [editAdminNote, setEditAdminNote] = useState('');
  const [editDepositRequired, setEditDepositRequired] = useState(0);
  const [editDepositPaid, setEditDepositPaid] = useState(0);
  const [editDiscount, setEditDiscount] = useState(0);
  const [editSupplierOrderNumber, setEditSupplierOrderNumber] = useState('');
  const [editCarrierTrackingNumber, setEditCarrierTrackingNumber] = useState('');
  const [editCarrierName, setEditCarrierName] = useState('');
  const [newTimelineStepTitle, setNewTimelineStepTitle] = useState('');
  const [newTimelineStepDesc, setNewTimelineStepDesc] = useState('');

  useEffect(() => {
    const isAuth = sessionStorage.getItem('cs_admin_auth');
    if (isAuth === 'true') {
      setIsAuthenticated(true);
      fetchTickets();
      fetchSettings();
      fetchGroupBuys();
    }
  }, []);

  const fetchGroupBuys = async () => {
    try {
      setLoadingGb(true);
      const res = await fetch('/api/group-buys');
      const data = await res.json();
      if (data.success && Array.isArray(data.groupBuys)) {
        setGroupBuys(data.groupBuys);
      }
    } catch (err) {
      console.error('Erreur chargement ventes groupées:', err);
    } finally {
      setLoadingGb(false);
    }
  };

  const handleOpenCreateGb = () => {
    setEditingGb(null);
    setGbTitle('');
    setGbDescription('');
    setGbImageUrl('https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&auto=format&fit=crop&q=80');
    setGbPriceCFA('');
    setGbOriginalPriceCFA('');
    setGbMinQty(10);
    setGbOrderDate(new Date(Date.now() + 7 * 86400 * 1000).toISOString().split('T')[0]);
    setGbShippingMode('air');
    setGbPlatform('shein');
    setGbVariants('Taille S, Taille M, Taille L');
    setGbStatus('open');
    setGbError(null);
    setShowGbModal(true);
  };

  const handleOpenEditGb = (item: GroupBuyItem) => {
    setEditingGb(item);
    setGbTitle(item.title);
    setGbDescription(item.description);
    setGbImageUrl(item.imageUrl);
    setGbPriceCFA(item.priceCFA);
    setGbOriginalPriceCFA(item.originalPriceCFA || '');
    setGbMinQty(item.minQuantity);
    setGbOrderDate(item.orderDate);
    setGbShippingMode(item.shippingMode);
    setGbPlatform(item.platform || 'shein');
    setGbVariants(item.variants ? item.variants.join(', ') : '');
    setGbStatus(item.status);
    setGbError(null);
    setShowGbModal(true);
  };

  const handleSaveGroupBuy = async (e: React.FormEvent) => {
    e.preventDefault();
    setGbError(null);

    if (!gbTitle.trim() || !gbPriceCFA || !gbMinQty || !gbOrderDate.trim()) {
      setGbError('Veuillez remplir le titre, le prix, la quantité minimum et la date de commande.');
      return;
    }

    try {
      const payload = {
        title: gbTitle.trim(),
        description: gbDescription.trim(),
        imageUrl: gbImageUrl.trim(),
        priceCFA: Number(gbPriceCFA),
        originalPriceCFA: gbOriginalPriceCFA ? Number(gbOriginalPriceCFA) : undefined,
        minQuantity: Number(gbMinQty),
        orderDate: gbOrderDate.trim(),
        shippingMode: gbShippingMode,
        platform: gbPlatform,
        variants: gbVariants.split(',').map(v => v.trim()).filter(Boolean),
        status: gbStatus
      };

      if (editingGb) {
        const res = await fetch(`/api/group-buys/${editingGb.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || 'Erreur mise à jour');
        setGroupBuys(prev => prev.map(g => g.id === editingGb.id ? data.groupBuy : g));
      } else {
        const res = await fetch('/api/group-buys', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || 'Erreur création');
        setGroupBuys(prev => [data.groupBuy, ...prev]);
      }

      setShowGbModal(false);
      setGbSuccess(true);
      setTimeout(() => setGbSuccess(false), 3000);
    } catch (err: any) {
      setGbError(err.message || 'Une erreur est survenue');
    }
  };

  const handleDeleteGroupBuy = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer cet article de vente en groupe ?')) return;
    try {
      const res = await fetch(`/api/group-buys/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setGroupBuys(prev => prev.filter(g => g.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChangeGb = async (id: string, newStatus: GroupBuyStatus) => {
    try {
      const res = await fetch(`/api/group-buys/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setGroupBuys(prev => prev.map(g => g.id === id ? data.groupBuy : g));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123' || password === '0154072488' || password === 'admin') {
      setIsAuthenticated(true);
      sessionStorage.setItem('cs_admin_auth', 'true');
      setAuthError('');
      fetchTickets();
      fetchSettings();
      fetchGroupBuys();
    } else {
      setAuthError('Mot de passe incorrect. (Indice : admin123)');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('cs_admin_auth');
  };

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tickets');
      const data = await res.json();
      if (data.success) {
        setTickets(data.tickets);
      }
    } catch (err) {
      console.error('Erreur chargement tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success) {
        setSettings(data.settings);
      }
    } catch (err) {
      console.error('Erreur chargement paramètres:', err);
    }
  };

  const saveSettingsToServer = async (newSettings: AppSettings) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });
      const data = await res.json();
      if (data.success) {
        setSettings(data.settings);
        setSettingsSuccess(true);
        setTimeout(() => setSettingsSuccess(false), 3000);
      }
    } catch (err) {
      alert('Erreur enregistrement');
    }
  };

  // Basculer l'état actif/inactif d'une plateforme (ex: réactiver Alibaba en 1 clic)
  const togglePlatform = (pltId: string) => {
    if (!settings) return;
    const updated = settings.platforms.map(p => 
      p.id === pltId ? { ...p, enabled: !p.enabled } : p
    );
    const newSettings = { ...settings, platforms: updated };
    setSettings(newSettings);
    saveSettingsToServer(newSettings);
  };

  // Ajouter une nouvelle plateforme de vente
  const handleAddPlatform = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings || !newPlatformName.trim()) return;

    const id = newPlatformName.trim().toLowerCase().replace(/\s+/g, '-');
    if (settings.platforms.some(p => p.id === id)) {
      alert('Cette plateforme existe déjà !');
      return;
    }

    const newPlt: StorePlatform = {
      id,
      name: newPlatformName.trim(),
      logoText: (newPlatformBadge.trim() || newPlatformName.trim()).toUpperCase(),
      bg: newPlatformBg,
      border: 'border-transparent',
      color: 'text-white',
      enabled: true
    };

    const newSettings = {
      ...settings,
      platforms: [...settings.platforms, newPlt]
    };

    setSettings(newSettings);
    saveSettingsToServer(newSettings);
    setNewPlatformName('');
    setNewPlatformBadge('');
  };

  // Supprimer une plateforme personnalisée
  const handleDeletePlatform = (pltId: string) => {
    if (!settings) return;
    if (pltId === 'shein' || pltId === 'temu') {
      alert('Vous ne pouvez pas supprimer Shein ou Temu. Vous pouvez simplement les désactiver.');
      return;
    }
    if (!confirm('Supprimer cette plateforme ?')) return;

    const newSettings = {
      ...settings,
      platforms: settings.platforms.filter(p => p.id !== pltId)
    };
    setSettings(newSettings);
    saveSettingsToServer(newSettings);
  };

  const openEditModal = (t: TicketOrder) => {
    setSelectedTicket(t);
    setEditStatus(t.quote.status);
    setEditShippingMode(t.shippingMode || 'air');
    setEditItems(JSON.parse(JSON.stringify(t.items)));
    setEditAdminNote(t.quote.adminNote || '');
    setEditDepositRequired(t.quote.depositRequiredCFA || 0);
    setEditDepositPaid(t.quote.depositPaidCFA || 0);
    setEditDiscount(t.quote.discountCFA || 0);
    setEditSupplierOrderNumber(t.tracking.supplierOrderNumber || '');
    setEditCarrierTrackingNumber(t.tracking.carrierTrackingNumber || '');
    setEditCarrierName(t.tracking.carrierName || (t.shippingMode === 'sea' ? 'Fret Maritime Cotonou' : 'Cargo Aérien Cotonou'));
    setNewTimelineStepTitle('');
    setNewTimelineStepDesc('');
    setSaveSuccess(false);
    setSaveError(null);
    setIsEditing(true);
  };

  const updateItemTotalPrice = (idx: number, val: number) => {
    const updated = [...editItems];
    const it = { ...updated[idx], totalItemCFA: val, unitPriceCFA: val };
    updated[idx] = it;
    setEditItems(updated);
  };

  const computedGrandTotal = Math.max(0, editItems.reduce((acc, it) => acc + (it.totalItemCFA || 0), 0) - editDiscount);
  const computedBalanceRemaining = Math.max(0, computedGrandTotal - editDepositPaid);

  const handleSaveTicket = async () => {
    if (!selectedTicket) return;
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const estimatedDelivery = editShippingMode === 'sea' ? '2 à 3 mois' : 'Au plus 1 mois';

      const payload: any = {
        shippingMode: editShippingMode,
        items: editItems,
        status: editStatus,
        quote: {
          status: editStatus,
          subtotalItemsCFA: computedGrandTotal + editDiscount,
          discountCFA: editDiscount,
          grandTotalCFA: computedGrandTotal,
          depositRequiredCFA: editDepositRequired || Math.round(computedGrandTotal * 0.6),
          depositPaidCFA: editDepositPaid,
          balanceRemainingCFA: computedBalanceRemaining,
          adminNote: editAdminNote
        },
        tracking: {
          shippingMode: editShippingMode,
          estimatedDelivery,
          supplierOrderNumber: editSupplierOrderNumber.trim() || null,
          carrierTrackingNumber: editCarrierTrackingNumber.trim() || null,
          carrierName: editCarrierName.trim() || null
        }
      };

      if (newTimelineStepTitle.trim()) {
        payload.tracking.customEvent = {
          title: newTimelineStepTitle.trim(),
          description: newTimelineStepDesc.trim() || 'Étape enregistrée par Christaline Shop Bénin',
          location: editShippingMode === 'sea' ? 'Port Autonome de Cotonou' : 'Hub Cotonou'
        };
      }

      const res = await fetch(`/api/tickets/${selectedTicket.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erreur lors de la sauvegarde');
      }

      setSaveSuccess(true);
      setTickets(tickets.map(t => t.id === selectedTicket.id ? data.ticket : t));
      setSelectedTicket(data.ticket);

      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);

    } catch (err: any) {
      setSaveError(err.message || 'Erreur inconnue');
    }
  };

  const handleDeleteTicket = async (id: string) => {
    if (!confirm(`Confirmez-vous la suppression du ticket ${id} ?`)) return;

    try {
      const res = await fetch(`/api/tickets/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTickets(tickets.filter(t => t.id !== id));
        if (selectedTicket?.id === id) {
          setIsEditing(false);
          setSelectedTicket(null);
        }
      }
    } catch (err) {
      alert('Erreur suppression');
    }
  };

  const generateClientWhatsAppMessage = (t: TicketOrder) => {
    const total = t.quote.grandTotalCFA > 0 ? `${new Intl.NumberFormat('fr-FR').format(t.quote.grandTotalCFA)} FCFA` : '';
    const deposit = t.quote.depositRequiredCFA > 0 ? `${new Intl.NumberFormat('fr-FR').format(t.quote.depositRequiredCFA)} FCFA` : '';
    const currentUrl = typeof window !== 'undefined' ? `${window.location.origin}/ticket/${t.id}` : `https://christaline.shop/ticket/${t.id}`;
    const modeLabel = t.shippingMode === 'sea' ? 'Voie Maritime (2 à 3 mois)' : 'Voie Aérienne (Au plus 1 mois)';

    let msg = `Bonjour ${t.client.name} ! 🌸\nC'est l'équipe Christaline Shop Bénin concernant votre ticket *${t.id}*.\n\n`;

    if (t.quote.status === 'ready') {
      msg += `✨ Votre devis est prêt !\n`
        + `💰 Montant total de vos articles : *${total}*\n`
        + `💵 Acompte pour valider la commande : *${deposit}*\n`
        + `📦 Mode de livraison : *${modeLabel}*\n\n`
        + `👉 Consultez votre ticket et les instructions de paiement Mobile Money ici :\n${currentUrl}\n\n`
        + `Paiement accepté : MTN Mobile Money Bénin, Moov Money Bénin, Celtiis Cash.`;
    } else if (t.quote.status === 'in_transit') {
      msg += `🚢✈️ Bonne nouvelle ! Vos articles ont été expédiés (${modeLabel}) et sont en route vers le Bénin.\n`
        + `👉 Suivez l'avancée de votre colis en direct sur votre ticket :\n${currentUrl}`;
    } else if (t.quote.status === 'ready_for_pickup') {
      msg += `🎉 Vos articles sont arrivés à Cotonou et sont prêts pour la livraison !\n`
        + `💵 Solde restant à régler : ${new Intl.NumberFormat('fr-FR').format(t.quote.balanceRemainingCFA)} FCFA\n`
        + `Merci de nous confirmer votre adresse exacte pour la remise du colis.`;
    } else {
      msg += `📌 Mise à jour de votre commande : *${t.tracking.statusLabel}*\n`
        + `👉 Consultez l'état d'avancement ici : ${currentUrl}`;
    }

    const cleanPhone = t.client.whatsapp.replace(/\D/g, '');
    const phoneWithCode = cleanPhone.startsWith('229') ? cleanPhone : `229${cleanPhone}`;
    return `https://wa.me/${phoneWithCode}?text=${encodeURIComponent(msg)}`;
  };

  const filteredTickets = tickets.filter(t => {
    const matchesStatus = statusFilter === 'all' || t.quote.status === statusFilter;
    const matchesSearch = searchQuery === '' || 
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.client.phone.includes(searchQuery) ||
      t.client.city.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const countPending = tickets.filter(t => t.quote.status === 'pending').length;
  const countReady = tickets.filter(t => t.quote.status === 'ready').length;
  const countInTransit = tickets.filter(t => ['paid_deposit', 'ordered', 'in_transit', 'customs'].includes(t.quote.status)).length;
  const countDelivered = tickets.filter(t => t.quote.status === 'delivered').length;
  const totalVolume = tickets.reduce((acc, t) => acc + (t.quote.grandTotalCFA || 0), 0);
  const totalCollected = tickets.reduce((acc, t) => acc + (t.quote.depositPaidCFA || 0), 0);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-stone-900 text-stone-100">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-stone-800 rounded-3xl p-8 border border-stone-700 shadow-2xl space-y-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 text-white flex items-center justify-center mx-auto shadow-lg">
              <Lock className="w-8 h-8" />
            </div>

            <div>
              <h1 className="text-2xl font-black text-white font-serif">
                Espace Gestion Christaline • Bénin
              </h1>
              <p className="text-xs text-stone-400 mt-1">
                Accès réservé pour chiffrer les devis et gérer le suivi des commandes
              </p>
            </div>

            {authError && (
              <div className="p-3 bg-red-950/60 border border-red-800 rounded-xl text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <input
                  type="password"
                  required
                  placeholder="Mot de passe d'administration"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-stone-900 border border-stone-700 text-white text-sm focus:border-rose-500 outline-hidden text-center"
                />
                <p className="text-[11px] text-stone-500 mt-2">
                  (Mot de passe par défaut : <code>admin123</code> ou <code>0154072488</code>)
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-rose-950 cursor-pointer"
              >
                Accéder au Tableau de Bord
              </button>
            </form>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-stone-100">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        
        {/* BANDEAU EN-TÊTE ADMIN AVEC ONGLETS */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-md border border-rose-200">
                Administration Bénin
              </span>
              <span className="text-xs text-stone-400">Christaline Shop</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 font-serif mt-1">
              Tableau de Bord & Paramètres
            </h1>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar max-w-full pb-1">
            {/* Boutons d'onglets (titres courts & scroll mobile) */}
            <button
              onClick={() => setActiveAdminTab('tickets')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeAdminTab === 'tickets'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Commandes ({tickets.length})</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('group_buys')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeAdminTab === 'group_buys'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Ventes Groupe ({groupBuys.length})</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('platforms')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeAdminTab === 'platforms'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Plateformes</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('settings')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeAdminTab === 'settings'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Mobile Money</span>
            </button>

            <button
              onClick={() => { fetchTickets(); fetchSettings(); fetchGroupBuys(); }}
              disabled={loading || loadingGb}
              className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors shrink-0 cursor-pointer"
              title="Actualiser"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading || loadingGb ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={handleLogout}
              className="px-3 py-2 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-600 text-xs font-semibold cursor-pointer"
            >
              Déconnexion
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* ONGLET 1 : GESTION DES COMMANDES & DEVIS */}
        {/* ============================================================ */}
        {activeAdminTab === 'tickets' && (
          <div className="space-y-8">
            
            {/* KPI STATISTIQUES */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-2xs">
                <div className="flex items-center justify-between text-stone-400 text-xs font-bold uppercase">
                  <span>Total Tickets</span>
                  <ShoppingBag className="w-4 h-4 text-stone-500" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-stone-900 mt-2">
                  {tickets.length}
                </div>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-amber-200 shadow-2xs bg-amber-50/20">
                <div className="flex items-center justify-between text-amber-700 text-xs font-bold uppercase">
                  <span>À Chiffrer</span>
                  <Clock className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-amber-700 mt-2">
                  {countPending}
                </div>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-blue-200 shadow-2xs bg-blue-50/20">
                <div className="flex items-center justify-between text-blue-700 text-xs font-bold uppercase">
                  <span>Devis Prêts</span>
                  <Edit3 className="w-4 h-4 text-blue-500" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-blue-700 mt-2">
                  {countReady}
                </div>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-cyan-200 shadow-2xs bg-cyan-50/20">
                <div className="flex items-center justify-between text-cyan-700 text-xs font-bold uppercase">
                  <span>En Transit Bénin</span>
                  <Plane className="w-4 h-4 text-cyan-500" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-cyan-700 mt-2">
                  {countInTransit}
                </div>
              </div>

              <div className="col-span-2 lg:col-span-1 bg-white p-4 sm:p-5 rounded-2xl border border-emerald-200 shadow-2xs bg-emerald-50/20">
                <div className="flex items-center justify-between text-emerald-700 text-xs font-bold uppercase">
                  <span>Acomptes Encaissés</span>
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-emerald-700 mt-2">
                  {new Intl.NumberFormat('fr-FR').format(totalCollected)} <span className="text-xs font-normal">F</span>
                </div>
              </div>
            </div>

            {/* TABLEAU DES COMMANDES */}
            <div className="bg-white p-4 sm:p-6 rounded-3xl border border-stone-200 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-96">
                  <input
                    type="text"
                    placeholder="Rechercher par N° ticket, client, téléphone, ville..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:border-rose-500 outline-hidden"
                  />
                  <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                </div>

                <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
                  {[
                    { id: 'all', label: 'Tous' },
                    { id: 'pending', label: 'À chiffrer' },
                    { id: 'ready', label: 'Devis prêts' },
                    { id: 'in_transit', label: 'En transit' },
                    { id: 'delivered', label: 'Livrés' }
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setStatusFilter(f.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        statusFilter === f.id
                          ? 'bg-rose-600 text-white'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-stone-50 text-stone-500 uppercase text-[11px] font-bold border-y border-stone-200">
                    <tr>
                      <th className="py-3 px-4">Ticket</th>
                      <th className="py-3 px-4">Client (Bénin)</th>
                      <th className="py-3 px-4">Articles & Mode</th>
                      <th className="py-3 px-4">Statut</th>
                      <th className="py-3 px-4">Prix Total</th>
                      <th className="py-3 px-4">Acompte</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 font-medium">
                    {filteredTickets.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-stone-400 text-sm">
                          Aucun ticket correspondant aux critères.
                        </td>
                      </tr>
                    ) : (
                      filteredTickets.map((t) => {
                        const st = STATUS_MAP[t.quote.status] || STATUS_MAP.pending;
                        const isSea = t.shippingMode === 'sea';

                        return (
                          <tr key={t.id} className="hover:bg-rose-50/30 transition-colors">
                            <td className="py-3.5 px-4 font-mono font-black text-rose-700 whitespace-nowrap">
                              {t.id}
                              <div className="text-[10px] text-stone-400 font-sans font-normal">
                                {new Date(t.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                              </div>
                            </td>

                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <div className="font-bold text-stone-900">{t.client.name}</div>
                              <div className="text-xs text-stone-500 flex items-center gap-1">
                                <span>{t.client.phone}</span>
                                <span>•</span>
                                <span className="text-stone-400">{t.client.city}</span>
                              </div>
                            </td>

                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-1.5 mb-1">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                                  isSea ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                                }`}>
                                  {isSea ? <Ship className="w-2.5 h-2.5" /> : <Plane className="w-2.5 h-2.5" />}
                                  <span>{isSea ? 'Maritime (2-3 mois)' : 'Aérien (≤ 1 mois)'}</span>
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {t.items.map((it, i) => (
                                  <span 
                                    key={i} 
                                    className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-stone-800 text-white uppercase"
                                  >
                                    {it.platform} (x{it.quantity})
                                  </span>
                                ))}
                              </div>
                            </td>

                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${st.badgeClass}`}>
                                {st.label}
                              </span>
                            </td>

                            <td className="py-3.5 px-4 font-bold text-stone-900 whitespace-nowrap">
                              {t.quote.grandTotalCFA > 0 
                                ? `${new Intl.NumberFormat('fr-FR').format(t.quote.grandTotalCFA)} F`
                                : <span className="text-amber-600 text-xs italic">À chiffrer</span>
                              }
                            </td>

                            <td className="py-3.5 px-4 whitespace-nowrap">
                              {t.quote.depositPaidCFA > 0 ? (
                                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-xs">
                                  {new Intl.NumberFormat('fr-FR').format(t.quote.depositPaidCFA)} F
                                </span>
                              ) : (
                                <span className="text-stone-400 text-xs">Non versé</span>
                              )}
                            </td>

                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                <a
                                  href={generateClientWhatsAppMessage(t)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                                  title="Envoyer devis ou suivi sur WhatsApp"
                                >
                                  <MessageCircle className="w-3.5 h-3.5 fill-emerald-600" />
                                </a>

                                <Link
                                  href={`/ticket/${t.id}`}
                                  target="_blank"
                                  className="p-2 rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200 transition-colors"
                                  title="Voir comme le client"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </Link>

                                <button
                                  onClick={() => openEditModal(t)}
                                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition-colors cursor-pointer"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                  <span>Gérer</span>
                                </button>

                                <button
                                  onClick={() => handleDeleteTicket(t.id)}
                                  className="p-2 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                  title="Supprimer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ============================================================ */}
        {/* ONGLET 2 : GESTION DES PLATEFORMES DE VENTE (NOUVEAU) */}
        {/* ============================================================ */}
        {activeAdminTab === 'platforms' && settings && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-8">
            <div className="border-b border-stone-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-xl font-black text-stone-900 font-serif flex items-center gap-2">
                  <Layers className="w-5 h-5 text-rose-600" />
                  <span>Gestion des Plateformes de Vente</span>
                </h2>
                <p className="text-xs text-stone-500">
                  Activez, désactivez ou ajoutez de nouvelles plateformes d'achat proposées aux clients sur le formulaire.
                </p>
              </div>

              {settingsSuccess && (
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Plateformes mises à jour !</span>
                </div>
              )}
            </div>

            {/* Liste des plateformes existantes */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-stone-700 uppercase tracking-wider">
                Plateformes configurées :
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {settings.platforms.map((plt) => (
                  <div 
                    key={plt.id} 
                    className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      plt.enabled ? 'bg-stone-50 border-stone-300' : 'bg-stone-100/60 border-dashed border-stone-300 opacity-60'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${plt.bg}`}>
                          {plt.logoText || plt.name}
                        </span>
                        <span className="font-bold text-stone-900 text-sm">{plt.name}</span>
                      </div>
                      <div className="text-xs text-stone-500">
                        Statut : {plt.enabled ? <strong className="text-emerald-600">Active sur le site</strong> : <span className="text-stone-400">Désactivée</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Bouton Toggle Actif / Inactif */}
                      <button
                        onClick={() => togglePlatform(plt.id)}
                        className={`p-1.5 rounded-xl border transition-colors cursor-pointer text-xs font-bold flex items-center gap-1 ${
                          plt.enabled 
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200' 
                            : 'bg-stone-200 text-stone-700 border-stone-300 hover:bg-stone-300'
                        }`}
                        title={plt.enabled ? 'Désactiver' : 'Activer'}
                      >
                        {plt.enabled ? 'Activée' : 'Désactivée'}
                      </button>

                      {plt.id !== 'shein' && plt.id !== 'temu' && plt.id !== 'alibaba' && (
                        <button
                          onClick={() => handleDeletePlatform(plt.id)}
                          className="p-1.5 text-stone-400 hover:text-red-600 transition-colors cursor-pointer"
                          title="Supprimer cette plateforme"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Formulaire d'ajout d'une nouvelle plateforme */}
            <form onSubmit={handleAddPlatform} className="bg-rose-50/50 p-6 rounded-3xl border border-rose-200 space-y-4">
              <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
                <Plus className="w-4 h-4 text-rose-600" />
                <span>Ajouter une nouvelle plateforme de vente</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Nom de la plateforme <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: AliExpress, Zara, Amazon..."
                    value={newPlatformName}
                    onChange={(e) => setNewPlatformName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 bg-white text-xs sm:text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Texte court du badge
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: ALIEXPRESS, ZARA..."
                    value={newPlatformBadge}
                    onChange={(e) => setNewPlatformBadge(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 bg-white text-xs sm:text-sm uppercase font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Couleur du badge
                  </label>
                  <select
                    value={newPlatformBg}
                    onChange={(e) => setNewPlatformBg(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 bg-white text-xs sm:text-sm font-bold"
                  >
                    <option value="bg-purple-600 text-white">Violet / Purple</option>
                    <option value="bg-blue-600 text-white">Bleu / Blue</option>
                    <option value="bg-emerald-600 text-white">Vert / Green</option>
                    <option value="bg-red-600 text-white">Rouge / Red</option>
                    <option value="bg-stone-900 text-white">Noir / Black</option>
                    <option value="bg-amber-600 text-white">Ambre / Orange</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white text-xs font-black shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter cette plateforme</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ============================================================ */}
        {/* ONGLET 3 : PARAMÈTRES & INSTRUCTIONS DE PAIEMENT MOBILE MONEY */}
        {/* ============================================================ */}
        {activeAdminTab === 'settings' && settings && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-8">
            <div className="border-b border-stone-100 pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-stone-900 font-serif">
                  Instructions & Comptes de Paiement Mobile Money (Bénin)
                </h2>
                <p className="text-xs text-stone-500">
                  Ces informations s'affichent automatiquement au client lorsqu'il clique sur « Valider mon devis & Régler mon acompte ».
                </p>
              </div>

              {settingsSuccess && (
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Paramètres enregistrés !</span>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Titre du Modal d'Instructions
                </label>
                <input
                  type="text"
                  value={settings.paymentInstructions.title}
                  onChange={(e) => setSettings({
                    ...settings,
                    paymentInstructions: { ...settings.paymentInstructions, title: e.target.value }
                  })}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Consigne générale de transfert
                </label>
                <textarea
                  rows={3}
                  value={settings.paymentInstructions.instructionsText}
                  onChange={(e) => setSettings({
                    ...settings,
                    paymentInstructions: { ...settings.paymentInstructions, instructionsText: e.target.value }
                  })}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-700"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-stone-900 text-sm border-l-4 border-rose-500 pl-3">
                Comptes Mobile Money configurés (MTN, Moov, Celtiis Bénin)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {settings.paymentInstructions.accounts.map((acc, idx) => (
                  <div key={acc.id} className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-500 uppercase">Opérateur</label>
                      <input
                        type="text"
                        value={acc.operator}
                        onChange={(e) => {
                          const accounts = [...settings.paymentInstructions.accounts];
                          accounts[idx] = { ...accounts[idx], operator: e.target.value };
                          setSettings({ ...settings, paymentInstructions: { ...settings.paymentInstructions, accounts } });
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs font-bold bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-500 uppercase">Numéro de téléphone</label>
                      <input
                        type="text"
                        value={acc.number}
                        onChange={(e) => {
                          const accounts = [...settings.paymentInstructions.accounts];
                          accounts[idx] = { ...accounts[idx], number: e.target.value };
                          setSettings({ ...settings, paymentInstructions: { ...settings.paymentInstructions, accounts } });
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm font-mono font-bold bg-white text-rose-700"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-500 uppercase">Nom du titulaire de compte</label>
                      <input
                        type="text"
                        value={acc.holderName}
                        onChange={(e) => {
                          const accounts = [...settings.paymentInstructions.accounts];
                          accounts[idx] = { ...accounts[idx], holderName: e.target.value };
                          setSettings({ ...settings, paymentInstructions: { ...settings.paymentInstructions, accounts } });
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs bg-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Instruction après le transfert (ex: envoyer capture d'écran)
              </label>
              <input
                type="text"
                value={settings.paymentInstructions.confirmationNote}
                onChange={(e) => setSettings({
                  ...settings,
                  paymentInstructions: { ...settings.paymentInstructions, confirmationNote: e.target.value }
                })}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => saveSettingsToServer(settings)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-black text-sm shadow-md cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Enregistrer les Instructions de Paiement</span>
              </button>
            </div>

          </div>
        )}

        {/* ============================================================ */}
        {/* ONGLET : VENTES EN GROUPE (ACHATS GROUPÉS) */}
        {/* ============================================================ */}
        {activeAdminTab === 'group_buys' && (
          <div className="space-y-8">
            
            {/* EN-TÊTE DE SECTION & STATS */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200 shadow-xs">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-md border border-rose-200">
                  Commandes Groupées
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-stone-900 font-serif mt-1">
                  Gestion des Ventes en Groupe
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Articles vedettes proposés aux clients pour commander ensemble à tarif réduit avec date de commande et quantité minimum.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/ventes-groupees"
                  target="_blank"
                  className="px-4 py-2.5 rounded-xl border border-stone-200 hover:border-rose-300 text-stone-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-rose-500" />
                  <span>Voir la page publique</span>
                </Link>

                <button
                  onClick={handleOpenCreateGb}
                  className="px-5 py-2.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-black text-xs rounded-xl shadow-md shadow-rose-200 flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter un Article</span>
                </button>
              </div>
            </div>

            {/* Notification de succès */}
            {gbSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Article de vente en groupe enregistré avec succès !</span>
              </div>
            )}

            {/* STATS RAPIDES VENTES GROUPÉES */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
                <div className="text-stone-400 text-xs font-bold uppercase">Total Articles</div>
                <div className="text-2xl font-black text-stone-900 mt-1">{groupBuys.length}</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
                <div className="text-rose-600 text-xs font-bold uppercase">En cours de réservation</div>
                <div className="text-2xl font-black text-rose-600 mt-1">
                  {groupBuys.filter(g => g.status === 'open').length}
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
                <div className="text-emerald-600 text-xs font-bold uppercase">Objectif Atteint (Confirmées)</div>
                <div className="text-2xl font-black text-emerald-600 mt-1">
                  {groupBuys.filter(g => g.status === 'goal_reached').length}
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
                <div className="text-amber-600 text-xs font-bold uppercase">Total Réservations Clients</div>
                <div className="text-2xl font-black text-amber-600 mt-1">
                  {groupBuys.reduce((acc, g) => acc + (g.participants?.length || 0), 0)} clients
                </div>
              </div>
            </div>

            {/* LISTE DES VENTES GROUPÉES */}
            {groupBuys.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 space-y-3">
                <Users className="w-12 h-12 text-stone-300 mx-auto" />
                <h3 className="text-lg font-bold text-stone-800">Aucune vente groupée enregistrée</h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Cliquez sur "Ajouter un Article" pour créer votre première offre de vente en groupe.
                </p>
                <button
                  onClick={handleOpenCreateGb}
                  className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold"
                >
                  Créer un article
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {groupBuys.map((item) => {
                  const progressPct = Math.min(100, Math.round((item.currentQuantity / item.minQuantity) * 100));

                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs hover:border-rose-300 transition-all p-5 flex flex-col justify-between space-y-4"
                    >
                      <div className="flex gap-4">
                        {/* Image */}
                        <div className="w-28 h-28 rounded-2xl overflow-hidden bg-stone-100 shrink-0 relative">
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute top-1 left-1 text-[9px] bg-stone-900/80 text-white font-bold px-1.5 py-0.5 rounded uppercase">
                            {item.platform || 'SHEIN'}
                          </span>
                        </div>

                        {/* Infos clés */}
                        <div className="flex-1 space-y-1.5 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                              {item.shippingMode === 'sea' ? '🚢 Voie Maritime (2-3 mois)' : '✈️ Voie Aérienne (≤ 1 mois)'}
                            </span>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                              item.status === 'goal_reached'
                                ? 'bg-emerald-100 text-emerald-800'
                                : item.status === 'ordered'
                                ? 'bg-purple-100 text-purple-800'
                                : item.status === 'closed'
                                ? 'bg-stone-100 text-stone-700'
                                : 'bg-rose-100 text-rose-800'
                            }`}>
                              {item.status === 'goal_reached' ? 'Objectif Atteint' : item.status === 'ordered' ? 'Commande Passée' : item.status === 'closed' ? 'Clôturée' : 'En cours'}
                            </span>
                          </div>

                          <h3 className="font-bold text-stone-900 text-sm sm:text-base truncate">
                            {item.title}
                          </h3>

                          {/* Prix */}
                          <div className="flex items-baseline gap-2">
                            <span className="font-mono font-black text-base text-rose-600">
                              {item.priceCFA.toLocaleString('fr-FR')} FCFA
                            </span>
                            {item.originalPriceCFA && (
                              <span className="text-xs text-stone-400 line-through font-mono">
                                {item.originalPriceCFA.toLocaleString('fr-FR')} FCFA
                              </span>
                            )}
                          </div>

                          {/* Date de commande */}
                          <div className="text-[11px] text-amber-800 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200 inline-flex items-center gap-1.5 font-semibold">
                            <Calendar className="w-3 h-3 text-amber-600 shrink-0" />
                            <span>Commande passée le : <strong>{item.orderDate}</strong></span>
                          </div>
                        </div>
                      </div>

                      {/* Barre de progression & quantité min */}
                      <div className="space-y-1.5 bg-stone-50 p-3 rounded-2xl border border-stone-200">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-stone-600">
                            Quantité réservée : <strong className="text-stone-900 font-mono">{item.currentQuantity}</strong> / {item.minQuantity} pièces
                          </span>
                          <span className="font-mono font-bold text-xs text-stone-700">
                            {progressPct}%
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-stone-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              item.currentQuantity >= item.minQuantity ? 'bg-emerald-500' : 'bg-rose-600'
                            }`}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-100">
                        {/* Sélecteur de statut rapide */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-stone-400 font-medium">Statut :</span>
                          <select
                            value={item.status}
                            onChange={(e) => handleStatusChangeGb(item.id, e.target.value as GroupBuyStatus)}
                            className="text-xs font-bold px-2 py-1 rounded-lg border border-stone-200 bg-white"
                          >
                            <option value="open">En cours</option>
                            <option value="goal_reached">Objectif Atteint</option>
                            <option value="ordered">Commande Passée</option>
                            <option value="closed">Clôturée</option>
                          </select>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setViewingParticipantsGb(item)}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Users className="w-3.5 h-3.5" />
                            <span>Participants ({item.participants?.length || 0})</span>
                          </button>

                          <button
                            onClick={() => handleOpenEditGb(item)}
                            className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition-colors cursor-pointer"
                            title="Modifier"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteGroupBuy(item.id)}
                            className="p-1.5 bg-stone-100 hover:bg-red-50 text-stone-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

      </main>

      {/* ============================================================ */}
      {/* MODAL D'ÉDITION AVANCÉE D'UN TICKET */}
      {/* ============================================================ */}
      {isEditing && selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-stone-200 p-6 sm:p-8 space-y-8 my-auto animate-fade-in">
            
            {/* Titre Modal */}
            <div className="flex items-start justify-between border-b border-stone-100 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xl sm:text-2xl font-black text-rose-700">
                    {selectedTicket.id}
                  </span>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${STATUS_MAP[editStatus]?.badgeClass}`}>
                    {STATUS_MAP[editStatus]?.label}
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-1">
                  Client : <strong>{selectedTicket.client.name}</strong> • Tél : {selectedTicket.client.phone} • Ville : {selectedTicket.client.city} (Bénin)
                </p>
              </div>

              <button
                onClick={() => setIsEditing(false)}
                className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {saveSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Ticket et statut mis à jour !</span>
              </div>
            )}

            {saveError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span>{saveError}</span>
              </div>
            )}

            {/* STATUT DU COLIS & CHOIX DU MODE D'EXPÉDITION */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-2">
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Mettre à jour le Statut
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as QuoteStatus)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-sm font-bold text-stone-800 outline-hidden"
                >
                  <option value="pending">⏳ En attente de devis (Calcul par Christaline)</option>
                  <option value="ready">📋 Devis prêt (Transmis au client avec montant total)</option>
                  <option value="accepted">✅ Devis validé par le client</option>
                  <option value="paid_deposit">💳 Acompte reçu (Prêt pour achat fournisseur)</option>
                  <option value="ordered">🛍️ Commande effectuée chez le fournisseur</option>
                  <option value="in_transit">✈️ En transit international vers le Bénin</option>
                  <option value="customs">🏛️ Arrivé au Bénin / Dédouanement (Cotonou)</option>
                  <option value="ready_for_pickup">🚚 Prêt pour livraison client / retrait agence</option>
                  <option value="delivered">📦 Colis livré avec succès</option>
                  <option value="cancelled">❌ Commande annulée</option>
                </select>
              </div>

              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-2">
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Mode de Livraison / Délais
                </label>
                <select
                  value={editShippingMode}
                  onChange={(e) => setEditShippingMode(e.target.value as ShippingModeType)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-sm font-bold text-stone-800 outline-hidden"
                >
                  <option value="air">✈️ Voie Aérienne (Délai : Au plus 1 mois)</option>
                  <option value="sea">🚢 Voie Maritime (Délai : 2 à 3 mois)</option>
                </select>
              </div>
            </div>

            {/* ARTICLES & PRIX TOTAL DE CHAQUE ARTICLE */}
            <div className="space-y-4">
              <div className="border-l-4 border-rose-500 pl-3">
                <h3 className="font-bold text-stone-900 text-base">
                  1. Prix Total par article en FCFA (affiché au client)
                </h3>
                <p className="text-xs text-stone-500">
                  Le client verra simplement ce prix total par article, sans aucun détail technique interne.
                </p>
              </div>

              <div className="space-y-4">
                {editItems.map((item, idx) => (
                  <div key={item.id} className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-stone-800 text-white">
                          {item.platform}
                        </span>
                        <span className="font-bold text-stone-900 text-sm">
                          {item.name} (Qté : {item.quantity})
                        </span>
                        {item.variant && (
                          <span className="text-xs text-stone-500">[{item.variant}]</span>
                        )}
                      </div>

                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 bg-white px-2.5 py-1 rounded-lg border border-rose-200"
                      >
                        <span>Voir l'article</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">
                          Prix Total de cet article pour le client (FCFA)
                        </label>
                        <input
                          type="number"
                          value={item.totalItemCFA || ''}
                          onChange={(e) => updateItemTotalPrice(idx, parseFloat(e.target.value) || 0)}
                          placeholder="Ex: 31000"
                          className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white font-black text-rose-700 text-base"
                        />
                      </div>

                      <div className="text-xs text-stone-500">
                        {item.originalPrice ? (
                          <span>Prix sur la plateforme : <strong>{item.originalPrice} {item.originalCurrency || 'EUR'}</strong></span>
                        ) : (
                          <span>Renseignez le montant net en FCFA qui sera facturé au client.</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SYNTHÈSE GLOBALE & ACOMPTES */}
            <div className="bg-rose-50/50 p-5 rounded-2xl border border-rose-200 space-y-4">
              <h3 className="font-bold text-stone-900 text-base">
                2. Total Commande & Acompte Demandé
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Remise éventuelle (FCFA)</label>
                  <input
                    type="number"
                    value={editDiscount || ''}
                    onChange={(e) => setEditDiscount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white font-bold text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Acompte à payer (FCFA)</label>
                  <input
                    type="number"
                    value={editDepositRequired || ''}
                    onChange={(e) => setEditDepositRequired(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white font-bold text-sm text-amber-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Acompte déjà reçu (FCFA)</label>
                  <input
                    type="number"
                    value={editDepositPaid || ''}
                    onChange={(e) => setEditDepositPaid(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white font-bold text-sm text-emerald-700"
                  />
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-rose-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm font-bold">
                <div>
                  <span className="text-stone-500 text-xs block">PRIX TOTAL DE LA COMMANDE :</span>
                  <span className="text-xl font-black text-rose-700">
                    {new Intl.NumberFormat('fr-FR').format(computedGrandTotal)} FCFA
                  </span>
                </div>
                <div>
                  <span className="text-stone-500 text-xs block">SOLDE RESTANT À LA LIVRAISON :</span>
                  <span className="text-lg font-black text-stone-900">
                    {new Intl.NumberFormat('fr-FR').format(computedBalanceRemaining)} FCFA
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Message pour le client (Optionnel)</label>
                <textarea
                  rows={2}
                  value={editAdminNote}
                  onChange={(e) => setEditAdminNote(e.target.value)}
                  placeholder="Ex: Devis validé ! Merci de régler l'acompte par MoMo ou Moov pour validation..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs outline-hidden"
                />
              </div>
            </div>

            {/* EXPÉDITION & SUIVI TRANSPORTEUR */}
            <div className="space-y-4">
              <h3 className="font-bold text-stone-900 text-base border-l-4 border-amber-500 pl-3">
                3. Suivi Fournisseur & Colis
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">N° Commande Fournisseur</label>
                  <input
                    type="text"
                    value={editSupplierOrderNumber}
                    onChange={(e) => setEditSupplierOrderNumber(e.target.value)}
                    placeholder="Ex: SHEIN-291820"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Transporteur / Hub</label>
                  <input
                    type="text"
                    value={editCarrierName}
                    onChange={(e) => setEditCarrierName(e.target.value)}
                    placeholder={editShippingMode === 'sea' ? 'Cargo Maritime Cotonou' : 'Cargo Aérien Cotonou'}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">N° de Suivi Colis</label>
                  <input
                    type="text"
                    value={editCarrierTrackingNumber}
                    onChange={(e) => setEditCarrierTrackingNumber(e.target.value)}
                    placeholder="Ex: CST-BEN-99214"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                <span className="text-xs font-bold text-stone-700 block">
                  + Ajouter un événement spécial à la Timeline du client
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Titre (ex: Conteneur déchargé au Port de Cotonou)"
                    value={newTimelineStepTitle}
                    onChange={(e) => setNewTimelineStepTitle(e.target.value)}
                    className="px-3 py-1.5 rounded-lg border border-stone-300 text-xs bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Détails (ex: Inspection douanière en cours)"
                    value={newTimelineStepDesc}
                    onChange={(e) => setNewTimelineStepDesc(e.target.value)}
                    className="px-3 py-1.5 rounded-lg border border-stone-300 text-xs bg-white"
                  />
                </div>
              </div>
            </div>

            {/* BOUTONS ACTIONS MODAL */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-stone-200">
              <a
                href={generateClientWhatsAppMessage(selectedTicket)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs transition-colors"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Notifier le client sur WhatsApp (Bénin)</span>
              </a>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-bold text-xs hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  Fermer
                </button>

                <button
                  type="button"
                  onClick={handleSaveTicket}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white px-6 py-2.5 rounded-xl text-xs font-black shadow-md shadow-rose-200 transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Enregistrer les modifications</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL CRÉATION / ÉDITION D'UNE VENTE EN GROUPE */}
      {/* ============================================================ */}
      {showGbModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-stone-200 p-6 sm:p-8 space-y-6 my-auto">
            
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-xs">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-stone-900 font-serif">
                    {editingGb ? 'Modifier la Vente en Groupe' : 'Nouvelle Vente en Groupe'}
                  </h2>
                  <p className="text-xs text-stone-500">
                    Définissez l'article, la date de commande, la quantité minimum et le prix
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowGbModal(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {gbError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{gbError}</span>
              </div>
            )}

            <form onSubmit={handleSaveGroupBuy} className="space-y-4">
              
              {/* Titre */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Titre de l'article *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Escarpins Luxe Strass & Finition Soie"
                  value={gbTitle}
                  onChange={(e) => setGbTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-semibold"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Description détaillée
                </label>
                <textarea
                  rows={2}
                  placeholder="Détails du produit, qualité, occasions idéales..."
                  value={gbDescription}
                  onChange={(e) => setGbDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs"
                />
              </div>

              {/* Image URL & Suggestions rapides */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Photo / Image du produit (URL) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://..."
                  value={gbImageUrl}
                  onChange={(e) => setGbImageUrl(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs font-mono"
                />

                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-stone-400 font-medium">Exemples rapides :</span>
                  <button
                    type="button"
                    onClick={() => setGbImageUrl('https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&auto=format&fit=crop&q=80')}
                    className="text-[10px] bg-stone-100 hover:bg-rose-50 hover:text-rose-700 px-2 py-0.5 rounded-md font-bold cursor-pointer"
                  >
                    👠 Escarpins
                  </button>
                  <button
                    type="button"
                    onClick={() => setGbImageUrl('https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80')}
                    className="text-[10px] bg-stone-100 hover:bg-rose-50 hover:text-rose-700 px-2 py-0.5 rounded-md font-bold cursor-pointer"
                  >
                    💄 Pinceaux
                  </button>
                  <button
                    type="button"
                    onClick={() => setGbImageUrl('https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&auto=format&fit=crop&q=80')}
                    className="text-[10px] bg-stone-100 hover:bg-rose-50 hover:text-rose-700 px-2 py-0.5 rounded-md font-bold cursor-pointer"
                  >
                    👗 Robe
                  </button>
                  <button
                    type="button"
                    onClick={() => setGbImageUrl('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80')}
                    className="text-[10px] bg-stone-100 hover:bg-rose-50 hover:text-rose-700 px-2 py-0.5 rounded-md font-bold cursor-pointer"
                  >
                    👖 Jogging
                  </button>
                  <button
                    type="button"
                    onClick={() => setGbImageUrl('https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80')}
                    className="text-[10px] bg-stone-100 hover:bg-rose-50 hover:text-rose-700 px-2 py-0.5 rounded-md font-bold cursor-pointer"
                  >
                    👜 Sac Chic
                  </button>
                  <button
                    type="button"
                    onClick={() => setGbImageUrl('https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80')}
                    className="text-[10px] bg-stone-100 hover:bg-rose-50 hover:text-rose-700 px-2 py-0.5 rounded-md font-bold cursor-pointer"
                  >
                    💍 Bijoux
                  </button>
                </div>
              </div>

              {/* PRIX FCFA & PRIX BARRÉ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Prix Vente Groupée (FCFA) *
                  </label>
                  <input
                    type="number"
                    required
                    min={100}
                    placeholder="Ex: 18500"
                    value={gbPriceCFA}
                    onChange={(e) => setGbPriceCFA(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 font-mono font-bold text-sm text-rose-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Prix Public indicatif (FCFA, optionnel)
                  </label>
                  <input
                    type="number"
                    min={100}
                    placeholder="Ex: 28000 (affiché barré)"
                    value={gbOriginalPriceCFA}
                    onChange={(e) => setGbOriginalPriceCFA(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 font-mono text-sm text-stone-600"
                  />
                </div>
              </div>

              {/* QUANTITÉ MINIMUM & DATE DE PASSAGE COMMANDE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-amber-50/70 p-4 rounded-2xl border border-amber-200">
                <div>
                  <label className="block text-xs font-bold text-amber-900 uppercase tracking-wider mb-1">
                    Quantité minimum requise *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    placeholder="Ex: 10"
                    value={gbMinQty}
                    onChange={(e) => setGbMinQty(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-amber-300 bg-white font-mono font-bold text-sm text-amber-950"
                  />
                  <p className="text-[10px] text-amber-700 mt-1">
                    Objectif à atteindre pour valider l'achat groupé
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-900 uppercase tracking-wider mb-1">
                    Date où la commande sera passée *
                  </label>
                  <input
                    type="date"
                    required
                    value={gbOrderDate}
                    onChange={(e) => setGbOrderDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-amber-300 bg-white font-mono font-bold text-sm text-amber-950"
                  />
                  <p className="text-[10px] text-amber-700 mt-1">
                    Date limite à laquelle l'admin commande chez le fournisseur
                  </p>
                </div>
              </div>

              {/* Mode de transport & Plateforme */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Mode d'expédition Bénin *
                  </label>
                  <select
                    value={gbShippingMode}
                    onChange={(e) => setGbShippingMode(e.target.value as ShippingModeType)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-bold"
                  >
                    <option value="air">✈️ Voie Aérienne (au plus 1 mois)</option>
                    <option value="sea">🚢 Voie Maritime (2 à 3 mois)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Plateforme Fournisseur *
                  </label>
                  <select
                    value={gbPlatform}
                    onChange={(e) => setGbPlatform(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-bold"
                  >
                    <option value="shein">SHEIN</option>
                    <option value="temu">TEMU</option>
                    <option value="autre">Autre Fournisseur</option>
                  </select>
                </div>
              </div>

              {/* Tailles / Variantes */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Options & Tailles (séparées par des virgules)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Taille 38 Noir, Taille 39 Doré, Taille 40 Champagne"
                  value={gbVariants}
                  onChange={(e) => setGbVariants(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs"
                />
              </div>

              {/* Statut */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Statut de la vente
                </label>
                <select
                  value={gbStatus}
                  onChange={(e) => setGbStatus(e.target.value as GroupBuyStatus)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs font-bold"
                >
                  <option value="open">En cours (Réservations ouvertes)</option>
                  <option value="goal_reached">Objectif Atteint (Confirmée)</option>
                  <option value="ordered">Commande Passée chez le fournisseur</option>
                  <option value="closed">Clôturée</option>
                </select>
              </div>

              {/* Boutons formulaire */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowGbModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-600 font-bold text-xs hover:bg-stone-100 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-black text-xs shadow-md shadow-rose-200 cursor-pointer"
                >
                  {editingGb ? 'Enregistrer les modifications' : 'Créer la Vente en Groupe'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL LISTE DES PARTICIPANTS D'UNE VENTE EN GROUPE */}
      {/* ============================================================ */}
      {viewingParticipantsGb && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-stone-200 p-6 sm:p-8 space-y-6 my-auto">
            
            <div className="flex items-start justify-between border-b border-stone-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                  {viewingParticipantsGb.platform?.toUpperCase() || 'SHEIN'} • Achat Groupé
                </span>
                <h2 className="text-xl font-black text-stone-900 font-serif mt-1">
                  Réservations Clients : {viewingParticipantsGb.title}
                </h2>
                <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 mt-1">
                  <span>Prix : <strong>{viewingParticipantsGb.priceCFA.toLocaleString('fr-FR')} FCFA</strong></span>
                  <span>•</span>
                  <span>Commande passée le : <strong>{viewingParticipantsGb.orderDate}</strong></span>
                  <span>•</span>
                  <span className="text-rose-600 font-bold">
                    {viewingParticipantsGb.currentQuantity} / {viewingParticipantsGb.minQuantity} pièces
                  </span>
                </div>
              </div>

              <button
                onClick={() => setViewingParticipantsGb(null)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tableau des participants */}
            {(!viewingParticipantsGb.participants || viewingParticipantsGb.participants.length === 0) ? (
              <div className="p-8 text-center text-stone-400 text-xs">
                Aucune réservation enregistrée pour le moment pour cet article.
              </div>
            ) : (
              <div className="space-y-3">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-stone-100 text-stone-700 uppercase text-[10px] tracking-wider font-bold">
                      <tr>
                        <th className="p-3 rounded-l-xl">Client</th>
                        <th className="p-3">WhatsApp / Ville</th>
                        <th className="p-3">Option</th>
                        <th className="p-3 text-center">Quantité</th>
                        <th className="p-3 text-right">Total FCFA</th>
                        <th className="p-3 text-center">Ticket Lié</th>
                        <th className="p-3 rounded-r-xl text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                      {viewingParticipantsGb.participants.map((p) => {
                        const total = p.quantity * viewingParticipantsGb.priceCFA;
                        const cleanPhone = p.whatsapp.replace(/\D/g, '');
                        const waNumber = cleanPhone.startsWith('229') ? cleanPhone : `229${cleanPhone}`;

                        return (
                          <tr key={p.id} className="hover:bg-stone-50/80">
                            <td className="p-3 font-bold text-stone-900">
                              {p.clientName}
                            </td>
                            <td className="p-3">
                              <div>{p.whatsapp}</div>
                              <div className="text-[10px] text-stone-400">{p.city}</div>
                            </td>
                            <td className="p-3 text-[11px] text-stone-600">
                              {p.variant || 'Standard'}
                            </td>
                            <td className="p-3 text-center font-mono font-bold text-stone-900">
                              {p.quantity} pcs
                            </td>
                            <td className="p-3 text-right font-mono font-bold text-rose-700">
                              {total.toLocaleString('fr-FR')} FCFA
                            </td>
                            <td className="p-3 text-center">
                              {p.ticketId ? (
                                <Link
                                  href={`/ticket/${p.ticketId}`}
                                  target="_blank"
                                  className="font-mono font-bold text-rose-600 hover:underline flex items-center justify-center gap-1"
                                >
                                  <span>{p.ticketId}</span>
                                  <ExternalLink className="w-3 h-3" />
                                </Link>
                              ) : (
                                <span className="text-stone-400">-</span>
                              )}
                            </td>
                            <td className="p-3 text-center">
                              <a
                                href={`https://wa.me/${waNumber}?text=Bonjour%20${encodeURIComponent(p.clientName)}%2C%20Christaline%20Shop%20au%20sujet%20de%20votre%20r%C3%A9servation%20group%C3%A9e%20${p.ticketId || ''}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors"
                              >
                                <MessageCircle className="w-3 h-3 fill-white" />
                                <span>WhatsApp</span>
                              </a>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-stone-100 flex justify-end">
              <button
                onClick={() => setViewingParticipantsGb(null)}
                className="px-5 py-2.5 rounded-xl bg-stone-900 text-white font-bold text-xs hover:bg-stone-800 cursor-pointer"
              >
                Fermer
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
