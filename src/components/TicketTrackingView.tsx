'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  TicketOrder, 
  STATUS_MAP, 
  PLATFORM_CONFIG, 
  QuoteStatus 
} from '@/lib/types';
import { 
  ShoppingBag, 
  Truck, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  MessageCircle, 
  Printer, 
  Share2, 
  Copy, 
  CreditCard, 
  PackageCheck, 
  Plane, 
  Building, 
  AlertCircle,
  FileText,
  User,
  MapPin,
  Calendar,
  Sparkles,
  Crown
} from 'lucide-react';

interface Props {
  ticket: TicketOrder;
}

export default function TicketTrackingView({ ticket }: Props) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'quote' | 'tracking' | 'client'>('quote');

  const statusConfig = STATUS_MAP[ticket.quote.status] || STATUS_MAP.pending;
  const isQuoteCalculated = ticket.quote.grandTotalCFA > 0 || ticket.quote.status !== 'pending';

  const copyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const printPage = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  // Formatage des montants FCFA
  const formatCFA = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  // Lien WhatsApp client vers Christaline Shop avec message contextuel
  const getWhatsAppMessage = () => {
    let msg = `Bonjour Christaline Shop ! 🌸\nJe consulte mon ticket *${ticket.id}* (Client: ${ticket.client.name}).\n`;
    if (ticket.quote.status === 'ready') {
      msg += `Mon devis est de *${formatCFA(ticket.quote.grandTotalCFA)}*. Je souhaite valider et régler mon acompte de *${formatCFA(ticket.quote.depositRequiredCFA)}*. Merci de me communiquer les détails de paiement !`;
    } else if (ticket.quote.status === 'pending') {
      msg += `Je voulais savoir si mon devis est en cours de calcul pour mes ${ticket.items.length} article(s). Merci !`;
    } else {
      msg += `Statut actuel : *${ticket.tracking.statusLabel}*. Avez-vous une mise à jour sur l'arrivée de mon colis ?`;
    }
    return `https://wa.me/2250154072488?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto printable-card">
      
      {/* EN-TÊTE DU TICKET */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-rose-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="text-xs font-mono font-bold bg-stone-900 text-white px-3 py-1 rounded-lg">
              TICKET OFFICIEL
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
            <span>{ticket.client.city}</span>
          </p>
        </div>

        {/* Boutons d'action rapides */}
        <div className="flex flex-wrap items-center gap-2.5 no-print">
          <a
            href={getWhatsAppMessage()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-200 transition-all hover:scale-102"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>WhatsApp (0154072488)</span>
          </a>

          <button
            onClick={copyLink}
            className="flex items-center gap-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 px-3.5 py-2.5 rounded-xl text-xs font-bold border border-stone-200 transition-colors cursor-pointer"
            title="Copier le lien du ticket"
          >
            <Copy className="w-3.5 h-3.5 text-stone-600" />
            <span>{copied ? 'Copié !' : 'Partager'}</span>
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
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Délai estimé</div>
            <div className="text-sm font-black text-amber-800">{ticket.tracking.estimatedDelivery || '7 à 12 jours ouvrables'}</div>
          </div>
        </div>

        {/* Montant / Acompte */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Total Devis (FCFA)</div>
            <div className="text-base font-black text-emerald-700">
              {ticket.quote.grandTotalCFA > 0 ? formatCFA(ticket.quote.grandTotalCFA) : 'En cours de chiffrage'}
            </div>
          </div>
        </div>

      </div>

      {/* NAVIGATION PAR ONGLETS */}
      <div className="flex border-b border-stone-200 no-print gap-2">
        <button
          onClick={() => setActiveTab('quote')}
          className={`pb-3 px-4 font-bold text-sm border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'quote'
              ? 'border-rose-600 text-rose-700'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Devis & Articles ({ticket.items.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('tracking')}
          className={`pb-3 px-4 font-bold text-sm border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'tracking'
              ? 'border-rose-600 text-rose-700'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Suivi Colis en direct</span>
        </button>

        <button
          onClick={() => setActiveTab('client')}
          className={`pb-3 px-4 font-bold text-sm border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'client'
              ? 'border-rose-600 text-rose-700'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Infos Client & Adresse</span>
        </button>
      </div>

      {/* ONGLET 1 : DEVIS & ARTICLES */}
      {activeTab === 'quote' && (
        <div className="space-y-6">

          {/* Alerte si le devis est encore en attente */}
          {ticket.quote.status === 'pending' && (
            <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
              <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1 text-sm text-amber-900">
                <div className="font-bold">Devis en cours de traitement par Christaline Shop</div>
                <p className="text-xs text-amber-800">
                  Notre équipe consulte vos liens pour calculer le tarif en FCFA, les frais de fret aérien et la douane. 
                  Vous recevrez un message WhatsApp dès que ce devis sera mis à jour !
                </p>
                <div className="pt-2">
                  <a
                    href={`https://wa.me/2250154072488?text=Bonjour%2C%20je%20relance%20pour%20mon%20ticket%20${ticket.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 underline hover:text-amber-950"
                  >
                    <span>Relancer l'équipe sur WhatsApp (0154072488) ›</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Tableau des articles et devis individuel */}
          <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
            <div className="p-5 bg-stone-50/80 border-b border-stone-200 flex items-center justify-between">
              <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-rose-600" />
                <span>Articles demandés & Devis Individuel</span>
              </h2>
              <span className="text-xs text-stone-500 font-medium">
                {ticket.items.length} produit{ticket.items.length > 1 ? 's' : ''}
              </span>
            </div>

            <div className="divide-y divide-stone-100">
              {ticket.items.map((item, index) => {
                const pltCfg = PLATFORM_CONFIG[item.platform] || PLATFORM_CONFIG.autre;
                return (
                  <div key={item.id || index} className="p-5 sm:p-6 space-y-4 hover:bg-rose-50/20 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      
                      {/* Titre & Plateforme */}
                      <div className="space-y-1">
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
                            Variante / Modèle : <span className="font-semibold text-stone-800">{item.variant}</span>
                          </div>
                        )}

                        {item.notes && (
                          <div className="text-xs italic text-stone-500">
                            Note client : &ldquo;{item.notes}&rdquo;
                          </div>
                        )}
                      </div>

                      {/* Quantité & Lien produit */}
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs bg-stone-100 text-stone-700 font-bold px-2.5 py-1 rounded-lg">
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

                    </div>

                    {/* DÉCOMPTE DU DEVIS INDIVIDUEL (FCFA) */}
                    <div className="bg-stone-50/80 p-4 rounded-2xl border border-stone-200 grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                      <div>
                        <span className="text-stone-400 block text-[11px]">Prix article (unit.)</span>
                        <span className="font-bold text-stone-800 text-sm">
                          {item.unitPriceCFA > 0 ? formatCFA(item.unitPriceCFA) : 'En attente'}
                        </span>
                      </div>

                      <div>
                        <span className="text-stone-400 block text-[11px]">Fret / Port (unit.)</span>
                        <span className="font-bold text-stone-800 text-sm">
                          {item.shippingFeeCFA > 0 ? formatCFA(item.shippingFeeCFA) : 'Inclus / Estim.'}
                        </span>
                      </div>

                      <div>
                        <span className="text-stone-400 block text-[11px]">Commission service</span>
                        <span className="font-bold text-stone-800 text-sm">
                          {item.serviceFeeCFA > 0 ? formatCFA(item.serviceFeeCFA) : 'Inclus'}
                        </span>
                      </div>

                      <div>
                        <span className="text-stone-400 block text-[11px]">Douane</span>
                        <span className="font-bold text-stone-800 text-sm">
                          {item.customsFeeCFA > 0 ? formatCFA(item.customsFeeCFA) : 'Inclus'}
                        </span>
                      </div>

                      <div className="col-span-2 sm:col-span-1 border-t sm:border-t-0 sm:border-l border-stone-200 pt-2 sm:pt-0 sm:pl-3">
                        <span className="text-rose-600 font-bold block text-[11px] uppercase">Total cet article</span>
                        <span className="font-black text-rose-700 text-base">
                          {item.totalItemCFA > 0 ? formatCFA(item.totalItemCFA) : (item.unitPriceCFA > 0 ? formatCFA(item.unitPriceCFA * item.quantity) : 'À chiffrer')}
                        </span>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

          {/* RÉCAPITULATIF FINANCIER GLOBAL DU DEVIS */}
          {isQuoteCalculated && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Carte des détails financiers */}
              <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
                <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-rose-600" />
                  <span>Détail du Devis Global</span>
                </h3>

                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between text-stone-600">
                    <span>Sous-total articles :</span>
                    <span className="font-semibold text-stone-800">{formatCFA(ticket.quote.subtotalItemsCFA)}</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>Frais de port / Fret international :</span>
                    <span className="font-semibold text-stone-800">{formatCFA(ticket.quote.totalShippingCFA)}</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>Commission de service Christaline :</span>
                    <span className="font-semibold text-stone-800">{formatCFA(ticket.quote.totalServiceFeeCFA)}</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>Frais de douane & transit :</span>
                    <span className="font-semibold text-stone-800">{formatCFA(ticket.quote.totalCustomsCFA)}</span>
                  </div>
                  {ticket.quote.discountCFA > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Remise accordée :</span>
                      <span>-{formatCFA(ticket.quote.discountCFA)}</span>
                    </div>
                  )}

                  <div className="border-t-2 border-stone-100 pt-3 flex justify-between items-baseline">
                    <span className="text-base font-black text-stone-900">TOTAL NET DU DEVIS :</span>
                    <span className="text-2xl font-black text-rose-600">
                      {formatCFA(ticket.quote.grandTotalCFA)}
                    </span>
                  </div>
                </div>

                {ticket.quote.adminNote && (
                  <div className="mt-4 p-3.5 rounded-xl bg-rose-50/60 border border-rose-200 text-xs text-rose-950 space-y-1">
                    <span className="font-bold uppercase tracking-wider text-rose-700 block">Note de Christaline Shop :</span>
                    <p>{ticket.quote.adminNote}</p>
                  </div>
                )}
              </div>

              {/* Carte de validation de l'acompte */}
              <div className="bg-gradient-to-br from-rose-50 via-pink-50 to-amber-50 rounded-3xl p-6 border border-rose-200 shadow-xs flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-800 bg-white/80 px-2.5 py-1 rounded-full border border-rose-200">
                      Modalités de réservation
                    </span>
                    <Crown className="w-5 h-5 text-amber-500" />
                  </div>

                  <h3 className="text-xl font-black text-stone-900 font-serif">
                    Validation par Acompte
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Les commandes chez le fournisseur se font <strong>sur réservation</strong> après validation d'un acompte. Le solde est réglé à la livraison de vos articles.
                  </p>

                  <div className="bg-white p-4 rounded-2xl border border-rose-100 space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-stone-600 font-medium">Acompte demandé :</span>
                      <span className="font-black text-rose-700 text-lg">
                        {formatCFA(ticket.quote.depositRequiredCFA)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <span className="text-stone-600 font-medium">Acompte déjà réglé :</span>
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

                {/* Bouton de confirmation WhatsApp */}
                <div className="space-y-2 no-print">
                  <a
                    href={getWhatsAppMessage()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-5 py-3.5 rounded-2xl text-sm shadow-md shadow-emerald-200 transition-all hover:scale-102"
                  >
                    <MessageCircle className="w-5 h-5 fill-white" />
                    <span>Valider mon devis & Régler mon acompte</span>
                  </a>
                  <p className="text-[11px] text-center text-stone-500">
                    Paiement accepté : Wave, Orange Money, MTN MoMo, Moov Money
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
                Acheminement International
              </span>
              <h2 className="text-2xl font-black text-stone-900 mt-1">
                Suivi de votre Colis
              </h2>
            </div>

            <div className="text-right">
              <div className="text-xs text-stone-400">Délai contractuel</div>
              <div className="text-sm font-bold text-amber-700">7 à 12 jours ouvrables</div>
            </div>
          </div>

          {/* Cartes d'informations d'expédition si disponibles */}
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
                  <span className="text-stone-400 uppercase font-bold">N° Suivi / Transitaire ({ticket.tracking.carrierName || 'Express'})</span>
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

          {/* TIMELINE VISUELLE INTERACTIVE */}
          <div className="space-y-6 pt-2">
            <h3 className="font-bold text-stone-900 text-base">
              Chronologie des étapes
            </h3>

            <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
              {ticket.tracking.events.map((event, idx) => {
                return (
                  <div key={event.id || idx} className="relative group">
                    
                    {/* Pastille */}
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

                    {/* Contenu étape */}
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

          {/* Mention de réassurance */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-600 shrink-0" />
            <p>
              Notre équipe surveille votre colis quotidiennement. Vous êtes notifié(e) par WhatsApp dès qu'il atterrit à Abidjan pour la livraison !
            </p>
          </div>

        </div>
      )}

      {/* ONGLET 3 : INFOS CLIENT */}
      {activeTab === 'client' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <User className="w-5 h-5 text-rose-600" />
            <span>Coordonnées de Livraison</span>
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
              <a 
                href={`https://wa.me/225${ticket.client.whatsapp.replace(/\D/g, '')}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-emerald-600 font-bold hover:underline flex items-center gap-1.5"
              >
                <MessageCircle className="w-4 h-4 fill-emerald-600 text-white" />
                <span>{ticket.client.whatsapp}</span>
              </a>
            </div>

            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
              <span className="text-xs text-stone-400 uppercase font-bold block mb-1">Ville & Commune</span>
              <span className="text-stone-900 font-bold">{ticket.client.city}</span>
            </div>

            {ticket.client.address && (
              <div className="sm:col-span-2 p-4 bg-stone-50 rounded-2xl border border-stone-200">
                <span className="text-xs text-stone-400 uppercase font-bold block mb-1">Adresse / Repère de livraison</span>
                <span className="text-stone-800">{ticket.client.address}</span>
              </div>
            )}

            {ticket.client.notes && (
              <div className="sm:col-span-2 p-4 bg-stone-50 rounded-2xl border border-stone-200">
                <span className="text-xs text-stone-400 uppercase font-bold block mb-1">Instructions particulières</span>
                <span className="text-stone-700 italic">&ldquo;{ticket.client.notes}&rdquo;</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FOOTER DU TICKET */}
      <div className="text-center space-y-2 pt-4 no-print">
        <p className="text-xs text-stone-500">
          Une question concernant votre ticket ou votre commande ? Contactez le service client au <strong>0154072488</strong>.
        </p>
        <div className="flex items-center justify-center gap-4 text-xs font-semibold">
          <Link href="/#commander" className="text-rose-600 hover:underline">
            + Passer une autre commande
          </Link>
          <span className="text-stone-300">•</span>
          <Link href="/suivi" className="text-stone-600 hover:underline">
            Consulter un autre ticket
          </Link>
        </div>
      </div>

    </div>
  );
}
