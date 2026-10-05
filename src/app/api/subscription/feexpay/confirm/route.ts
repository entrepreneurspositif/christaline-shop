import { NextResponse } from 'next/server';
import { processSuccessfulPayment, readSubscriptionData } from '@/lib/subscriptionServer';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { reference, feexpayTransactionId, phoneNumber, operator, amountCFA } = body;

    const data = readSubscriptionData();
    const fee = amountCFA || data.monthlyFeeCFA;

    const paymentResult = processSuccessfulPayment({
      amountCFA: fee,
      reference: reference || `FP_MANUAL_${Date.now()}`,
      feexpayTransactionId: feexpayTransactionId || `FP_TX_${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      phoneNumber: phoneNumber || 'Non spécifié',
      operator: operator || 'FeexPay Bénin'
    });

    return NextResponse.json({
      success: true,
      message: 'Paiement FeexPay validé avec succès ! Nouveau mot de passe administrateur généré.',
      newPassword: paymentResult.newPassword,
      expiresAt: paymentResult.expiresAt,
      record: paymentResult.record
    });
  } catch (error) {
    console.error('Erreur confirmation FeexPay:', error);
    return NextResponse.json({ success: false, error: 'Erreur validation paiement' }, { status: 500 });
  }
}
