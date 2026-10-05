'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  TicketOrder, 
  STATUS_MAP, 
  PLATFORM_CONFIG 
} from '@/lib/types';
import { AppSettings, PaymentAccount } from '@/lib/settings';
import { 
  ShoppingBag, 
  Truck, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  MessageCircle, 
  Printer, 
  Copy, 
  CreditCard, 
  PackageCheck, 
  Plane, 
  User, 
  MapPin, 
  Calendar, 
  Crown,
  X,
  Smartphone,
  ShieldCheck,
  Check,
  Ship
} from 'lucide-react';

interface Props {
  ticket: TicketOrder;
}

export default function TicketTrackingView({ ticket }: Props) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<'quote' | 'tracking' | 'client'>('quote');
  
  // Modal des instructions de paiement
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [copiedAccNumber, setCopiedAccNumber] = useState<string | null>(null);
  const [copiedTicketRef, setCopiedTicketRef] = useState(false);

  // Paramètres de paiement (chargés depuis l'API)
  const [settings, setSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.settings) {
          setSettings(data.settings);
        }
      })
      .catch(err => console.error('Erreur chargement paramètres:', err));
  }, []);

  const statusConfig = STATUS_MAP[ticket.quote.status] || STATUS_MAP.pending;
  const isQuoteCalculated = ticket.quote.grandTotalCFA > 0 || ticket.quote.status !== 'pending';

  const copyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  const copyNumber = (num: string) => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(num);
      setCopiedAccNumber(num);
      setTimeout(() => setCopiedAccNumber(null), 3000);
    }
  };

  const copyTicketRef = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(ticket.id);
      setCopiedTicketRef(true);
      setTimeout(() => setCopiedTicketRef(false), 3000);
    }
  };

  const printPage = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const formatCFA = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  // WhatsApp de confirmation après avoir effectué le paiement
  const getWhatsAppPaymentProofMessage = () => {
    const waNumber = settings?.whatsappNumber || '2290154072488';
    const msg = `Bonjour Christaline Shop Bénin ! 🌸\n`
      + `Je viens d'effectuer le règlement de mon acompte pour le *Ticket ${ticket.id}*.\n`
      + `👤 Client : ${ticket.client.name}\n`
      + `💰 Montant acompte : ${formatCFA(ticket.quote.depositRequiredCFA)}\n`
      + `Je vous transmets ma capture / référence de transaction pour validation de ma commande. Merci !`;
    return `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto printable-card">
      
      {/* EN-TÊTE DU TICKET */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-rose-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="text-xs font-mono font-bold bg-stone-900 text-white px-3 py-1 rounded-lg">
              TICKET OFFICIEL • BÉNIN
            </span>
            <span className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 ${statusConfig.badgeClass}`}>
              <span className="w-2 h-2 rounded-full bg-current animate-ping" />
              <span>{statusConfig.label}</span>
            </span>
            <span className="text-xs text-stone-500 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Créé le {new Date(ticket.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-rose-700 flex items-center gap-3">
            <span>{ticket.id}</span>
          </h1>

          <p className="text-sm text-stone-600 flex items-center gap-2">
            <User className="w-4 h-4 text-stone-400" />
            <span>Client : <strong>{ticket.client.name}</strong></span>
            <span className="text-stone-300">•</span>
            <MapPin className="w-4 h-4 text-stone-400" />
            <span>{ticket.client.city} (Bénin)</span>
          </p>
        </div>

        {/* Boutons d'action rapides */}
        <div className="flex flex-wrap items-center gap-2.5 no-print">
          {ticket.quote.status === 'ready' && (
            <button
              onClick={() => setShowPaymentModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-200 transition-all hover:scale-102 cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              <span>Régler mon Acompte</span>
            </button>
          )}

          <button
            onClick={copyLink}
            className="flex items-center gap-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 px-3.5 py-2.5 rounded-xl text-xs font-bold border border-stone-200 transition-colors cursor-pointer"
            title="Copier le lien du ticket"
          >
            <Copy className="w-3.5 h-3.5 text-stone-600" />
            <span>{copiedLink ? 'Copié !' : 'Partager'}</span>
          </button>

          <button
            onClick={printPage}
            className="flex items-center gap-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 px-3.5 py-2.5 rounded-xl text-xs font-bold border border-stone-200 transition-colors cursor-pointer"
            title="Imprimer / Sauvegarder PDF"
          >
            <Printer className="w-3.5 h-3.5 text-stone-600" />
            <span>Imprimer</span>
          </button>
        </div>
      </div>

      {/* BANNIÈRE RÉSUMÉ RAPIDE STATUT & DÉLAIS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Statut Colis */}
        <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            {ticket.quote.status === 'in_transit' ? (
              <Plane className="w-6 h-6 animate-pulse" />
            ) : ticket.quote.status === 'delivered' ? (
              <PackageCheck className="w-6 h-6 text-green-600" />
            ) : (
              <Truck className="w-6 h-6" />
            )}
          </div>
          <div>
            <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">État actuel</div>
            <div className="text-sm font-black text-stone-800">{ticket.tracking.statusLabel}</div>
          </div>
        </div>

        {/* Délais */}
        <div className="bg-white p-5 rounded-2xl border border-amber-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            {ticket.shippingMode === 'sea' ? <Ship className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
          </div>
          <div>
            <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
              {ticket.shippingMode === 'sea' ? 'Voie Maritime' : 'Voie Aérienne'}
            </div>
            <div className="text-sm font-black text-amber-800">
              {ticket.tracking.estimatedDelivery || (ticket.shippingMode === 'sea' ? '2 à 3 mois' : 'Au plus 1 mois')}
            </div>
          </div>
        </div>

        {/* Montant Total Devis */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Total de la commande</div>
            <div className="text-base font-black text-emerald-700">
              {ticket.quote.grandTotalCFA > 0 ? formatCFA(ticket.quote.grandTotalCFA) : 'En cours de chiffrage'}
            </div>
          </div>
        </div>

      </div>

      {/* NAVIGATION PAR ONGLETS (Mobile First) */}
      <div className="flex items-center border-b border-stone-200 no-print gap-1 sm:gap-2 overflow-x-auto no-scrollbar max-w-full">
        <button
          onClick={() => setActiveTab('quote')}
          className={`pb-3 px-3 sm:px-4 font-bold text-xs sm:text-sm border-b-2 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeTab === 'quote'
              ? 'border-rose-600 text-rose-700'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Articles & Devis ({ticket.items.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('tracking')}
          className={`pb-3 px-3 sm:px-4 font-bold text-xs sm:text-sm border-b-2 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeTab === 'tracking'
              ? 'border-rose-600 text-rose-700'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Suivi Colis</span>
        </button>

        <button
          onClick={() => setActiveTab('client')}
          className={`pb-3 px-3 sm:px-4 font-bold text-xs sm:text-sm border-b-2 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeTab === 'client'
              ? 'border-rose-600 text-rose-700'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Infos Client</span>
        </button>
      </div>

      {/* ONGLET 1 : DEVIS & ARTICLES SANS DÉTAILS INTERNES */}
      {activeTab === 'quote' && (
        <div className="space-y-6">

          {/* Alerte si le devis est en cours de calcul */}
          {ticket.quote.status === 'pending' && (
            <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
              <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1 text-sm text-amber-900">
                <div className="font-bold">Devis en cours de traitement par Christaline Shop Bénin</div>
                <p className="text-xs text-amber-800">
                  Notre équipe consulte vos liens pour calculer le montant total de vos articles en FCFA. 
                  Vous serez notifié(e) dès que le prix total sera affiché ici !
                </p>
              </div>
            </div>
          )}

          {/* LISTE DES ARTICLES AVEC UNIQUEMENT LE PRIX TOTAL PAR ARTICLE */}
          <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
            <div className="p-5 bg-stone-50/80 border-b border-stone-200 flex items-center justify-between">
              <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-rose-600" />
                <span>Articles de votre commande</span>
              </h2>
              <span className="text-xs text-stone-500 font-medium">
                {ticket.items.length} article{ticket.items.length > 1 ? 's' : ''}
              </span>
            </div>

            <div className="divide-y divide-stone-100">
              {ticket.items.map((item, index) => {
                const pltCfg = PLATFORM_CONFIG[item.platform] || PLATFORM_CONFIG.autre;
                const itemTotalPrice = item.totalItemCFA > 0 
                  ? item.totalItemCFA 
                  : (item.unitPriceCFA > 0 ? item.unitPriceCFA * item.quantity : 0);

                return (
                  <div key={item.id || index} className="p-5 sm:p-6 space-y-3 hover:bg-rose-50/20 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      
                      {/* Titre & Informations Article */}
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${pltCfg.bg}`}>
                            {pltCfg.name}
                          </span>
                          <span className="text-xs font-bold text-stone-400">#{index + 1}</span>
                          <h3 className="font-bold text-stone-900 text-sm sm:text-base">
                            {item.name}
                          </h3>
                        </div>

                        {item.variant && (
                          <div className="text-xs text-stone-600">
                            Variante : <span className="font-semibold text-stone-800">{item.variant}</span>
                          </div>
                        )}

                        {item.notes && (
                          <div className="text-xs italic text-stone-500">
                            Remarque : &ldquo;{item.notes}&rdquo;
                          </div>
                        )}
                      </div>

                      {/* Quantité & Lien */}
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs bg-stone-100 text-stone-700 font-bold px-3 py-1.5 rounded-xl border border-stone-200">
                          Qté : {item.quantity}
                        </span>

                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl border border-rose-200 transition-colors"
                        >
                          <span>Voir l'article</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>

                      {/* PRIX TOTAL DE L'ARTICLE (AUCUN DÉTAIL INTERNE) */}
                      <div className="text-left sm:text-right shrink-0 bg-rose-50/60 sm:bg-transparent p-3 sm:p-0 rounded-xl sm:rounded-none">
                        <span className="text-[11px] font-semibold text-stone-500 block uppercase">Prix de l'article</span>
                        <span className="text-lg sm:text-xl font-black text-rose-700">
                          {itemTotalPrice > 0 ? formatCFA(itemTotalPrice) : 'En attente de chiffrage'}
                        </span>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RÉCAPITULATIF FINANCIER ÉPURÉ & INSTRUCTIONS DE PAIEMENT */}
          {isQuoteCalculated && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Carte Résumé Total Client */}
              <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
                <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-rose-600" />
                  <span>Récapitulatif de votre commande</span>
                </h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-stone-600">
                    <span>Nombre d'articles :</span>
                    <span className="font-bold text-stone-900">{ticket.items.length}</span>
                  </div>

                  <div className="border-t border-stone-100 pt-3 flex justify-between items-baseline">
                    <span className="text-base font-black text-stone-900">PRIX TOTAL DE LA COMMANDE :</span>
                    <span className="text-2xl font-black text-rose-600">
                      {formatCFA(ticket.quote.grandTotalCFA)}
                    </span>
                  </div>

                  {ticket.quote.adminNote && (
                    <div className="mt-4 p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-700 space-y-1">
                      <span className="font-bold uppercase tracking-wider text-stone-600 block">Message de Christaline Shop :</span>
                      <p>{ticket.quote.adminNote}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Carte Modalités de Réservation & Bouton d'Instruction */}
              <div className="bg-gradient-to-br from-rose-50 via-pink-50 to-amber-50 rounded-3xl p-6 border border-rose-200 shadow-xs flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-800 bg-white/80 px-2.5 py-1 rounded-full border border-rose-200">
                      Réservation par Acompte (Bénin)
                    </span>
                    <Crown className="w-5 h-5 text-amber-500" />
                  </div>

                  <h3 className="text-xl font-black text-stone-900 font-serif">
                    Modalités de Règlement
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Les commandes se font <strong>sur réservation</strong> après versement de l'acompte. Le reste est réglé à la livraison à Cotonou ou dans votre ville au Bénin.
                  </p>

                  <div className="bg-white p-4 rounded-2xl border border-rose-100 space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-stone-600 font-medium">Acompte à payer :</span>
                      <span className="font-black text-rose-700 text-lg">
                        {formatCFA(ticket.quote.depositRequiredCFA)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <span className="text-stone-600 font-medium">Acompte déjà versé :</span>
                      <span className={`font-bold ${ticket.quote.depositPaidCFA > 0 ? 'text-emerald-600' : 'text-stone-400'}`}>
                        {ticket.quote.depositPaidCFA > 0 ? formatCFA(ticket.quote.depositPaidCFA) : '0 FCFA'}
                      </span>
                    </div>

                    <div className="border-t border-stone-100 pt-2 flex justify-between items-center text-sm">
                      <span className="text-stone-600 font-bold">Reste à payer à la livraison :</span>
                      <span className="font-black text-stone-900 text-base">
                        {formatCFA(ticket.quote.balanceRemainingCFA)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* BOUTON PRINCIPAL : OUVRE LE MODAL D'INSTRUCTIONS DE PAIEMENT */}
                <div className="space-y-2 no-print">
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white font-extrabold px-5 py-4 rounded-2xl text-sm sm:text-base shadow-lg shadow-rose-200 transition-all hover:scale-102 cursor-pointer"
                  >
                    <CreditCard className="w-5 h-5" />
                    <span>Valider mon devis & Régler mon acompte</span>
                  </button>
                  <p className="text-[11px] text-center text-stone-500">
                    MTN Mobile Money • Moov Money • Celtiis Cash Bénin
                  </p>
                </div>

              </div>

            </div>
          )}

        </div>
      )}

      {/* ONGLET 2 : SUIVI COLIS EN DIRECT */}
      {activeTab === 'tracking' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600">
                Acheminement International vers le Bénin
              </span>
              <h2 className="text-2xl font-black text-stone-900 mt-1">
                Suivi de votre Colis
              </h2>
            </div>

            <div className="text-right">
              <div className="text-xs text-stone-400">Délai estimé ({ticket.shippingMode === 'sea' ? 'Maritime' : 'Aérien'})</div>
              <div className="text-sm font-bold text-amber-700">
                {ticket.shippingMode === 'sea' ? '2 à 3 mois' : 'Au plus 1 mois'}
              </div>
            </div>
          </div>

          {/* Numéros d'expédition si disponibles */}
          {(ticket.tracking.supplierOrderNumber || ticket.tracking.carrierTrackingNumber) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ticket.tracking.supplierOrderNumber && (
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs space-y-1">
                  <span className="text-stone-400 uppercase font-bold">N° Commande Fournisseur</span>
                  <div className="font-mono font-bold text-stone-900 text-sm">
                    {ticket.tracking.supplierOrderNumber}
                  </div>
                </div>
              )}

              {ticket.tracking.carrierTrackingNumber && (
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs space-y-1">
                  <span className="text-stone-400 uppercase font-bold">N° Suivi Fret International ({ticket.tracking.carrierName || 'Cargo'})</span>
                  <div className="font-mono font-bold text-rose-700 text-sm flex items-center justify-between">
                    <span>{ticket.tracking.carrierTrackingNumber}</span>
                    {ticket.tracking.carrierTrackingUrl && (
                      <a 
                        href={ticket.tracking.carrierTrackingUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-stone-500 hover:text-rose-600"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TIMELINE VISUELLE */}
          <div className="space-y-6 pt-2">
            <h3 className="font-bold text-stone-900 text-base">
              Chronologie des étapes d'expédition
            </h3>

            <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
              {ticket.tracking.events.map((event, idx) => {
                return (
                  <div key={event.id || idx} className="relative group">
                    <div className={`absolute -left-6 sm:-left-8 top-0.5 flex items-center justify-center w-6 h-6 rounded-full border-2 transition-all ${
                      event.current
                        ? 'bg-rose-600 border-white text-white shadow-md ring-4 ring-rose-200'
                        : event.completed
                        ? 'bg-emerald-500 border-white text-white shadow-xs'
                        : 'bg-stone-100 border-stone-300 text-stone-400'
                    }`}>
                      {event.completed ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-current" />
                      )}
                    </div>

                    <div className={`p-4 rounded-2xl border transition-all ${
                      event.current 
                        ? 'bg-rose-50/70 border-rose-200 shadow-xs' 
                        : event.completed
                        ? 'bg-white border-stone-200'
                        : 'bg-stone-50/50 border-stone-100 opacity-60'
                    }`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                        <h4 className={`font-bold text-sm ${event.current ? 'text-rose-900' : 'text-stone-900'}`}>
                          {event.title}
                        </h4>
                        <span className="text-xs font-mono text-stone-500">
                          {event.date}
                        </span>
                      </div>

                      <p className="text-xs text-stone-600 leading-relaxed">
                        {event.description}
                      </p>

                      {event.location && (
                        <div className="mt-2 text-[11px] font-semibold text-stone-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-stone-400" />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ONGLET 3 : INFOS CLIENT */}
      {activeTab === 'client' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <User className="w-5 h-5 text-rose-600" />
            <span>Coordonnées de Livraison au Bénin</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
              <span className="text-xs text-stone-400 uppercase font-bold block mb-1">Nom complet</span>
              <span className="text-stone-900 font-bold text-base">{ticket.client.name}</span>
            </div>

            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
              <span className="text-xs text-stone-400 uppercase font-bold block mb-1">Téléphone d'appel</span>
              <a href={`tel:${ticket.client.phone}`} className="text-rose-600 font-bold hover:underline">
                {ticket.client.phone}
              </a>
            </div>

            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
              <span className="text-xs text-stone-400 uppercase font-bold block mb-1">Numéro WhatsApp</span>
              <span className="text-emerald-700 font-bold">{ticket.client.whatsapp}</span>
            </div>

            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
              <span className="text-xs text-stone-400 uppercase font-bold block mb-1">Ville / Commune (Bénin)</span>
              <span className="text-stone-900 font-bold">{ticket.client.city}</span>
            </div>

            {ticket.client.address && (
              <div className="sm:col-span-2 p-4 bg-stone-50 rounded-2xl border border-stone-200">
                <span className="text-xs text-stone-400 uppercase font-bold block mb-1">Adresse / Repère de livraison</span>
                <span className="text-stone-800">{ticket.client.address}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL D'INSTRUCTIONS DE PAIEMENT MOBILE MONEY BÉNIN */}
      {/* ============================================================ */}
      {showPaymentModal && (
        <div 
          onClick={() => setShowPaymentModal(false)}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-rose-200 p-6 sm:p-8 space-y-6 my-auto animate-fade-in relative"
          >
            {/* Bouton Fermer */}
            <button
              onClick={() => setShowPaymentModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* En-tête Modal */}
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 text-white flex items-center justify-center mx-auto shadow-md">
                <CreditCard className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black text-stone-900 font-serif">
                {settings?.paymentInstructions?.title || 'Instructions de Paiement Mobile Money'}
              </h3>
              <p className="text-xs text-stone-500">
                Réglez votre acompte pour lancer l'achat immédiat auprès des fournisseurs
              </p>
            </div>

            {/* Boîte Récapitulative du Montant & Référence */}
            <div className="bg-gradient-to-r from-rose-50 to-pink-50 p-4 rounded-2xl border border-rose-200 text-center space-y-2">
              <span className="text-xs font-bold uppercase text-stone-500 block">
                Montant de l'acompte à transférer
              </span>
              <div className="text-3xl font-black text-rose-700">
                {formatCFA(ticket.quote.depositRequiredCFA)}
              </div>

              {/* Référence Ticket à copier */}
              <div className="pt-2 flex items-center justify-center gap-2">
                <span className="text-xs text-stone-600 font-medium">Motif du transfert :</span>
                <span className="font-mono font-black text-stone-900 bg-white px-2 py-0.5 rounded border border-rose-200 text-xs">
                  {ticket.id}
                </span>
                <button
                  onClick={copyTicketRef}
                  className="p-1 rounded-md bg-white hover:bg-rose-100 text-rose-600 border border-rose-200 text-[11px] font-bold cursor-pointer"
                  title="Copier le N° de Ticket"
                >
                  {copiedTicketRef ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Texte d'instructions défini par l'admin */}
            <p className="text-xs text-stone-600 leading-relaxed text-center">
              {settings?.paymentInstructions?.instructionsText || 
                'Effectuez le transfert de votre acompte sur l\'un de nos comptes Mobile Money officiels ci-dessous. Mentionnez impérativement votre N° de ticket en motif.'
              }
            </p>

            {/* LISTE DES COMPTES MOBILE MONEY BÉNIN */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-700 block">
                Comptes de paiement officiels (Bénin) :
              </span>

              {(settings?.paymentInstructions?.accounts || [
                { id: '1', operator: 'MTN Mobile Money Bénin', number: '0154072488', holderName: 'Christaline Shop Bénin', badgeColor: 'bg-yellow-400 text-stone-900 border-yellow-500' },
                { id: '2', operator: 'Moov Money Bénin', number: '0154072488', holderName: 'Christaline Shop Bénin', badgeColor: 'bg-blue-600 text-white border-blue-700' },
                { id: '3', operator: 'Celtiis Cash Bénin', number: '0154072488', holderName: 'Christaline Shop Bénin', badgeColor: 'bg-purple-600 text-white border-purple-700' }
              ]).map((acc: PaymentAccount) => (
                <div 
                  key={acc.id} 
                  className="p-3.5 bg-stone-50 hover:bg-stone-100/80 rounded-2xl border border-stone-200 flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="space-y-0.5">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border inline-block ${acc.badgeColor || 'bg-stone-800 text-white'}`}>
                      {acc.operator}
                    </span>
                    <div className="text-base font-black font-mono text-stone-900">
                      {acc.number}
                    </div>
                    <div className="text-[11px] text-stone-500 font-medium">
                      Titulaire : {acc.holderName}
                    </div>
                  </div>

                  <button
                    onClick={() => copyNumber(acc.number)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-rose-50 border border-stone-300 hover:border-rose-300 rounded-xl text-xs font-bold text-stone-700 transition-colors cursor-pointer shrink-0"
                    title="Copier le numéro"
                  >
                    {copiedAccNumber === acc.number ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copié</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-rose-600" />
                        <span>Copier</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>

            {/* Note de confirmation */}
            <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-[11px] text-amber-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>Après avoir effectué le transfert :</span>
              </div>
              <p>
                {settings?.paymentInstructions?.confirmationNote || 
                  'Veuillez nous envoyer la capture d\'écran ou le SMS de confirmation sur WhatsApp avec votre N° de ticket.'}
              </p>
            </div>

            {/* Bouton de confirmation WhatsApp */}
            <div className="pt-1 space-y-2">
              <a
                href={getWhatsAppPaymentProofMessage()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-5 py-3.5 rounded-2xl text-xs sm:text-sm shadow-md shadow-emerald-200 transition-all hover:scale-102"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>J'ai payé • Envoyer ma preuve sur WhatsApp</span>
              </a>

              <button
                onClick={() => setShowPaymentModal(false)}
                className="w-full py-2.5 rounded-xl border border-stone-200 text-stone-500 text-xs font-bold hover:bg-stone-100 transition-colors cursor-pointer"
              >
                Fermer cette fenêtre
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
