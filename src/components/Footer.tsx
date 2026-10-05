'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, Crown, Heart, Phone, Clock, ShieldCheck, MapPin, MessageCircle, ExternalLink, Users } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { formatPhoneNumber, getWhatsAppDirectUrl } from '@/lib/settings';
import { trackContactClick } from '@/lib/trackingClient';
import { getClientAuthRole, AuthRole } from '@/lib/authClient';

export default function Footer() {
  const { settings } = useSettings();
  const [authRole, setAuthRole] = useState<AuthRole>('none');

  useEffect(() => {
    const updateRole = () => setAuthRole(getClientAuthRole());
    updateRole();
    window.addEventListener('storage', updateRole);
    window.addEventListener('cs-auth-change', updateRole);
    return () => {
      window.removeEventListener('storage', updateRole);
      window.removeEventListener('cs-auth-change', updateRole);
    };
  }, []);

  const phone = settings?.phone || '0154072488';
  const waNumber = settings?.whatsappNumber || '0154072488';
  const groupLink = settings?.whatsappGroupLink;
  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-12 border-t-4 border-rose-600 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-stone-800">
          
          {/* Colonne 1 : Brand & Citation du flyer */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-md">
                <Crown className="w-4 h-4 absolute -top-2 text-amber-300" />
                <ShoppingBag className="w-5 h-5" />
              </div>
              <span className="text-xl font-black text-white font-serif tracking-tight">
                Christaline <span className="text-amber-400 text-sm font-sans font-bold">SHOP</span>
              </span>
            </div>
            <p className="text-stone-400 text-sm leading-relaxed">
              Votre service de confiance pour précommander facilement sur <strong>SHEIN</strong>, <strong>TEMU</strong> et vos plateformes préférées au Bénin. Nous nous occupons de l’achat en devises, du fret international et du dédouanement.
            </p>
            <div className="bg-stone-800/80 p-3.5 rounded-xl border border-stone-700 text-xs text-rose-300 flex items-start gap-2.5">
              <Heart className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <p className="italic">
                &ldquo;Merci pour votre patience. La qualité vaut parfois quelques jours d’attente.&rdquo;
              </p>
            </div>
          </div>

          {/* Colonne 2 : Liens Rapides */}
          <div className="space-y-4">
            <h3 className="text-white font-bold text-base tracking-wide border-l-2 border-rose-500 pl-2.5">
              Accès Rapide
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/#commander" className="hover:text-rose-400 transition-colors flex items-center gap-2">
                  <span className="text-rose-500">›</span> Passer une précommande
                </Link>
              </li>
              <li>
                <Link href="/ventes-groupees" className="hover:text-amber-400 transition-colors flex items-center gap-2 text-amber-300 font-bold">
                  <span className="text-amber-400">🔥</span> Ventes en Groupe (Achats Groupés)
                </Link>
              </li>
              <li>
                <Link href="/suivi" className="hover:text-rose-400 transition-colors flex items-center gap-2">
                  <span className="text-rose-500">›</span> Suivre mon colis avec mon Ticket
                </Link>
              </li>
              <li>
                <Link href="/#fonctionnement" className="hover:text-rose-400 transition-colors flex items-center gap-2">
                  <span className="text-rose-500">›</span> Comment fonctionne le service
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-rose-400 transition-colors flex items-center gap-2">
                  <span className="text-rose-500">›</span> Questions fréquentes & Tarifs
                </Link>
              </li>
              {authRole !== 'none' && (
                <li>
                  <Link 
                    href={authRole === 'super-admin' ? '/super-admin' : '/admin'} 
                    className="hover:text-amber-400 transition-colors flex items-center gap-2 text-amber-300 font-semibold"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>{authRole === 'super-admin' ? 'Espace Super Admin (Connecté)' : 'Espace Admin (Connecté)'}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Colonne 3 : Plateformes & Catégories */}
          <div className="space-y-4">
            <h3 className="text-white font-bold text-base tracking-wide border-l-2 border-amber-500 pl-2.5">
              Plateformes & Articles
            </h3>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="bg-stone-800 text-white px-2.5 py-1 rounded-md border border-stone-700 font-semibold">SHEIN</span>
              <span className="bg-stone-800 text-amber-400 px-2.5 py-1 rounded-md border border-stone-700 font-semibold">TEMU</span>
              <span className="bg-stone-800 text-rose-400 px-2.5 py-1 rounded-md border border-stone-700 font-semibold">AliExpress</span>
              <span className="bg-stone-800 text-stone-300 px-2.5 py-1 rounded-md border border-stone-700 font-semibold">Autres</span>
            </div>
            <p className="text-stone-400 text-xs leading-relaxed">
              Robes de soirée, costumes de mariage, chaussures habillées, maquillage & pinceaux, vestes & doudounes, joggings molletonnés, sacs et accessoires.
            </p>
            <div className="pt-2 text-xs text-amber-400 font-medium flex items-center gap-1.5">
              <Clock className="w-4 h-4 shrink-0" />
              <span>Délais : <strong>Aérien (au plus 1 mois) • Maritime (2 à 3 mois)</strong></span>
            </div>
          </div>

          {/* Colonne 4 : Contact Officiel */}
          <div className="space-y-4">
            <h3 className="text-white font-bold text-base tracking-wide border-l-2 border-emerald-500 pl-2.5">
              Contact & Réservation
            </h3>
            <p className="text-xs text-stone-400">
              Les commandes se font uniquement sur réservation avec acompte validé.
            </p>
            <div className="space-y-2 text-sm">
              {groupLink && (
                <a 
                  href={groupLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={() => trackContactClick('whatsapp', 'footer_whatsapp_group')}
                  className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-emerald-900/80 to-teal-900/80 border border-emerald-500/50 text-emerald-200 hover:from-emerald-800 hover:to-teal-800 transition-colors font-medium shadow-xs"
                >
                  <Users className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <div className="text-[11px] text-emerald-300 font-bold uppercase tracking-wider">Communauté WhatsApp</div>
                    <div className="font-bold text-white text-xs">Rejoindre le Groupe VIP ↗</div>
                  </div>
                </a>
              )}

              <a 
                href={getWhatsAppDirectUrl(waNumber)} 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={() => trackContactClick('whatsapp', 'footer_whatsapp_direct')}
                className="flex items-center gap-3 p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 hover:bg-emerald-900/60 transition-colors font-medium"
              >
                <MessageCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <div className="text-xs text-stone-400">WhatsApp officiel (Bénin)</div>
                  <div className="font-bold text-white text-base font-mono">{waNumber}</div>
                </div>
              </a>

              <a 
                href={`tel:${phone}`} 
                onClick={() => trackContactClick('phone', 'footer_phone_call')}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-stone-800/60 hover:bg-stone-800 border border-stone-700 text-stone-300 transition-colors"
              >
                <Phone className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Appel téléphonique : <strong className="font-mono">{formatPhoneNumber(phone)}</strong></span>
              </a>
            </div>
          </div>

        </div>

        {/* Bas de page */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} Christaline Shop. Tous droits réservés.</p>
          <p className="text-center sm:text-right">
            Service de commande et transit sécurisé • Bénin (Cotonou, Calavi, Porto-Novo) & International
          </p>
        </div>
      </div>
    </footer>
  );
}
