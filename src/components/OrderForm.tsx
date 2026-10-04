'use client';

import React, { useState, useEffect } from 'react';
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
  AlertCircle,
  Plane,
  Ship
} from 'lucide-react';
import { StorePlatform, ShippingModeOption } from '@/lib/settings';

interface ItemInput {
  platform: string;
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

  // Plateformes & Modes d'expédition dynamiques
  const [availablePlatforms, setAvailablePlatforms] = useState<StorePlatform[]>([
    { id: 'shein', name: 'Shein', logoText: 'SHEIN', bg: 'bg-black text-white', border: 'border-black', color: 'text-black', enabled: true },
    { id: 'temu', name: 'Temu', logoText: 'TEMU', bg: 'bg-gradient-to-r from-orange-500 to-amber-600 text-white', border: 'border-orange-500', color: 'text-amber-600', enabled: true },
    { id: 'autre', name: 'Autre plateforme', logoText: 'AUTRE', bg: 'bg-rose-500 text-white', border: 'border-rose-400', color: 'text-rose-600', enabled: true }
  ]);

  // Mode d'expédition choisi par le client
  const [shippingMode, setShippingMode] = useState<'air' | 'sea'>('air');

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

  // Charger les plateformes actives configurées par l'admin
  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.settings?.platforms) {
          const active = data.settings.platforms.filter((p: StorePlatform) => p.enabled);
          if (active.length > 0) {
            setAvailablePlatforms(active);
            if (!active.some((p: StorePlatform) => p.id === items[0].platform)) {
              updateItem(0, 'platform', active[0].id);
            }
          }
        }
      })
      .catch(err => console.error('Erreur chargement plateformes:', err));
  }, []);

  const addItem = () => {
    const defaultPlt = availablePlatforms[0]?.id || 'shein';
    setItems([
      ...items,
      {
        platform: defaultPlt,
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
        shippingMode,
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

  const generateWhatsAppUrl = () => {
    if (!createdTicket) return '';
    const modeLabel = shippingMode === 'sea' ? 'Voie Maritime (2 à 3 mois)' : 'Voie Aérienne (Au plus 1 mois)';
    const message = `Bonjour Christaline Shop Bénin ! 🌸\n`
      + `Je viens d'enregistrer ma précommande sur votre site :\n\n`
      + `🎫 *Ticket N° : ${createdTicket.id}*\n`
      + `👤 Client : ${name}\n`
      + `📦 Mode choisi : *${modeLabel}*\n`
      + `📍 Ville : ${city} (Bénin)\n\n`
      + `Merci de me communiquer le montant total de mes articles !`;
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
            Votre demande a été transmise à Christaline Shop Bénin. Mode retenu : <strong>{shippingMode === 'sea' ? 'Voie Maritime (2 à 3 mois)' : 'Voie Aérienne (Au plus 1 mois)'}</strong>.
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
                platform: availablePlatforms[0]?.id || 'shein',
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
          Ajoutez vos articles Shein, Temu & autres
        </h2>
        <p className="text-stone-600 text-sm mt-1">
          Collez le lien de chaque article. Notre équipe calcule le montant total en FCFA et s'occupe de l'achat et de l'expédition vers le Bénin.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* SECTION CHOIX DU MODE D'EXPÉDITION & DÉLAI */}
      <div className="space-y-3 bg-gradient-to-br from-rose-50/60 to-amber-50/60 p-5 rounded-2xl border border-rose-200">
        <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
          Choisissez votre mode de livraison vers le Bénin <span className="text-rose-500">*</span>
        </label>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Voie Aérienne */}
          <div
            onClick={() => setShippingMode('air')}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3.5 ${
              shippingMode === 'air'
                ? 'bg-white border-rose-600 shadow-md ring-2 ring-rose-200'
                : 'bg-white/80 border-stone-200 hover:border-stone-300'
            }`}
          >
            <div className={`p-2.5 rounded-xl shrink-0 ${shippingMode === 'air' ? 'bg-rose-100 text-rose-600' : 'bg-stone-100 text-stone-500'}`}>
              <Plane className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-stone-900 text-sm">Voie Aérienne (Avion)</span>
                <span className="text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  Rapide
                </span>
              </div>
              <div className="text-xs font-bold text-rose-700">
                Délai : Au plus 1 mois
              </div>
              <p className="text-[11px] text-stone-500 leading-tight">
                Idéal pour vêtements, chaussures, maquillage et commandes urgentes.
              </p>
            </div>
          </div>

          {/* Voie Maritime */}
          <div
            onClick={() => setShippingMode('sea')}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3.5 ${
              shippingMode === 'sea'
                ? 'bg-white border-amber-600 shadow-md ring-2 ring-amber-200'
                : 'bg-white/80 border-stone-200 hover:border-stone-300'
            }`}
          >
            <div className={`p-2.5 rounded-xl shrink-0 ${shippingMode === 'sea' ? 'bg-amber-100 text-amber-600' : 'bg-stone-100 text-stone-500'}`}>
              <Ship className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-stone-900 text-sm">Voie Maritime (Bateau)</span>
                <span className="text-[10px] font-black uppercase bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                  Économique
                </span>
              </div>
              <div className="text-xs font-bold text-amber-700">
                Délai : 2 à 3 mois
              </div>
              <p className="text-[11px] text-stone-500 leading-tight">
                Idéal pour gros volumes, colis lourds ou commandes en quantité.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* SECTION 1 : VOS COORDONNÉES */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2 border-l-4 border-rose-500 pl-3">
          <span>1. Vos Coordonnées au Bénin</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Nom complet <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Dossou Sophie"
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
              Ajoutez les liens de vos articles choisis sur Shein, Temu ou autres plateformes.
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

              {/* SÉLECTEUR DYNAMIQUE DE PLATEFORME (CHARGÉ DEPUIS L'ADMIN) */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Plateforme d'achat <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {availablePlatforms.map((plt) => {
                    const isSelected = item.platform === plt.id;
                    return (
                      <button
                        key={plt.id}
                        type="button"
                        onClick={() => updateItem(index, 'platform', plt.id)}
                        className={`py-2.5 px-3 rounded-xl text-xs font-black tracking-wide border-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? `${plt.bg || 'bg-rose-600 text-white'} border-transparent shadow-sm scale-102`
                            : 'bg-white text-stone-700 border-stone-200 hover:border-stone-400'
                        }`}
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>{plt.logoText || plt.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Champ Lien Produit */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Lien du produit <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="url"
                    required
                    placeholder={`Collez ici le lien exact de l'article`}
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

              <div>
                <input
                  type="text"
                  placeholder="Remarque spécifique (ex: prendre du L si ça taille petit)"
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
          placeholder="Ex: Événement prévu pour le mois prochain, besoin d'une confirmation rapide..."
          value={generalNotes}
          onChange={(e) => setGeneralNotes(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-rose-500 text-sm outline-hidden bg-stone-50/50"
        ></textarea>
      </div>

      {/* RAPPEL DES DÉLAIS OFFICIELS */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-rose-50 border border-amber-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-700">
        <div className="flex items-center gap-2.5">
          <Clock className="w-5 h-5 text-amber-600 shrink-0" />
          <span>
            Mode choisi : <strong>{shippingMode === 'sea' ? 'Voie Maritime (2 à 3 mois)' : 'Voie Aérienne (Au plus 1 mois)'}</strong> vers le Bénin.
          </span>
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
