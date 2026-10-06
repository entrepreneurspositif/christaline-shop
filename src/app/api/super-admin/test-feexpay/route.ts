import { NextResponse } from 'next/server';
import { readSubscriptionData } from '@/lib/subscriptionServer';
import { testFeexPayConnection } from '@/lib/feexpayServer';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { masterPassword, shopId, apiToken } = body;

    const data = readSubscriptionData();

    if (masterPassword !== data.superAdminPassword) {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
    }

    const testShopId = (shopId ?? data.feexpayConfig.shopId ?? '').trim();
    const testToken = (apiToken ?? data.feexpayConfig.apiToken ?? '').trim();

    if (!testShopId || !testToken) {
      return NextResponse.json({
        success: false,
        error: 'Veuillez saisir votre FeexPay Shop ID et Clé API Token avant de tester.'
      }, { status: 400 });
    }

    const result = await testFeexPayConnection(testShopId, testToken);

    return NextResponse.json({
      success: result.success,
      message: result.message,
      shopName: result.shopName,
      details: result.details
    });
  } catch (error: any) {
    console.error('Erreur test-feexpay:', error);
    return NextResponse.json({
      success: false,
      error: error?.message || 'Erreur lors du test de connexion FeexPay'
    }, { status: 500 });
  }
}
