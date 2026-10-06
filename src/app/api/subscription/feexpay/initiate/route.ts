import { NextResponse } from 'next/server';
import { readSubscriptionDataAsync } from '@/lib/subscriptionServer';
import { sendFeexPayRequestToPay } from '@/lib/feexpayServer';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phoneNumber, operator } = body;

    const data = await readSubscriptionDataAsync();
    const amount = data.monthlyFeeCFA || 15000;
    const reference = `FP_CS_${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Vérifier la configuration FeexPay
    const feexpay = data.feexpayConfig;
    const isConfigured = !!(feexpay.shopId && feexpay.apiToken);
    const isLive = feexpay.mode === 'LIVE' && isConfigured;

    const host = request.headers.get('host') || '';
    const protocol = request.headers.get('x-forwarded-proto') || 'https';
    const baseUrl = host ? `${protocol}://${host}` : 'https://christaline-shop.vercel.app';

    // 1. Si mode LIVE et clés configurées : appel officiel RequestToPay
    if (isLive) {
      if (operator === 'Card') {
        return NextResponse.json({
          success: false,
          error: 'Le paiement par Carte Bancaire n’est pas activé sur FeexPay. Veuillez sélectionner MTN MoMo, Moov Money ou Celtiis Cash.',
          mode: 'LIVE'
        }, { status: 400 });
      }

      const cleanPhone = String(phoneNumber || '').trim();
      if (!cleanPhone) {
        return NextResponse.json({
          success: false,
          error: 'Veuillez saisir votre numéro de téléphone Mobile Money (ex: 01 97 00 00 00).',
          mode: 'LIVE'
        }, { status: 400 });
      }

      const liveRes = await sendFeexPayRequestToPay({
        amount,
        phoneNumber: cleanPhone,
        operator: operator || 'MTN',
        reference,
        shopId: feexpay.shopId,
        apiToken: feexpay.apiToken,
        description: 'Abonnement Christaline',
        callbackUrl: feexpay.callbackUrl || `${baseUrl}/api/subscription/feexpay/webhook`,
        merchantDomain: baseUrl
      });

      if (!liveRes.success) {
        return NextResponse.json({
          success: false,
          error: liveRes.error || 'Erreur lors de la communication avec la passerelle FeexPay.',
          reference,
          mode: 'LIVE',
          rawResponse: liveRes.rawResponse
        }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        reference: liveRes.reference || reference,
        amountCFA: amount,
        isSandbox: false,
        mode: 'LIVE',
        status: liveRes.status || 'PENDING',
        paymentUrl: liveRes.payment_url,
        message: 'Demande de débit Mobile Money envoyée sur votre téléphone. Veuillez valider avec votre code secret.',
        feexpayResponse: liveRes
      });
    }

    // 2. Mode SANDBOX / Simulation locale si pas en LIVE
    return NextResponse.json({
      success: true,
      reference,
      amountCFA: amount,
      isSandbox: true,
      mode: 'SANDBOX',
      status: 'PENDING',
      shopId: feexpay.shopId || 'DEMO_SHOP_BENIN',
      message: 'Mode Sandbox actif : La transaction de test peut être validée immédiatement.'
    });
  } catch (error: any) {
    console.error('Erreur initiate FeexPay:', error);
    return NextResponse.json({
      success: false,
      error: error?.message || 'Erreur initialisation FeexPay'
    }, { status: 500 });
  }
}
