import { NextResponse } from 'next/server';
import { processSuccessfulPaymentAsync, readSubscriptionDataAsync } from '@/lib/subscriptionServer';
import { checkFeexPayTransactionStatus } from '@/lib/feexpayServer';
import { notifyNewAdminPasswordTelegram } from '@/lib/telegram';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { reference, phoneNumber, operator, amountCFA, forceConfirm } = body;

    if (!reference) {
      return NextResponse.json({ success: false, error: 'Référence requise' }, { status: 400 });
    }

    const data = await readSubscriptionDataAsync();
    const isLive = data.feexpayConfig.mode === 'LIVE' && !!(data.feexpayConfig.shopId && data.feexpayConfig.apiToken);

    let isSuccess = false;

    if (isLive && !forceConfirm) {
      const statusRes = await checkFeexPayTransactionStatus(reference, data.feexpayConfig.apiToken);

      if (statusRes.status === 'PENDING') {
        return NextResponse.json({
          success: true,
          status: 'PENDING',
          reference,
          message: 'Paiement en attente de confirmation sur votre mobile...'
        });
      }

      if (statusRes.status === 'FAILED' || statusRes.status === 'INSUFFICIENT_FUNDS') {
        return NextResponse.json({
          success: false,
          status: statusRes.status,
          reference,
          error: statusRes.status === 'INSUFFICIENT_FUNDS' 
            ? 'Fonds insuffisants sur votre compte Mobile Money.'
            : 'La transaction a échoué ou a été refusée.'
        }, { status: 400 });
      }

      if (statusRes.status === 'SUCCESS') {
        isSuccess = true;
      }
    } else {
      // Sandbox ou confirmation forcée
      isSuccess = true;
    }

    if (isSuccess) {
      const fee = amountCFA || data.monthlyFeeCFA || 15000;
      const paymentResult = await processSuccessfulPaymentAsync({
        amountCFA: fee,
        reference: reference,
        feexpayTransactionId: `FP_TX_${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        phoneNumber: phoneNumber || 'Non spécifié',
        operator: operator || 'FeexPay Bénin'
      });

      const host = request.headers.get('host') || '';
      const protocol = request.headers.get('x-forwarded-proto') || 'https';
      const baseUrl = host ? `${protocol}://${host}` : 'https://christaline-shop.vercel.app';

      // Alerte Telegram
      notifyNewAdminPasswordTelegram({
        newPassword: paymentResult.newPassword,
        expiresAt: paymentResult.expiresAt,
        amountCFA: fee,
        reference: paymentResult.record.reference,
        operator: paymentResult.record.operator,
        source: 'feexpay',
        baseUrl
      }).catch(err => {
        console.error('Erreur notification Telegram:', err);
      });

      return NextResponse.json({
        success: true,
        status: 'SUCCESS',
        message: 'Paiement FeexPay validé avec succès ! Nouveau mot de passe généré et envoyé sur Telegram.',
        newPassword: paymentResult.newPassword,
        expiresAt: paymentResult.expiresAt,
        record: paymentResult.record
      });
    }

    return NextResponse.json({
      success: true,
      status: 'PENDING',
      reference,
      message: 'En attente de confirmation...'
    });
  } catch (error: any) {
    console.error('Erreur check-status FeexPay:', error);
    return NextResponse.json({
      success: false,
      error: error?.message || 'Erreur vérification statut'
    }, { status: 500 });
  }
}
