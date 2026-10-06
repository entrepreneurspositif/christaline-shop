import { NextResponse } from 'next/server';
import { processSuccessfulPaymentAsync, readSubscriptionDataAsync } from '@/lib/subscriptionServer';
import { notifyNewAdminPasswordTelegram } from '@/lib/telegram';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Format typique webhook FeexPay
    const status = String(body?.status || body?.transaction_status || '').toUpperCase();
    const reference = body?.reference || body?.custom_id || body?.id || `FP_WH_${Date.now()}`;
    const amount = Number(body?.amount) || 0;
    const phoneNumber = body?.phoneNumber || body?.phone;
    const operator = body?.operator || 'FeexPay';

    if (status === 'SUCCESSFUL' || status === 'SUCCESS' || status === 'PAID') {
      const data = await readSubscriptionDataAsync();
      const fee = amount > 0 ? amount : data.monthlyFeeCFA;

      const result = await processSuccessfulPaymentAsync({
        amountCFA: fee,
        reference: String(reference),
        feexpayTransactionId: body?.id ? String(body.id) : undefined,
        phoneNumber,
        operator
      });

      const host = request.headers.get('host') || '';
      const protocol = request.headers.get('x-forwarded-proto') || 'https';
      const baseUrl = host ? `${protocol}://${host}` : 'https://christaline-shop.vercel.app';

      notifyNewAdminPasswordTelegram({
        newPassword: result.newPassword,
        expiresAt: result.expiresAt,
        amountCFA: fee,
        reference: String(reference),
        operator,
        source: 'feexpay',
        baseUrl
      }).catch(err => {
        console.error('Erreur webhook notification Telegram:', err);
      });

      return NextResponse.json({
        success: true,
        message: 'Abonnement prolongé et nouveau mot de passe envoyé sur Telegram',
        expiresAt: result.expiresAt
      });
    }

    return NextResponse.json({ success: false, message: 'Paiement non complété ou statut différent' });
  } catch (error) {
    console.error('Erreur Webhook FeexPay:', error);
    return NextResponse.json({ success: false, error: 'Erreur traitement webhook' }, { status: 500 });
  }
}
