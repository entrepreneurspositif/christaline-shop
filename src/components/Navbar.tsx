'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ShoppingBag, 
  Crown, 
  Heart, 
  Truck, 
  Phone, 
  Search, 
  PlusCircle, 
  ShieldCheck, 
  Menu, 
  X, 
  MessageCircle, 
  Users, 
  Sparkles,
  ChevronRight,
  Clock
} from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { getWhatsAppActionUrl, getWhatsAppDirectUrl, formatPhoneNumber } from '@/lib/settings';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { settings } = useSettings();

  const hasGroup = !!(settings.whatsappGroupLink && settings.whatsappGroupLink.trim());
  const isGroupTarget = settings.whatsappButtonTarget === 'group' && hasGroup;
  const whatsAppActionUrl = getWhatsAppActionUrl(
    settings, 
    "Bonjour Christaline Shop, je souhaite des renseignements pour une commande"
  );

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-rose-100 shadow-xs">
      
      {/* Barre supérieure d'informations - Mobile first & responsive */}
      <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 text-white text-[11px] sm:text-xs py-1 px-3 sm:px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          
          {/* Délais Bénin condensés pour mobile */}
          <div className="flex items-center gap-1.5 font-medium truncate">
            <Truck className="w-3.5 h-3.5 shrink-0 animate-pulse" />
            <span className="truncate">
              Bénin : <strong className="font-bold">Aérien ≤ 1 mois</strong> • <strong className="font-bold">Mer 2-3 mois</strong>
            </span>
            <span className="hidden md:inline text-rose-200">• SHEIN & TEMU</span>
          </div>

          {/* Contact rapide WhatsApp */}
          <div className="flex items-center shrink-0">
            <a 
              href={whatsAppActionUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:underline bg-white/15 px-2 py-0.5 rounded-full font-semibold transition-colors"
              title={isGroupTarget ? "Rejoindre le Groupe WhatsApp" : "Discuter sur WhatsApp"}
            >
              <MessageCircle className="w-3 h-3 fill-current shrink-0" />
              <span className="hidden xs:inline">WhatsApp :</span>
              <span>{settings.whatsappNumber || '0154072488'}</span>
              {hasGroup && isGroupTarget && (
                <span className="hidden sm:inline text-[9px] bg-emerald-500 text-white px-1.5 py-0.5 rounded-full font-bold ml-0.5">
                  Groupe
                </span>
              )}
            </a>
          </div>

        </div>
      </div>

      {/* Navigation principale */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo Brand (optimisé mobile-first) */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group shrink-0">
            <div className="relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-md shadow-rose-200 group-hover:scale-105 transition-transform">
              <Crown className="w-4 h-4 sm:w-5 sm:h-5 absolute -top-2 text-amber-300 drop-shadow-xs" />
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
              <Heart className="w-2 h-2 sm:w-2.5 sm:h-2.5 absolute bottom-1.5 right-1.5 text-rose-200 fill-rose-200" />
            </div>

            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-rose-600 font-serif leading-none flex items-center gap-1">
                Christaline
                <span className="text-amber-500 text-[10px] sm:text-xs uppercase tracking-widest font-sans font-bold bg-amber-50 px-1 py-0.5 rounded border border-amber-200">
                  SHOP
                </span>
              </span>
              <span className="text-[10px] sm:text-[11px] font-semibold text-stone-500 tracking-wider uppercase mt-0.5 truncate max-w-[170px] sm:max-w-none">
                Précommandes Shein & Temu
              </span>
            </div>
          </Link>

          {/* Liens Desktop (titres courts & percutants) */}
          <nav className="hidden lg:flex items-center gap-6">
            <Link 
              href="/#commander" 
              className="text-stone-700 hover:text-rose-600 font-bold text-sm transition-colors flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4 text-rose-500" />
              <span>Commander</span>
            </Link>

            <Link 
              href="/ventes-groupees" 
              className="text-stone-800 hover:text-rose-600 font-bold text-sm transition-colors flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-950 px-2.5 py-1 rounded-lg border border-amber-200"
            >
              <Users className="w-4 h-4 text-amber-600" />
              <span>Ventes en Groupe</span>
              <span className="bg-rose-600 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full uppercase">🔥</span>
            </Link>

            <Link 
              href="/suivi" 
              className="text-stone-700 hover:text-rose-600 font-bold text-sm transition-colors flex items-center gap-1.5"
            >
              <Search className="w-4 h-4 text-pink-500" />
              <span>Suivi Colis</span>
            </Link>

            <Link 
              href="/#fonctionnement" 
              className="text-stone-700 hover:text-rose-600 font-medium text-sm transition-colors"
            >
              Fonctionnement
            </Link>

            <Link 
              href="/admin" 
              className="text-stone-500 hover:text-rose-700 font-medium text-xs bg-stone-100 hover:bg-stone-200 px-2.5 py-1.5 rounded-lg border border-stone-200 transition-colors flex items-center gap-1"
              title="Espace réservé à l'équipe Christaline"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
              <span>Admin</span>
            </Link>
          </nav>

          {/* Boutons d'action Desktop */}
          <div className="hidden lg:flex items-center gap-2.5">
            <a
              href={whatsAppActionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-xs transition-all hover:-translate-y-0.5"
              title={isGroupTarget ? "Rejoindre le Groupe WhatsApp" : "Discuter sur WhatsApp"}
            >
              <MessageCircle className="w-3.5 h-3.5 fill-white" />
              <span>{isGroupTarget ? 'Groupe WhatsApp' : 'WhatsApp'}</span>
            </a>

            <Link
              href="/#commander"
              className="flex items-center gap-1.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-rose-200 transition-all hover:-translate-y-0.5"
            >
              <span>Commander</span>
            </Link>
          </div>

          {/* Contrôles Header Mobile (Suivi rapide + Bouton Menu) */}
          <div className="lg:hidden flex items-center gap-1.5">
            <Link 
              href="/suivi"
              className="p-2 text-stone-700 hover:text-rose-600 rounded-xl bg-rose-50/80 border border-rose-200 flex items-center gap-1 text-xs font-bold"
              title="Suivre mon ticket"
            >
              <Search className="w-4 h-4 text-rose-600" />
              <span className="hidden xs:inline">Suivi</span>
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-stone-700 hover:text-rose-600 rounded-xl hover:bg-stone-100 border border-stone-200 cursor-pointer"
              aria-label="Menu de navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-stone-800" /> : <Menu className="w-5 h-5 text-stone-800" />}
            </button>
          </div>

        </div>
      </div>

      {/* Menu Mobile Déroulant - Mobile First, Ergonomique et Titres Courts */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-rose-100 px-4 pt-3 pb-6 space-y-2.5 shadow-2xl animate-fade-in">
          
          {/* 1. Commander */}
          <Link
            href="/#commander"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between p-3 rounded-2xl bg-rose-50 text-rose-900 border border-rose-200 font-bold transition-colors active:scale-98"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <PlusCircle className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-black text-rose-950">Commander</div>
                <div className="text-[11px] font-normal text-rose-700">Demander un devis en FCFA</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-rose-400" />
          </Link>

          {/* 2. Ventes en Groupe */}
          <Link
            href="/ventes-groupees"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between p-3 rounded-2xl bg-amber-50/80 text-amber-950 border border-amber-200 font-bold transition-colors active:scale-98"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-black text-amber-950 flex items-center gap-1.5">
                  <span>Ventes en Groupe</span>
                  <span className="bg-rose-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase">🔥 Promo</span>
                </div>
                <div className="text-[11px] font-normal text-amber-800">Commandes groupées à date fixe</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-amber-500" />
          </Link>

          {/* 3. Suivi Colis */}
          <Link
            href="/suivi"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between p-3 rounded-2xl hover:bg-stone-50 border border-stone-200 font-bold text-stone-800 transition-colors active:scale-98"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center shrink-0">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-black text-stone-900">Suivi Colis</div>
                <div className="text-[11px] font-normal text-stone-500">Consulter mon devis & ticket</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400" />
          </Link>

          {/* 4. Fonctionnement & Délais */}
          <Link
            href="/#fonctionnement"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between p-3 rounded-2xl hover:bg-stone-50 border border-stone-200 font-bold text-stone-800 transition-colors active:scale-98"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-black text-stone-900">Fonctionnement</div>
                <div className="text-[11px] font-normal text-stone-500">Délais Aérien (≤ 1 mois) & Mer (2-3 mois)</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400" />
          </Link>

          {/* 5. Espace Admin */}
          <Link
            href="/admin"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between p-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-stone-600 text-xs font-bold transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-rose-600" />
              <span>Espace Administrateur</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          </Link>

          {/* Contact Rapide (Bénin) */}
          <div className="pt-2 border-t border-stone-100 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <a
                href={`tel:${settings.phone || '0154072488'}`}
                className="flex items-center justify-center gap-1.5 p-3 rounded-xl bg-stone-100 text-stone-800 font-bold text-xs active:bg-stone-200"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Appeler</span>
              </a>

              <a
                href={whatsAppActionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 p-3 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-xs active:bg-emerald-700"
                title={isGroupTarget ? "Rejoindre le Groupe WhatsApp" : "Discuter sur WhatsApp"}
              >
                <MessageCircle className="w-3.5 h-3.5 fill-white" />
                <span>{isGroupTarget ? 'Groupe' : 'WhatsApp'}</span>
              </a>
            </div>

            {hasGroup && (
              <a
                href={settings.whatsappGroupLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-xs active:bg-emerald-100"
              >
                <Users className="w-3.5 h-3.5 text-emerald-600" />
                <span>Communauté / Groupe WhatsApp</span>
              </a>
            )}
          </div>

        </div>
      )}

    </header>
  );
}
