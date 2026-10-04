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
  PLATFORM_CONFIG 
} from '@/lib/types';
import { 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Search, 
  Filter, 
  Edit3, 
  ExternalLink, 
  Save, 
  X, 
  CheckCircle2, 
  Clock, 
  Truck, 
  PackageCheck, 
  ShoppingBag, 
  Phone, 
  MessageCircle, 
  DollarSign, 
  Trash2, 
  AlertCircle,
  Eye,
  RefreshCw,
  Plus,
  Send,
  Plane
} from 'lucide-react';

export default function AdminPage() {
  // Authentification locale simple
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Données
  const [tickets, setTickets] = useState<TicketOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal d'édition
  const [selectedTicket, setSelectedTicket] = useState<TicketOrder | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Formulaire d'édition dans le modal
  const [editStatus, setEditStatus] = useState<QuoteStatus>('pending');
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

  // Vérifier la session admin au montage
  useEffect(() => {
    const isAuth = sessionStorage.getItem('cs_admin_auth');
    if (isAuth === 'true') {
      setIsAuthenticated(true);
      fetchTickets();
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mot de passe admin par défaut : admin123 ou 0154072488
    if (password === 'admin123' || password === '0154072488' || password === 'admin') {
      setIsAuthenticated(true);
      sessionStorage.setItem('cs_admin_auth', 'true');
      setAuthError('');
      fetchTickets();
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

  // Ouvrir le modal d'édition pour un ticket
  const openEditModal = (t: TicketOrder) => {
    setSelectedTicket(t);
    setEditStatus(t.quote.status);
    setEditItems(JSON.parse(JSON.stringify(t.items))); // clone profond
    setEditAdminNote(t.quote.adminNote || '');
    setEditDepositRequired(t.quote.depositRequiredCFA || 0);
    setEditDepositPaid(t.quote.depositPaidCFA || 0);
    setEditDiscount(t.quote.discountCFA || 0);
    setEditSupplierOrderNumber(t.tracking.supplierOrderNumber || '');
    setEditCarrierTrackingNumber(t.tracking.carrierTrackingNumber || '');
    setEditCarrierName(t.tracking.carrierName || 'Cargo Aérien Christaline');
    setNewTimelineStepTitle('');
    setNewTimelineStepDesc('');
    setSaveSuccess(false);
    setSaveError(null);
    setIsEditing(true);
  };

  // Mettre à jour un article individuel dans le devis
  const updateItemField = (idx: number, field: keyof OrderItem, val: number) => {
    const updated = [...editItems];
    const it = { ...updated[idx], [field]: val };
    // Recalculer le total pour cet article
    it.totalItemCFA = (it.unitPriceCFA * it.quantity) + it.shippingFeeCFA + it.serviceFeeCFA + it.customsFeeCFA;
    updated[idx] = it;
    setEditItems(updated);
  };

  // Calculs financiers automatiques en direct
  const computedSubtotal = editItems.reduce((acc, it) => acc + (it.unitPriceCFA * it.quantity), 0);
  const computedShipping = editItems.reduce((acc, it) => acc + it.shippingFeeCFA, 0);
  const computedService = editItems.reduce((acc, it) => acc + it.serviceFeeCFA, 0);
  const computedCustoms = editItems.reduce((acc, it) => acc + it.customsFeeCFA, 0);
  const computedGrandTotal = Math.max(0, computedSubtotal + computedShipping + computedService + computedCustoms - editDiscount);
  const computedBalanceRemaining = Math.max(0, computedGrandTotal - editDepositPaid);

  // Sauvegarder les modifications du ticket
  const handleSaveTicket = async () => {
    if (!selectedTicket) return;
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const payload: any = {
        items: editItems,
        status: editStatus,
        quote: {
          status: editStatus,
          subtotalItemsCFA: computedSubtotal,
          totalShippingCFA: computedShipping,
          totalServiceFeeCFA: computedService,
          totalCustomsCFA: computedCustoms,
          discountCFA: editDiscount,
          grandTotalCFA: computedGrandTotal,
          depositRequiredCFA: editDepositRequired || Math.round(computedGrandTotal * 0.6),
          depositPaidCFA: editDepositPaid,
          balanceRemainingCFA: computedBalanceRemaining,
          adminNote: editAdminNote
        },
        tracking: {
          supplierOrderNumber: editSupplierOrderNumber.trim() || null,
          carrierTrackingNumber: editCarrierTrackingNumber.trim() || null,
          carrierName: editCarrierName.trim() || null
        }
      };

      if (newTimelineStepTitle.trim()) {
        payload.tracking.customEvent = {
          title: newTimelineStepTitle.trim(),
          description: newTimelineStepDesc.trim() || 'Étape enregistrée par Christaline Shop',
          location: 'Hub Abidjan'
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
      // Mettre à jour la liste locale
      setTickets(tickets.map(t => t.id === selectedTicket.id ? data.ticket : t));
      setSelectedTicket(data.ticket);

      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);

    } catch (err: any) {
      setSaveError(err.message || 'Erreur inconnue');
    }
  };

  // Supprimer un ticket
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

  // Générer le message WhatsApp à envoyer au client
  const generateClientWhatsAppMessage = (t: TicketOrder) => {
    const total = t.quote.grandTotalCFA > 0 ? `${new Intl.NumberFormat('fr-FR').format(t.quote.grandTotalCFA)} FCFA` : '';
    const deposit = t.quote.depositRequiredCFA > 0 ? `${new Intl.NumberFormat('fr-FR').format(t.quote.depositRequiredCFA)} FCFA` : '';
    const currentUrl = typeof window !== 'undefined' ? `${window.location.origin}/ticket/${t.id}` : `https://christaline.shop/ticket/${t.id}`;

    let msg = `Bonjour ${t.client.name} ! 🌸\nC'est l'équipe Christaline Shop concernant votre ticket *${t.id}*.\n\n`;

    if (t.quote.status === 'ready') {
      msg += `✨ Votre devis est prêt !\n`
        + `💰 Total de votre commande : *${total}*\n`
        + `💵 Acompte pour valider la commande : *${deposit}*\n`
        + `📦 Délai : 7 à 12 jours ouvrables dès réception de l'acompte.\n\n`
        + `👉 Consultez le détail complet de votre devis ici :\n${currentUrl}\n\n`
        + `Merci de nous confirmer votre mode de règlement (Wave / Orange Money / MoMo) !`;
    } else if (t.quote.status === 'in_transit') {
      msg += `✈️ Bonne nouvelle ! Vos articles ont été expédiés et sont actuellement en transit aérien international.\n`
        + `📦 N° Suivi : ${t.tracking.carrierTrackingNumber || 'Vol groupé'}\n`
        + `👉 Suivez l'avancée de votre colis en direct sur votre ticket :\n${currentUrl}`;
    } else if (t.quote.status === 'ready_for_pickup') {
      msg += `🎉 Vos articles sont arrivés à Abidjan et sont prêts pour la livraison !\n`
        + `💵 Solde restant à régler : ${new Intl.NumberFormat('fr-FR').format(t.quote.balanceRemainingCFA)} FCFA\n`
        + `Merci de nous confirmer votre adresse exacte pour la remise du colis.`;
    } else {
      msg += `📌 Mise à jour de votre commande : *${t.tracking.statusLabel}*\n`
        + `👉 Consultez l'état d'avancement ici : ${currentUrl}`;
    }

    const cleanPhone = t.client.whatsapp.replace(/\D/g, '');
    const phoneWithCode = cleanPhone.startsWith('225') ? cleanPhone : `225${cleanPhone}`;
    return `https://wa.me/${phoneWithCode}?text=${encodeURIComponent(msg)}`;
  };

  // Filtrage des tickets
  const filteredTickets = tickets.filter(t => {
    const matchesStatus = statusFilter === 'all' || t.quote.status === statusFilter;
    const matchesSearch = searchQuery === '' || 
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.client.phone.includes(searchQuery) ||
      t.client.city.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Statistiques
  const countPending = tickets.filter(t => t.quote.status === 'pending').length;
  const countReady = tickets.filter(t => t.quote.status === 'ready').length;
  const countInTransit = tickets.filter(t => ['paid_deposit', 'ordered', 'in_transit', 'customs'].includes(t.quote.status)).length;
  const countDelivered = tickets.filter(t => t.quote.status === 'delivered').length;
  const totalVolume = tickets.reduce((acc, t) => acc + (t.quote.grandTotalCFA || 0), 0);
  const totalCollected = tickets.reduce((acc, t) => acc + (t.quote.depositPaidCFA || 0), 0);

  // Écran d'authentification si non connecté
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
                Espace Gestion Christaline
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
        
        {/* BANDEAU EN-TÊTE ADMIN */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-md border border-rose-200">
                Administration
              </span>
              <span className="text-xs text-stone-400">Connecté en tant que gestionnaire</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 font-serif mt-1">
              Tableau de Bord des Commandes & Devis
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchTickets}
              disabled={loading}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-colors cursor-pointer"
              title="Rafraîchir"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Actualiser</span>
            </button>

            <Link
              href="/#commander"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nouveau Ticket</span>
            </Link>

            <button
              onClick={handleLogout}
              className="px-3 py-2 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-600 text-xs font-semibold cursor-pointer"
            >
              Déconnexion
            </button>
          </div>
        </div>

        {/* CARTES KPI STATISTIQUES */}
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
              <span>En Transit / Fret</span>
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

        {/* BARRE DE RECHERCHE ET FILTRES */}
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

          {/* TABLEAU DES TICKETS */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-stone-50 text-stone-500 uppercase text-[11px] font-bold border-y border-stone-200">
                <tr>
                  <th className="py-3 px-4">Ticket</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Articles</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4">Total Devis</th>
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
                    return (
                      <tr key={t.id} className="hover:bg-rose-50/30 transition-colors">
                        
                        {/* Numéro Ticket */}
                        <td className="py-3.5 px-4 font-mono font-black text-rose-700 whitespace-nowrap">
                          {t.id}
                          <div className="text-[10px] text-stone-400 font-sans font-normal">
                            {new Date(t.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                          </div>
                        </td>

                        {/* Client */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-bold text-stone-900">{t.client.name}</div>
                          <div className="text-xs text-stone-500 flex items-center gap-1">
                            <span>{t.client.phone}</span>
                            <span>•</span>
                            <span className="text-stone-400 truncate max-w-[120px]">{t.client.city}</span>
                          </div>
                        </td>

                        {/* Articles */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1">
                            {t.items.map((it, i) => {
                              const cfg = PLATFORM_CONFIG[it.platform] || PLATFORM_CONFIG.autre;
                              return (
                                <span 
                                  key={i} 
                                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${cfg.bg}`}
                                  title={`${it.name} (${it.quantity})`}
                                >
                                  {cfg.name} (x{it.quantity})
                                </span>
                              );
                            })}
                          </div>
                          <div className="text-[11px] text-stone-500 truncate max-w-[180px] mt-0.5">
                            {t.items[0]?.name}
                          </div>
                        </td>

                        {/* Statut */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${st.badgeClass}`}>
                            {st.label}
                          </span>
                        </td>

                        {/* Total Devis */}
                        <td className="py-3.5 px-4 font-bold text-stone-900 whitespace-nowrap">
                          {t.quote.grandTotalCFA > 0 
                            ? `${new Intl.NumberFormat('fr-FR').format(t.quote.grandTotalCFA)} F`
                            : <span className="text-amber-600 text-xs italic">À chiffrer</span>
                          }
                        </td>

                        {/* Acompte */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {t.quote.depositPaidCFA > 0 ? (
                            <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-xs">
                              {new Intl.NumberFormat('fr-FR').format(t.quote.depositPaidCFA)} F
                            </span>
                          ) : (
                            <span className="text-stone-400 text-xs">Non versé</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            
                            {/* Bouton WhatsApp Client */}
                            <a
                              href={generateClientWhatsAppMessage(t)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                              title="Envoyer message WhatsApp au client"
                            >
                              <MessageCircle className="w-3.5 h-3.5 fill-emerald-600" />
                            </a>

                            {/* Voir page client */}
                            <Link
                              href={`/ticket/${t.id}`}
                              target="_blank"
                              className="p-2 rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200 transition-colors"
                              title="Voir la page du ticket"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Link>

                            {/* Éditer Devis & Commande */}
                            <button
                              onClick={() => openEditModal(t)}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Gérer</span>
                            </button>

                            {/* Supprimer */}
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

      </main>

      {/* ============================================================ */}
      {/* MODAL D'ÉDITION AVANCÉE DU DEVIS ET DE LA COMMANDE */}
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
                  Client : <strong>{selectedTicket.client.name}</strong> • Tél : {selectedTicket.client.phone} • Ville : {selectedTicket.client.city}
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
                <span>Devis et statut mis à jour avec succès ! Le client verra ces changements en direct.</span>
              </div>
            )}

            {saveError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span>{saveError}</span>
              </div>
            )}

            {/* STATUT DE LA COMMANDE */}
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-2">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                Mettre à jour le Statut du Colis & Devis
              </label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as QuoteStatus)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-sm font-bold text-stone-800 outline-hidden"
              >
                <option value="pending">⏳ En attente de devis (Calcul par Christaline)</option>
                <option value="ready">📋 Devis prêt (Transmis au client pour validation)</option>
                <option value="accepted">✅ Devis validé par le client</option>
                <option value="paid_deposit">💳 Acompte reçu (Prêt pour achat)</option>
                <option value="ordered">🛍️ Commande effectuée chez le fournisseur (Shein/Temu/Alibaba)</option>
                <option value="in_transit">✈️ En transit international (Vol fret aérien)</option>
                <option value="customs">🏛️ Arrivé au pays / En dédouanement (Abidjan)</option>
                <option value="ready_for_pickup">🚚 Prêt pour livraison client / retrait</option>
                <option value="delivered">📦 Colis livré avec succès</option>
                <option value="cancelled">❌ Commande annulée</option>
              </select>
            </div>

            {/* ARTICLES & DEVIS INDIVIDUEL */}
            <div className="space-y-4">
              <h3 className="font-bold text-stone-900 text-base border-l-4 border-rose-500 pl-3">
                1. Chiffrage individuel par article (FCFA)
              </h3>

              <div className="space-y-4">
                {editItems.map((item, idx) => {
                  const cfg = PLATFORM_CONFIG[item.platform] || PLATFORM_CONFIG.autre;
                  return (
                    <div key={item.id} className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${cfg.bg}`}>
                            {cfg.name}
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
                          <span>Voir le produit sur {cfg.name}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>

                      {/* Champs chiffrage de cet article */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div>
                          <label className="block text-stone-500 font-bold mb-1">Prix article unit. (FCFA)</label>
                          <input
                            type="number"
                            value={item.unitPriceCFA || ''}
                            onChange={(e) => updateItemField(idx, 'unitPriceCFA', parseFloat(e.target.value) || 0)}
                            placeholder="Ex: 15000"
                            className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white font-bold"
                          />
                        </div>

                        <div>
                          <label className="block text-stone-500 font-bold mb-1">Fret / Port unit. (FCFA)</label>
                          <input
                            type="number"
                            value={item.shippingFeeCFA || ''}
                            onChange={(e) => updateItemField(idx, 'shippingFeeCFA', parseFloat(e.target.value) || 0)}
                            placeholder="Ex: 4000"
                            className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white font-bold"
                          />
                        </div>

                        <div>
                          <label className="block text-stone-500 font-bold mb-1">Commission unit. (FCFA)</label>
                          <input
                            type="number"
                            value={item.serviceFeeCFA || ''}
                            onChange={(e) => updateItemField(idx, 'serviceFeeCFA', parseFloat(e.target.value) || 0)}
                            placeholder="Ex: 2000"
                            className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white font-bold"
                          />
                        </div>

                        <div>
                          <label className="block text-stone-500 font-bold mb-1">Douane unit. (FCFA)</label>
                          <input
                            type="number"
                            value={item.customsFeeCFA || ''}
                            onChange={(e) => updateItemField(idx, 'customsFeeCFA', parseFloat(e.target.value) || 0)}
                            placeholder="Ex: 1000"
                            className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white font-bold"
                          />
                        </div>
                      </div>

                      <div className="text-right text-xs font-bold text-rose-700">
                        Sous-total article : {new Intl.NumberFormat('fr-FR').format(item.totalItemCFA)} FCFA
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SYNTHÈSE FINANCIÈRE & ACOMPTES */}
            <div className="bg-rose-50/50 p-5 rounded-2xl border border-rose-200 space-y-4">
              <h3 className="font-bold text-stone-900 text-base">
                2. Totaux & Modalités Financières
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-stone-500 block">Total Articles :</span>
                  <span className="font-bold text-stone-900 text-sm">{new Intl.NumberFormat('fr-FR').format(computedSubtotal)} FCFA</span>
                </div>
                <div>
                  <span className="text-stone-500 block">Total Fret :</span>
                  <span className="font-bold text-stone-900 text-sm">{new Intl.NumberFormat('fr-FR').format(computedShipping)} FCFA</span>
                </div>
                <div>
                  <span className="text-stone-500 block">Total Services :</span>
                  <span className="font-bold text-stone-900 text-sm">{new Intl.NumberFormat('fr-FR').format(computedService)} FCFA</span>
                </div>
                <div>
                  <span className="text-stone-500 block">Total Douane :</span>
                  <span className="font-bold text-stone-900 text-sm">{new Intl.NumberFormat('fr-FR').format(computedCustoms)} FCFA</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-rose-200">
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
                  <label className="block text-xs font-bold text-stone-700 mb-1">Acompte demandé (FCFA)</label>
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
                  <span className="text-stone-500 text-xs block">TOTAL NET DU DEVIS :</span>
                  <span className="text-xl font-black text-rose-700">
                    {new Intl.NumberFormat('fr-FR').format(computedGrandTotal)} FCFA
                  </span>
                </div>
                <div>
                  <span className="text-stone-500 text-xs block">SOLDE RESTANT À PERCEVOIR :</span>
                  <span className="text-lg font-black text-stone-900">
                    {new Intl.NumberFormat('fr-FR').format(computedBalanceRemaining)} FCFA
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Note explicative pour le client</label>
                <textarea
                  rows={2}
                  value={editAdminNote}
                  onChange={(e) => setEditAdminNote(e.target.value)}
                  placeholder="Ex: Devis calculé pour le modèle rose Shein. Acompte de 60% demandé..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs outline-hidden"
                />
              </div>
            </div>

            {/* EXPÉDITION & SUIVI TRANSPORTEUR */}
            <div className="space-y-4">
              <h3 className="font-bold text-stone-900 text-base border-l-4 border-amber-500 pl-3">
                3. Données de Suivi Fournisseur & Colis
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
                    placeholder="Ex: Cargo Express Abidjan"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">N° de Suivi Colis</label>
                  <input
                    type="text"
                    value={editCarrierTrackingNumber}
                    onChange={(e) => setEditCarrierTrackingNumber(e.target.value)}
                    placeholder="Ex: CST-CI-99214"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Ajouter une étape personnalisée à la timeline */}
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                <span className="text-xs font-bold text-stone-700 block">
                  + Ajouter un événement spécial à la Timeline du client
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Titre (ex: Colis inspecté à la douane)"
                    value={newTimelineStepTitle}
                    onChange={(e) => setNewTimelineStepTitle(e.target.value)}
                    className="px-3 py-1.5 rounded-lg border border-stone-300 text-xs bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Détails (ex: Formalités complétées, en route vers Cocody)"
                    value={newTimelineStepDesc}
                    onChange={(e) => setNewTimelineStepDesc(e.target.value)}
                    className="px-3 py-1.5 rounded-lg border border-stone-300 text-xs bg-white"
                  />
                </div>
              </div>
            </div>

            {/* BOUTONS ACTIONS MODAL */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-stone-200">
              
              {/* WhatsApp direct avec le nouveau devis */}
              <a
                href={generateClientWhatsAppMessage(selectedTicket)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs transition-colors"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Envoyer le devis sur WhatsApp au client</span>
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

    </div>
  );
}
