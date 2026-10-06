'use client';

import React from 'react';
import { 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  X, 
  RefreshCw, 
  ArrowRight,
  Send,
  Smartphone,
  ExternalLink
} from 'lucide-react';

interface FeexPayRenewalModalProps {
  isOpen: boolean;
  onClose: () => void;
  monthlyFeeCFA: number;
  subscriptionDurationDays?: number;
  renewalPhone: string;
  setRenewalPhone: (phone: string) => void;
  renewalOperator: string;
  setRenewalOperator: (operator: string) => void;
  processingPayment: boolean;
  onSubmitRenewal: (e: React.FormEvent) => void;
  paymentSuccessData: {
    newPassword: string;
    expiresAt: string;
  } | null;
  paymentError: string | null;
  onSuccessProceed: () => void;
  waitingForMobilePin?: boolean;
  onManualCheckStatus?: () => void;
  feexpayMode?: 'LIVE' | 'SANDBOX';
  paymentUrl?: string;
}

export default function FeexPayRenewalModal({
  isOpen,
  onClose,
  monthlyFeeCFA,
  subscriptionDurationDays = 30,
  renewalPhone,
  setRenewalPhone,
  renewalOperator,
  setRenewalOperator,
  processingPayment,
  onSubmitRenewal,
  paymentSuccessData,
  paymentError,
  onSuccessProceed,
  waitingForMobilePin = false,
  onManualCheckStatus,
  feexpayMode = 'SANDBOX',
  paymentUrl
}: FeexPayRenewalModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[94vh] overflow-y-auto shadow-2xl border border-stone-200 p-6 sm:p-8 space-y-6 my-auto animate-fade-in text-stone-900">
        
        {/* ============================================================ */}
        {/* ÉCRAN 1 : SUCCÈS (Délivrance du mot de passe généré) */}
        {/* ============================================================ */}
        {paymentSuccessData ? (
          <div className="space-y-6 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Paiement FeexPay Confirmé avec Succès !
              </span>
              <h3 className="text-2xl font-black text-stone-900 font-serif">
                Nouveau Mot de Passe Administrateur
              </h3>
              <p className="text-xs text-stone-600 max-w-sm mx-auto">
                Votre accès administrateur a été validé pour <strong>{subscriptionDurationDays} jours</strong> jusqu'au {new Date(paymentSuccessData.expiresAt).toLocaleDateString('fr-FR')}.
              </p>
            </div>

            {/* Boîte Mot de Passe */}
            <div className="bg-gradient-to-br from-amber-50 via-rose-50 to-purple-50 p-6 rounded-2xl border-2 border-dashed border-amber-300 relative space-y-2.5">
              <div className="text-[11px] font-bold uppercase text-stone-500">
                Votre mot de passe actif (Valable {subscriptionDurationDays} jours) :
              </div>
              <div className="text-3xl font-mono font-black text-rose-700 tracking-wider select-all">
                {paymentSuccessData.newPassword}
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-100 text-sky-800 border border-sky-200 rounded-full text-xs font-semibold">
                <Send className="w-3.5 h-3.5 text-sky-600" />
                <span>Envoyé automatiquement sur votre Telegram privé !</span>
              </div>
              <p className="text-[11px] text-stone-500 pt-0.5">
                Conservez précieusement ce mot de passe.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(paymentSuccessData.newPassword);
                  alert('Mot de passe copié dans le presse-papier !');
                }}
                className="w-full sm:w-auto flex-1 py-3 px-4 rounded-xl border border-stone-300 font-bold text-xs hover:bg-stone-100 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-4 h-4" />
                <span>Copier le mot de passe</span>
              </button>

              <button
                type="button"
                onClick={onSuccessProceed}
                className="w-full sm:w-auto flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-black text-xs shadow-md shadow-rose-200 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Accéder au Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : waitingForMobilePin ? (
          /* ============================================================ */
          /* ÉCRAN 2 : EN ATTENTE DU CODE SECRET SUR LE TÉLÉPHONE (LIVE) */
          /* ============================================================ */
          <div className="space-y-6 text-center animate-fade-in">
            <div className="relative w-20 h-20 rounded-3xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-inner">
              <Smartphone className="w-10 h-10 animate-bounce" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500"></span>
              </span>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                Demande transmise à votre opérateur {renewalOperator}
              </span>
              <h3 className="text-xl font-black text-stone-900 font-serif">
                Validez le paiement sur votre mobile
              </h3>
              <p className="text-xs text-stone-600 max-w-sm mx-auto leading-relaxed">
                Une notification de débit de <strong>{monthlyFeeCFA.toLocaleString('fr-FR')} FCFA</strong> a été envoyée sur votre numéro <strong>{renewalPhone}</strong> ({renewalOperator}).
                <br /><br />
                Composez votre <strong>code secret Mobile Money</strong> sur votre téléphone pour confirmer.
              </p>
            </div>

            {paymentError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-bold flex items-center gap-2 text-left">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{paymentError}</span>
              </div>
            )}

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-center gap-3">
              <RefreshCw className="w-4 h-4 text-rose-600 animate-spin" />
              <span className="text-xs font-bold text-stone-700">
                En attente de votre validation mobile en temps réel...
              </span>
            </div>

            {paymentUrl && (
              <div className="pt-1">
                <a
                  href={paymentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 font-bold underline"
                >
                  <span>Ou payer via le guichet web FeexPay sécurisé</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-xl border border-stone-300 font-bold text-xs hover:bg-stone-100 text-stone-600"
              >
                Fermer
              </button>

              {onManualCheckStatus && (
                <button
                  type="button"
                  onClick={onManualCheckStatus}
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-200 flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>J'ai validé (Vérifier)</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          /* ============================================================ */
          /* ÉCRAN 3 : FORMULAIRE DE RÈGLEMENT FEEXPAY */
          /* ============================================================ */
          <div className="space-y-6">
            
            <div className="flex items-start justify-between border-b border-stone-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shadow-md shadow-amber-200 shrink-0">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      Passerelle FeexPay Bénin
                    </span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase ${
                      feexpayMode === 'LIVE' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}>
                      {feexpayMode === 'LIVE' ? '🚀 Mode Réel' : '🧪 Mode Test (Sandbox)'}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-stone-900 font-serif mt-1">
                    Renouveler l'Accès Administrateur
                  </h3>
                  <p className="text-xs text-stone-500">
                    Générez votre mot de passe pour les 30 prochains jours
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl hover:bg-stone-100 text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Récapitulatif montant défini */}
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
                  Cotisation d'Abonnement Définie :
                </span>
                <span className="text-2xl font-black text-amber-950 font-mono">
                  {monthlyFeeCFA.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-amber-700 font-medium block">Période accordée :</span>
                <span className="text-xs font-bold text-amber-900 bg-white/90 px-2 py-0.5 rounded-md border border-amber-200">
                  {subscriptionDurationDays} Jours
                </span>
              </div>
            </div>

            {paymentError && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{paymentError}</span>
              </div>
            )}

            <form onSubmit={onSubmitRenewal} className="space-y-4">
              {/* Opérateurs Bénin */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Opérateur Mobile Money (Bénin) *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRenewalOperator('MTN')}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      renewalOperator === 'MTN'
                        ? 'border-yellow-500 bg-yellow-50 text-yellow-950 ring-2 ring-yellow-400/40 shadow-xs'
                        : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <span className="block font-black text-xs">MTN MoMo</span>
                    <span className="text-[10px] text-stone-500 font-medium">Bénin</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRenewalOperator('Moov')}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      renewalOperator === 'Moov'
                        ? 'border-blue-500 bg-blue-50 text-blue-950 ring-2 ring-blue-400/40 shadow-xs'
                        : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <span className="block font-black text-xs">Moov Money</span>
                    <span className="text-[10px] text-stone-500 font-medium">Bénin</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRenewalOperator('Celtiis')}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      renewalOperator === 'Celtiis'
                        ? 'border-purple-500 bg-purple-50 text-purple-950 ring-2 ring-purple-400/40 shadow-xs'
                        : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <span className="block font-black text-xs">Celtiis Cash</span>
                    <span className="text-[10px] text-stone-500 font-medium">Bénin</span>
                  </button>
                </div>
              </div>

              {/* Numéro de téléphone Mobile Money */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Numéro de Téléphone Mobile Money *</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    Bénin (+229)
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    placeholder="Ex: 01 97 00 00 00 ou 97 00 00 00"
                    value={renewalPhone}
                    onChange={(e) => setRenewalPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 font-mono text-sm bg-white focus:border-rose-500 outline-hidden"
                  />
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  {feexpayMode === 'LIVE'
                    ? `Une demande de débit Mobile Money de ${monthlyFeeCFA.toLocaleString('fr-FR')} FCFA sera transmise à votre téléphone (formats 8 ou 10 chiffres acceptés).`
                    : `Simulation Sandbox : test de paiement de ${monthlyFeeCFA.toLocaleString('fr-FR')} FCFA sans débit réel.`}
                </p>
              </div>

              {/* Boutons d'action */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-600 font-bold text-xs hover:bg-stone-100 cursor-pointer"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  disabled={processingPayment}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-xs shadow-md shadow-emerald-200 flex items-center gap-2 cursor-pointer transition-transform hover:scale-102"
                >
                  {processingPayment ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Initialisation FeexPay...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      <span>Payer {monthlyFeeCFA.toLocaleString('fr-FR')} FCFA avec FeexPay</span>
                    </>
                  )}
                </button>
              </div>
            </form>

          </div>
        )}

      </div>
    </div>
  );
}
