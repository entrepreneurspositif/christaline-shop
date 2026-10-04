'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import OrderForm from '@/components/OrderForm';
import { 
  ShoppingBag, 
  Crown, 
  Heart, 
  Truck, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Search, 
  Sparkles, 
  MessageCircle, 
  Phone,
  HelpCircle,
  ExternalLink,
  ChevronDown
} from 'lucide-react';

export default function Home() {
  const [quickTicketId, setQuickTicketId] = useState('');
  const [showFlyerModal, setShowFlyerModal] = useState(false);

  const categories = [
    {
      title: 'Chaussures Habillées',
      desc: 'Escarpins strass, talons hauts, sandales chic',
      icon: '👠',
      tag: 'Shein & Temu'
    },
    {
      title: 'Accessoires de Maquillage',
      desc: 'Sets de pinceaux luxe, palettes, faux cils',
      icon: '💄',
      tag: 'Temu & Shein'
    },
    {
      title: 'Robes de Soirée & Chic',
      desc: 'Robes de cocktail, plissées, satinées, mariages',
      icon: '👗',
      tag: 'Toutes plateformes'
    },
    {
      title: 'Costumes Homme & Blazers',
      desc: 'Costumes 3 pièces, vestes de cérémonie',
      icon: '👔',
      tag: 'Alibaba & Shein'
    },
    {
      title: 'Joggings & Streetwear',
      desc: 'Ensembles sweats à capuche molletonnés',
      icon: '👖',
      tag: 'Temu & Shein'
    },
    {
      title: 'Vestes & Doudounes',
      desc: 'Manteaux chauds, vestes matelassées chic',
      icon: '🧥',
      tag: 'Toutes plateformes'
    }
  ];

  const steps = [
    {
      num: '01',
      title: 'Choisissez & Copiez les Liens',
      desc: 'Faites votre shopping sur l\'application Shein, Temu ou Alibaba. Cliquez sur "Partager" puis copiez le lien de vos articles préférés.'
    },
    {
      num: '02',
      title: 'Remplissez le Formulaire',
      desc: 'Collez vos liens dans notre formulaire ci-dessous avec vos tailles et options. Vous recevez immédiatement votre numéro de Ticket officiel.'
    },
    {
      num: '03',
      title: 'Consultez votre Devis en FCFA',
      desc: 'L\'équipe Christaline calcule le coût réel en FCFA incluant l\'achat en devises, le fret aérien et la douane. Devis individuel et total transparent.'
    },
    {
      num: '04',
      title: 'Validez & Suivez votre Colis',
      desc: 'Validez votre réservation avec un acompte. Suivez en temps réel chaque étape de l\'expédition jusqu\'à la livraison (7 à 12 jours ouvrables).'
    }
  ];

  const faqs = [
    {
      q: 'Comment fonctionne le calcul du devis en FCFA ?',
      a: 'Le devis prend en compte le prix d\'achat chez le fournisseur converti en FCFA, le fret aérien au poids/volume, les frais de douane et la commission Christaline Shop. Aucun frais caché : vous connaissez le montant exact avant tout engagement.'
    },
    {
      q: 'Quel est le délai de livraison ?',
      a: 'Le délai standard est de 7 à 12 jours ouvrables à compter de la validation de votre acompte et de la commande chez le fournisseur. Comme le dit notre devise : "La qualité vaut parfois quelques jours d\'attente !"'
    },
    {
      q: 'Comment s\'effectue le paiement ?',
      a: 'Les commandes se font sur réservation. Vous versez un acompte (généralement 50% à 60%) par Wave, Orange Money, MTN MoMo ou Moov Money pour valider l\'achat. Le solde est payé à la réception de vos articles.'
    },
    {
      q: 'Puis-je commander sur d\'autres sites qu\'Alibaba, Temu et Shein ?',
      a: 'Oui ! Nous prenons également en charge AliExpress, Fashion Nova, Zara, Amazon et d\'autres sites marchands. Choisissez simplement l\'option "Autre" dans le sélecteur de plateforme.'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 space-y-20 pb-20">
        
        {/* ============================================================ */}
        {/* HERO SECTION */}
        {/* ============================================================ */}
        <section className="relative overflow-hidden bg-gradient-to-b from-rose-50/80 via-pink-50/40 to-white pt-10 sm:pt-16 pb-16 border-b border-rose-100">
          
          {/* Éléments décoratifs en arrière-plan */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none overflow-hidden">
            <div className="absolute -top-24 -left-20 w-96 h-96 bg-rose-200/40 rounded-full blur-3xl" />
            <div className="absolute top-1/2 -right-20 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Colonne Gauche : Texte & Accroche */}
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                
                {/* Badge d'en-tête */}
                <div className="inline-flex items-center gap-2 bg-white/90 border border-rose-200 shadow-xs px-4 py-1.5 rounded-full text-xs font-bold text-rose-700">
                  <Crown className="w-4 h-4 text-amber-500 fill-amber-400" />
                  <span>CHRISTALINE SHOP • SERVICE OFFICIEL DE PRÉCOMMANDE</span>
                </div>

                <h1 className="text-4xl sm:text-6xl font-black text-stone-900 font-serif tracking-tight leading-tight">
                  Précommandez sur <br />
                  <span className="text-stone-900 bg-stone-100 px-2 py-0.5 rounded-lg border border-stone-200 text-3xl sm:text-5xl">SHEIN</span>,{' '}
                  <span className="text-amber-700 bg-amber-100 px-2 py-0.5 rounded-lg border border-amber-200 text-3xl sm:text-5xl">TEMU</span>{' '}
                  <span className="font-sans font-light">&</span>{' '}
                  <span className="text-orange-600 bg-orange-100 px-2 py-0.5 rounded-lg border border-orange-200 text-3xl sm:text-5xl">ALIBABA</span>
                </h1>

                <p className="text-base sm:text-lg text-stone-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                  Plus besoin de carte bancaire internationale ! Collez simplement les liens de vos articles, obtenez votre <strong>ticket avec devis en FCFA</strong> et suivez votre colis étape par étape.
                </p>

                {/* Badges Flyer Clés */}
                <div className="flex flex-wrap justify-center lg:justify-start gap-3 pt-2 text-xs font-bold">
                  <div className="flex items-center gap-2 bg-rose-100/80 text-rose-800 px-3.5 py-2 rounded-xl border border-rose-200">
                    <ShoppingBag className="w-4 h-4 text-rose-600" />
                    <span>Commandes sur RÉSERVATION</span>
                  </div>
                  <div className="flex items-center gap-2 bg-amber-100/80 text-amber-900 px-3.5 py-2 rounded-xl border border-amber-200">
                    <Truck className="w-4 h-4 text-amber-600" />
                    <span>Livraison 7 à 12 jours ouvrables</span>
                  </div>
                  <div className="flex items-center gap-2 bg-emerald-100/80 text-emerald-800 px-3.5 py-2 rounded-xl border border-emerald-200">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Acompte & Suivi transparent</span>
                  </div>
                </div>

                {/* Boutons d'action Hero */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-4">
                  <a
                    href="#commander"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white font-black px-7 py-4 rounded-2xl text-base shadow-lg shadow-rose-200 transition-all hover:-translate-y-0.5"
                  >
                    <Sparkles className="w-5 h-5" />
                    <span>Passer une commande (Gratuit)</span>
                  </a>

                  <Link
                    href="/suivi"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-stone-50 text-stone-800 font-bold px-6 py-4 rounded-2xl text-base border-2 border-stone-200 hover:border-rose-300 transition-all"
                  >
                    <Search className="w-5 h-5 text-rose-600" />
                    <span>Suivre mon ticket</span>
                  </Link>
                </div>

                {/* Citation flyer */}
                <div className="pt-2 text-xs italic text-stone-500 flex items-center justify-center lg:justify-start gap-2">
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-500 shrink-0" />
                  <span>&ldquo;Merci pour votre patience. La qualité vaut parfois quelques jours d'attente.&rdquo;</span>
                </div>

              </div>

              {/* Colonne Droite : Carte Flyer & Recherche Rapide */}
              <div className="lg:col-span-5 space-y-4">
                
                {/* Carte de Recherche Rapide de Ticket */}
                <div className="bg-white p-6 rounded-3xl shadow-xl border border-rose-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                      <Search className="w-4 h-4" />
                      Accès Rapide Ticket
                    </span>
                    <span className="text-[11px] text-stone-400 font-medium">Déjà client ?</span>
                  </div>

                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (quickTicketId.trim()) {
                        window.location.href = `/ticket/${quickTicketId.trim().toUpperCase()}`;
                      }
                    }} 
                    className="space-y-3"
                  >
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Ex: CS-784210"
                        value={quickTicketId}
                        onChange={(e) => setQuickTicketId(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm font-mono font-bold uppercase placeholder:normal-case placeholder:font-sans placeholder:font-normal focus:border-rose-500 outline-hidden bg-stone-50"
                      />
                      <button
                        type="submit"
                        className="px-4 py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold shrink-0 transition-colors cursor-pointer"
                      >
                        Consulter
                      </button>
                    </div>
                  </form>
                  <p className="text-[11px] text-stone-400">
                    Entrez votre numéro de ticket pour voir votre devis et l'avancement du colis.
                  </p>
                </div>

                {/* Flyer Showcase interactif */}
                <div className="relative group rounded-3xl overflow-hidden border-2 border-rose-200 shadow-xl bg-white p-2">
                  <div className="relative h-72 sm:h-80 w-full rounded-2xl overflow-hidden bg-stone-100">
                    <Image
                      src="/images/christaline-flyer.jpg"
                      alt="Christaline Shop Flyer Officiel"
                      fill
                      className="object-cover object-top group-hover:scale-102 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent flex flex-col justify-end p-5 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-amber-300">AFFICHE OFFICIELLE</div>
                          <div className="text-lg font-black font-serif">Christaline SHOP</div>
                        </div>
                        <button
                          onClick={() => setShowFlyerModal(true)}
                          className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-md text-xs font-bold transition-colors cursor-pointer"
                        >
                          Agrandir
                        </button>
                      </div>
                      <div className="text-xs text-stone-200 mt-1 flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-emerald-400" />
                        <span>WhatsApp / Appel : <strong>0154072488</strong></span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* CATÉGORIES POPULAIRES (DU FLYER) */}
        {/* ============================================================ */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-3.5 py-1.5 rounded-full border border-rose-200 inline-block">
              Tous vos articles préférés
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-stone-900 font-serif">
              Ce que vous pouvez commander
            </h2>
            <p className="text-stone-600 text-sm max-w-lg mx-auto">
              Repéré sur Shein, Temu ou Alibaba ? Envoyez-nous le lien et nous nous chargeons du reste !
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat, idx) => (
              <div
                key={idx}
                className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs hover:border-rose-400 hover:shadow-md transition-all text-center space-y-3 flex flex-col justify-between group"
              >
                <div className="text-3xl group-hover:scale-110 transition-transform">{cat.icon}</div>
                <div>
                  <h3 className="font-bold text-stone-900 text-xs sm:text-sm">{cat.title}</h3>
                  <p className="text-[11px] text-stone-500 mt-1 leading-tight">{cat.desc}</p>
                </div>
                <span className="text-[10px] font-bold text-rose-700 bg-rose-50 py-1 rounded-md">
                  {cat.tag}
                </span>
              </div>
            ))}
          </div>

          <div className="text-center">
            <p className="text-xs text-stone-500 italic">
              ... et bien plus encore ! (Bijoux, sacs, accessoires téléphonie, décoration, perruques, layettes...)
            </p>
          </div>
        </section>

        {/* ============================================================ */}
        {/* COMMENT ÇA MARCHE */}
        {/* ============================================================ */}
        <section id="fonctionnement" className="bg-stone-50 py-16 border-y border-stone-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            
            <div className="text-center space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-3.5 py-1.5 rounded-full border border-amber-200 inline-block">
                Processus Simple & Transparent
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-stone-900 font-serif">
                Comment passer votre commande en 4 étapes
              </h2>
              <p className="text-stone-600 text-sm max-w-lg mx-auto">
                De la sélection de vos articles jusqu'à la remise de votre colis en Côte d'Ivoire.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map((st, i) => (
                <div 
                  key={i} 
                  className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs relative space-y-4 hover:-translate-y-1 transition-transform"
                >
                  <span className="text-4xl font-mono font-black text-rose-200 block">
                    {st.num}
                  </span>
                  <h3 className="font-bold text-stone-900 text-base">
                    {st.title}
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {st.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Encadré Délais de livraison */}
            <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 max-w-4xl mx-auto">
              <div className="space-y-2 text-center md:text-left">
                <div className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-xs font-bold">
                  <Truck className="w-4 h-4" />
                  <span>DÉLAI DE LIVRAISON OFFICIEL</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black">
                  7 à 12 jours ouvrables
                </h3>
                <p className="text-xs text-white/90">
                  Après validation de la commande auprès des fournisseurs internationaux.
                </p>
              </div>

              <div className="shrink-0">
                <a
                  href="#commander"
                  className="inline-flex items-center gap-2 bg-white text-stone-900 hover:bg-rose-50 font-black px-6 py-3.5 rounded-2xl text-sm shadow-md transition-all hover:scale-105"
                >
                  <span>Commencer ma précommande</span>
                  <ArrowRight className="w-4 h-4 text-rose-600" />
                </a>
              </div>
            </div>

          </div>
        </section>

        {/* ============================================================ */}
        {/* FORMULAIRE DE PRÉCOMMANDE (CŒUR DE L'APPLICATION) */}
        {/* ============================================================ */}
        <section id="commander" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <OrderForm />
        </section>

        {/* ============================================================ */}
        {/* FAQ & CONTACT */}
        {/* ============================================================ */}
        <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-3.5 py-1.5 rounded-full border border-rose-200 inline-block">
              Foire Aux Questions
            </span>
            <h2 className="text-3xl font-black text-stone-900 font-serif">
              Questions Fréquentes
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((f, i) => (
              <div key={i} className="p-6 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-2">
                <h3 className="font-bold text-stone-900 text-sm sm:text-base flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{f.q}</span>
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed pl-6">
                  {f.a}
                </p>
              </div>
            ))}
          </div>

          {/* Contact WhatsApp Bannière */}
          <div className="bg-emerald-50 rounded-3xl p-6 sm:p-8 border border-emerald-200 text-center space-y-4">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-600 text-white shadow-md">
              <MessageCircle className="w-7 h-7 fill-white" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-stone-900 font-serif">
              Besoin d'aide pour trouver un article ?
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto">
              Notre équipe vous répond sur WhatsApp 7j/7 pour vous assister dans le choix de vos articles et le suivi de vos colis.
            </p>
            <div className="pt-2">
              <a
                href="https://wa.me/2250154072488?text=Bonjour%20Christaline%20Shop%2C%20j%27aimerais%20une%20assistance%20pour%20une%20commande"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black px-6 py-3.5 rounded-2xl text-sm shadow-md shadow-emerald-200 transition-all hover:scale-102"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Discuter sur WhatsApp : 0154072488</span>
              </a>
            </div>
          </div>
        </section>

      </main>

      {/* MODAL FLYER EN GRAND */}
      {showFlyerModal && (
        <div 
          onClick={() => setShowFlyerModal(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-lg w-full max-h-[90vh] bg-white rounded-3xl overflow-hidden p-2 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="relative h-[80vh] w-full">
              <Image
                src="/images/christaline-flyer.jpg"
                alt="Christaline Shop Flyer Grand Format"
                fill
                className="object-contain"
              />
            </div>
            <div className="p-3 text-center">
              <button
                onClick={() => setShowFlyerModal(false)}
                className="px-6 py-2 rounded-xl bg-stone-900 text-white font-bold text-xs"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
