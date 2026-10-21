import { NextResponse } from 'next/server';
import { 
  readSubscriptionDataAsync, 
  superAdminManualGeneratePasswordAsync, 
  superAdminExtendDaysAsync, 
  superAdminRevokeAccessAsync 
} from '@/lib/subscriptionServer';
import { notifyNewAdminPasswordTelegram } from '@/lib/telegram';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { masterPassword, action, days, grantFreeDays } = body;

    const data = await readSubscriptionDataAsync();

    if (masterPassword !== data.superAdminPassword) {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
    }

    const host = request.headers.get('host') || '';
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const baseUrl = host ? `${protocol}://${host}` : '';

    if (action === 'generate_password') {
      const isFreeGift = Boolean(grantFreeDays);
      const extensionDays = Number(days) || 30;
      const res = await superAdminManualGeneratePasswordAsync({
        grantFreeDays: isFreeGift,
        durationDays: extensionDays
      });

      // Transmission sur Telegram
      notifyNewAdminPasswordTelegram({
        newPassword: res.newPassword,
        expiresAt: res.expiresAt,
        amountCFA: isFreeGift ? 0 : data.monthlyFeeCFA,
        reference: isFreeGift ? 'OFFRE_SUPER_ADMIN_GRATUIT' : 'CLE_ADMIN_PAIEMENT_REQUIS',
        operator: isFreeGift ? 'Super Admin Manuel (Offert)' : 'En attente de paiement FeexPay',
        source: 'super_admin',
        baseUrl
      }).catch(err => {
        console.error('Erreur alerte Telegram mot de passe manuel:', err);
      });

      return NextResponse.json({
        success: true,
        message: isFreeGift 
          ? `Nouveau code généré et offert pour ${extensionDays} jours ! Transmis sur Telegram.`
          : `Nouveau code généré avec succès (Accès verrouillé : Paiement FeexPay de ${data.monthlyFeeCFA.toLocaleString('fr-FR')} FCFA obligatoire pour activer). Transmis sur Telegram.`,
        newPassword: res.newPassword,
        expiresAt: res.expiresAt,
        isExpired: res.isExpired
      });
    }

    if (action === 'send_telegram_password') {
      const tgRes = await notifyNewAdminPasswordTelegram({
        newPassword: data.activeAdminPassword,
        expiresAt: data.passwordExpiresAt,
        amountCFA: data.monthlyFeeCFA,
        reference: 'NOTIFICATION_MANUELLE_SUPER_ADMIN',
        operator: 'Super Admin',
        source: 'super_admin',
        baseUrl
      });

      if (!tgRes || tgRes.skipped) {
        return NextResponse.json({
          success: false,
          error: tgRes?.error || 'Token ou Chat ID Telegram manquant dans la configuration'
        });
      }

      if (!tgRes.success) {
        return NextResponse.json({
          success: false,
          error: tgRes?.error || 'Échec de transmission vers les serveurs Telegram'
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Mot de passe administrateur actif transmis avec succès sur Telegram !'
      });
    }

    if (action === 'extend_days') {
      const extensionDays = Number(days) || 30;
      const res = await superAdminExtendDaysAsync(extensionDays);
      return NextResponse.json({
        success: true,
        message: `Accès administrateur prolongé de ${extensionDays} jours`,
        expiresAt: res.expiresAt,
        daysRemaining: res.daysRemaining
      });
    }

    if (action === 'revoke_access') {
      await superAdminRevokeAccessAsync();
      return NextResponse.json({
        success: true,
        message: 'Accès administrateur révoqué immédiatement (marqué comme expiré)'
      });
    }

    return NextResponse.json({ success: false, error: 'Action non reconnue' }, { status: 400 });
  } catch (error) {
    console.error('Erreur action super admin:', error);
    return NextResponse.json({ success: false, error: 'Erreur exécution action' }, { status: 500 });
  }
}
