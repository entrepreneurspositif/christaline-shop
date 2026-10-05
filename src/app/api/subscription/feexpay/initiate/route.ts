import { NextResponse } from 'next/server';
import { readSubscriptionData } from '@/lib/subscriptionServer';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phoneNumber, operator, fullName } = body;

    const data = readSubscriptionData();
    const amount = data.monthlyFeeCFA;
    const reference = `FP_CS_${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Vérifier la configuration FeexPay
    const feexpay = data.feexpayConfig;
    const isConfigured = !!(feexpay.shopId && feexpay.apiToken);
    const isSandbox = feexpay.mode === 'SANDBOX' || !isConfigured;

    let feexpayResponse: any = null;

    // Si des clés FeexPay réelles sont fournies et en mode LIVE
    if (isConfigured && feexpay.mode === 'LIVE') {
      try {
        const res = await fetch('https://api.feexpay.me/api/transactions/requesttopay', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${feexpay.apiToken}`
          },
          body: JSON.stringify({
            shop: feexpay.shopId,
            amount,
            phoneNumber: phoneNumber || '0154072488',
            operator: operator || 'MTN',
            reference,
            description: `Abonnement Admin Christaline Shop Bénin (1 mois) - Ref: ${reference}`,
            callback_url: feexpay.callbackUrl || `${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/subscription/feexpay/webhook`
          })
        });

        if (res.ok) {
          feexpayResponse = await res.json();
        }
      } catch (err) {
        console.warn('FeexPay API call failed, falling back to local processing:', err);
      }
    }

    return NextResponse.json({
      success: true,
      reference,
      amountCFA: amount,
      isSandbox,
      shopId: feexpay.shopId || 'DEMO_SHOP_BENIN',
      feexpayResponse
    });
  } catch (error) {
    console.error('Erreur initiate FeexPay:', error);
    return NextResponse.json({ success: false, error: 'Erreur initialisation FeexPay' }, { status: 500 });
  }
}
