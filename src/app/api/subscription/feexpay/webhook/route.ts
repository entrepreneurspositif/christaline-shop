import { NextResponse } from 'next/server';
import { processSuccessfulPayment, readSubscriptionData } from '@/lib/subscriptionServer';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Format typique webhook FeexPay
    const status = body?.status || body?.transaction_status;
    const reference = body?.reference || body?.custom_id || body?.id;
    const amount = Number(body?.amount) || 15000;
    const phoneNumber = body?.phoneNumber || body?.phone;
    const operator = body?.operator || 'FeexPay';

    if (status === 'SUCCESSFUL' || status === 'SUCCESS' || status === 'PAID') {
      const data = readSubscriptionData();
      const result = processSuccessfulPayment({
        amountCFA: amount || data.monthlyFeeCFA,
        reference: String(reference),
        feexpayTransactionId: body?.id ? String(body.id) : undefined,
        phoneNumber,
        operator
      });

      return NextResponse.json({
        success: true,
        message: 'Abonnement prolongé et nouveau mot de passe généré',
        expiresAt: result.expiresAt
      });
    }

    return NextResponse.json({ success: false, message: 'Paiement non complété ou statut différent' });
  } catch (error) {
    console.error('Erreur Webhook FeexPay:', error);
    return NextResponse.json({ success: false, error: 'Erreur traitement webhook' }, { status: 500 });
  }
}
