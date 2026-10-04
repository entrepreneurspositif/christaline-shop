'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Crown, Heart, Truck, Phone, Search, PlusCircle, ShieldCheck, Menu, X, MessageCircle } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-rose-100 shadow-xs">
      {/* Barre supérieure d'informations */}
      <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-medium">
            <Truck className="w-3.5 h-3.5 animate-pulse" />
            <span>Livraison Bénin : <strong>Aérien (≤ 1 mois) • Maritime (2 à 3 mois)</strong></span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">SHEIN • TEMU • MULTI-PLATEFORMES</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <a 
              href="https://wa.me/2290154072488?text=Bonjour%20Christaline%20Shop%2C%20je%20souhaite%20des%20renseignements%20pour%20une%20commande" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:underline bg-white/15 px-2 py-0.5 rounded-full"
            >
              <MessageCircle className="w-3 h-3 fill-current" />
              <span>WhatsApp : 0154072488</span>
            </a>
          </div>
        </div>
      </div>

      {/* Navigation principale */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-md shadow-rose-200 group-hover:scale-105 transition-transform">
              <Crown className="w-5 h-5 absolute -top-2.5 text-amber-300 drop-shadow-xs" />
              <ShoppingBag className="w-6 h-6" />
              <Heart className="w-2.5 h-2.5 absolute bottom-2 right-2 text-rose-200 fill-rose-200" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tight text-rose-600 font-serif leading-none flex items-center gap-1">
                Christaline
                <span className="text-amber-500 text-xs uppercase tracking-widest font-sans font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">SHOP</span>
              </span>
              <span className="text-[11px] font-semibold text-stone-500 tracking-wider uppercase mt-1">
                Précommandes Shein • Temu & Plus
              </span>
            </div>
          </Link>

          {/* Liens Desktop */}
          <nav className="hidden md:flex items-center gap-7">
            <Link 
              href="/#commander" 
              className="text-stone-700 hover:text-rose-600 font-semibold text-sm transition-colors flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4 text-rose-500" />
              Nouvelle Demande
            </Link>
            <Link 
              href="/suivi" 
              className="text-stone-700 hover:text-rose-600 font-semibold text-sm transition-colors flex items-center gap-1.5"
            >
              <Search className="w-4 h-4 text-pink-500" />
              Suivre mon Ticket
            </Link>
            <Link 
              href="/#fonctionnement" 
              className="text-stone-700 hover:text-rose-600 font-semibold text-sm transition-colors"
            >
              Comment ça marche
            </Link>
            <Link 
              href="/admin" 
              className="text-stone-500 hover:text-rose-700 font-medium text-xs bg-stone-100 hover:bg-stone-200 px-2.5 py-1.5 rounded-lg border border-stone-200 transition-colors flex items-center gap-1"
              title="Espace réservé à l'équipe Christaline"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
              Espace Admin
            </Link>
          </nav>

          {/* Boutons d'action Desktop */}
          <div className="hidden lg:flex items-center gap-3">
            <a
              href="https://wa.me/2290154072488?text=Bonjour%20Christaline%20Shop%2C%20je%20souhaite%20passer%20une%20commande"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm shadow-emerald-200 transition-all hover:-translate-y-0.5"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>WhatsApp Direct</span>
            </a>
            <Link
              href="/#commander"
              className="flex items-center gap-2 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md shadow-rose-200 transition-all hover:-translate-y-0.5"
            >
              <span>Précommander</span>
              <span className="bg-white/20 text-white text-xs px-1.5 py-0.5 rounded-full font-mono">Gratuit</span>
            </Link>
          </div>

          {/* Bouton Hamburger Mobile */}
          <div className="md:hidden flex items-center gap-2">
            <Link 
              href="/suivi"
              className="p-2 text-stone-700 hover:text-rose-600 rounded-lg bg-rose-50 border border-rose-100"
              title="Suivre"
            >
              <Search className="w-5 h-5 text-rose-600" />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-stone-700 hover:text-rose-600 rounded-lg hover:bg-stone-100"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Menu Mobile Déroulant */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-rose-100 px-4 pt-3 pb-6 space-y-3 shadow-xl">
          <Link
            href="/#commander"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 p-3 rounded-xl bg-rose-50 text-rose-700 font-bold"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Passer une précommande (Nouveau ticket)</span>
          </Link>
          <Link
            href="/suivi"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-stone-50 text-stone-700 font-medium"
          >
            <Search className="w-5 h-5 text-pink-500" />
            <span>Suivre un ticket / Consulter mon devis</span>
          </Link>
          <Link
            href="/#fonctionnement"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-stone-50 text-stone-700 font-medium"
          >
            <Truck className="w-5 h-5 text-amber-500" />
            <span>Comment ça marche & Délais (Aérien ≤ 1 mois / Mer 2-3 mois)</span>
          </Link>
          <Link
            href="/admin"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-stone-50 text-stone-600 font-medium border border-stone-200"
          >
            <ShieldCheck className="w-5 h-5 text-rose-600" />
            <span>Espace Administrateur Christaline</span>
          </Link>
          <div className="pt-2 border-t border-stone-100 flex flex-col gap-2">
            <a
              href="tel:0154072488"
              className="flex items-center justify-center gap-2 p-3 rounded-xl bg-stone-100 text-stone-800 font-bold text-sm"
            >
              <Phone className="w-4 h-4" />
              <span>Appeler : 0154072488</span>
            </a>
            <a
              href="https://wa.me/2290154072488?text=Bonjour%20Christaline%20Shop%2C%20je%20souhaite%20passer%20une%20commande"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 p-3 rounded-xl bg-emerald-600 text-white font-bold text-sm"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Échanger sur WhatsApp</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
