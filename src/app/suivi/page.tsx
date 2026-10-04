'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Search, ArrowRight, Clock, HelpCircle, Sparkles, ShoppingBag, ShieldCheck } from 'lucide-react';

export default function SuiviPage() {
  const router = useRouter();
  const [ticketInput, setTicketInput] = useState('');
  const [recentTickets, setRecentTickets] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('cs_recent_tickets') || '[]');
      setRecentTickets(saved);
    } catch (e) {
      // Ignorer
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = ticketInput.trim().toUpperCase();
    if (clean) {
      router.push(`/ticket/${clean}`);
    }
  };

  const handleSelectRecent = (id: string) => {
    router.push(`/ticket/${id}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50/60">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 w-full space-y-12">
        
        {/* Titre & Hero */}
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-3.5 py-1.5 rounded-full border border-rose-200 inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Espace Client • Suivi en Temps Réel
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-stone-900 font-serif">
            Suivre mon Ticket & Devis
          </h1>
          <p className="text-stone-600 text-sm sm:text-base max-w-xl mx-auto">
            Consultez le chiffrage en FCFA de vos articles Shein, Temu ou Alibaba et suivez l'acheminement de votre colis jusqu'à la livraison.
          </p>
        </div>

        {/* Barre de Recherche Principale */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-rose-100 max-w-2xl mx-auto">
          <form onSubmit={handleSearch} className="space-y-4">
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
              Entrez votre numéro de ticket officiel
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  required
                  placeholder="Ex: CS-784210"
                  value={ticketInput}
                  onChange={(e) => setTicketInput(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl border-2 border-stone-200 focus:border-rose-500 text-base sm:text-lg font-mono font-bold tracking-wide outline-hidden bg-stone-50/50 uppercase placeholder:normal-case placeholder:font-sans placeholder:font-normal"
                />
              </div>
              <button
                type="submit"
                className="py-4 px-8 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-black text-base shadow-md shadow-rose-200 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                <Search className="w-5 h-5" />
                <span>Rechercher</span>
              </button>
            </div>
            <p className="text-xs text-stone-400">
              💡 Le numéro de ticket commence par "CS-" suivi de 6 chiffres (reçu lors de la soumission de votre commande).
            </p>
          </form>
        </div>

        {/* Tickets récents consultés sur cet appareil */}
        {recentTickets.length > 0 && (
          <div className="max-w-2xl mx-auto bg-stone-100/70 p-5 rounded-2xl border border-stone-200 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-500">
              <Clock className="w-3.5 h-3.5" />
              <span>Vos tickets récemment consultés</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentTickets.map((id) => (
                <button
                  key={id}
                  onClick={() => handleSelectRecent(id)}
                  className="bg-white hover:bg-rose-50 border border-stone-200 hover:border-rose-300 px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold text-rose-700 shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{id}</span>
                  <ArrowRight className="w-3 h-3 text-stone-400" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tickets d'exemples pour tester immédiatement */}
        <div className="max-w-2xl mx-auto bg-rose-50/50 p-6 rounded-3xl border border-rose-200/80 space-y-4">
          <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
            <Sparkles className="w-4 h-4 text-rose-600" />
            <span>Tickets de démonstration pour tester l'application :</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <button
              onClick={() => handleSelectRecent('CS-784210')}
              className="p-3 bg-white rounded-xl border border-rose-200 hover:border-rose-400 text-left transition-colors cursor-pointer group"
            >
              <div className="font-mono font-bold text-rose-700 group-hover:text-rose-800 flex items-center justify-between">
                <span>CS-784210</span>
                <span className="text-[10px] bg-cyan-100 text-cyan-800 px-2 py-0.5 rounded-full font-sans">En vol international</span>
              </div>
              <div className="text-stone-500 mt-1">Sophie Yao • Robe & Escarpins Shein (58 500 FCFA)</div>
            </button>

            <button
              onClick={() => handleSelectRecent('CS-918234')}
              className="p-3 bg-white rounded-xl border border-rose-200 hover:border-rose-400 text-left transition-colors cursor-pointer group"
            >
              <div className="font-mono font-bold text-rose-700 group-hover:text-rose-800 flex items-center justify-between">
                <span>CS-918234</span>
                <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-sans">Devis prêt</span>
              </div>
              <div className="text-stone-500 mt-1">Aïcha Koné • Pinceaux maquillage Temu (42 000 FCFA)</div>
            </button>

            <button
              onClick={() => handleSelectRecent('CS-334912')}
              className="p-3 bg-white rounded-xl border border-rose-200 hover:border-rose-400 text-left transition-colors cursor-pointer group"
            >
              <div className="font-mono font-bold text-rose-700 group-hover:text-rose-800 flex items-center justify-between">
                <span>CS-334912</span>
                <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-sans">En attente</span>
              </div>
              <div className="text-stone-500 mt-1">Marc Kouamé • Costume Alibaba (Chiffrage en cours)</div>
            </button>

            <button
              onClick={() => handleSelectRecent('CS-652190')}
              className="p-3 bg-white rounded-xl border border-rose-200 hover:border-rose-400 text-left transition-colors cursor-pointer group"
            >
              <div className="font-mono font-bold text-rose-700 group-hover:text-rose-800 flex items-center justify-between">
                <span>CS-652190</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-sans">Livré</span>
              </div>
              <div className="text-stone-500 mt-1">Grace Bamba • Jogging Shein (Commande achevée)</div>
            </button>
          </div>
        </div>

        {/* Aide & FAQ Ticket */}
        <div className="max-w-2xl mx-auto border-t border-stone-200 pt-8 text-center space-y-2">
          <p className="text-xs text-stone-500">
            Vous avez perdu votre numéro de ticket ? Contactez directement Christaline Shop par WhatsApp au <strong>0154072488</strong> avec votre nom et numéro de téléphone.
          </p>
        </div>

      </main>

      <Footer />
    </div>
  );
}
