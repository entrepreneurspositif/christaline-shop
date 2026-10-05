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
  ShieldCheck,
  Send
} from 'lucide-react';

interface FeexPayRenewalModalProps {
  isOpen: boolean;
  onClose: () => void;
  monthlyFeeCFA: number;
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
}

export default function FeexPayRenewalModal({
  isOpen,
  onClose,
  monthlyFeeCFA,
  renewalPhone,
  setRenewalPhone,
  renewalOperator,
  setRenewalOperator,
  processingPayment,
  onSubmitRenewal,
  paymentSuccessData,
  paymentError,
  onSuccessProceed
}: FeexPayRenewalModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[94vh] overflow-y-auto shadow-2xl border border-stone-200 p-6 sm:p-8 space-y-6 my-auto animate-fade-in text-stone-900">
        
        {/* ÉCRAN SUCCÈS : DÉLIVRANCE DU MOT DE PASSE GÉNÉRÉ */}
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
                Votre accès administrateur a été validé pour <strong>1 mois (30 jours)</strong> jusqu'au {new Date(paymentSuccessData.expiresAt).toLocaleDateString('fr-FR')}.
              </p>
            </div>

            {/* Boîte Mot de Passe */}
            <div className="bg-gradient-to-br from-amber-50 via-rose-50 to-purple-50 p-6 rounded-2xl border-2 border-dashed border-amber-300 relative space-y-2.5">
              <div className="text-[11px] font-bold uppercase text-stone-500">
                Votre mot de passe actif (Valable 30 jours) :
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
        ) : (
          /* FORMULAIRE DE RÈGLEMENT FEEXPAY */
          <div className="space-y-6">
            
            <div className="flex items-start justify-between border-b border-stone-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shadow-md shadow-amber-200 shrink-0">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    Passerelle FeexPay Bénin
                  </span>
                  <h3 className="text-lg font-black text-stone-900 font-serif mt-0.5">
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
                  Cotisation Mensuelle Définie :
                </span>
                <span className="text-2xl font-black text-amber-950 font-mono">
                  {monthlyFeeCFA.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-amber-700 font-medium block">Période accordée :</span>
                <span className="text-xs font-bold text-amber-900 bg-white/90 px-2 py-0.5 rounded-md border border-amber-200">
                  1 Mois (30 jours)
                </span>
              </div>
            </div>

            {paymentError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{paymentError}</span>
              </div>
            )}

            <form onSubmit={onSubmitRenewal} className="space-y-4">
              {/* Opérateurs Bénin */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Moyen de Paiement FeexPay (Bénin) *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setRenewalOperator('MTN')}
                    className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                      renewalOperator === 'MTN'
                        ? 'border-yellow-500 bg-yellow-50 text-yellow-900 ring-2 ring-yellow-400/30'
                        : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <span className="block font-black text-xs">MTN MoMo</span>
                    <span className="text-[9px] text-stone-500 font-normal">Bénin</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRenewalOperator('Moov')}
                    className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                      renewalOperator === 'Moov'
                        ? 'border-blue-500 bg-blue-50 text-blue-900 ring-2 ring-blue-400/30'
                        : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <span className="block font-black text-xs">Moov Money</span>
                    <span className="text-[9px] text-stone-500 font-normal">Bénin</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRenewalOperator('Celtiis')}
                    className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                      renewalOperator === 'Celtiis'
                        ? 'border-purple-500 bg-purple-50 text-purple-900 ring-2 ring-purple-400/30'
                        : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <span className="block font-black text-xs">Celtiis Cash</span>
                    <span className="text-[9px] text-stone-500 font-normal">Bénin</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRenewalOperator('Card')}
                    className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                      renewalOperator === 'Card'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-400/30'
                        : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <span className="block font-black text-xs">Carte VISA</span>
                    <span className="text-[9px] text-stone-500 font-normal">MasterCard</span>
                  </button>
                </div>
              </div>

              {/* Numéro de téléphone Mobile Money */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Numéro de Téléphone Mobile Money *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Ex: 0154072488 ou 97000000"
                  value={renewalPhone}
                  onChange={(e) => setRenewalPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 font-mono text-sm bg-white focus:border-rose-500 outline-hidden"
                />
                <p className="text-[11px] text-stone-500 mt-1">
                  Une notification de validation de {monthlyFeeCFA.toLocaleString('fr-FR')} FCFA sera transmise à ce compte Mobile Money.
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
                      <span>Traitement FeexPay...</span>
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
