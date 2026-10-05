'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppSettings } from '@/lib/settings';

// Valeurs par défaut immédiates pour éviter tout saut de mise en page (layout shift)
const FALLBACK_SETTINGS: AppSettings = {
  storeName: 'Christaline Shop',
  phone: '0154072488',
  whatsappNumber: '2290154072488',
  whatsappGroupLink: '',
  whatsappButtonTarget: 'group',
  country: 'Bénin',
  defaultCity: 'Cotonou',
  platforms: [
    {
      id: 'shein',
      name: 'Shein',
      logoText: 'SHEIN',
      bg: 'bg-black text-white',
      border: 'border-black',
      color: 'text-black',
      enabled: true
    },
    {
      id: 'temu',
      name: 'Temu',
      logoText: 'TEMU',
      bg: 'bg-gradient-to-r from-orange-500 to-amber-600 text-white',
      border: 'border-orange-500',
      color: 'text-amber-600',
      enabled: true
    },
    {
      id: 'alibaba',
      name: 'Alibaba',
      logoText: 'ALIBABA',
      bg: 'bg-orange-500 text-white',
      border: 'border-orange-500',
      color: 'text-orange-600',
      enabled: false
    },
    {
      id: 'autre',
      name: 'Autre plateforme',
      logoText: 'AUTRE',
      bg: 'bg-rose-500 text-white',
      border: 'border-rose-400',
      color: 'text-rose-600',
      enabled: true
    }
  ],
  shippingModes: [
    {
      id: 'air',
      name: 'Voie Aérienne (Fret Aérien)',
      duration: 'Au plus 1 mois',
      description: 'Expédition rapide par avion • Idéal pour vêtements, chaussures et articles légers'
    },
    {
      id: 'sea',
      name: 'Voie Maritime (Bateau)',
      duration: '2 à 3 mois',
      description: 'Expédition par conteneur maritime • Idéal pour colis volumineux ou lourds'
    }
  ],
  paymentInstructions: {
    title: 'Instructions de Règlement de l\'Acompte',
    instructionsText: 'Pour valider votre réservation et lancer l\'achat immédiat de vos articles auprès des fournisseurs, veuillez effectuer le transfert de votre acompte sur l\'un de nos comptes Mobile Money officiels ci-dessous. Mentionnez impérativement votre N° de ticket en motif de transaction.',
    accounts: [
      {
        id: 'acc-1',
        operator: 'MTN Mobile Money Bénin',
        number: '0154072488',
        holderName: 'Christaline Shop Bénin',
        badgeColor: 'bg-yellow-400 text-stone-900 border-yellow-500'
      },
      {
        id: 'acc-2',
        operator: 'Moov Money Bénin',
        number: '0154072488',
        holderName: 'Christaline Shop Bénin',
        badgeColor: 'bg-blue-600 text-white border-blue-700'
      },
      {
        id: 'acc-3',
        operator: 'Celtiis Cash Bénin',
        number: '0154072488',
        holderName: 'Christaline Shop Bénin',
        badgeColor: 'bg-purple-600 text-white border-purple-700'
      }
    ],
    confirmationNote: 'Une fois le transfert effectué, veuillez nous envoyer la capture d\'écran ou le SMS de confirmation sur notre WhatsApp pour validation immédiate de votre commande.'
  }
};

interface SettingsContextType {
  settings: AppSettings;
  loading: boolean;
  refreshSettings: () => Promise<void>;
  updateSettings: (newSettings: AppSettings) => void;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: FALLBACK_SETTINGS,
  loading: false,
  refreshSettings: async () => {},
  updateSettings: () => {}
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(FALLBACK_SETTINGS);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.settings) {
          setSettings(data.settings);
        }
      }
    } catch (err) {
      console.error('Erreur chargement settings dans SettingsProvider:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSettings = useCallback((newSettings: AppSettings) => {
    setSettings(newSettings);
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings: fetchSettings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
