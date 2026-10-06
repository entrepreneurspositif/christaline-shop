import { NextResponse } from 'next/server';
import { processSuccessfulPaymentAsync, readSubscriptionDataAsync } from '@/lib/subscriptionServer';
import { notifyNewAdminPasswordTelegram } from '@/lib/telegram';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { reference, feexpayTransactionId, phoneNumber, operator, amountCFA } = body;

    const data = await readSubscriptionDataAsync();
    const fee = amountCFA || data.monthlyFeeCFA;

    const paymentResult = await processSuccessfulPaymentAsync({
      amountCFA: fee,
      reference: reference || `FP_MANUAL_${Date.now()}`,
      feexpayTransactionId: feexpayTransactionId || `FP_TX_${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      phoneNumber: phoneNumber || 'Non spécifié',
      operator: operator || 'FeexPay Bénin'
    });

    const host = request.headers.get('host') || '';
    const protocol = request.headers.get('x-forwarded-proto') || 'https';
    const baseUrl = host ? `${protocol}://${host}` : 'https://christaline-shop.vercel.app';

    // Transmission automatique du mot de passe généré sur Telegram
    notifyNewAdminPasswordTelegram({
      newPassword: paymentResult.newPassword,
      expiresAt: paymentResult.expiresAt,
      amountCFA: fee,
      reference: paymentResult.record.reference,
      operator: paymentResult.record.operator,
      source: 'feexpay',
      baseUrl
    }).catch(err => {
      console.error('Erreur alerte Telegram nouveau mot de passe:', err);
    });

    return NextResponse.json({
      success: true,
      message: 'Paiement FeexPay validé avec succès ! Nouveau mot de passe administrateur généré et envoyé sur Telegram.',
      newPassword: paymentResult.newPassword,
      expiresAt: paymentResult.expiresAt,
      record: paymentResult.record
    });
  } catch (error) {
    console.error('Erreur confirmation FeexPay:', error);
    return NextResponse.json({ success: false, error: 'Erreur validation paiement' }, { status: 500 });
  }
}
