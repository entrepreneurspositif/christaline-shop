import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TicketTrackingView from '@/components/TicketTrackingView';
import { getTicketById } from '@/lib/storage';
import { Search, AlertCircle, PlusCircle, ArrowLeft } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TicketPage({ params }: PageProps) {
  const { id } = await params;
  const ticket = await getTicketById(id);

  if (!ticket) {
    return (
      <div className="min-h-screen flex flex-col bg-stone-50">
        <Navbar />
        <main className="flex-1 max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>

          <h1 className="text-3xl font-black text-stone-900 font-serif">
            Ticket introuvable
          </h1>

          <p className="text-stone-600 text-sm">
            Le numéro de ticket <code className="bg-stone-200 px-2 py-0.5 rounded font-mono font-bold">{id}</code> ne correspond à aucune précommande enregistrée sur Christaline Shop.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/suivi"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-stone-900 text-white font-bold text-sm hover:bg-stone-800 transition-colors"
            >
              <Search className="w-4 h-4" />
              <span>Rechercher un autre ticket</span>
            </Link>

            <Link
              href="/#commander"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-rose-600 text-white font-bold text-sm hover:bg-rose-700 transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Créer une nouvelle commande</span>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-stone-50/60">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="mb-6">
          <Link
            href="/suivi"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-rose-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour à la recherche de tickets</span>
          </Link>
        </div>

        <TicketTrackingView ticket={ticket} />
      </main>
      <Footer />
    </div>
  );
}
