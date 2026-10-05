'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Lock, 
  Key, 
  CreditCard, 
  Clock, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  Save, 
  LogOut, 
  Calendar, 
  DollarSign, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  XCircle,
  Eye,
  EyeOff,
  UserCheck
} from 'lucide-react';
import { AdminSubscriptionData } from '@/lib/subscription';

export default function SuperAdminPage() {
  const [masterPassword, setMasterPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);

  // Données de souscription
  const [subscription, setSubscription] = useState<AdminSubscriptionData & { isExpired?: boolean; daysRemaining?: number } | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Formulaire configuration
  const [feeInput, setFeeInput] = useState<number>(15000);
  const [shopIdInput, setShopIdInput] = useState('');
  const [apiTokenInput, setApiTokenInput] = useState('');
  const [modeInput, setModeInput] = useState<'LIVE' | 'SANDBOX'>('SANDBOX');
  const [newMasterPasswordInput, setNewMasterPasswordInput] = useState('');
  const [savingConfig, setSavingConfig] = useState(false);

  // UI state
  const [copiedPass, setCopiedPass] = useState(false);
  const [showCurrentPass, setShowCurrentPass] = useState(true);

  // Vérification session
  useEffect(() => {
    const savedPass = sessionStorage.getItem('cs_super_admin_pass');
    if (savedPass) {
      setMasterPassword(savedPass);
      loadSuperAdminData(savedPass);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setLoading(true);

    try {
      const res = await fetch('/api/super-admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: masterPassword })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Mot de passe incorrect');
      }

      setIsAuthenticated(true);
      sessionStorage.setItem('cs_super_admin_pass', masterPassword);
      await loadSuperAdminData(masterPassword);
    } catch (err: any) {
      setAuthError(err.message || 'Erreur authentification');
    } finally {
      setLoading(false);
    }
  };

  const loadSuperAdminData = async (pass: string) => {
    try {
      setLoading(true);
      const res = await fetch('/api/super-admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ masterPassword: pass })
      });

      const data = await res.json();
      if (data.success && data.subscription) {
        setIsAuthenticated(true);
        setSubscription(data.subscription);
        setFeeInput(data.subscription.monthlyFeeCFA || 15000);
        setShopIdInput(data.subscription.feexpayConfig?.shopId || '');
        setApiTokenInput(data.subscription.feexpayConfig?.apiToken || '');
        setModeInput(data.subscription.feexpayConfig?.mode || 'SANDBOX');
      } else {
        sessionStorage.removeItem('cs_super_admin_pass');
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('cs_super_admin_pass');
    setIsAuthenticated(false);
    setMasterPassword('');
    setSubscription(null);
  };

  const copyPassword = (pass: string) => {
    navigator.clipboard.writeText(pass);
    setCopiedPass(true);
    setTimeout(() => setCopiedPass(false), 2500);
  };

  // Actions manuelles
  const triggerAction = async (action: 'generate_password' | 'extend_days' | 'revoke_access', days = 30) => {
    if (!confirm(
      action === 'revoke_access' 
        ? "Voulez-vous vraiment bloquer l'accès administrateur immédiatement ? L'admin devra payer sur FeexPay pour continuer."
        : action === 'generate_password'
        ? "Générer un nouveau mot de passe Admin pour 1 mois ?"
        : `Prolonger l'accès de ${days} jours gratuitement ?`
    )) return;

    setActionSuccess(null);
    setActionError(null);

    try {
      const res = await fetch('/api/super-admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          masterPassword,
          action,
          days
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erreur lors de l’action');
      }

      setActionSuccess(data.message);
      await loadSuperAdminData(masterPassword);
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      setActionError(err.message || 'Une erreur est survenue');
      setTimeout(() => setActionError(null), 4000);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingConfig(true);
    setActionSuccess(null);
    setActionError(null);

    try {
      const res = await fetch('/api/super-admin/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          masterPassword,
          monthlyFeeCFA: Number(feeInput),
          feexpayConfig: {
            enabled: true,
            shopId: shopIdInput.trim(),
            apiToken: apiTokenInput.trim(),
            mode: modeInput
          },
          newMasterPassword: newMasterPasswordInput.trim() || undefined
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erreur lors de la sauvegarde');
      }

      if (newMasterPasswordInput.trim()) {
        setMasterPassword(newMasterPasswordInput.trim());
        sessionStorage.setItem('cs_super_admin_pass', newMasterPasswordInput.trim());
        setNewMasterPasswordInput('');
      }

      setActionSuccess('Paramètres FeexPay & Tarif mensuel enregistrés avec succès !');
      await loadSuperAdminData(masterPassword);
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      setActionError(err.message || 'Erreur sauvegarde');
      setTimeout(() => setActionError(null), 4000);
    } finally {
      setSavingConfig(false);
    }
  };

  // ÉCRAN DE VERROUILLAGE / AUTHENTIFICATION SUPER ADMIN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-stone-900 border border-stone-800 rounded-3xl p-8 shadow-2xl space-y-6 text-stone-100 animate-fade-in">
          
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-600 to-purple-700 flex items-center justify-center mx-auto shadow-lg shadow-rose-900/40">
              <ShieldCheck className="w-9 h-9 text-white" />
            </div>
            <span className="text-[11px] font-mono tracking-widest text-amber-400 uppercase font-black">
              Espace Super Administrateur
            </span>
            <h1 className="text-2xl font-black font-serif text-white">
              Christaline Shop Bénin
            </h1>
            <p className="text-xs text-stone-400">
              Contrôle des abonnements mensuels admin et passerelle FeexPay
            </p>
          </div>

          {authError && (
            <div className="p-3.5 bg-rose-950/80 border border-rose-800 rounded-xl text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                Clé Maître / Mot de passe Super Admin
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="Mot de passe Super Admin..."
                  value={masterPassword}
                  onChange={(e) => setMasterPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-stone-800 border border-stone-700 text-white text-sm focus:border-amber-500 outline-hidden font-mono"
                />
                <Lock className="w-4 h-4 text-stone-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
              </div>
              <p className="text-[10px] text-stone-500 mt-1.5">
                Indice par défaut : <code>superadmin2026</code>
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-rose-600 to-purple-600 hover:from-amber-600 hover:to-purple-700 text-white font-black text-sm shadow-md shadow-rose-900/50 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
              <span>Déverrouiller le Super Admin</span>
            </button>
          </form>

          <div className="pt-4 border-t border-stone-800 text-center">
            <Link href="/admin" className="text-xs text-stone-500 hover:text-stone-300 transition-colors">
              ← Retour à l'espace Admin normal
            </Link>
          </div>

        </div>
      </div>
    );
  }

  const totalCollectedCFA = (subscription?.paymentHistory || [])
    .filter(p => p.status === 'SUCCESS')
    .reduce((acc, p) => acc + (p.amountCFA || 0), 0);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 pb-16">
      
      {/* HEADER SUPER ADMIN */}
      <header className="sticky top-0 z-40 bg-stone-900/90 backdrop-blur-md border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-white shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-black text-white text-lg">
                  SUPER ADMIN
                </span>
                <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold">
                  Christaline Shop
                </span>
              </div>
              <p className="text-[11px] text-stone-400">
                Gestion des accès mensuels & passerelle de paiement FeexPay
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              target="_blank"
              className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <span>Voir /admin</span>
              <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
            </Link>

            <button
              onClick={handleLogout}
              className="px-3.5 py-2 rounded-xl border border-stone-800 hover:bg-rose-950/50 hover:text-rose-400 text-stone-400 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Quitter</span>
            </button>
          </div>

        </div>
      </header>

      {/* CONTENU PRINCIPAL */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* ALERTES RETOUR ACTION */}
        {actionSuccess && (
          <div className="p-4 bg-emerald-950/80 border border-emerald-800 rounded-2xl text-emerald-300 text-xs font-bold flex items-center gap-2.5 shadow-lg animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {actionError && (
          <div className="p-4 bg-rose-950/80 border border-rose-800 rounded-2xl text-rose-300 text-xs font-bold flex items-center gap-2.5 shadow-lg animate-fade-in">
            <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        {/* 4 KPIS EN CARTOUCHES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* KPI 1 : STATUT ABONNEMENT */}
          <div className={`p-5 rounded-3xl border shadow-lg ${
            subscription?.isExpired 
              ? 'bg-rose-950/30 border-rose-800/80' 
              : 'bg-emerald-950/30 border-emerald-800/80'
          }`}>
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-stone-400">
              <span>Statut Abonnement</span>
              {subscription?.isExpired ? (
                <XCircle className="w-4 h-4 text-rose-400" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              )}
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className={`text-2xl font-black ${subscription?.isExpired ? 'text-rose-400' : 'text-emerald-400'}`}>
                {subscription?.isExpired ? 'EXPIRÉ' : 'ACTIF'}
              </span>
              <span className="text-xs text-stone-400 font-mono">
                ({subscription?.daysRemaining || 0} jours)
              </span>
            </div>
            <p className="text-[11px] text-stone-400 mt-1">
              Expire le : <strong>{subscription ? new Date(subscription.passwordExpiresAt).toLocaleDateString('fr-FR') : '-'}</strong>
            </p>
          </div>

          {/* KPI 2 : MOT DE PASSE ADMIN EN CLAIR */}
          <div className="p-5 rounded-3xl bg-stone-900 border border-stone-800 shadow-lg space-y-1">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-stone-400">
              <span>Mot de passe Admin Actuel</span>
              <button
                type="button"
                onClick={() => setShowCurrentPass(!showCurrentPass)}
                className="text-stone-400 hover:text-stone-200 cursor-pointer"
              >
                {showCurrentPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="flex items-center justify-between gap-2 pt-1">
              <div className="font-mono text-xl font-black text-amber-400 tracking-wider">
                {showCurrentPass ? subscription?.activeAdminPassword : '••••••••••••'}
              </div>
              <button
                type="button"
                onClick={() => copyPassword(subscription?.activeAdminPassword || '')}
                className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors cursor-pointer"
                title="Copier le mot de passe"
              >
                {copiedPass ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-stone-500">
              Généré chaque 1 mois après paiement FeexPay
            </p>
          </div>

          {/* KPI 3 : TARIF MENSUEL DÉFINI */}
          <div className="p-5 rounded-3xl bg-stone-900 border border-stone-800 shadow-lg">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-stone-400">
              <span>Tarif Mensuel FeexPay</span>
              <DollarSign className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-black font-mono text-white">
                {(subscription?.monthlyFeeCFA || 15000).toLocaleString('fr-FR')}
              </span>
              <span className="text-xs font-bold text-amber-400">FCFA / mois</span>
            </div>
            <p className="text-[11px] text-stone-400 mt-1">
              Somme à régler par l'admin pour renouveler
            </p>
          </div>

          {/* KPI 4 : TOTAL ENCAISSÉ VIA FEEXPAY */}
          <div className="p-5 rounded-3xl bg-stone-900 border border-stone-800 shadow-lg">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-stone-400">
              <span>Total Cotisations Encaissées</span>
              <TrendingUp className="w-4 h-4 text-purple-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-black font-mono text-purple-400">
                {totalCollectedCFA.toLocaleString('fr-FR')}
              </span>
              <span className="text-xs font-bold text-stone-400">FCFA</span>
            </div>
            <p className="text-[11px] text-stone-400 mt-1">
              Sur {subscription?.paymentHistory?.length || 0} transaction(s) enregistrée(s)
            </p>
          </div>

        </div>

        {/* SECTION 1 : ACTIONS D'URGENCE & PILOTAGE MANUEL */}
        <div className="p-6 rounded-3xl bg-stone-900 border border-stone-800 shadow-lg space-y-4">
          <div className="flex items-center gap-2.5 border-b border-stone-800 pb-3">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-black text-white font-serif">
              Actions Manuelles du Super Admin (Contrôle Direct)
            </h2>
          </div>

          <p className="text-xs text-stone-400">
            En tant que Super Admin, vous pouvez forcer la génération d'un nouveau mot de passe, accorder un mois gratuit, ou révoquer immédiatement l'accès d'un clic :
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <button
              type="button"
              onClick={() => triggerAction('generate_password')}
              className="p-4 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-bold text-xs flex flex-col gap-1 text-left transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-1.5 font-black text-amber-200">
                <RefreshCw className="w-4 h-4 text-amber-400" />
                <span>Générer Nouveau Mot de Passe (+30j)</span>
              </span>
              <span className="text-[11px] text-stone-400 font-normal">
                Crée une nouvelle clé aléatoire et prolonge l'accès de 30 jours
              </span>
            </button>

            <button
              type="button"
              onClick={() => triggerAction('extend_days', 30)}
              className="p-4 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex flex-col gap-1 text-left transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-1.5 font-black text-emerald-200">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>Prolonger de +30 Jours (Gratuit)</span>
              </span>
              <span className="text-[11px] text-stone-400 font-normal">
                Conserve le mot de passe actuel et repousse l'expiration
              </span>
            </button>

            <button
              type="button"
              onClick={() => triggerAction('revoke_access')}
              className="p-4 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 font-bold text-xs flex flex-col gap-1 text-left transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-1.5 font-black text-rose-200">
                <XCircle className="w-4 h-4 text-rose-400" />
                <span>Bloquer / Expirer l'Accès Maintenant</span>
              </span>
              <span className="text-[11px] text-stone-400 font-normal">
                Verrouille l'espace admin : oblige l'admin à régler sur FeexPay
              </span>
            </button>
          </div>
        </div>

        {/* SECTION 2 : CONFIGURATION DU TARIF ET DE FEEXPAY */}
        <form onSubmit={handleSaveSettings} className="p-6 sm:p-8 rounded-3xl bg-stone-900 border border-stone-800 shadow-lg space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600/30 text-purple-400 border border-purple-500/40 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-white font-serif">
                  Configuration Passerelle FeexPay & Tarif Mensuel
                </h2>
                <p className="text-xs text-stone-400">
                  Définissez la somme à payer chaque mois et vos identifiants FeexPay Bénin
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-stone-400">Mode Passerelle :</span>
              <select
                value={modeInput}
                onChange={(e) => setModeInput(e.target.value as 'LIVE' | 'SANDBOX')}
                className="px-3 py-1.5 rounded-xl bg-stone-800 border border-stone-700 text-xs font-bold text-amber-300"
              >
                <option value="SANDBOX">🧪 SANDBOX (Mode Test / Démo)</option>
                <option value="LIVE">🚀 LIVE (Paiements Réels)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Montant mensuel à payer */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider">
                Montant de l'abonnement mensuel (FCFA) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min={100}
                  step={500}
                  placeholder="Ex: 15000"
                  value={feeInput}
                  onChange={(e) => setFeeInput(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl bg-stone-800 border border-stone-700 text-amber-400 font-mono font-bold text-base focus:border-amber-500 outline-hidden"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400">
                  FCFA / 30 jours
                </span>
              </div>
              <p className="text-[11px] text-stone-500">
                L'administrateur sera invité à régler ce montant précis via Mobile Money (MTN, Moov, Celtiis) sur FeexPay.
              </p>
            </div>

            {/* FeexPay Shop ID */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider flex items-center justify-between">
                <span>FeexPay Shop ID / Token</span>
                <span className="text-[10px] text-stone-500 font-normal">Créé sur feexpay.me</span>
              </label>
              <input
                type="text"
                placeholder="Ex: 64f19b10..."
                value={shopIdInput}
                onChange={(e) => setShopIdInput(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-stone-800 border border-stone-700 text-stone-200 font-mono text-xs focus:border-amber-500 outline-hidden"
              />
              <p className="text-[11px] text-stone-500">
                Votre identifiant de boutique fourni dans votre tableau de bord FeexPay.
              </p>
            </div>

            {/* FeexPay API Secret Token */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider flex items-center justify-between">
                <span>FeexPay API Secret Key / Token</span>
                <span className="text-[10px] text-stone-500 font-normal">Clé privée API</span>
              </label>
              <input
                type="password"
                placeholder="Ex: fp_sec_..."
                value={apiTokenInput}
                onChange={(e) => setApiTokenInput(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-stone-800 border border-stone-700 text-stone-200 font-mono text-xs focus:border-amber-500 outline-hidden"
              />
            </div>

            {/* Changer le mot de passe Super Admin */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider">
                Modifier le mot de passe Super Admin (Optionnel)
              </label>
              <input
                type="password"
                placeholder="Laisser vide pour ne pas changer..."
                value={newMasterPasswordInput}
                onChange={(e) => setNewMasterPasswordInput(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-stone-800 border border-stone-700 text-stone-200 font-mono text-xs focus:border-amber-500 outline-hidden"
              />
              <p className="text-[10px] text-stone-500">
                Mot de passe pour accéder à cet espace super admin (`/super-admin`).
              </p>
            </div>

          </div>

          {/* Webhook & URL de notification FeexPay */}
          <div className="p-4 bg-stone-800/60 rounded-2xl border border-stone-700/60 space-y-1.5 text-xs">
            <span className="font-bold text-stone-300 flex items-center gap-1.5">
              <span>🔗 URL de Webhook FeexPay à configurer sur votre compte FeexPay :</span>
            </span>
            <div className="p-2.5 bg-stone-900 rounded-xl border border-stone-700 font-mono text-amber-300 text-[11px] select-all break-all">
              {typeof window !== 'undefined' ? `${window.location.origin}/api/subscription/feexpay/webhook` : 'https://christaline.shop/api/subscription/feexpay/webhook'}
            </div>
            <p className="text-[11px] text-stone-500">
              FeexPay appellera automatiquement cette URL pour prolonger l'abonnement et délivrer le mot de passe dès que le virement MoMo/Moov/Celtiis est validé.
            </p>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={savingConfig}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-rose-600 to-purple-600 hover:from-amber-600 hover:to-purple-700 text-white font-black text-xs shadow-lg transition-transform hover:scale-102 flex items-center gap-2 cursor-pointer"
            >
              {savingConfig ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Enregistrer la Configuration FeexPay & Tarif</span>
            </button>
          </div>
        </form>

        {/* SECTION 3 : HISTORIQUE DES PAIEMENTS FEEXPAY */}
        <div className="p-6 sm:p-8 rounded-3xl bg-stone-900 border border-stone-800 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-stone-800 pb-4">
            <div>
              <h2 className="text-base font-black text-white font-serif flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span>Historique des Règlements & Mots de Passe Générés</span>
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                Chaque paiement réussi génère un mot de passe et étend la validité de 30 jours
              </p>
            </div>
          </div>

          {(!subscription?.paymentHistory || subscription.paymentHistory.length === 0) ? (
            <div className="p-8 text-center text-stone-500 text-xs">
              Aucun paiement enregistré pour le moment.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-stone-800/80 text-stone-400 uppercase text-[10px] tracking-wider font-bold">
                  <tr>
                    <th className="p-3 rounded-l-xl">Date</th>
                    <th className="p-3">Référence</th>
                    <th className="p-3">Montant</th>
                    <th className="p-3">Moyen / Contact</th>
                    <th className="p-3">Statut</th>
                    <th className="p-3">Mot de passe généré</th>
                    <th className="p-3 rounded-r-xl">Validité jusqu'au</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800 font-medium text-stone-300">
                  {subscription.paymentHistory.map((p) => {
                    const dateFormatted = new Date(p.date).toLocaleString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    });
                    const validDateFormatted = p.validUntil ? new Date(p.validUntil).toLocaleDateString('fr-FR') : '-';

                    return (
                      <tr key={p.id} className="hover:bg-stone-800/40">
                        <td className="p-3 font-mono text-[11px] text-stone-400">
                          {dateFormatted}
                        </td>
                        <td className="p-3 font-mono text-[11px] text-amber-300">
                          {p.reference}
                        </td>
                        <td className="p-3 font-mono font-bold text-white">
                          {p.amountCFA.toLocaleString('fr-FR')} FCFA
                        </td>
                        <td className="p-3 text-[11px]">
                          <div>{p.operator || 'FeexPay'}</div>
                          {p.phoneNumber && <div className="text-stone-500 text-[10px]">{p.phoneNumber}</div>}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.status === 'SUCCESS' 
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                              : 'bg-rose-950 text-rose-400 border border-rose-800'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="p-3 font-mono font-bold text-amber-400">
                          {p.generatedPassword || '-'}
                        </td>
                        <td className="p-3 font-mono text-stone-400">
                          {validDateFormatted}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>

    </div>
  );
}
