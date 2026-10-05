'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { GroupBuyItem, GroupBuyParticipant, ShippingModeType } from '@/lib/types';
import { 
  Users, 
  Clock, 
  Calendar, 
  Truck, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  ShoppingBag, 
  Heart, 
  ShieldCheck, 
  Phone, 
  MessageCircle, 
  Copy, 
  Check, 
  X, 
  AlertCircle,
  TrendingUp,
  Percent,
  Search,
  ChevronRight,
  Plane,
  Ship
} from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { getWhatsAppDirectUrl } from '@/lib/settings';
import { trackViewContent, trackInitiateCheckout, trackGroupBuyReservation, trackContactClick } from '@/lib/trackingClient';

export default function VentesGroupeesPage() {
  const { settings } = useSettings();
  const [groupBuys, setGroupBuys] = useState<GroupBuyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'open' | 'goal_reached' | 'air' | 'sea'>('all');
  const [search, setSearch] = useState('');

  // Modal de participation
  const [selectedItem, setSelectedItem] = useState<GroupBuyItem | null>(null);
  const [clientName, setClientName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [city, setCity] = useState('Cotonou');
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Succès de participation
  const [successData, setSuccessData] = useState<{
    ticketId: string;
    itemTitle: string;
    totalCFA: number;
    depositCFA: number;
    orderDate: string;
  } | null>(null);

  const [copiedTicket, setCopiedTicket] = useState(false);

  useEffect(() => {
    fetchGroupBuys();
  }, []);

  const fetchGroupBuys = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/group-buys');
      const data = await res.json();
      if (data.success && Array.isArray(data.groupBuys)) {
        setGroupBuys(data.groupBuys);
      }
    } catch (err) {
      console.error('Erreur chargement ventes groupées:', err);
    } finally {
      setLoading(false);
    }
  };

  const openJoinModal = (item: GroupBuyItem) => {
    setSelectedItem(item);
    setQuantity(1);
    setSelectedVariant(item.variants && item.variants.length > 0 ? item.variants[0] : '');
    setSubmitError(null);
    setSuccessData(null);

    // Tracking ViewContent & InitiateCheckout
    trackViewContent(item.title, 'Vente en Groupe', item.priceCFA);
    trackInitiateCheckout(`Vente Groupe: ${item.title}`, item.priceCFA);
  };

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch(`/api/group-buys/${selectedItem.id}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: clientName.trim(),
          whatsapp: whatsapp.trim(),
          city: city.trim(),
          quantity,
          variant: selectedVariant,
          notes: notes.trim()
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erreur lors de la réservation');
      }

      const total = selectedItem.priceCFA * quantity;
      const deposit = Math.round(total * 0.6);

      // Tracking Purchase / Réservation pour Meta Pixel, TikTok Pixel & Stats
      trackGroupBuyReservation(selectedItem.title, total, quantity, clientName.trim());

      setSuccessData({
        ticketId: data.ticketId,
        itemTitle: selectedItem.title,
        totalCFA: total,
        depositCFA: deposit,
        orderDate: selectedItem.orderDate
      });

      // Mettre à jour l'article dans la liste locale
      setGroupBuys(prev => prev.map(gb => gb.id === selectedItem.id ? data.groupBuy : gb));

    } catch (err: any) {
      setSubmitError(err.message || 'Une erreur est survenue');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyTicket = (ticketId: string) => {
    navigator.clipboard.writeText(ticketId);
    setCopiedTicket(true);
    setTimeout(() => setCopiedTicket(false), 2500);
  };

  // Filtrage des articles
  const filteredItems = groupBuys.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
                          item.description.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;

    if (filter === 'open') return item.status === 'open';
    if (filter === 'goal_reached') return item.status === 'goal_reached';
    if (filter === 'air') return item.shippingMode === 'air';
    if (filter === 'sea') return item.shippingMode === 'sea';
    return true;
  });

  const getStatusBadge = (status: string, current: number, min: number) => {
    if (status === 'goal_reached' || current >= min) {
      return (
        <span className="inline-flex items-center gap-1 bg-emerald-500 text-white text-[11px] font-black px-2.5 py-1 rounded-full shadow-xs">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Objectif Atteint (Confirmé)</span>
        </span>
      );
    }
    if (status === 'ordered') {
      return (
        <span className="inline-flex items-center gap-1 bg-purple-600 text-white text-[11px] font-black px-2.5 py-1 rounded-full shadow-xs">
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Commande Passée</span>
        </span>
      );
    }
    if (status === 'closed') {
      return (
        <span className="inline-flex items-center gap-1 bg-stone-600 text-white text-[11px] font-black px-2.5 py-1 rounded-full shadow-xs">
          <X className="w-3.5 h-3.5" />
          <span>Vente Clôturée</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 bg-rose-600 text-white text-[11px] font-black px-2.5 py-1 rounded-full shadow-xs animate-pulse">
        <Users className="w-3.5 h-3.5" />
        <span>En cours de réservation</span>
      </span>
    );
  };

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <Navbar />

      <main className="flex-1 pb-20 space-y-12">

        {/* HERO SECTION VENTES EN GROUPE */}
        <section className="relative overflow-hidden bg-gradient-to-b from-stone-900 via-stone-850 to-stone-900 text-white pt-12 pb-16 px-4 sm:px-6 lg:px-8 border-b-4 border-rose-500">
          
          <div className="max-w-7xl mx-auto relative z-10 text-center space-y-6">
            <div className="inline-flex items-center gap-2 bg-rose-500/20 border border-rose-500/40 text-rose-300 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>ÉCONOMISEZ JUSQU'À -50% • CHRISTALINE SHOP BÉNIN</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-serif tracking-tight max-w-4xl mx-auto leading-tight">
              Ventes en Groupe & <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-pink-300 to-amber-300">
                Commandes Groupées
              </span>
            </h1>

            <p className="text-stone-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              Ensemble, obtenons les prix les plus bas chez les fournisseurs internationaux ! L'administrateur sélectionne les articles vedettes, fixe une <strong>quantité minimum</strong> et la <strong>date exacte où la commande sera passée</strong>.
            </p>

            {/* Badges d'avantages */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs font-bold text-stone-200">
              <div className="flex items-center gap-2 bg-white/10 px-3.5 py-2 rounded-xl backdrop-blur-xs border border-white/10">
                <Users className="w-4 h-4 text-rose-400" />
                <span>Tarif grossiste dès 1 pièce</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-3.5 py-2 rounded-xl backdrop-blur-xs border border-white/10">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>Date de commande transparente</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-3.5 py-2 rounded-xl backdrop-blur-xs border border-white/10">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Paiement sécurisé Mobile Money Bénin</span>
              </div>
            </div>
          </div>
        </section>

        {/* BARRE D'ACTION, RECHERCHE & FILTRES */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="bg-white p-4 sm:p-6 rounded-3xl shadow-xs border border-stone-200 flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Barre de recherche */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Rechercher un article..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm focus:border-rose-500 outline-hidden"
              />
            </div>

            {/* Filtres par statut (défilement horizontal fluide sur mobile) */}
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pb-1 w-full md:w-auto max-w-full">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  filter === 'all'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                Toutes ({groupBuys.length})
              </button>

              <button
                onClick={() => setFilter('open')}
                className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  filter === 'open'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                En cours ({groupBuys.filter(g => g.status === 'open').length})
              </button>

              <button
                onClick={() => setFilter('goal_reached')}
                className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  filter === 'goal_reached'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                Confirmées ({groupBuys.filter(g => g.status === 'goal_reached').length})
              </button>

              <button
                onClick={() => setFilter('air')}
                className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  filter === 'air'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                ✈️ Aérien (≤ 1 mois)
              </button>

              <button
                onClick={() => setFilter('sea')}
                className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  filter === 'sea'
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                🚢 Maritime (2-3 mois)
              </button>
            </div>
          </div>

          {/* LISTE DES VENTES EN GROUPE */}
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-stone-500 font-bold">Chargement des ventes groupées en cours...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-stone-800">Aucune vente groupée ne correspond à ce critère</h3>
              <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto">
                Modifiez vos filtres ou revenez très vite pour découvrir de nouvelles offres sélectionnées par l'équipe Christaline Shop.
              </p>
              <button
                onClick={() => { setFilter('all'); setSearch(''); }}
                className="px-5 py-2.5 bg-stone-900 text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-stone-800"
              >
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => {
                const progressPct = Math.min(100, Math.round((item.currentQuantity / item.minQuantity) * 100));
                const remaining = Math.max(0, item.minQuantity - item.currentQuantity);
                const discountPct = item.originalPriceCFA
                  ? Math.round(((item.originalPriceCFA - item.priceCFA) / item.originalPriceCFA) * 100)
                  : null;

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-xl hover:border-rose-300 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Image avec superpositions */}
                      <div className="relative h-64 w-full bg-stone-100 overflow-hidden">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        
                        {/* Overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

                        {/* Badges en haut */}
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                          <div>
                            {getStatusBadge(item.status, item.currentQuantity, item.minQuantity)}
                          </div>

                          <div className="flex items-center gap-1.5">
                            {discountPct && (
                              <span className="bg-amber-500 text-white text-xs font-black px-2.5 py-1 rounded-full shadow-xs">
                                -{discountPct}%
                              </span>
                            )}
                            <span className="bg-stone-900/80 backdrop-blur-md text-white text-[11px] font-bold px-2 py-0.5 rounded-md uppercase">
                              {item.platform || 'SHEIN'}
                            </span>
                          </div>
                        </div>

                        {/* Mode d'expédition en bas de l'image */}
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-bold">
                          <span className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                            {item.shippingMode === 'sea' ? (
                              <>
                                <Ship className="w-3.5 h-3.5 text-cyan-300" />
                                <span>Maritime (2 à 3 mois)</span>
                              </>
                            ) : (
                              <>
                                <Plane className="w-3.5 h-3.5 text-amber-300" />
                                <span>Aérien (≤ 1 mois)</span>
                              </>
                            )}
                          </span>

                          <span className="bg-rose-600/90 backdrop-blur-md px-2.5 py-1 rounded-lg flex items-center gap-1 text-[11px]">
                            <Users className="w-3 h-3" />
                            <span>{item.participants?.length || 0} participants</span>
                          </span>
                        </div>
                      </div>

                      {/* Contenu de la carte */}
                      <div className="p-5 sm:p-6 space-y-4">
                        
                        {/* Titre & Description */}
                        <div>
                          <h3 className="font-bold text-stone-900 text-base sm:text-lg group-hover:text-rose-600 transition-colors line-clamp-1">
                            {item.title}
                          </h3>
                          <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        </div>

                        {/* Options / Variantes */}
                        {item.variants && item.variants.length > 0 && (
                          <div className="space-y-1.5">
                            <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                              Options & Tailles :
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {item.variants.slice(0, 3).map((v, i) => (
                                <span key={i} className="text-[10px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md font-medium">
                                  {v}
                                </span>
                              ))}
                              {item.variants.length > 3 && (
                                <span className="text-[10px] bg-stone-100 text-stone-500 px-2 py-0.5 rounded-md font-medium">
                                  +{item.variants.length - 3} autres
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* DATE DE PASSAGE DE COMMANDE */}
                        <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                            <Calendar className="w-5 h-5 text-amber-600" />
                          </div>
                          <div>
                            <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                              Commande passée le :
                            </div>
                            <div className="text-xs sm:text-sm font-black text-amber-950">
                              {formatDateDisplay(item.orderDate)}
                            </div>
                          </div>
                        </div>

                        {/* JAUGE DE PROGRESSION QUANTITÉ MINIMUM */}
                        <div className="space-y-2 pt-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-stone-700 flex items-center gap-1.5">
                              <TrendingUp className="w-3.5 h-3.5 text-rose-600" />
                              <span>Quantité réservée :</span>
                            </span>
                            <span className="font-mono font-black text-stone-900">
                              <span className="text-rose-600">{item.currentQuantity}</span> / {item.minQuantity} pièces
                            </span>
                          </div>

                          {/* Barre visuelle */}
                          <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden p-0.5 border border-stone-200">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${
                                item.currentQuantity >= item.minQuantity
                                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                                  : 'bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500'
                              }`}
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>

                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-stone-400 font-medium">
                              Objectif min. {item.minQuantity} pcs
                            </span>
                            {remaining > 0 ? (
                              <span className="text-rose-600 font-bold">
                                Plus que {remaining} pièce{remaining > 1 ? 's' : ''} !
                              </span>
                            ) : (
                              <span className="text-emerald-600 font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Objectif validé !
                              </span>
                            )}
                          </div>
                        </div>

                        {/* PRIX FCFA */}
                        <div className="pt-2 border-t border-stone-100 flex items-baseline justify-between">
                          <div>
                            <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                              Prix Vente Groupée
                            </div>
                            <div className="flex items-baseline gap-2">
                              <span className="text-2xl font-black text-stone-950 font-mono">
                                {item.priceCFA.toLocaleString('fr-FR')}
                              </span>
                              <span className="text-xs font-bold text-rose-600 font-sans">
                                FCFA
                              </span>
                            </div>
                          </div>

                          {item.originalPriceCFA && (
                            <div className="text-right">
                              <div className="text-[10px] text-stone-400">Prix public</div>
                              <div className="text-xs text-stone-400 line-through font-mono">
                                {item.originalPriceCFA.toLocaleString('fr-FR')} FCFA
                              </div>
                            </div>
                          )}
                        </div>

                      </div>
                    </div>

                    {/* Bouton d'action */}
                    <div className="p-5 pt-0">
                      <button
                        onClick={() => openJoinModal(item)}
                        disabled={item.status === 'closed'}
                        className={`w-full py-3.5 px-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                          item.status === 'closed'
                            ? 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none'
                            : 'bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white shadow-rose-200 hover:-translate-y-0.5'
                        }`}
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Participer à la vente ({item.priceCFA.toLocaleString('fr-FR')} FCFA)</span>
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* MODAL DE PARTICIPATION & RÉSERVATION */}
        {selectedItem && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div 
              className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-200 my-8 max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header Modal */}
              <div className="bg-stone-900 text-white p-5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-rose-600 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-base font-black">Réservation Vente en Groupe</h2>
                    <p className="text-[11px] text-stone-400">Christaline Shop Bénin</p>
                  </div>
                </div>

                <button
                  onClick={() => { setSelectedItem(null); setSuccessData(null); }}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Contenu du Modal */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1">
                
                {/* ÉCRAN DE SUCCÈS APRÈS RÉSERVATION */}
                {successData ? (
                  <div className="text-center space-y-6 py-2">
                    <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-2xl font-black text-stone-900 font-serif">
                        Réservation Confirmée !
                      </h3>
                      <p className="text-xs text-stone-600 max-w-sm mx-auto">
                        Votre participation pour <strong>{successData.itemTitle}</strong> a bien été enregistrée. Un ticket officiel a été généré pour vous.
                      </p>
                    </div>

                    {/* Encadré Ticket généré */}
                    <div className="bg-rose-50 border-2 border-rose-200 rounded-3xl p-5 space-y-3">
                      <div className="text-xs font-bold text-rose-800 uppercase tracking-wider">
                        Votre Numéro de Ticket Officiel
                      </div>
                      <div className="flex items-center justify-center gap-3">
                        <span className="text-3xl font-mono font-black text-rose-700 tracking-wider">
                          {successData.ticketId}
                        </span>
                        <button
                          onClick={() => handleCopyTicket(successData.ticketId)}
                          className="p-2 rounded-xl bg-white hover:bg-rose-100 border border-rose-300 text-rose-700 transition-colors cursor-pointer"
                          title="Copier le numéro de ticket"
                        >
                          {copiedTicket ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-[11px] text-stone-500">
                        Conservez précieusement ce numéro pour suivre votre commande et valider votre acompte.
                      </p>
                    </div>

                    {/* Récapitulatif montant & acompte */}
                    <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-2 text-xs">
                      <div className="flex justify-between text-stone-600">
                        <span>Montant total :</span>
                        <span className="font-mono font-bold text-stone-900">{successData.totalCFA.toLocaleString('fr-FR')} FCFA</span>
                      </div>
                      <div className="flex justify-between text-rose-700 font-bold border-t border-stone-200 pt-2">
                        <span>Acompte requis (60%) :</span>
                        <span className="font-mono text-sm">{successData.depositCFA.toLocaleString('fr-FR')} FCFA</span>
                      </div>
                      <div className="flex justify-between text-stone-500 text-[11px]">
                        <span>Date de commande :</span>
                        <span>{formatDateDisplay(successData.orderDate)}</span>
                      </div>
                    </div>

                    {/* Boutons d'action après succès */}
                    <div className="space-y-2 pt-2">
                      <Link
                        href={`/ticket/${successData.ticketId}`}
                        className="w-full py-3.5 px-4 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all"
                      >
                        <ShieldCheck className="w-4 h-4 text-rose-400" />
                        <span>Accéder à mon Ticket & Payer l'Acompte</span>
                      </Link>

                      <a
                        href={getWhatsAppDirectUrl(
                          settings?.whatsappNumber || '0154072488',
                          `Bonjour Christaline Shop, je viens de réserver la vente en groupe pour le ticket ${successData.ticketId}`
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => trackContactClick('whatsapp', 'group_buy_success')}
                        className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <MessageCircle className="w-4 h-4 fill-white" />
                        <span>Confirmer sur WhatsApp ({settings?.whatsappNumber || '0154072488'})</span>
                      </a>
                    </div>
                  </div>
                ) : (
                  /* FORMULAIRE DE PARTICIPATION */
                  <form onSubmit={handleJoinSubmit} className="space-y-5">
                    
                    {/* Récap Article sélectionné */}
                    <div className="flex items-center gap-3 p-3.5 bg-stone-50 rounded-2xl border border-stone-200">
                      <img
                        src={selectedItem.imageUrl}
                        alt={selectedItem.title}
                        className="w-16 h-16 rounded-xl object-cover shrink-0"
                      />
                      <div className="space-y-0.5">
                        <h4 className="font-bold text-stone-900 text-xs sm:text-sm line-clamp-1">{selectedItem.title}</h4>
                        <div className="text-xs font-mono font-bold text-rose-600">
                          {selectedItem.priceCFA.toLocaleString('fr-FR')} FCFA / pièce
                        </div>
                        <div className="text-[11px] text-amber-800 flex items-center gap-1 font-medium">
                          <Calendar className="w-3 h-3 text-amber-600" />
                          <span>Commande passée le : {formatDateDisplay(selectedItem.orderDate)}</span>
                        </div>
                      </div>
                    </div>

                    {submitError && (
                      <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{submitError}</span>
                      </div>
                    )}

                    {/* Nom & Prénom */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                        Votre Nom & Prénom *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Sophie Dossou"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-stone-200 text-base sm:text-sm focus:border-rose-500 outline-hidden bg-stone-50"
                      />
                    </div>

                    {/* Numéro WhatsApp */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                        Numéro WhatsApp Bénin (+229) *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="Ex: 0154072488"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-stone-200 text-base sm:text-sm focus:border-rose-500 outline-hidden bg-stone-50"
                      />
                    </div>

                    {/* Ville */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                        Ville de livraison au Bénin *
                      </label>
                      <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-stone-200 text-base sm:text-sm focus:border-rose-500 outline-hidden bg-stone-50"
                      >
                        <option value="Cotonou">Cotonou</option>
                        <option value="Abomey-Calavi">Abomey-Calavi</option>
                        <option value="Porto-Novo">Porto-Novo</option>
                        <option value="Ouidah">Ouidah</option>
                        <option value="Parakou">Parakou</option>
                        <option value="Bohicon">Bohicon</option>
                        <option value="Autre ville">Autre ville au Bénin</option>
                      </select>
                    </div>

                    {/* Choix variante si applicable */}
                    {selectedItem.variants && selectedItem.variants.length > 0 && (
                      <div>
                        <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                          Taille / Variante souhaitée *
                        </label>
                        <select
                          value={selectedVariant}
                          onChange={(e) => setSelectedVariant(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-stone-200 text-base sm:text-sm focus:border-rose-500 outline-hidden bg-stone-50"
                        >
                          {selectedItem.variants.map((v, i) => (
                            <option key={i} value={v}>{v}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Quantité désirée */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                        Quantité à réserver
                      </label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="w-10 h-10 rounded-xl bg-stone-100 hover:bg-stone-200 font-bold text-stone-800 text-base flex items-center justify-center cursor-pointer"
                        >
                          -
                        </button>
                        <span className="font-mono text-lg font-black text-stone-900 w-12 text-center">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQuantity(quantity + 1)}
                          className="w-10 h-10 rounded-xl bg-stone-100 hover:bg-stone-200 font-bold text-stone-800 text-base flex items-center justify-center cursor-pointer"
                        >
                          +
                        </button>
                        <span className="text-xs text-stone-400">
                          pièce{quantity > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    {/* Commentaire optionnel */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                        Instructions particulières (Optionnel)
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Ex: Précision sur la couleur, quartier exact..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs focus:border-rose-500 outline-hidden bg-stone-50"
                      />
                    </div>

                    {/* Récapitulatif Total & Acompte */}
                    <div className="bg-gradient-to-r from-rose-50 to-amber-50 p-4 rounded-2xl border border-rose-200 space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-stone-700">
                        <span>Total de votre commande ({quantity} pièce{quantity > 1 ? 's' : ''}) :</span>
                        <span className="font-mono font-black text-stone-900 text-sm">
                          {(selectedItem.priceCFA * quantity).toLocaleString('fr-FR')} FCFA
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-bold text-rose-700">
                        <span>Acompte pour bloquer votre place (60%) :</span>
                        <span className="font-mono text-base">
                          {Math.round(selectedItem.priceCFA * quantity * 0.6).toLocaleString('fr-FR')} FCFA
                        </span>
                      </div>
                      <p className="text-[10px] text-stone-500 pt-1">
                        💡 Vous recevrez les instructions Mobile Money Bénin (MTN MoMo / Moov Money / Celtiis) dès la validation.
                      </p>
                    </div>

                    {/* Bouton de confirmation */}
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-4 bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white font-black rounded-2xl text-sm shadow-lg shadow-rose-200 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {submitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Enregistrement en cours...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-5 h-5" />
                          <span>Confirmer ma réservation ({quantity} pièce{quantity > 1 ? 's' : ''})</span>
                        </>
                      )}
                    </button>

                  </form>
                )}

              </div>
            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
