'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  Plane, 
  Ship, 
  Star, 
  MapPin, 
  Package, 
  Sparkles, 
  ExternalLink, 
  X, 
  ShoppingBag,
  ShieldCheck,
  Calendar,
  ThumbsUp
} from 'lucide-react';
import { DeliveredOrder, DELIVERED_ORDERS_MOCK } from '@/lib/deliveredOrdersData';

export type { DeliveredOrder };
export { DELIVERED_ORDERS_MOCK };

export default function DeliveredOrdersCarousel() {
  const [orders, setOrders] = useState<DeliveredOrder[]>(DELIVERED_ORDERS_MOCK);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'air' | 'sea' | 'shein' | 'temu'>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<DeliveredOrder | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/delivered-orders');
        const data = await res.json();
        if (data.success && Array.isArray(data.orders) && data.orders.length > 0) {
          setOrders(data.orders);
        }
      } catch (err) {
        console.error('Erreur chargement colis reçus:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Filtrer les commandes
  const filteredOrders = orders.filter((o) => {
    if (filter === 'all') return true;
    if (filter === 'air') return o.shippingMode === 'air';
    if (filter === 'sea') return o.shippingMode === 'sea';
    if (filter === 'shein') return o.platform.toLowerCase() === 'shein';
    if (filter === 'temu') return o.platform.toLowerCase() === 'temu';
    return true;
  });

  // Défilement automatique toutes les 4,5 secondes
  useEffect(() => {
    if (isPaused || filteredOrders.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % filteredOrders.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [isPaused, filteredOrders.length]);

  // Réinitialiser l'index si le filtre change
  useEffect(() => {
    setCurrentIndex(0);
  }, [filter]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + filteredOrders.length) % filteredOrders.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % filteredOrders.length);
  };

  return (
    <div className="w-full space-y-6">
      
      {/* En-tête de la section avec badge de confiance */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Preuves de Livraison au Bénin • 100% Vérifiées</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 font-serif">
            Commandes des Clients Déjà Reçues
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 max-w-xl">
            Découvrez les colis Shein, Temu et Alibaba réceptionnés et remis en main propre à Cotonou, Calavi, Porto-Novo et dans tout le Bénin.
          </p>
        </div>

        {/* Boutons de navigation Flèches */}
        <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Image précédente"
            className="p-2.5 rounded-2xl bg-white border border-stone-200 text-stone-700 hover:bg-rose-50 hover:border-rose-300 hover:text-rose-600 shadow-xs transition-all cursor-pointer active:scale-95"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-xs font-mono font-bold text-stone-500 px-1">
            {filteredOrders.length > 0 ? currentIndex + 1 : 0} / {filteredOrders.length}
          </span>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Image suivante"
            className="p-2.5 rounded-2xl bg-white border border-stone-200 text-stone-700 hover:bg-rose-50 hover:border-rose-300 hover:text-rose-600 shadow-xs transition-all cursor-pointer active:scale-95"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Filtres rapides */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        {[
          { id: 'all', label: '🌟 Tous les Colis Reçus' },
          { id: 'air', label: '✈️ Voie Aérienne (Au plus 1 mois)' },
          { id: 'sea', label: '🚢 Voie Maritime (Conteneur)' },
          { id: 'shein', label: '🛍️ Commandes Shein' },
          { id: 'temu', label: '⚡ Commandes Temu' },
        ].map((btn) => (
          <button
            key={btn.id}
            type="button"
            onClick={() => setFilter(btn.id as any)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === btn.id
                ? 'bg-rose-600 text-white shadow-md shadow-rose-200 ring-2 ring-rose-400/40'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Conteneur principal du Carrousel */}
      <div
        ref={containerRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="relative overflow-hidden rounded-3xl bg-white border border-stone-200 shadow-xl p-4 sm:p-6"
      >
        {filteredOrders.length === 0 ? (
          <div className="py-12 text-center text-stone-500 text-sm">
            Aucun colis ne correspond à ce filtre pour le moment.
          </div>
        ) : (
          <div className="relative">
            {/* Vue principale : Disposition Cartes avec transition */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Afficher 3 éléments consécutifs pour les grands écrans, ou 1 sur mobile */}
              {[0, 1, 2].map((offset) => {
                const itemIndex = (currentIndex + offset) % filteredOrders.length;
                const order = filteredOrders[itemIndex];
                if (!order) return null;

                // Sur petit écran, n'afficher que le premier élément
                const isHiddenOnMobile = offset > 0 ? 'hidden md:flex' : 'flex';
                const isHiddenOnTablet = offset === 2 ? 'hidden lg:flex' : isHiddenOnMobile;

                return (
                  <div
                    key={`${order.id}-${offset}`}
                    onClick={() => setSelectedOrder(order)}
                    className={`${isHiddenOnTablet} flex-col bg-stone-50/70 hover:bg-white rounded-2xl border border-stone-200/90 hover:border-rose-300 hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer group`}
                  >
                    {/* Zone Image */}
                    <div className="relative aspect-4/3 w-full overflow-hidden bg-stone-200">
                      <Image
                        src={order.imageUrl}
                        alt={order.title}
                        fill
                        unoptimized
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* Badges d'état et plateforme sur l'image */}
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-black/75 backdrop-blur-xs text-white shadow-xs">
                          {order.platform}
                        </span>
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold text-white shadow-xs flex items-center gap-1 ${
                          order.shippingMode === 'air' ? 'bg-rose-600/90' : 'bg-cyan-700/90'
                        }`}>
                          {order.shippingMode === 'air' ? (
                            <>
                              <Plane className="w-3 h-3" />
                              <span>Avion • {order.transitDays}j</span>
                            </>
                          ) : (
                            <>
                              <Ship className="w-3 h-3" />
                              <span>Bateau</span>
                            </>
                          )}
                        </span>
                      </div>

                      {/* Badge "Livré au Bénin" en bas de l'image */}
                      <div className="absolute bottom-3 right-3">
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-emerald-600/90 backdrop-blur-xs text-white flex items-center gap-1 shadow-xs">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Livré</span>
                        </span>
                      </div>
                    </div>

                    {/* Zone Contenu / Témoignage */}
                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                      
                      <div className="space-y-2">
                        {/* Ville & Date */}
                        <div className="flex items-center justify-between text-[11px] text-stone-500 font-medium">
                          <span className="flex items-center gap-1 text-stone-700 font-semibold">
                            <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                            <span>{order.location}</span>
                          </span>
                          <span className="text-stone-400">{order.deliveryDate}</span>
                        </div>

                        {/* Titre du colis */}
                        <h3 className="font-bold text-sm text-stone-900 group-hover:text-rose-600 transition-colors line-clamp-1">
                          {order.title}
                        </h3>

                        {/* Étoiles & Note */}
                        <div className="flex items-center gap-1 text-amber-500">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          ))}
                          <span className="text-[11px] font-bold text-stone-700 ml-1">5.0</span>
                        </div>

                        {/* Témoignage client */}
                        <p className="text-xs text-stone-600 italic line-clamp-2 leading-relaxed">
                          « {order.review} »
                        </p>
                      </div>

                      {/* Pied de carte avec nom client et référence */}
                      <div className="pt-3 border-t border-stone-200/70 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-stone-800 block text-xs">
                            {order.clientName}
                          </span>
                          <span className="text-[10px] text-emerald-700 font-medium flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" />
                            <span>Achat vérifié</span>
                          </span>
                        </div>

                        <span className="font-mono text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                          {order.ticketId}
                        </span>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Indicateurs de points (Dots) */}
        {filteredOrders.length > 1 && (
          <div className="flex items-center justify-center gap-1.5 pt-5">
            {filteredOrders.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Aller au colis ${idx + 1}`}
                className={`transition-all rounded-full cursor-pointer ${
                  currentIndex === idx
                    ? 'w-6 h-2 bg-rose-600'
                    : 'w-2 h-2 bg-stone-300 hover:bg-stone-400'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* MODAL LIGHTBOX PLEIN ÉCRAN LORS DU CLIC SUR UN COLIS */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-stone-200 p-6 space-y-5 my-auto text-stone-900">
            
            {/* En-tête Lightbox */}
            <div className="flex items-start justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase bg-stone-900 text-white px-2 py-0.5 rounded-md">
                      {selectedOrder.platform}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      Reçu & Livré en main propre
                    </span>
                  </div>
                  <h3 className="text-base font-black text-stone-900 font-serif mt-0.5">
                    {selectedOrder.title}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-xl hover:bg-stone-100 text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Grande photo de la commande */}
            <div className="relative aspect-16/10 w-full rounded-2xl overflow-hidden bg-stone-100 border border-stone-200">
              <Image
                src={selectedOrder.imageUrl}
                alt={selectedOrder.title}
                fill
                unoptimized
                sizes="(max-width: 768px) 100vw, 600px"
                className="object-cover"
              />
            </div>

            {/* Détails & Avis client */}
            <div className="space-y-3.5 bg-stone-50 p-4 rounded-2xl border border-stone-200/80">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-bold text-stone-800">
                  <MapPin className="w-3.5 h-3.5 text-rose-600" />
                  <span>{selectedOrder.location}</span>
                </div>
                <span className="text-stone-500 font-mono text-[11px]">
                  Réf. {selectedOrder.ticketId}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                  Contenu vérifié du colis :
                </span>
                <p className="text-xs font-semibold text-stone-800">
                  {selectedOrder.itemsSummary}
                </p>
              </div>

              {/* Mode et durée d'acheminement */}
              <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                <div className="p-2.5 rounded-xl bg-white border border-stone-200">
                  <span className="text-[10px] text-stone-400 block">Mode de transport :</span>
                  <span className="font-bold text-stone-800 flex items-center gap-1 mt-0.5">
                    {selectedOrder.shippingMode === 'air' ? (
                      <>
                        <Plane className="w-3.5 h-3.5 text-rose-600" />
                        <span>Fret Aérien Régulier</span>
                      </>
                    ) : (
                      <>
                        <Ship className="w-3.5 h-3.5 text-cyan-600" />
                        <span>Conteneur Maritime</span>
                      </>
                    )}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-stone-200">
                  <span className="text-[10px] text-stone-400 block">Délai d’acheminement :</span>
                  <span className="font-bold text-stone-800 flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{selectedOrder.transitDays} jours jusqu’au Bénin</span>
                  </span>
                </div>
              </div>

              {/* Avis & Note */}
              <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                    <span className="text-xs font-black text-amber-950 ml-1">5/5</span>
                  </div>
                  <span className="text-[11px] font-bold text-stone-600">
                    Client : {selectedOrder.clientName}
                  </span>
                </div>
                <p className="text-xs text-stone-700 italic leading-relaxed">
                  « {selectedOrder.review} »
                </p>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="py-2.5 px-4 rounded-xl border border-stone-300 font-bold text-xs hover:bg-stone-100 cursor-pointer"
              >
                Fermer
              </button>

              <a
                href="/"
                className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 text-white font-black text-xs shadow-md shadow-rose-200 flex items-center gap-1.5 hover:from-rose-700 hover:to-pink-700 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Passer ma commande aussi</span>
              </a>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
