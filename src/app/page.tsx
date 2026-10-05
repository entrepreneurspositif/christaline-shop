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
  ChevronDown,
  Users,
  Calendar
} from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { formatPhoneNumber, getWhatsAppDirectUrl } from '@/lib/settings';

export default function Home() {
  const [quickTicketId, setQuickTicketId] = useState('');
  const [showFlyerModal, setShowFlyerModal] = useState(false);
  const { settings } = useSettings();

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
      tag: 'Shein & Temu'
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
      desc: 'Faites votre shopping sur l\'application Shein, Temu ou toute autre plateforme partenaire. Cliquez sur "Partager" puis copiez le lien de vos articles préférés.'
    },
    {
      num: '02',
      title: 'Remplissez le Formulaire',
      desc: 'Collez vos liens dans notre formulaire ci-dessous avec vos options et choisissez votre mode d\'expédition (Aérien ou Maritime). Vous recevez immédiatement votre numéro de Ticket officiel.'
    },
    {
      num: '03',
      title: 'Consultez votre Devis en FCFA',
      desc: 'L\'équipe Christaline calcule le prix total de vos articles en FCFA incluant tous les frais. Vous voyez directement le montant net par article sans calcul complexe.'
    },
    {
      num: '04',
      title: 'Validez & Suivez votre Colis',
      desc: 'Validez votre réservation avec un acompte via Mobile Money Bénin. Suivez en temps réel chaque étape de l\'acheminement jusqu\'à la livraison (Aérien : au plus 1 mois • Maritime : 2 à 3 mois).'
    }
  ];

  const faqs = [
    {
      q: 'Comment fonctionne le calcul du devis en FCFA ?',
      a: 'Le devis prend en compte le prix d\'achat chez le fournisseur converti en FCFA, le fret international et l\'acheminement. Vous obtenez un prix net transparent par article avant tout versement.'
    },
    {
      q: 'Quels sont les délais de livraison au Bénin ?',
      a: 'Le délai dépend du mode d\'expédition choisi : au plus 1 mois par voie aérienne (recommandé pour les articles urgents et légers) et 2 à 3 mois par voie maritime (recommandé pour les colis lourds ou volumineux).'
    },
    {
      q: 'Comment s\'effectue le paiement de l\'acompte ?',
      a: 'Les commandes sont traitées sur réservation. Vous versez un acompte via Mobile Money Bénin (MTN MoMo, Moov Money ou Celtiis Cash) selon les instructions présentées à la validation du devis. Le solde est versé à la remise du colis.'
    },
    {
      q: 'Puis-je commander sur d\'autres sites que Shein et Temu ?',
      a: 'Oui ! Notre équipe peut traiter vos achats sur AliExpress, Zara et d\'autres boutiques en ligne. Choisissez simplement la plateforme appropriée ou sélectionnez "Autre" dans le formulaire.'
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
                <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-white/90 border border-rose-200 shadow-xs px-3 sm:px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-bold text-rose-700 max-w-full">
                  <Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 fill-amber-400 shrink-0" />
                  <span className="truncate">CHRISTALINE SHOP • PRÉCOMMANDES BÉNIN</span>
                </div>

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-stone-900 font-serif tracking-tight leading-tight">
                  Précommandez sur <br />
                  <span className="text-stone-900 bg-stone-100 px-2 py-0.5 rounded-lg border border-stone-200 text-2xl sm:text-4xl lg:text-5xl inline-block mt-1">SHEIN</span>{' '}
                  <span className="font-sans font-light">&</span>{' '}
                  <span className="text-amber-700 bg-amber-100 px-2 py-0.5 rounded-lg border border-amber-200 text-2xl sm:text-4xl lg:text-5xl inline-block mt-1">TEMU</span>
                  <span className="block text-base sm:text-2xl font-sans font-normal text-stone-500 mt-2">en toute sérénité au Bénin</span>
                </h1>

                <p className="text-sm sm:text-lg text-stone-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                  Plus besoin de carte bancaire internationale ! Collez simplement les liens de vos articles, obtenez votre <strong>ticket avec devis en FCFA</strong> et suivez votre colis étape par étape.
                </p>

                {/* Badges Flyer Clés (condensés mobile-first) */}
                <div className="flex flex-wrap justify-center lg:justify-start gap-2 sm:gap-3 pt-2 text-[11px] sm:text-xs font-bold">
                  <div className="flex items-center gap-1.5 sm:gap-2 bg-rose-100/80 text-rose-800 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl border border-rose-200">
                    <ShoppingBag className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>Sur Réservation</span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 bg-amber-100/80 text-amber-900 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl border border-amber-200">
                    <Truck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Aérien ≤ 1 mois • Mer 2-3 mois</span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 bg-emerald-100/80 text-emerald-800 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Mobile Money Bénin</span>
                  </div>
                </div>

                {/* Boutons d'action Hero */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-4">
                  <a
                    href="#commander"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white font-black px-6 py-4 rounded-2xl text-sm sm:text-base shadow-lg shadow-rose-200 transition-all hover:-translate-y-0.5"
                  >
                    <Sparkles className="w-5 h-5" />
                    <span>Passer une commande (Gratuit)</span>
                  </a>

                  <Link
                    href="/ventes-groupees"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 text-amber-950 font-black px-5 py-4 rounded-2xl text-sm sm:text-base border-2 border-amber-300 transition-all hover:-translate-y-0.5 shadow-sm"
                  >
                    <Users className="w-5 h-5 text-amber-600" />
                    <span>🔥 Ventes en Groupe</span>
                  </Link>

                  <Link
                    href="/suivi"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-stone-50 text-stone-800 font-bold px-5 py-4 rounded-2xl text-sm sm:text-base border-2 border-stone-200 hover:border-rose-300 transition-all"
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
                        <span>WhatsApp / Appel : <strong className="font-mono">{formatPhoneNumber(settings?.phone || '0154072488')}</strong></span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* BANNIÈRE VENTES EN GROUPE / ACHATS GROUPÉS */}
        {/* ============================================================ */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-stone-800 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-xl text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-rose-500/20 border border-rose-500/40 text-rose-300 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Nouveau • Commandes Groupées</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black font-serif leading-tight">
                Ventes en Groupe : Profitez de prix réduits à date fixe
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                Rejoignez nos commandes groupées sélectionnées par Christaline Shop ! Chaque article a une <strong>quantité minimum</strong> et une <strong>date précise de passage de commande</strong>. Économisez jusqu'à 50% sur vos articles préférés.
              </p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-1 text-xs text-stone-400">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Tarif grossiste dès 1 pièce</span>
                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-amber-400" /> Date de commande garantie</span>
              </div>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <Link
                href="/ventes-groupees"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white font-black px-7 py-4 rounded-2xl text-sm shadow-lg shadow-rose-950 transition-all hover:scale-102"
              >
                <Users className="w-4 h-4" />
                <span>Voir les Ventes en Groupe</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
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
              Repéré sur Shein, Temu ou ailleurs ? Envoyez-nous le lien et nous nous chargeons du reste !
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
                De la sélection de vos articles jusqu'à la remise de votre colis au Bénin.
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
                  <span>MODES & DÉLAIS DE LIVRAISON AU BÉNIN</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black">
                  Aérien : au plus 1 mois • Maritime : 2 à 3 mois
                </h3>
                <p className="text-xs text-white/90">
                  Optez pour la voie aérienne pour vos commandes rapides ou la voie maritime pour vos colis volumineux et économiques.
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
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <a
                href={getWhatsAppDirectUrl(settings?.whatsappNumber || '0154072488', "Bonjour Christaline Shop, j'aimerais une assistance pour une commande")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black px-6 py-3.5 rounded-2xl text-sm shadow-md shadow-emerald-200 transition-all hover:scale-102 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Discuter sur WhatsApp : <span className="font-mono">{settings?.whatsappNumber || '0154072488'}</span></span>
              </a>

              {settings?.whatsappGroupLink && (
                <a
                  href={settings.whatsappGroupLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-700 to-emerald-800 hover:from-teal-800 hover:to-emerald-900 text-white font-black px-6 py-3.5 rounded-2xl text-sm shadow-md shadow-teal-200 transition-all hover:scale-102 cursor-pointer"
                >
                  <Users className="w-4 h-4 text-emerald-300" />
                  <span>Rejoindre la Communauté WhatsApp ↗</span>
                </a>
              )}
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
