'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Trash2, 
  ExternalLink, 
  CheckCircle2, 
  Copy, 
  MessageCircle, 
  ArrowRight, 
  Sparkles, 
  ShoppingBag, 
  Info, 
  Loader2,
  Clock,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { PlatformType, PLATFORM_CONFIG } from '@/lib/types';

interface ItemInput {
  platform: PlatformType;
  url: string;
  name: string;
  variant: string;
  quantity: number;
  originalPrice: string;
  originalCurrency: string;
  notes: string;
}

export default function OrderForm() {
  const router = useRouter();

  // État Client (Bénin)
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [sameAsPhone, setSameAsPhone] = useState(true);
  const [city, setCity] = useState('Cotonou');
  const [address, setAddress] = useState('');
  const [generalNotes, setGeneralNotes] = useState('');

  // État Produits
  const [items, setItems] = useState<ItemInput[]>([
    {
      platform: 'shein',
      url: '',
      name: '',
      variant: '',
      quantity: 1,
      originalPrice: '',
      originalCurrency: 'EUR',
      notes: ''
    }
  ]);

  // État Soumission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [createdTicket, setCreatedTicket] = useState<{ id: string; name: string } | null>(null);
  const [copiedTicket, setCopiedTicket] = useState(false);

  // Gestion des articles
  const addItem = () => {
    setItems([
      ...items,
      {
        platform: 'shein',
        url: '',
        name: '',
        variant: '',
        quantity: 1,
        originalPrice: '',
        originalCurrency: 'EUR',
        notes: ''
      }
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const updateItem = (index: number, field: keyof ItemInput, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg('Veuillez renseigner votre nom complet.');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('Veuillez renseigner votre numéro de téléphone.');
      return;
    }

    const invalidItem = items.findIndex(it => !it.url.trim());
    if (invalidItem !== -1) {
      setErrorMsg(`Veuillez renseigner le lien du produit pour l'article #${invalidItem + 1}.`);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        client: {
          name: name.trim(),
          phone: phone.trim(),
          whatsapp: sameAsPhone ? phone.trim() : (whatsapp.trim() || phone.trim()),
          city: city.trim(),
          address: address.trim(),
          notes: generalNotes.trim()
        },
        items: items.map(it => ({
          platform: it.platform,
          url: it.url.trim(),
          name: it.name.trim() || `Article ${it.platform.toUpperCase()}`,
          variant: it.variant.trim(),
          quantity: it.quantity > 0 ? it.quantity : 1,
          originalPrice: it.originalPrice ? parseFloat(it.originalPrice) : null,
          originalCurrency: it.originalCurrency,
          notes: it.notes.trim()
        }))
      };

      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erreur lors de la création de la commande');
      }

      // Sauvegarder dans le localStorage
      try {
        const saved = JSON.parse(localStorage.getItem('cs_recent_tickets') || '[]');
        if (!saved.includes(data.ticket.id)) {
          saved.unshift(data.ticket.id);
          localStorage.setItem('cs_recent_tickets', JSON.stringify(saved.slice(0, 10)));
        }
      } catch (e) {
        // Ignorer
      }

      setCreatedTicket({
        id: data.ticket.id,
        name: data.ticket.client.name
      });

    } catch (err: any) {
      setErrorMsg(err.message || 'Une erreur est survenue, veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyTicketId = () => {
    if (!createdTicket) return;
    navigator.clipboard.writeText(createdTicket.id);
    setCopiedTicket(true);
    setTimeout(() => setCopiedTicket(false), 3000);
  };

  // WhatsApp de notification pour Christaline Shop Bénin
  const generateWhatsAppUrl = () => {
    if (!createdTicket) return '';
    const message = `Bonjour Christaline Shop Bénin ! 🌸\n`
      + `Je viens d'enregistrer ma précommande sur votre site :\n\n`
      + `🎫 *Ticket N° : ${createdTicket.id}*\n`
      + `👤 Client : ${name}\n`
      + `📦 Nombre d'articles : ${items.length}\n`
      + `📍 Ville : ${city} (Bénin)\n\n`
      + `Merci de me communiquer le montant total de ma commande !`;
    return `https://wa.me/2290154072488?text=${encodeURIComponent(message)}`;
  };

  if (createdTicket) {
    return (
      <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-rose-100 max-w-3xl mx-auto text-center space-y-8 animate-fade-in">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 mb-2">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
            Demande enregistrée avec succès au Bénin !
          </span>
          <h2 className="text-3xl font-extrabold text-stone-900 font-serif">
            Félicitations {createdTicket.name} !
          </h2>
          <p className="text-stone-600 text-sm max-w-lg mx-auto">
            Votre demande de précommande a été transmise à l'équipe Christaline Shop Bénin. Voici votre numéro de ticket officiel :
          </p>
        </div>

        {/* Ticket Box géant */}
        <div className="bg-gradient-to-br from-rose-50 via-pink-50 to-amber-50 p-6 rounded-2xl border-2 border-dashed border-rose-300 relative max-w-md mx-auto">
          <div className="text-xs font-semibold uppercase text-stone-500 mb-1">Votre Numéro de Ticket</div>
          <div className="text-4xl font-mono font-black text-rose-700 tracking-wider">
            {createdTicket.id}
          </div>
          <p className="text-xs text-stone-500 mt-2">
            Conservez ce numéro pour consulter le prix de vos articles et suivre l'avancée de votre colis.
          </p>

          <button
            onClick={copyTicketId}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-white text-stone-800 rounded-xl text-xs font-bold border border-rose-200 hover:bg-rose-100/50 shadow-xs transition-colors cursor-pointer"
          >
            <Copy className="w-4 h-4 text-rose-600" />
            {copiedTicket ? 'Copié dans le presse-papier !' : 'Copier le numéro de ticket'}
          </button>
        </div>

        {/* Instructions */}
        <div className="bg-stone-50 p-5 rounded-2xl text-left border border-stone-200 space-y-2 text-sm text-stone-700 max-w-lg mx-auto">
          <div className="font-bold text-stone-900 flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-500 shrink-0" />
            Prochaines étapes :
          </div>
          <ol className="list-decimal pl-5 space-y-1 text-xs text-stone-600">
            <li>Notre équipe calcule le prix total de vos articles en FCFA.</li>
            <li>Vous consultez le montant total et les instructions de paiement Mobile Money.</li>
            <li>Vous versez votre acompte pour valider la réservation.</li>
            <li>Votre colis est acheminé au Bénin dans un délai de <strong>7 à 12 jours ouvrables</strong>.</li>
          </ol>
        </div>

        {/* Actions principales */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <a
            href={generateWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3.5 rounded-xl text-sm shadow-md shadow-emerald-200 transition-all hover:scale-102"
          >
            <MessageCircle className="w-5 h-5 fill-white" />
            <span>Envoyer à Christaline sur WhatsApp (Bénin)</span>
          </a>

          <button
            onClick={() => router.push(`/ticket/${createdTicket.id}`)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-bold px-6 py-3.5 rounded-xl text-sm shadow-md shadow-rose-200 transition-all hover:scale-102 cursor-pointer"
          >
            <span>Voir mon devis & mon ticket</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="pt-4">
          <button
            onClick={() => {
              setCreatedTicket(null);
              setItems([{
                platform: 'shein',
                url: '',
                name: '',
                variant: '',
                quantity: 1,
                originalPrice: '',
                originalCurrency: 'EUR',
                notes: ''
              }]);
            }}
            className="text-xs text-stone-500 hover:text-rose-600 underline cursor-pointer"
          >
            Faire une autre précommande
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-rose-100 max-w-4xl mx-auto space-y-10">
      
      {/* En-tête formulaire */}
      <div className="border-b border-rose-100 pb-6">
        <div className="inline-flex items-center gap-2 text-rose-600 bg-rose-50 px-3 py-1 rounded-full text-xs font-bold mb-3 border border-rose-200">
          <Sparkles className="w-3.5 h-3.5" />
          Précommandes Sécurisées • Bénin
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-serif">
          Ajoutez vos articles Shein, Temu ou Alibaba
        </h2>
        <p className="text-stone-600 text-sm mt-1">
          Collez le lien de chaque article. Notre équipe calcule le prix total de vos articles en FCFA sans frais cachés.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* SECTION 1 : VOS COORDONNÉES AU BÉNIN */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2 border-l-4 border-rose-500 pl-3">
          <span>1. Vos Coordonnées au Bénin</span>
          <span className="text-xs font-normal text-stone-500">(Pour recevoir le devis et être livré)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Nom complet <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Tossou Sophie"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm outline-hidden bg-stone-50/50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Numéro de téléphone appel <span className="text-rose-500">*</span>
            </label>
            <input
              type="tel"
              required
              placeholder="Ex: 0154072488"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm outline-hidden bg-stone-50/50"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                Numéro WhatsApp
              </label>
              <label className="text-xs text-stone-500 flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sameAsPhone}
                  onChange={(e) => setSameAsPhone(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500"
                />
                Identique au téléphone
              </label>
            </div>
            <input
              type="tel"
              disabled={sameAsPhone}
              placeholder={sameAsPhone ? phone || 'Identique au numéro ci-dessus' : 'Ex: 0154072488'}
              value={sameAsPhone ? phone : whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border border-stone-300 text-sm outline-hidden ${sameAsPhone ? 'bg-stone-100 text-stone-500 cursor-not-allowed' : 'bg-stone-50/50 focus:ring-2 focus:ring-rose-500'}`}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Ville & Commune (Bénin) <span className="text-rose-500">*</span>
            </label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-rose-500 text-sm outline-hidden bg-stone-50/50 font-medium"
            >
              <option value="Cotonou">Cotonou</option>
              <option value="Abomey-Calavi">Abomey-Calavi</option>
              <option value="Porto-Novo">Porto-Novo</option>
              <option value="Parakou">Parakou</option>
              <option value="Bohicon">Bohicon</option>
              <option value="Ouidah">Ouidah</option>
              <option value="Natitingou">Natitingou</option>
              <option value="Autre ville Bénin">Autre ville (Bénin)</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Quartier / Repère de livraison au Bénin (Optionnel)
            </label>
            <input
              type="text"
              placeholder="Ex: Haie Vive, Akpakpa, Menontin, Cadjehoun, Arconville..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm outline-hidden bg-stone-50/50"
            />
          </div>
        </div>
      </div>

      {/* SECTION 2 : ARTICLES À COMMANDER */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-l-4 border-amber-500 pl-3">
          <div>
            <h3 className="text-lg font-bold text-stone-900">
              2. Vos Articles Choisi(s)
            </h3>
            <p className="text-xs text-stone-500">
              Vous pouvez ajouter plusieurs articles dans la même précommande.
            </p>
          </div>
          <span className="text-xs font-bold bg-amber-100 text-amber-800 px-3 py-1 rounded-full border border-amber-300">
            {items.length} article{items.length > 1 ? 's' : ''}
          </span>
        </div>

        {/* Liste dynamique d'articles */}
        <div className="space-y-6">
          {items.map((item, index) => (
            <div 
              key={index} 
              className="p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-stone-50 to-white border border-stone-200 shadow-xs relative space-y-4 hover:border-rose-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-stone-900 text-white text-xs font-bold">
                    #{index + 1}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-600">
                    Article #{index + 1}
                  </span>
                </div>

                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                    title="Supprimer cet article"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Supprimer</span>
                  </button>
                )}
              </div>

              {/* Choix de la plateforme */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Plateforme d'achat <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['shein', 'temu', 'alibaba', 'autre'] as PlatformType[]).map((plt) => {
                    const isSelected = item.platform === plt;
                    const cfg = PLATFORM_CONFIG[plt];
                    return (
                      <button
                        key={plt}
                        type="button"
                        onClick={() => updateItem(index, 'platform', plt)}
                        className={`py-2.5 px-3 rounded-xl text-xs font-black tracking-wide border-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? `${cfg.bg} border-transparent shadow-sm scale-102`
                            : 'bg-white text-stone-700 border-stone-200 hover:border-stone-400'
                        }`}
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>{cfg.logoText}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Champ Lien Produit */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Lien du produit (URL Shein, Temu ou Alibaba) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="url"
                    required
                    placeholder={`Collez ici le lien exact ${item.platform.toUpperCase()} (ex: https://${item.platform === 'shein' ? 'shein.com/...' : item.platform === 'temu' ? 'temu.com/...' : 'alibaba.com/...'})`}
                    value={item.url}
                    onChange={(e) => updateItem(index, 'url', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-xs sm:text-sm outline-hidden bg-white pr-10"
                  />
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute right-3 top-3.5 text-stone-400 hover:text-rose-600"
                      title="Ouvrir le lien"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>

              {/* Détails du produit */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Nom ou description de l'article
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Robe longue satin plissée rose"
                    value={item.name}
                    onChange={(e) => updateItem(index, 'name', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-rose-500 text-xs sm:text-sm outline-hidden bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Variante (Taille, Couleur)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Taille M / Doré"
                    value={item.variant}
                    onChange={(e) => updateItem(index, 'variant', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-rose-500 text-xs sm:text-sm outline-hidden bg-white"
                  />
                </div>
              </div>

              {/* Quantité & Prix indicatif */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Quantité
                  </label>
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={() => updateItem(index, 'quantity', Math.max(1, item.quantity - 1))}
                      className="px-3 py-2 bg-stone-100 border border-stone-300 rounded-l-xl text-stone-700 hover:bg-stone-200 text-sm font-bold cursor-pointer"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                      className="w-16 py-2 text-center border-y border-stone-300 text-sm font-bold focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => updateItem(index, 'quantity', item.quantity + 1)}
                      className="px-3 py-2 bg-stone-100 border border-stone-300 rounded-r-xl text-stone-700 hover:bg-stone-200 text-sm font-bold cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Prix indicatif sur le site (Optionnel)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Ex: 19.99"
                      value={item.originalPrice}
                      onChange={(e) => updateItem(index, 'originalPrice', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm outline-hidden bg-white"
                    />
                    <select
                      value={item.originalCurrency}
                      onChange={(e) => updateItem(index, 'originalCurrency', e.target.value)}
                      className="px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold bg-stone-50"
                    >
                      <option value="EUR">EUR (€)</option>
                      <option value="USD">USD ($)</option>
                      <option value="CFA">FCFA</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Remarques */}
              <div>
                <input
                  type="text"
                  placeholder="Remarque particulière (ex: prendre du L si ça taille petit)"
                  value={item.notes}
                  onChange={(e) => updateItem(index, 'notes', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-dashed border-stone-300 text-xs outline-hidden bg-white/70 text-stone-600"
                />
              </div>

            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addItem}
          className="w-full py-3.5 px-4 rounded-2xl border-2 border-dashed border-rose-300 hover:border-rose-500 hover:bg-rose-50/50 text-rose-700 font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Plus className="w-5 h-5 text-rose-600" />
          <span>Ajouter un autre article à cette commande</span>
        </button>
      </div>

      {/* SECTION 3 : INSTRUCTIONS PARTICULIÈRES */}
      <div className="space-y-3">
        <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
          Instructions particulières pour Christaline Shop (Optionnel)
        </label>
        <textarea
          rows={2}
          placeholder="Ex: Besoin urgent pour un mariage le 20 du mois..."
          value={generalNotes}
          onChange={(e) => setGeneralNotes(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-rose-500 text-sm outline-hidden bg-stone-50/50"
        ></textarea>
      </div>

      {/* RAPPEL DES ENGAGEMENTS */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-rose-50 border border-amber-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-700">
        <div className="flex items-center gap-2.5">
          <Clock className="w-5 h-5 text-amber-600 shrink-0" />
          <span>Délai de livraison au Bénin : <strong>7 à 12 jours ouvrables</strong> après validation de l'acompte.</span>
        </div>
        <div className="flex items-center gap-1.5 font-bold text-rose-700">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Paiement sécurisé Mobile Money</span>
        </div>
      </div>

      {/* BOUTON DE SOUMISSION */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 hover:from-rose-700 hover:via-pink-700 hover:to-amber-700 text-white font-extrabold text-base sm:text-lg shadow-lg shadow-rose-200 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Génération de votre ticket de commande...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Générer mon Ticket & Obtenir mon Devis ({items.length} article{items.length > 1 ? 's' : ''})</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
        <p className="text-center text-xs text-stone-500 mt-2.5">
          Gratuit & sans engagement immédiat • Votre devis en FCFA vous sera communiqué avec le ticket
        </p>
      </div>

    </form>
  );
}
